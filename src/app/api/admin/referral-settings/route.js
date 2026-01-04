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

// GET: Get referral settings
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!await isAdmin(session)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let settings = await prisma.referralSettings.findUnique({
            where: { id: 'default' }
        });

        if (!settings) {
            settings = await prisma.referralSettings.create({
                data: { id: 'default' }
            });
        }

        return NextResponse.json(settings);

    } catch (error) {
        console.error('Settings fetch error:', error);
        return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 });
    }
}

// PUT: Update referral settings
export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!await isAdmin(session)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { patientToPatient, doctorToDoctor, doctorToPatient, minWithdrawal, isEnabled } = body;

        const settings = await prisma.referralSettings.upsert({
            where: { id: 'default' },
            update: {
                patientToPatient: patientToPatient !== undefined ? patientToPatient : undefined,
                doctorToDoctor: doctorToDoctor !== undefined ? doctorToDoctor : undefined,
                doctorToPatient: doctorToPatient !== undefined ? doctorToPatient : undefined,
                minWithdrawal: minWithdrawal !== undefined ? minWithdrawal : undefined,
                isEnabled: isEnabled !== undefined ? isEnabled : undefined
            },
            create: {
                id: 'default',
                patientToPatient: patientToPatient || 50,
                doctorToDoctor: doctorToDoctor || 100,
                doctorToPatient: doctorToPatient || 75,
                minWithdrawal: minWithdrawal || 100,
                isEnabled: isEnabled !== undefined ? isEnabled : true
            }
        });

        return NextResponse.json({
            message: 'Settings updated successfully',
            settings
        });

    } catch (error) {
        console.error('Settings update error:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
