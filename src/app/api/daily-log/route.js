import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get today's date at midnight for consistent querying
const getTodayDate = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// GET - Fetch today's daily log
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const today = getTodayDate();

        // Find or create today's log
        let log = await prisma.dailyLog.findFirst({
            where: {
                userId: user.id,
                date: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        });

        // If no log exists, return defaults
        if (!log) {
            return NextResponse.json({
                water: 0,
                sleep: 0,
                exercise: null,
                steps: 0,
                exerciseStreak: 0,
                date: today
            });
        }

        return NextResponse.json(log);
    } catch (error) {
        console.error("Daily log fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch daily log" }, { status: 500 });
    }
}

// POST - Update today's daily log
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const data = await request.json();
        const today = getTodayDate();
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

        // Find existing log for today
        let existingLog = await prisma.dailyLog.findFirst({
            where: {
                userId: user.id,
                date: {
                    gte: today,
                    lt: tomorrow
                }
            }
        });

        let log;
        if (existingLog) {
            // Update existing log
            log = await prisma.dailyLog.update({
                where: { id: existingLog.id },
                data: {
                    ...(data.water !== undefined && { water: data.water }),
                    ...(data.sleep !== undefined && { sleep: data.sleep }),
                    ...(data.exercise !== undefined && { exercise: data.exercise }),
                    ...(data.steps !== undefined && { steps: data.steps }),
                    ...(data.exerciseStreak !== undefined && { exerciseStreak: data.exerciseStreak })
                }
            });
        } else {
            // Create new log for today
            log = await prisma.dailyLog.create({
                data: {
                    userId: user.id,
                    date: today,
                    water: data.water || 0,
                    sleep: data.sleep || 7,
                    exercise: data.exercise || false,
                    steps: data.steps || 0,
                    exerciseStreak: data.exerciseStreak || 0
                }
            });
        }

        return NextResponse.json(log);
    } catch (error) {
        console.error("Daily log update error:", error);
        return NextResponse.json({ error: "Failed to update daily log" }, { status: 500 });
    }
}

// GET last 7 days for history
export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const logs = await prisma.dailyLog.findMany({
            where: {
                userId: user.id,
                date: { gte: sevenDaysAgo }
            },
            orderBy: { date: 'desc' }
        });

        return NextResponse.json(logs);
    } catch (error) {
        console.error("Daily log history error:", error);
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}
