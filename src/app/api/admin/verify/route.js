import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

// Verify if the current user is an admin
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: "Not an admin" }, { status: 403 });
        }

        return NextResponse.json({
            success: true,
            admin: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }
}
