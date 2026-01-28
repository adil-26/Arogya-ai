import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const type = formData.get('type') || 'Unknown';
        const date = formData.get('date') || new Date().toISOString();

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save file locally (In prod, use S3/Supabase Storage)
        const uploadDir = join(process.cwd(), 'public/uploads/reports');
        await mkdir(uploadDir, { recursive: true });

        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-z0-9.]/yi, '_');
        const fileName = `${timestamp}_${safeName}`;
        const filePath = join(uploadDir, fileName);

        await writeFile(filePath, buffer);
        const fileUrl = `/uploads/reports/${fileName}`;

        // Create DB Record
        const report = await prisma.healthReport.create({
            data: {
                userId: session.user.id,
                title: file.name,
                type: type,
                fileUrl: fileUrl,
                reportDate: new Date(date),
                status: 'processing' // AI Analysis will come next
            }
        });

        return NextResponse.json(report);

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
