import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
    let reportId = null;
    try {
        const body = await request.json();
        const { fileUrl } = body;
        reportId = body.reportId;

        if (!reportId || !fileUrl) {
            return NextResponse.json({ error: 'Missing reportId or fileUrl' }, { status: 400 });
        }

        console.log("AI OCR Request (Groq Vision):", { reportId, fileUrl });

        // 1. Fetch the image and convert to Base64
        const fileResponse = await fetch(fileUrl);
        if (!fileResponse.ok) {
            console.error("Fetch failed for URL:", fileUrl);
            throw new Error(`Failed to fetch image from storage: ${fileResponse.statusText}. Please check if the file exists.`);
        }

        const arrayBuffer = await fileResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');
        const mimeType = fileResponse.headers.get('content-type') || 'image/jpeg';

        console.log("Image metadata:", { mimeType, size: buffer.length });

        // Check if it's an image (Groq Vision requirement)
        if (!mimeType.startsWith('image/')) {
            throw new Error(`AI Analysis currently only supports images (JPG/PNG). This file is a ${mimeType}. Please upload a photo or screenshot instead.`);
        }

        // 2. Send to Groq Vision API
        const API_KEY = process.env.GROQ_API_KEY;
        if (!API_KEY) {
            throw new Error("GROQ_API_KEY is not configured in .env.local");
        }

        console.log("Sending to Groq Llama-4-Scout...");
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "meta-llama/llama-4-scout-17b-16e-instruct",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "Extact ALL text from this medical report. Maintain the structure and tables as much as possible. Group data by section headers. Return only the extracted text, no chat or intro."
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:${mimeType};base64,${base64Image}`
                                }
                            }
                        ]
                    }
                ],
                temperature: 0.1,
                max_tokens: 4096
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Groq API Error Output:", errText);
            throw new Error(`Groq API Error (${response.status}): ${errText.substring(0, 200)}`);
        }

        const groqData = await response.json();
        const extractedText = groqData.choices[0].message.content;

        console.log("AI OCR Success. Length:", extractedText.length);

        // 3. Save raw text to database
        await prisma.healthReport.update({
            where: { id: reportId },
            data: {
                rawOcrText: extractedText,
                status: 'ocr_complete'
            }
        });

        return NextResponse.json({
            text: extractedText,
            reportId,
            status: 'ocr_complete'
        });

    } catch (error) {
        console.error("AI OCR CRITICAL FAILURE:", {
            message: error.message,
            reportId: reportId
        });

        // Update report status to failed
        if (reportId) {
            try {
                await prisma.healthReport.update({
                    where: { id: reportId },
                    data: { status: 'failed' }
                });
            } catch (dbError) {
                console.error("Prisma update failed:", dbError.message);
            }
        }

        return NextResponse.json({
            error: "AI Text Extraction Failed",
            details: error.message
        }, { status: 500 });
    }
}
