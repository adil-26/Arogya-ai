import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

// GET: Fetch AI chat history for logged-in user
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const messages = await prisma.aIChatMessage.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'asc' }
        });

        return NextResponse.json({ messages });
    } catch (error) {
        console.error("Failed to fetch AI chat history:", error);
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}

// POST: Save AI chat messages
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { messages } = await request.json();
        const userId = session.user.id;

        // Save new messages (expect array of { sender, content })
        if (Array.isArray(messages) && messages.length > 0) {
            await prisma.aIChatMessage.createMany({
                data: messages.map(msg => ({
                    userId,
                    sender: msg.sender,
                    content: msg.content
                }))
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to save AI chat history:", error);
        return NextResponse.json({ error: "Failed to save history" }, { status: 500 });
    }
}

// DELETE: Clear chat history
export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.aIChatMessage.deleteMany({
            where: { userId: session.user.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to clear AI chat history:", error);
        return NextResponse.json({ error: "Failed to clear history" }, { status: 500 });
    }
}
