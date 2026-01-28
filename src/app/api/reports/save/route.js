import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { reportId, data } = body;

        if (!reportId || !data) {
            return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
        }

        // Use a transaction to ensure all data is saved together
        const result = await prisma.$transaction(async (tx) => {

            // 1. Update Report Status & Metadata
            await tx.healthReport.update({
                where: { id: reportId },
                data: {
                    status: 'completed',
                    title: data.metadata?.category ? `${data.metadata.category} Report` : undefined,
                    reportDate: data.metadata?.date ? new Date(data.metadata.date) : undefined
                }
            });

            // 2. Save Test Results (if any)
            if (data.results && data.results.length > 0) {
                await tx.testResult.createMany({
                    data: data.results.map(r => ({
                        reportId: reportId,
                        category: data.metadata?.category || 'General',
                        parameter: r.parameter,
                        value: parseFloat(r.value),
                        unit: r.unit,
                        refMin: r.ref_min,
                        refMax: r.ref_max,
                        status: r.status,
                        isNewTest: r.is_new_test || false
                    }))
                });
            }

            // 3. Save Imaging Findings (if any)
            if (data.imaging_summary) {
                await tx.imagingFinding.create({
                    data: {
                        reportId: reportId,
                        impression: data.imaging_summary.findings,
                        conclusion: data.imaging_summary.conclusion,
                        bodyPart: data.imaging_summary.affected_locations ? data.imaging_summary.affected_locations.join(',') : 'Unknown'
                    }
                });
            }

            return { success: true };
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error("Save Report Error:", error);
        return NextResponse.json({ error: 'Failed to save report' }, { status: 500 });
    }
}
