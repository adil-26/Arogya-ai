import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req) {
    try {
        const { userId, pin } = await req.json();

        if (!userId || !pin) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { sharePin: true, sharePinExpiry: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check strictly if PIN matches
        if (user.sharePin !== pin) {
            return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
        }

        // Check expiry
        if (!user.sharePinExpiry || new Date() > new Date(user.sharePinExpiry)) {
            return NextResponse.json({ error: 'PIN Expired. Ask patient to generate a new one.' }, { status: 401 });
        }

        // Success! Set a cookie to allow access
        // Cookie name includes UserID so it's specific to this profile
        const cookieStore = await cookies();
        cookieStore.set(`med_share_access_${userId}`, 'granted', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            // No maxAge: Session cookie (expires when browser/tab closes)
            path: '/'
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error verifying PIN:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
