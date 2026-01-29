import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabase } from '@/lib/supabase';

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

        // Sanitize file name
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-z0-9.]/yi, '_');
        const fileName = `${timestamp}_${safeName}`;
        const filePath = `${session.user.id}/${fileName}`; // Organize by user ID

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('reports') // Ensure this bucket exists in Supabase
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (uploadError) {
            console.error("Supabase Storage Upload Error:", uploadError);
            throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        // Get Public URL
        const { data: urlData } = supabase
            .storage
            .from('reports')
            .getPublicUrl(filePath);

        const fileUrl = urlData.publicUrl;

        // Create DB Record
        const report = await prisma.healthReport.create({
            data: {
                userId: session.user.id,
                title: file.name,
                type: type,
                fileUrl: fileUrl,
                reportDate: new Date(date),
                status: 'processing'
            }
        });

        return NextResponse.json(report);

    } catch (error) {
        console.error("Upload route error:", error);
        return NextResponse.json(
            { error: error.message || 'Upload failed' },
            { status: 500 }
        );
    }
}
