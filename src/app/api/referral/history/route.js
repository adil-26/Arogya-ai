import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

// GET: Get user's referral history (people they referred)
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all referrals made by this user
        const referrals = await prisma.referral.findMany({
            where: { referrerId: session.user.id },
            include: {
                referee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        createdAt: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Get stats
        const stats = {
            total: referrals.length,
            pending: referrals.filter(r => r.status === 'pending').length,
            completed: referrals.filter(r => r.status === 'completed').length,
            credited: referrals.filter(r => r.status === 'credited').length,
            totalEarned: referrals.filter(r => r.status === 'credited').reduce((sum, r) => sum + r.rewardAmount, 0)
        };

        return NextResponse.json({
            referrals: referrals.map(r => ({
                id: r.id,
                refereeName: r.referee.name,
                refereeEmail: r.referee.email,
                refereeRole: r.referee.role,
                status: r.status,
                rewardAmount: r.rewardAmount,
                signupDate: r.createdAt,
                creditedAt: r.creditedAt
            })),
            stats
        });

    } catch (error) {
        console.error('Referral history error:', error);
        return NextResponse.json({ error: 'Failed to get referral history' }, { status: 500 });
    }
}
