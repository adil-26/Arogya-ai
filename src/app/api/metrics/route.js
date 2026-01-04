import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

// GET: Fetch latest metrics for logged-in user
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const metrics = await prisma.healthMetric.findMany({
            where: { userId: session.user.id },
            orderBy: { recordedAt: 'desc' },
            take: 10 // Last 10 records
        });
        return NextResponse.json(metrics);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
    }
}

// POST: Add new metric
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const userId = session.user.id;

        const newMetric = await prisma.healthMetric.create({
            data: {
                userId: userId,
                type: data.type,
                value: data.value,
                unit: data.unit,
                status: data.status
            }
        });

        return NextResponse.json(newMetric);
    } catch (error) {
        return NextResponse.json({ error: "Failed to save metric" }, { status: 500 });
    }
}
