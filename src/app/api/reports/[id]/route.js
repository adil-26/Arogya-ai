import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabase } from '@/lib/supabase';

// DELETE /api/reports/[id] - Delete a report
export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        // Get the report first to check ownership and get file URL
        const report = await prisma.healthReport.findFirst({
            where: {
                id: id,
                userId: session.user.id
            }
        });

        if (!report) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        // Delete file from Supabase Storage if exists
        if (report.fileUrl) {
            try {
                // Extract file path from URL
                const urlParts = report.fileUrl.split('/reports/');
                if (urlParts[1]) {
                    const filePath = urlParts[1];
                    await supabase.storage.from('reports').remove([filePath]);
                }
            } catch (storageError) {
                console.warn('Failed to delete file from storage:', storageError);
            }
        }

        // Delete related records first (cascade should handle this, but being explicit)
        await prisma.testResult.deleteMany({ where: { reportId: id } });
        await prisma.imagingFinding.deleteMany({ where: { reportId: id } });

        // Delete the report
        await prisma.healthReport.delete({ where: { id: id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting report:", error);
        return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 });
    }
}

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
                userId: session.user.id
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
