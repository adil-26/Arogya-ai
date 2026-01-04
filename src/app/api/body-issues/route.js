import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

// GET: Fetch all active body issues for the current user
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const issues = await prisma.bodyIssue.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(issues);
    } catch (error) {
        console.error("Failed to fetch body issues:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

// POST: Save a new body issue
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        // Validate (Basic)
        if (!data.organId || !data.issue) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const userId = session.user.id;

        // Create record
        const newIssue = await prisma.bodyIssue.create({
            data: {
                userId: userId,
                organId: data.organId,
                specificPart: data.specificPart,
                issue: data.issue,
                severity: data.severity || 'mild',
                painLevel: parseInt(data.painLevel) || 0,
                note: data.note,
                status: 'active'
            }
        });

        return NextResponse.json(newIssue);
    } catch (error) {
        console.error("Failed to save body issue:", error);
        return NextResponse.json({ error: "Failed to save record" }, { status: 500 });
    }
}
