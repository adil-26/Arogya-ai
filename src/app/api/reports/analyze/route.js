import { NextResponse } from 'next/server';

// MASTER PROMPT FOR STRUCTURED DATA
const SYSTEM_PROMPT = `
You are a medical AI assistant. Your task is to extract structured data from the provided medical report text.
Return ONLY valid JSON. No markdown, no prolog.

Structure:
{
  "metadata": {
    "name": "Patient Name or Unknown",
    "date": "Report Date (YYYY-MM-DD) or Today",
    "category": "Report Type (e.g. Blood Work, MRI)"
  },
  "results": [
    {
      "parameter": "Test Name (e.g. Hemoglobin)",
      "value": Number (remove units),
      "unit": "Unit string",
      "ref_min": Number or null,
      "ref_max": Number or null,
      "status": "Normal" | "High" | "Low",
      "body_part_id": "generic body part ID for 3D map (e.g. blood, heart, liver)"
    }
  ],
  "imaging_summary": {
    "findings": "Summary of findings (if imaging)",
    "conclusion": "Conclusion/Impression",
    "affected_locations": ["list", "of", "body_part_ids", "for", "3d_map"]
  }
}

Use these body_part_ids for mapping: head, brain, eyes, ears, nose, mouth, neck, chest, lungs, heart, abdomen, stomach, liver, kidneys, intestines, spine_cervical, spine_thoracic, spine_lumbar, pelvis, arms, hands, legs, feet, blood, skin, muscle, bone.
`;

export async function POST(request) {
    try {
        const body = await request.json();
        const { text, category } = body;

        console.log("Analyze Request (Text Mode):", { category, textLength: text?.length });

        // 1. Send to Groq AI for Parsing
        const API_KEY = process.env.GROQ_API_KEY;
        if (!API_KEY) {
            throw new Error("GROQ_API_KEY is not configured");
        }

        console.log("Sending to Groq Llama-3...");
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: `Report Category: ${category}\n\nExtracted Text:\n${text}` }
                ],
                temperature: 0.1, // Low temp for more deterministic JSON
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Groq API Error: ${err}`);
        }

        const data = await response.json();
        const jsonContent = data.choices[0].message.content;

        console.log("AI Parsing Complete");
        const parsedResult = JSON.parse(jsonContent);

        return NextResponse.json(parsedResult);

    } catch (error) {
        console.error("AI Analysis Failed:", error);
        return NextResponse.json({
            error: "Failed to analyze report",
            details: error.message
        }, { status: 500 });
    }
}
