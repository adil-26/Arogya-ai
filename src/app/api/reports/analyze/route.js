import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// MASTER PROMPT FOR STRUCTURED DATA
const SYSTEM_PROMPT = `
You are a Medical Lab Specialist AI. Your task is to extract structured data from medical laboratory or imaging reports.
Return ONLY valid JSON. No markdown, no chat, no intro.

CLINICAL EXTRACTION RULES:
1. EXTREMELY IMPORTANT: Every result MUST have a 'parameter' name (e.g., "Hemoglobin", "RBC Count"). NEVER leave it blank.
2. If text is in a table, the 'Test Name' or 'Parameter' is usually in the first column.
3. Remove units (g/dL, %) from the 'value' and put them in the 'unit' field.
4. Convert 'value', 'refMin', and 'refMax' to Numbers.
5. If a reference range is "13.00 - 17.00", refMin is 13.0, refMax is 17.0.
6. Status must be "Normal", "High", or "Low" based on the reference range.

JSON Structure:
{
  "metadata": {
    "patientName": "Name or Unknown",
    "reportDate": "YYYY-MM-DD",
    "category": "Blood Work | MRI | CT | X-Ray"
  },
  "summary": "2-3 sentence clinical summary.",
  "results": [
    {
      "parameter": "Full Test Name",
      "value": 12.5,
      "unit": "g/dL",
      "refMin": 13.0,
      "refMax": 17.0,
      "status": "Low",
      "category": "e.g., CBC"
    }
  ],
  "imagingSummary": {
    "findings": "Summary of findings",
    "conclusion": "Impression",
    "affectedLocations": ["blood", "heart", "liver", etc]
  }
}

Use these body_part_ids: head, brain, eyes, ears, nose, mouth, neck, chest, lungs, heart, abdomen, stomach, liver, kidneys, intestines, spine_cervical, spine_thoracic, spine_lumbar, pelvis, arms, hands, legs, feet, blood, skin, muscle, bone.
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

    // Verify report exists before proceeding
    const reportExists = await prisma.healthReport.findUnique({
      where: { id: reportId }
    });

    if (!reportExists) {
      throw new Error(`Health report with ID ${reportId} not found in database.`);
    }

    // Update status to analyzing
    await prisma.healthReport.update({
      where: { id: reportId },
      data: { status: 'analyzing' }
    });

    // ... AI call happens here ...
    // (Skipping to keep diff clean, but logic remains)

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

    // Save to database in a safe transaction-like order
    if (reportId) {
      // 1. Clean up OLD results/findings first (Crucial for retries!)
      await prisma.testResult.deleteMany({ where: { reportId } });
      await prisma.imagingFinding.deleteMany({ where: { reportId } });

      // 2. Save analysis JSON and set completed
      await prisma.healthReport.update({
        where: { id: reportId },
        data: {
          analysisJson: parsedResult,
          status: 'completed'
        }
      });

      // 3. Create TestResult records
      if (parsedResult.results && parsedResult.results.length > 0) {
        await prisma.testResult.createMany({
          data: parsedResult.results.map(r => ({
            reportId: reportId,
            parameter: (r.parameter && String(r.parameter).trim()) ? String(r.parameter).trim() : 'Unknown Test',
            value: parseFloat(String(r.value).replace(/[^0-9.]/g, '')) || 0,
            unit: r.unit || '',
            refMin: r.refMin ? parseFloat(String(r.refMin).replace(/[^0-9.]/g, '')) : null,
            refMax: r.refMax ? parseFloat(String(r.refMax).replace(/[^0-9.]/g, '')) : null,
            status: r.status || 'Normal'
          }))
        });
      }

      // 4. Create ImagingFinding if present
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

      console.log("Analysis saved to database successfully!");
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
      } catch (dbError) {
        console.error("Failed to update report status to failed in analysis:", dbError.message);
      }
    }

    return NextResponse.json({
      error: "Failed to analyze report",
      details: error.message
    }, { status: 500 });
  }
}
