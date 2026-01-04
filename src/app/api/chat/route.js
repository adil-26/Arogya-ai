import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

// API Handler for AI Chat
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { messages } = await request.json();

        // ============================================
        // REAL GROQ API INTEGRATION
        // ============================================
        const API_KEY = process.env.GROQ_API_KEY;


        if (!API_KEY) {
            return NextResponse.json({ reply: "API Key missing." });
        }

        try {
            // 1. Fetch Patient Context (The "Cluster" of Medical History)
            const userId = session.user.id;

            const [issues, records, appointments] = await Promise.all([
                prisma.bodyIssue.findMany({ where: { userId } }),
                prisma.medicalRecord.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 5 }),
                prisma.appointment.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 3 })
            ]);

            // 2. Format Context for AI
            const contextSummary = `
            PATIENT MEDICAL CONTEXT:
            - Active Health Issues: ${issues.length > 0 ? issues.map(i => `${i.issue} in ${i.specificPart} (${i.severity})`).join(', ') : "None recorded"}
            - Recent Medical Reports: ${records.length > 0 ? records.map(r => `${r.title} (${r.type}) on ${r.date}`).join(', ') : "None"}
            - Appointments: ${appointments.length > 0 ? appointments.map(a => `Dr. ${a.doctorName} (${a.specialty}) on ${a.date}`).join(', ') : "None"}
            `;

            console.log("Injected Context:", contextSummary);

            // 3. Prepare Messages
            const cleanMessages = messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            const systemPrompt = `
            You are Aarogya, a dedicated medical AI assistant for a specific patient.
            
            YOUR KNOWLEDGE CLUSTER (Use this to personalize answers):
            ${contextSummary}

            STRICT GUIDELINES:
            1. **Medical Focus Only**: You must ONLY answer questions related to health, symptoms, doctors, appointments, or medical reports.
            2. **Acupressure & Wellness Allowed**: If the user asks about acupressure, yoga, or home remedies, you **SHOULD** provide detailed, educational answers (e.g., "For headaches, you can try pressing the LI4 point on your hand"). Treating this as "searching your knowledge base".
            3. **Use Context**: Refer to the patient's specific history. E.g., "Since you have a history of Migraines, Acupoint GB20 might help."
            4. **Doctor-Relatable**: Always suggest consulting their specific doctors if available.
            5. **Disclaimer**: Always add: "This is for wellness support and not a medical replacement."
            `;

            const conversation = [
                { role: "system", content: systemPrompt },
                ...cleanMessages
            ];

            const payload = {
                model: "llama-3.3-70b-versatile",
                messages: conversation,
                temperature: 0.6, // Slightly lower for more precision
                stream: false
            };

            console.log("Sending to Groq:", JSON.stringify(payload, null, 2));

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Groq API Error (Detailed):", response.status, errorText);
                return NextResponse.json({
                    reply: `AI Connection Error (${response.status}): ${errorText.substring(0, 100)}...`
                });
            }

            const data = await response.json();
            const aiReply = data.choices[0].message.content;

            return NextResponse.json({ reply: aiReply });

        } catch (err) {
            console.error("Groq Fetch Failed:", err);
            return NextResponse.json({ reply: "Connection error. Please check your internet." });
        }

    } catch (error) {
        console.error("Chat API Failed:", error);
        return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
    }
}
