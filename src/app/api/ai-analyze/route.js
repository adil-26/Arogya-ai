import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

// API Handler for AI Medical Assessment
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { organId } = await request.json();
        const userId = session.user.id;

        // 1. Fetch Patient's Data Context
        const userIssues = await prisma.bodyIssue.findMany({
            where: { userId: userId }
        });

        const userRecords = await prisma.medicalRecord.findMany({
            where: { userId: userId },
            orderBy: { date: 'desc' },
            take: 3 // Last 3 records
        });

        // 2. Prepare Context for AI
        const context = {
            organFocus: organId || "General Health",
            currentIssues: userIssues.map(i => `${i.specificPart}: ${i.issue} (${i.severity})`),
            recentReports: userRecords.map(r => `${r.title} (${r.date})`)
        };

        let aiResponseText = "";

        // ============================================
        // REAL GROQ API INTEGRATION
        // ============================================
        const API_KEY = process.env.GROQ_API_KEY;


        if (API_KEY) {
            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile", // Valid Groq Model
                        messages: [
                            { role: "system", content: "You are a medical AI assistant named Aarogya. Analyze the patient records briefly and provide health insights. Be professional, empathetic, and concise." },
                            { role: "user", content: `Patient Data Context: ${JSON.stringify(context)}` }
                        ],
                        temperature: 0.7
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Groq API Error:", errorText);
                    aiResponseText = "AI Service temporarily unavailable. (Check console for details)";
                } else {
                    const data = await response.json();
                    aiResponseText = data.choices[0].message.content;
                }
            } catch (err) {
                console.error("Groq Fetch Failed:", err);
                aiResponseText = "Failed to connect to AI service.";
            }
        } else {
            aiResponseText = "API Key missing.";
        }

        // Fallback if AI fails (Safety Net)
        if (!aiResponseText || aiResponseText.startsWith("AI Service")) {
            aiResponseText = `(Offline Analysis) Based on your history of ${userIssues.length} issues, please consult a specific specialist for ${context.organFocus}.`;
        }

        return NextResponse.json({
            analysis: aiResponseText,
            contextUsed: context
        });

    } catch (error) {
        console.error("AI Analysis Failed:", error);
        return NextResponse.json({ error: "Failed to generate assessment" }, { status: 500 });
    }
}
