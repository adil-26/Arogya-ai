import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // 1. Fetch Comprehensive Data for the logged-in user
        const [issues, records, appointments] = await Promise.all([
            prisma.bodyIssue.findMany({ where: { userId } }),
            prisma.medicalRecord.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 5 }),
            prisma.appointment.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 3 })
        ]);

        // 2. Format Data for AI
        const context = `
        PATIENT RECORDS:
        - Reported Symptoms/Issues: ${issues.length > 0 ? issues.map(i => `${i.issue} (${i.specificPart}) - Severity: ${i.severity}`).join('; ') : "None"}
        - Medical Documents: ${records.length > 0 ? records.map(r => `${r.title} (${r.type}) - ${r.date}`).join('; ') : "None"}
        - Apppointment History: ${appointments.length > 0 ? appointments.map(a => `Dr. ${a.doctorName} (${a.specialty}) - Status: ${a.status}`).join('; ') : "None"}
        `;

        // 3. Groq AI Generation
        const API_KEY = process.env.GROQ_API_KEY;


        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: `You are a Senior Chief Medical Officer. Generate the **BODY CONTENT** for a Medical Health Summary Report.
                        
                        **Directives:**
                        1. Return **ONLY HTML** for the content sections. DO NOT include <html>, <head>, <body>, Header, or Footer (these are handled by the system).
                        2. Use <h3> tags for titles (e.g., "Clinical Overview", "Recommendations") with inline style: color: #1E3A8A; border-bottom: 2px solid #E5E7EB; padding-bottom: 4px; margin-top: 20px; font-family: sans-serif;
                        3. Use <p> tags for text with inline style: color: #374151; line-height: 1.6; font-family: sans-serif; margin-bottom: 12px;
                        4. Use <ul>/<li> for lists.
                        
                        **Sections to Generate:**
                        - **Executive Summary**: Brief narrative of the patient's health.
                        - **Clinical Observations**: Key findings from issues and reports.
                        - **Actionable Recommendations**: Next steps (doctors, tests, home care).`
                    },
                    { role: "user", content: `Patient Data: ${context}` }
                ],
                temperature: 0.4
            })
        });

        const data = await response.json();
        let reportContent = data.choices ? data.choices[0].message.content : "Failed to generate report.";

        // Cleanup: Remove markdown code blocks if AI adds them
        reportContent = reportContent.replace(/```html/g, '').replace(/```/g, '').trim();

        return NextResponse.json({ report: reportContent });

    } catch (error) {
        console.error("Summary Generation Failed:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
