import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');

    // Get current user
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, role: true }
    });

    let userId;

    // If doctor is fetching, use the patientId from query
    // If patient is fetching, use their own ID
    if (user?.role === 'patient') {
        userId = user.id;
    } else if (user?.role === 'doctor' && patientId) {
        userId = patientId;
    } else {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!doctorId) {
        return NextResponse.json({ error: "Doctor ID required" }, { status: 400 });
    }

    try {
        const messages = await prisma.chatMessage.findMany({
            where: { userId, doctorId },
            orderBy: { createdAt: 'asc' }
        });
        return NextResponse.json(messages);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { doctorId, patientId, content, sender } = body;

        // Get current user
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, role: true }
        });

        let userId;

        if (user?.role === 'patient') {
            userId = user.id;
        } else if (user?.role === 'doctor' && patientId) {
            userId = patientId;
        } else {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        // Save message
        const msg = await prisma.chatMessage.create({
            data: {
                userId,
                doctorId: doctorId.toString(),
                sender: sender || 'user',
                content
            }
        });

        return NextResponse.json(msg);

    } catch (error) {
        console.error("Message send error:", error);
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }
}
