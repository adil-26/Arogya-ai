import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import acupointData from '@/data/acupoints.json';

// Simple keyword search for acupoints (RAG-lite)
function getRelevantAcupoints(query) {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();

    return acupointData.acupoints.filter(point => {
        // Search in name, code, or what it treats
        return (
            point.name.toLowerCase().includes(lowerQuery) ||
            point.code.toLowerCase().includes(lowerQuery) ||
            point.treats.some(t => lowerQuery.includes(t.replace(':', ' '))) || // Match "pain chest" from "pain:chest"
            point.treats.some(t => lowerQuery.includes(t.split(':')[0])) // Match "headache"
        );
    }).slice(0, 5); // Limit to top 5 to save tokens
}

// API Handler for AI Chat
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { messages } = await request.json();
        const lastUserMessage = messages[messages.length - 1]?.content || "";

        // ============================================
        // REAL GROQ API INTEGRATION
        // ============================================
        const API_KEY = process.env.GROQ_API_KEY;

        if (!API_KEY) {
            return NextResponse.json({ reply: "API Key missing." });
        }

        try {
            // 1. Fetch User & Medical Context
            const userId = session.user.id;

            // Fetch latest user data to check Premium status (session might be stale)
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { isPremium: true }
            });

            const isPremium = user?.isPremium || false;

            const [issues, records, appointments] = await Promise.all([
                prisma.bodyIssue.findMany({ where: { userId } }),
                prisma.medicalRecord.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 5 }),
                prisma.appointment.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 3 })
            ]);

            // 2. Format Context for AI
            let contextSummary = `
            PATIENT MEDICAL CONTEXT:
            - Active Health Issues: ${issues.length > 0 ? issues.map(i => `${i.issue} in ${i.specificPart} (${i.severity})`).join(', ') : "None recorded"}
            - Recent Medical Reports: ${records.length > 0 ? records.map(r => `${r.title} (${r.type}) on ${r.date}`).join(', ') : "None"}
            - Appointments: ${appointments.length > 0 ? appointments.map(a => `Dr. ${a.doctorName} (${a.specialty}) on ${a.date}`).join(', ') : "None"}
            `;

            // 3. Premium Logic: Acupressure Injection
            let systemInstructions = "";

            if (isPremium) {
                // Search for relevant acupoints based on user's message
                const relevantPoints = getRelevantAcupoints(lastUserMessage);

                if (relevantPoints.length > 0) {
                    const pointDetails = relevantPoints.map(p =>
                        `- ${p.code} (${p.name}): ${p.location}. Treats: ${p.treats.join(', ')}. Caution: ${p.cautions}`
                    ).join('\n');

                    contextSummary += `
                    
                    PREMIUM KNOWLEDGE (ACUPRESSURE):
                    The user has Premium access. Here is verified data from the Acupoint Database relevant to their query:
                    
                    ${pointDetails}
                    
                    INSTRUCTION: You can recommend these specific points. Describe the location clearly.
                    `;
                } else {
                    contextSummary += `\nPREMIUM ACCESS: Active. (No specific acupoints matched this query, rely on general medical knowledge).`;
                }
            } else {
                // Non-Premium User
                systemInstructions = `
                NOTE: The user is on a BASIC plan. 
                - If they ask about detailed acupressure or specific point cleaning/locations, give a general answer but mention: "Detailed acupoint diagrams and precise location data are available in the Premium Plan."
                - Do NOT invent specific acupoint locations if you don't have the data.
                `;
            }

            console.log(`User ${userId} (Premium: ${isPremium})`);

            // 4. Prepare Messages
            const cleanMessages = messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            const systemPrompt = `
            You are Aarogya, a dedicated medical AI assistant.
            
            YOUR KNOWLEDGE CLUSTER:
            ${contextSummary}
            
            ${systemInstructions}

            STRICT GUIDELINES:
            1. **Medical Focus Only**: Answer health, symptom, and doctor questions.
            2. **Use Context**: Refer to the patient's specific history (e.g., "Since you have Migraines...").
            3. **Doctor-Relatable**: Suggest consulting their specific doctors if available.
            4. **Disclaimer**: Always add: "This is for wellness support and not a medical replacement."
            `;

            // Keep conversation history short to save context (System + Last 5 messages)
            const conversation = [
                { role: "system", content: systemPrompt },
                ...cleanMessages.slice(-5)
            ];

            const payload = {
                model: "llama-3.3-70b-versatile",
                messages: conversation,
                temperature: 0.6,
                stream: false
            };

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
