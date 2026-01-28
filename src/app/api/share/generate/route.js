import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Adjust path if needed
import { prisma } from '@/lib/prisma'; // Adjust path if needed

// Generate a random 6-digit PIN
const generatePin = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const pin = generatePin();
        // Set expiry to 20 minutes from now
        const expiry = new Date(Date.now() + 20 * 60 * 1000);

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                sharePin: pin,
                sharePinExpiry: expiry
            }
        });

        return NextResponse.json({ pin });
    } catch (error) {
        console.error("Error generating PIN:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
