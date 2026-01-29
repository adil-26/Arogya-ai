import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
  "summary": "A brief 2-3 sentence summary of the overall health status based on the report.",
  "results": [
    {
      "parameter": "Test Name (e.g. Hemoglobin)",
      "value": Number (remove units),
      "unit": "Unit string",
      "refMin": Number or null,
      "refMax": Number or null,
      "status": "Normal" | "High" | "Low",
      "bodyPartId": "generic body part ID for 3D map (e.g. blood, heart, liver)"
    }
  ],
  "imagingSummary": {
    "findings": "Summary of findings (if imaging)",
    "conclusion": "Conclusion/Impression",
    "affectedLocations": ["list", "of", "body_part_ids", "for", "3d_map"]
  }
}

Use these body_part_ids for mapping: head, brain, eyes, ears, nose, mouth, neck, chest, lungs, heart, abdomen, stomach, liver, kidneys, intestines, spine_cervical, spine_thoracic, spine_lumbar, pelvis, arms, hands, legs, feet, blood, skin, muscle, bone.
`;

export async function POST(request) {
  let reportId = null;

  try {
    const body = await request.json();
    const { text, category } = body;
    reportId = body.reportId;

    console.log("Analyze Request:", { reportId, category, textLength: text?.length });

    if (!text) {
      throw new Error("No text provided for analysis");
    }

    // Update status to analyzing
    if (reportId) {
      await prisma.healthReport.update({
        where: { id: reportId },
        data: { status: 'analyzing' }
      });
    }

    // Send to Groq AI for Parsing (Free Tier)
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
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq API Error: ${err}`);
    }

    const data = await response.json();
    const jsonContent = data.choices[0].message.content;
    const parsedResult = JSON.parse(jsonContent);

    console.log("AI Parsing Complete. Results count:", parsedResult.results?.length);

    // Save to database
    if (reportId) {
      // Save analysis JSON
      await prisma.healthReport.update({
        where: { id: reportId },
        data: {
          analysisJson: parsedResult,
          status: 'completed'
        }
      });

      // Create TestResult records
      if (parsedResult.results && parsedResult.results.length > 0) {
        await prisma.testResult.createMany({
          data: parsedResult.results.map(r => ({
            reportId: reportId,
            parameter: r.parameter,
            value: parseFloat(r.value) || 0,
            unit: r.unit || '',
            refMin: r.refMin ? parseFloat(r.refMin) : null,
            refMax: r.refMax ? parseFloat(r.refMax) : null,
            status: r.status || 'Normal'
          }))
        });
      }

      // Create ImagingFinding if present
      if (parsedResult.imagingSummary?.findings) {
        await prisma.imagingFinding.create({
          data: {
            reportId: reportId,
            impression: parsedResult.imagingSummary.findings,
            conclusion: parsedResult.imagingSummary.conclusion,
            bodyPart: parsedResult.imagingSummary.affectedLocations?.[0] || 'general',
            locationId: parsedResult.imagingSummary.affectedLocations?.[0] || null
          }
        });
      }

      console.log("Analysis saved to database!");
    }

    return NextResponse.json(parsedResult);

  } catch (error) {
    console.error("AI Analysis Failed:", error);

    // Update status to failed
    if (reportId) {
      try {
        await prisma.healthReport.update({
          where: { id: reportId },
          data: { status: 'failed' }
        });
      } catch (e) { /* ignore */ }
    }

    return NextResponse.json({
      error: "Failed to analyze report",
      details: error.message
    }, { status: 500 });
  }
}
