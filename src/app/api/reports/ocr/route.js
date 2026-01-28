import { NextResponse } from 'next/server';
import { join } from 'path';
import { readFile } from 'fs/promises';

export async function POST(request) {
    try {
        const body = await request.json();
        const { fileUrl } = body;

        console.log("OCR Request (Vision-Powered):", { fileUrl });

        // 1. Resolve File Path (Local)
        const relativePath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
        const filePath = join(process.cwd(), 'public', relativePath);

        // 2. Read File as Base64
        const fileBuffer = await readFile(filePath);
        const base64Image = fileBuffer.toString('base64');
        const dataUrl = `data:image/jpeg;base64,${base64Image}`;

        // 3. Send to Groq Vision for "Optical Character Recognition"
        const API_KEY = process.env.GROQ_API_KEY;
        if (!API_KEY) {
            throw new Error("GROQ_API_KEY is not configured");
        }

        console.log("Sending to Groq Vision (Llama-3.2-11b-vision-preview)...");

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.2-11b-vision-preview",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Please extract all the readable text from this medical report image. Return ONLY the raw text content. Do not add any conversational filler like 'Here is the text'." },
                            { type: "image_url", image_url: { url: dataUrl } }
                        ]
                    }
                ],
                temperature: 0.1,
                max_tokens: 4096
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Groq API Error: ${err}`);
        }

        const data = await response.json();
        const rawText = data.choices[0]?.message?.content || "No text found.";

        console.log("Vision OCR Complete. Length:", rawText.length);

        return NextResponse.json({ text: rawText });

    } catch (error) {
        console.error("OCR Failed:", error);
        return NextResponse.json({
            error: "Failed to extract text",
            details: error.message
        }, { status: 500 });
    }
}
