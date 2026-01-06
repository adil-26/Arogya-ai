import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Fetch user's medications
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('active') === 'true';

        const medications = await prisma.medication.findMany({
            where: {
                userId: user.id,
                ...(activeOnly && { isActive: true })
            },
            orderBy: { createdAt: 'desc' },
            include: {
                prescription: {
                    select: { id: true, title: true }
                }
            }
        });

        return NextResponse.json({ medications });
    } catch (error) {
        console.error('Medications fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch medications' }, { status: 500 });
    }
}

// POST - Create new medication
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const data = await request.json();

        const medication = await prisma.medication.create({
            data: {
                userId: user.id,
                prescriptionId: data.prescriptionId || null,
                name: data.name,
                dosage: data.dosage,
                frequency: data.frequency,
                timing: data.timing || [],
                instructions: data.instructions,
                startDate: data.startDate ? new Date(data.startDate) : new Date(),
                endDate: data.endDate ? new Date(data.endDate) : null,
                isActive: data.isActive !== undefined ? data.isActive : true,
                reminderEnabled: data.reminderEnabled !== undefined ? data.reminderEnabled : true
            }
        });

        return NextResponse.json({ medication, message: 'Medication added successfully' });
    } catch (error) {
        console.error('Medication create error:', error);
        return NextResponse.json({ error: 'Failed to create medication' }, { status: 500 });
    }
}

// PUT - Update medication
export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const data = await request.json();

        if (!data.id) {
            return NextResponse.json({ error: 'Medication ID required' }, { status: 400 });
        }

        // Verify ownership
        const existing = await prisma.medication.findFirst({
            where: { id: data.id, userId: user.id }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Medication not found' }, { status: 404 });
        }

        const medication = await prisma.medication.update({
            where: { id: data.id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.dosage && { dosage: data.dosage }),
                ...(data.frequency && { frequency: data.frequency }),
                ...(data.timing && { timing: data.timing }),
                ...(data.instructions !== undefined && { instructions: data.instructions }),
                ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
                ...(data.isActive !== undefined && { isActive: data.isActive }),
                ...(data.reminderEnabled !== undefined && { reminderEnabled: data.reminderEnabled })
            }
        });

        return NextResponse.json({ medication, message: 'Medication updated successfully' });
    } catch (error) {
        console.error('Medication update error:', error);
        return NextResponse.json({ error: 'Failed to update medication' }, { status: 500 });
    }
}

// DELETE - Delete a medication
export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const medicationId = searchParams.get('id');

        if (!medicationId) {
            return NextResponse.json({ error: 'Medication ID required' }, { status: 400 });
        }

        // Verify ownership
        const medication = await prisma.medication.findFirst({
            where: { id: medicationId, userId: user.id }
        });

        if (!medication) {
            return NextResponse.json({ error: 'Medication not found' }, { status: 404 });
        }

        await prisma.medication.delete({
            where: { id: medicationId }
        });

        return NextResponse.json({ message: 'Medication deleted successfully' });
    } catch (error) {
        console.error('Medication delete error:', error);
        return NextResponse.json({ error: 'Failed to delete medication' }, { status: 500 });
    }
}
