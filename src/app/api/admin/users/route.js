import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Helper to check if request is from an admin
async function isAdmin(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return false;

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    return user?.role === 'admin';
}

// DELETE: Delete a user
export async function DELETE(request) {
    try {
        // Check admin auth
        if (!await isAdmin(request)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('id');

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        // Don't allow deleting admins
        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (targetUser?.role === 'admin') {
            return NextResponse.json({ error: "Cannot delete admin users" }, { status: 403 });
        }

        // Delete related records first (to handle foreign keys)
        await prisma.appointment.deleteMany({ where: { userId } });
        await prisma.healthMetric.deleteMany({ where: { userId } });
        await prisma.medicalCondition.deleteMany({ where: { userId } });
        await prisma.dailyLog.deleteMany({ where: { userId } });
        await prisma.chatMessage.deleteMany({ where: { userId } });
        await prisma.account.deleteMany({ where: { userId } });
        await prisma.session.deleteMany({ where: { userId } });

        // Finally delete the user
        await prisma.user.delete({ where: { id: userId } });

        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("User delete error:", error);
        return NextResponse.json({ error: "Delete failed: " + error.message }, { status: 500 });
    }
}

// GET: Get all users with optional filters
export async function GET(request) {
    try {
        if (!await isAdmin(request)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');

        const where = {};
        if (role) where.role = role;

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                phone: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Users fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
