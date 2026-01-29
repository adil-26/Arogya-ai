import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/reports/list - Fetch all reports for the logged-in user
export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const reports = await prisma.healthReport.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                type: true,
                fileUrl: true,
                reportDate: true,
                status: true,
                createdAt: true
            }
        });

        return NextResponse.json(reports);
    } catch (error) {
        console.error("Error fetching reports:", error);
        return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }
}
