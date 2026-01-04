import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

// GET: Get wallet balance and transactions
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get or create wallet
        let wallet = await prisma.wallet.findUnique({
            where: { userId: session.user.id },
            include: {
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 50 // Last 50 transactions
                }
            }
        });

        // Create wallet if doesn't exist
        if (!wallet) {
            wallet = await prisma.wallet.create({
                data: {
                    userId: session.user.id,
                    balance: 0,
                    totalEarned: 0,
                    totalWithdrawn: 0
                },
                include: { transactions: true }
            });
        }

        // Get pending withdrawal requests
        const pendingWithdrawals = await prisma.withdrawalRequest.findMany({
            where: {
                userId: session.user.id,
                status: 'pending'
            }
        });

        const pendingAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

        return NextResponse.json({
            balance: wallet.balance,
            availableBalance: wallet.balance - pendingAmount,
            totalEarned: wallet.totalEarned,
            totalWithdrawn: wallet.totalWithdrawn,
            pendingWithdrawal: pendingAmount,
            transactions: wallet.transactions.map(t => ({
                id: t.id,
                type: t.type,
                amount: t.amount,
                description: t.description,
                status: t.status,
                date: t.createdAt
            }))
        });

    } catch (error) {
        console.error('Wallet error:', error);
        return NextResponse.json({ error: 'Failed to get wallet' }, { status: 500 });
    }
}
