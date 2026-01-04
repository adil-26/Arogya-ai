import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

// POST: Request withdrawal
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { amount, upiId, bankAccount, bankIfsc, bankName } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        if (!upiId && !bankAccount) {
            return NextResponse.json({ error: 'Please provide UPI ID or bank account details' }, { status: 400 });
        }

        // Get referral settings for min withdrawal
        let settings = await prisma.referralSettings.findUnique({
            where: { id: 'default' }
        });

        if (!settings) {
            settings = await prisma.referralSettings.create({
                data: { id: 'default' }
            });
        }

        if (amount < settings.minWithdrawal) {
            return NextResponse.json({
                error: `Minimum withdrawal amount is ₹${settings.minWithdrawal}`
            }, { status: 400 });
        }

        // Check wallet balance
        const wallet = await prisma.wallet.findUnique({
            where: { userId: session.user.id }
        });

        if (!wallet) {
            return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
        }

        // Check pending withdrawals
        const pendingWithdrawals = await prisma.withdrawalRequest.findMany({
            where: { userId: session.user.id, status: 'pending' }
        });
        const pendingAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);
        const availableBalance = wallet.balance - pendingAmount;

        if (amount > availableBalance) {
            return NextResponse.json({
                error: `Insufficient balance. Available: ₹${availableBalance}`
            }, { status: 400 });
        }

        // Create withdrawal request
        const withdrawal = await prisma.withdrawalRequest.create({
            data: {
                userId: session.user.id,
                amount,
                upiId: upiId || null,
                bankAccount: bankAccount || null,
                bankIfsc: bankIfsc || null,
                bankName: bankName || null,
                status: 'pending'
            }
        });

        return NextResponse.json({
            message: 'Withdrawal request submitted successfully',
            withdrawal: {
                id: withdrawal.id,
                amount: withdrawal.amount,
                status: withdrawal.status,
                createdAt: withdrawal.createdAt
            }
        });

    } catch (error) {
        console.error('Withdrawal error:', error);
        return NextResponse.json({ error: 'Failed to process withdrawal request' }, { status: 500 });
    }
}

// GET: Get withdrawal history
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const withdrawals = await prisma.withdrawalRequest.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(withdrawals.map(w => ({
            id: w.id,
            amount: w.amount,
            upiId: w.upiId,
            bankAccount: w.bankAccount ? `****${w.bankAccount.slice(-4)}` : null,
            status: w.status,
            adminNote: w.adminNote,
            createdAt: w.createdAt,
            processedAt: w.processedAt
        })));

    } catch (error) {
        console.error('Withdrawal history error:', error);
        return NextResponse.json({ error: 'Failed to get withdrawal history' }, { status: 500 });
    }
}
