import NextAuthLib from "next-auth";
const NextAuth = NextAuthLib.default || NextAuthLib;
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export async function GET(req, ctx) {
    try {
        return await handler(req, ctx);
    } catch (e) {
        return NextResponse.json({ error: "NextAuth Crash", details: e.message, stack: e.stack }, { status: 500 });
    }
}

export async function POST(req, ctx) {
    try {
        return await handler(req, ctx);
    } catch (e) {
        return NextResponse.json({ error: "NextAuth Crash", details: e.message, stack: e.stack }, { status: 500 });
    }
}

// Export authOptions so other files can import it
export { authOptions };
