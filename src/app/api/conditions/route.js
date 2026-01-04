import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

// GET: Fetch all medical conditions for the logged-in user
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const conditions = await prisma.medicalCondition.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(conditions);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch conditions" }, { status: 500 });
    }
}

// POST: Sync/Bulk Update capabilities
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await request.json();
        const userId = session.user.id;

        // Logic: If payload is array, it's a Full Sync (Delete all old -> Insert new)
        if (Array.isArray(payload)) {
            // 1. Delete all existing for user
            await prisma.medicalCondition.deleteMany({
                where: { userId: userId }
            });

            // 2. Insert new ones
            if (payload.length > 0) {
                await prisma.medicalCondition.createMany({
                    data: payload.map(item => ({
                        userId: userId,
                        name: item.name,
                        type: item.type,
                        since: item.since,
                        status: 'active'
                    }))
                });
            }
            return NextResponse.json({ success: true, count: payload.length });
        }

        // Single Create (Fallback)
        const newCondition = await prisma.medicalCondition.create({
            data: {
                userId: userId,
                name: payload.name,
                type: payload.type,
                since: payload.since,
                status: 'active'
            }
        });

        return NextResponse.json(newCondition);
    } catch (error) {
        console.error("Error saving condition:", error);
        return NextResponse.json({ error: "Failed to save condition" }, { status: 500 });
    }
}
