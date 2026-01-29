import { NextResponse } from 'next/server';
import { createWorker } from 'tesseract.js';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
    try {
        const body = await request.json();
        const { reportId, fileUrl } = body;

        if (!reportId || !fileUrl) {
            return NextResponse.json({ error: 'Missing reportId or fileUrl' }, { status: 400 });
        }

        console.log("OCR Request (Tesseract.js):", { reportId, fileUrl });

        // Fetch the image
        const fileResponse = await fetch(fileUrl);
        if (!fileResponse.ok) {
            throw new Error(`Failed to fetch image: ${fileResponse.statusText}`);
        }

        const arrayBuffer = await fileResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Initialize Tesseract worker
        console.log("Initializing Tesseract.js worker...");
        const worker = await createWorker('eng');

        // Recognize text
        console.log("Running OCR...");
        const { data: { text } } = await worker.recognize(buffer);

        // Terminate worker
        await worker.terminate();
        console.log("OCR Complete. Text length:", text.length);

        // Save raw text to database
        await prisma.healthReport.update({
            where: { id: reportId },
            data: {
                rawOcrText: text,
                status: 'ocr_complete'
            }
        });

        return NextResponse.json({
            text,
            reportId,
            status: 'ocr_complete'
        });

    } catch (error) {
        console.error("OCR CRITICAL FAILURE:", error);
        console.error("Error Stack:", error.stack);

        // Update report status to failed
        try {
            const body = await request.json().catch(() => ({}));
            if (body.reportId) {
                await prisma.healthReport.update({
                    where: { id: body.reportId },
                    data: { status: 'failed' }
                });
            }
        } catch (e) { /* ignore */ }

        return NextResponse.json({
            error: "Failed to extract text",
            details: error.message
        }, { status: 500 });
    }
}
