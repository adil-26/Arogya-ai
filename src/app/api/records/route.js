import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

// GET: Fetch all records for logged-in user
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const records = await prisma.medicalRecord.findMany({
            where: { userId: session.user.id },
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(records);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 });
    }
}

// POST: Add new record
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const userId = session.user.id;

        const newRecord = await prisma.medicalRecord.create({
            data: {
                userId: userId,
                title: data.title,
                type: data.type,
                doctorName: data.doctorName,
                date: data.date,
                fileUrl: data.fileUrl || null
            }
        });

        return NextResponse.json(newRecord);
    } catch (error) {
        console.error("Record save error:", error);
        return NextResponse.json({ error: "Failed to save record" }, { status: 500 });
    }
}
