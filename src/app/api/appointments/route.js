import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

// GET: Fetch appointments for the logged-in user
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit');

        const appointments = await prisma.appointment.findMany({
            where: { userId: session.user.id },
            orderBy: { date: 'desc' },
            take: limit ? parseInt(limit) : undefined
        });
        return NextResponse.json(appointments);
    } catch (error) {
        console.error("Appointments Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
    }
}

// POST: Book new appointment
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        console.log("Received Booking Request:", data);

        const userId = session.user.id;

        // Create Appointment
        console.log("Creating Appointment Record for user:", userId);
        const newAppointment = await prisma.appointment.create({
            data: {
                userId: userId,
                doctorId: data.doctorId,
                doctorName: data.doctorName,
                specialty: data.specialty,
                date: data.date,
                time: data.time,
                status: 'scheduled'
            }
        });

        console.log("Appointment Created:", newAppointment);
        return NextResponse.json(newAppointment);

    } catch (error) {
        console.error("FINAL BOOKING ERROR:", error);
        return NextResponse.json({
            error: "Failed to book appointment",
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}


// PATCH: Update appointment status (complete/cancel)
export async function PATCH(request) {
    try {
        const data = await request.json();
        const { appointmentId, status } = data;

        if (!appointmentId || !status) {
            return NextResponse.json({ error: "Missing appointmentId or status" }, { status: 400 });
        }

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId }
        });

        if (!appointment) {
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
        }

        // Update appointment status
        const updated = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status }
        });

        // If completing the appointment, check for referral reward
        if (status === 'completed') {
            await processReferralReward(appointment.userId);
        }

        return NextResponse.json(updated);

    } catch (error) {
        console.error("Appointment update error:", error);
        return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
    }
}

// Helper function to process referral reward after first completed appointment
async function processReferralReward(userId) {
    try {
        // Check if this is the user's FIRST completed appointment
        const completedCount = await prisma.appointment.count({
            where: { userId, status: 'completed' }
        });

        // Only process on first appointment
        if (completedCount !== 1) return;

        // Check if user was referred
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { referredBy: true, role: true, name: true }
        });

        if (!user?.referredBy) return;

        // Find the referral record
        const referral = await prisma.referral.findFirst({
            where: {
                refereeId: userId,
                status: 'pending'
            },
            include: { referrer: true }
        });

        if (!referral) return;

        // Get reward settings
        let settings = await prisma.referralSettings.findUnique({
            where: { id: 'default' }
        });

        if (!settings) {
            settings = await prisma.referralSettings.create({
                data: { id: 'default' }
            });
        }

        // Calculate reward based on referral type
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
                data: {
                    userId: referral.referrerId,
                    balance: 0,
                    totalEarned: 0,
                    totalWithdrawn: 0
                }
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

        // Create transaction record
        await prisma.transaction.create({
            data: {
                walletId: wallet.id,
                type: 'credit',
                amount: rewardAmount,
                description: `Referral reward: ${user.name || 'User'} completed first appointment`,
                referenceId: referral.id,
                status: 'completed'
            }
        });

        // Update referral status
        await prisma.referral.update({
            where: { id: referral.id },
            data: {
                status: 'credited',
                rewardAmount,
                creditedAt: new Date()
            }
        });

        console.log(`Referral reward of ₹${rewardAmount} credited to ${referral.referrer?.name}`);

    } catch (error) {
        console.error("Error processing referral reward:", error);
        // Don't throw - allow appointment to complete even if referral fails
    }
}
