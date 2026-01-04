import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const count = await prisma.user.count();
        return NextResponse.json({ message: "DB is working", count });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
