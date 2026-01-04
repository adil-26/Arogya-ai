import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

// Helper to check if user is admin
async function isAdmin(session) {
    if (!session?.user?.id) return false;
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
    });
    return user?.role === 'admin';
}

// GET: Get all referrals (Admin)
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!await isAdmin(session)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const type = searchParams.get('type');

        const where = {};
        if (status) where.status = status;
        if (type) where.referralType = type;

        const referrals = await prisma.referral.findMany({
            where,
            include: {
                referrer: {
                    select: { id: true, name: true, email: true, role: true }
                },
                referee: {
                    select: { id: true, name: true, email: true, role: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Get stats
        const allReferrals = await prisma.referral.findMany();
        const stats = {
            total: allReferrals.length,
            pending: allReferrals.filter(r => r.status === 'pending').length,
            completed: allReferrals.filter(r => r.status === 'completed').length,
            credited: allReferrals.filter(r => r.status === 'credited').length,
            totalPaid: allReferrals.filter(r => r.status === 'credited').reduce((sum, r) => sum + r.rewardAmount, 0)
        };

        return NextResponse.json({ referrals, stats });

    } catch (error) {
        console.error('Admin referrals error:', error);
        return NextResponse.json({ error: 'Failed to get referrals' }, { status: 500 });
    }
}

// PUT: Update referral status (Admin)
export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!await isAdmin(session)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { referralId, action } = body;

        if (!referralId || !action) {
            return NextResponse.json({ error: 'Missing referralId or action' }, { status: 400 });
        }

        const referral = await prisma.referral.findUnique({
            where: { id: referralId },
            include: { referrer: true }
        });

        if (!referral) {
            return NextResponse.json({ error: 'Referral not found' }, { status: 404 });
        }

        if (action === 'credit') {
            // Get settings for reward amount
            let settings = await prisma.referralSettings.findUnique({
                where: { id: 'default' }
            });
            if (!settings) {
                settings = await prisma.referralSettings.create({ data: { id: 'default' } });
            }

            // Calculate reward based on type
            let rewardAmount = 0;
            switch (referral.referralType) {
                case 'patient_to_patient':
                    rewardAmount = settings.patientToPatient;
                    break;
                case 'doctor_to_doctor':
                    rewardAmount = settings.doctorToDoctor;
                    break;
                case 'doctor_to_patient':
                    rewardAmount = settings.doctorToPatient;
                    break;
            }

            // Get or create referrer's wallet
            let wallet = await prisma.wallet.findUnique({
                where: { userId: referral.referrerId }
            });

            if (!wallet) {
                wallet = await prisma.wallet.create({
                    data: { userId: referral.referrerId, balance: 0, totalEarned: 0, totalWithdrawn: 0 }
                });
            }

            // Credit the wallet
            await prisma.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance: { increment: rewardAmount },
                    totalEarned: { increment: rewardAmount }
                }
            });

            // Create transaction
            await prisma.transaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'credit',
                    amount: rewardAmount,
                    description: `Referral reward for inviting ${referral.referee?.name || 'user'}`,
                    referenceId: referral.id,
                    status: 'completed'
                }
            });

            // Update referral status
            await prisma.referral.update({
                where: { id: referralId },
                data: {
                    status: 'credited',
                    rewardAmount,
                    creditedAt: new Date()
                }
            });

            return NextResponse.json({ message: `₹${rewardAmount} credited successfully` });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Admin referral update error:', error);
        return NextResponse.json({ error: 'Failed to update referral' }, { status: 500 });
    }
}
