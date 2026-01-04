import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Send notification to all users or specific groups
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if admin
        const admin = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!admin || admin.role !== 'admin') {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        const data = await request.json();
        const { title, message, type = 'system', link = null, targetRole = 'all' } = data;

        if (!title || !message) {
            return NextResponse.json({ error: "Title and message required" }, { status: 400 });
        }

        // Get target users based on role
        let whereClause = {};
        if (targetRole !== 'all') {
            whereClause = { role: targetRole };
        }

        const users = await prisma.user.findMany({
            where: whereClause,
            select: { id: true }
        });

        // Create notifications for all target users
        const notifications = await prisma.notification.createMany({
            data: users.map(user => ({
                userId: user.id,
                type,
                title,
                message,
                link,
                read: false
            }))
        });

        return NextResponse.json({
            success: true,
            sentTo: users.length,
            message: `Notification sent to ${users.length} users`
        });
    } catch (error) {
        console.error("Admin notification error:", error);
        return NextResponse.json({ error: "Failed to send notifications" }, { status: 500 });
    }
}

// GET - Get notification stats
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if admin
        const admin = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!admin || admin.role !== 'admin') {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        // Get stats
        const totalNotifications = await prisma.notification.count();
        const unreadNotifications = await prisma.notification.count({
            where: { read: false }
        });
        const recentNotifications = await prisma.notification.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { name: true, email: true }
                }
            }
        });

        return NextResponse.json({
            total: totalNotifications,
            unread: unreadNotifications,
            recent: recentNotifications
        });
    } catch (error) {
        console.error("Admin notification stats error:", error);
        return NextResponse.json({ error: "Failed to get stats" }, { status: 500 });
    }
}
