import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import acupointData from '@/data/acupoints.json';

// Smart keyword search for acupoints (RAG-lite)
// Accepts both user query and context keywords (e.g., from their health issues)
function getRelevantAcupoints(query, contextKeywords = []) {
    const searchTerms = [query, ...contextKeywords].filter(Boolean).map(t => t.toLowerCase());
    if (searchTerms.length === 0) return [];

    return acupointData.acupoints.filter(point => {
        return searchTerms.some(term =>
            point.name.toLowerCase().includes(term) ||
            point.code.toLowerCase().includes(term) ||
            point.treats.some(t => term.includes(t.replace(':', ' '))) ||
            point.treats.some(t => term.includes(t.split(':')[0]))
        );
    }).slice(0, 7); // Top 7 for broader coverage
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

            const [issues, records, appointments, history, medications] = await Promise.all([
                prisma.bodyIssue.findMany({ where: { userId } }),
                prisma.medicalRecord.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 5 }),
                prisma.appointment.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 3 }),
                prisma.patientMedicalHistory.findUnique({
                    where: { userId },
                    include: { surgeries: true, allergies: true, familyHistory: true }
                }),
                prisma.medication.findMany({ where: { userId, isActive: true } })
            ]);

            // 2. Format Context for AI - FULL HISTORY
            let contextSummary = `
            PATIENT MEDICAL CONTEXT:
            - Active Health Issues: ${issues.length > 0 ? issues.map(i => `${i.issue} in ${i.specificPart} (${i.severity})`).join(', ') : "None"}
            - Current Medications: ${medications.length > 0 ? medications.map(m => `${m.name} (${m.dosage})`).join(', ') : "None"}
            - Allergies: ${history?.allergies?.length > 0 ? history.allergies.map(a => `${a.allergen} (${a.severity || 'unknown severity'})`).join(', ') : "None known"}
            - Past Surgeries: ${history?.surgeries?.length > 0 ? history.surgeries.map(s => `${s.type} on ${s.bodyPart} (${s.year})`).join(', ') : "None"}
            - Family History: ${history?.familyHistory?.length > 0 ? history.familyHistory.map(f => `${f.relation}: ${f.conditions?.join(', ')}`).join('; ') : "None"}
            - Recent Reports: ${records.length > 0 ? records.map(r => `${r.title} (${r.type})`).join(', ') : "None"}
            `;

            // 3. Premium Logic: Acupressure Injection
            let systemInstructions = "";

            if (isPremium) {
                // Collect keywords from Active Issues for auto-context (e.g., 'Headache', 'Asthma')
                const issueKeywords = issues.map(i => i.issue);
                // Search acupoints using BOTH user query AND their health issues
                const relevantPoints = getRelevantAcupoints(lastUserMessage, issueKeywords);

                if (relevantPoints.length > 0) {
                    const pointDetails = relevantPoints.map(p =>
                        `📍 **${p.code}** - ${p.name} (${p.chinese} / ${p.pinyin})
   • Meridian: ${p.meridian}
   • Location: ${p.location}
   • Treats: ${p.treats.map(t => t.replace(':', ': ')).join(', ')}
   • ⚠️ Caution: ${p.cautions}`
                    ).join('\n\n');

                    contextSummary += `
                    
                    PREMIUM ACUPRESSURE DATABASE:
                    
${pointDetails}
                    
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
            You are **Aarogya**, a warm and knowledgeable Ayurvedic & Acupressure wellness assistant.
            
            YOUR KNOWLEDGE CLUSTER:
            ${contextSummary}
            
            ${systemInstructions}

            **CRITICAL RULES (MUST FOLLOW):**
            
            ❌ **NEVER** list all meridians or say "I have access to Lung Meridian (11 points), Large Intestine (20 points)..." - this is useless to the user.
            ❌ **NEVER** give generic overviews of the acupressure system.
            ✅ **ALWAYS** recommend 2-3 SPECIFIC acupoints based on the user's ACTIVE HEALTH ISSUES shown above.
            ✅ **ALWAYS** use the acupoint data provided in "PREMIUM ACUPRESSURE DATABASE" section.
            
            **RESPONSE FORMAT FOR ACUPOINTS:**
            
            ---
            ### 🌟 [Point Code] - [English Name]
            **Chinese:** [Chinese Name] | **Pinyin:** [Pinyin]
            
            📍 **How to Find It:**
            [Simple step-by-step instructions using body landmarks the user can feel]
            
            ✨ **Benefits:** [What it helps with, in friendly language]
            
            ⚠️ **Caution:** [Any warnings]
            
            ---
            
            **BEHAVIOR:**
            1. Start by acknowledging the user's specific conditions (e.g., "I see you have Headache and Asthma...").
            2. Recommend ONLY 2-3 most relevant points from the PREMIUM ACUPRESSURE DATABASE.
            3. If no acupoint data matches, give general wellness advice - do NOT invent point locations.
            4. End with: "💙 This is for wellness support and not a medical replacement."
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
