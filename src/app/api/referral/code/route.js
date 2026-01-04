import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

// Generate unique referral code
function generateReferralCode(name, id) {
    const prefix = (name || 'USER').substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X');
    const suffix = id.substring(0, 4).toUpperCase();
    return `${prefix}${suffix}`;
}

// GET: Get current user's referral code (generate if not exists)
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, name: true, referralCode: true, role: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Generate referral code if not exists
        if (!user.referralCode) {
            const newCode = generateReferralCode(user.name, user.id);
            await prisma.user.update({
                where: { id: user.id },
                data: { referralCode: newCode }
            });
            user.referralCode = newCode;
        }

        // Get referral link
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const referralLink = `${baseUrl}/register?ref=${user.referralCode}`;

        return NextResponse.json({
            code: user.referralCode,
            link: referralLink,
            whatsappLink: `https://wa.me/?text=Join%20our%20health%20app%20using%20my%20referral%20code:%20${user.referralCode}%20${encodeURIComponent(referralLink)}`
        });

    } catch (error) {
        console.error('Referral code error:', error);
        return NextResponse.json({ error: 'Failed to get referral code' }, { status: 500 });
    }
}
