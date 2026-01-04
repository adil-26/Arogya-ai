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

// GET: Get all withdrawal requests
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!await isAdmin(session)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const where = {};
        if (status) where.status = status;

        const withdrawals = await prisma.withdrawalRequest.findMany({
            where,
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true, role: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Get stats
        const allWithdrawals = await prisma.withdrawalRequest.findMany();
        const stats = {
            total: allWithdrawals.length,
            pending: allWithdrawals.filter(w => w.status === 'pending').length,
            approved: allWithdrawals.filter(w => w.status === 'approved').length,
            processed: allWithdrawals.filter(w => w.status === 'processed').length,
            rejected: allWithdrawals.filter(w => w.status === 'rejected').length,
            totalPending: allWithdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + w.amount, 0),
            totalProcessed: allWithdrawals.filter(w => w.status === 'processed').reduce((sum, w) => sum + w.amount, 0)
        };

        return NextResponse.json({ withdrawals, stats });

    } catch (error) {
        console.error('Admin withdrawals error:', error);
        return NextResponse.json({ error: 'Failed to get withdrawals' }, { status: 500 });
    }
}

// PUT: Update withdrawal status (approve/reject/process)
export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!await isAdmin(session)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { withdrawalId, action, adminNote } = body;

        if (!withdrawalId || !action) {
            return NextResponse.json({ error: 'Missing withdrawalId or action' }, { status: 400 });
        }

        const withdrawal = await prisma.withdrawalRequest.findUnique({
            where: { id: withdrawalId },
            include: { user: true }
        });

        if (!withdrawal) {
            return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
        }

        if (action === 'approve') {
            await prisma.withdrawalRequest.update({
                where: { id: withdrawalId },
                data: { status: 'approved', adminNote }
            });
            return NextResponse.json({ message: 'Withdrawal approved' });
        }

        if (action === 'reject') {
            // Refund to wallet
            const wallet = await prisma.wallet.findUnique({
                where: { userId: withdrawal.userId }
            });

            if (wallet) {
                await prisma.wallet.update({
                    where: { id: wallet.id },
                    data: { balance: { increment: withdrawal.amount } }
                });

                await prisma.transaction.create({
                    data: {
                        walletId: wallet.id,
                        type: 'refund',
                        amount: withdrawal.amount,
                        description: `Withdrawal rejected: ${adminNote || 'See admin note'}`,
                        referenceId: withdrawalId,
                        status: 'completed'
                    }
                });
            }

            await prisma.withdrawalRequest.update({
                where: { id: withdrawalId },
                data: { status: 'rejected', adminNote }
            });

            return NextResponse.json({ message: 'Withdrawal rejected, amount refunded' });
        }

        if (action === 'process') {
            // Mark as processed (payment made externally)
            const wallet = await prisma.wallet.findUnique({
                where: { userId: withdrawal.userId }
            });

            if (wallet) {
                await prisma.wallet.update({
                    where: { id: wallet.id },
                    data: {
                        balance: { decrement: withdrawal.amount },
                        totalWithdrawn: { increment: withdrawal.amount }
                    }
                });

                await prisma.transaction.create({
                    data: {
                        walletId: wallet.id,
                        type: 'withdrawal',
                        amount: -withdrawal.amount,
                        description: `Withdrawal processed via ${withdrawal.upiId ? 'UPI' : 'Bank Transfer'}`,
                        referenceId: withdrawalId,
                        status: 'completed'
                    }
                });
            }

            await prisma.withdrawalRequest.update({
                where: { id: withdrawalId },
                data: {
                    status: 'processed',
                    adminNote,
                    processedAt: new Date()
                }
            });

            return NextResponse.json({ message: 'Withdrawal processed successfully' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Admin withdrawal update error:', error);
        return NextResponse.json({ error: 'Failed to update withdrawal' }, { status: 500 });
    }
}
