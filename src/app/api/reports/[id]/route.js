import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/reports/[id] - Fetch a single report with full details
export async function GET(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        const report = await prisma.healthReport.findFirst({
            where: {
                id: id,
                userId: session.user.id // Ensure user owns this report
            },
            include: {
                results: true,
                findings: true
            }
        });

        if (!report) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        return NextResponse.json(report);
    } catch (error) {
        console.error("Error fetching report:", error);
        return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
    }
}
