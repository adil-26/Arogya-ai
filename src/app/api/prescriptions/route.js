import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Fetch user's prescriptions
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

        const prescriptions = await prisma.prescription.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                medications: true
            }
        });

        return NextResponse.json({ prescriptions });
    } catch (error) {
        console.error('Prescriptions fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 });
    }
}

// POST - Create new prescription
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

        const prescription = await prisma.prescription.create({
            data: {
                userId: user.id,
                title: data.title,
                description: data.description,
                doctorName: data.doctorName,
                doctorId: data.doctorId,
                fileUrl: data.fileUrl,
                fileData: data.fileData,  // Base64 encoded
                fileType: data.fileType,
                fileName: data.fileName,
                issuedDate: data.issuedDate ? new Date(data.issuedDate) : new Date(),
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : null
            }
        });

        return NextResponse.json({ prescription, message: 'Prescription uploaded successfully' });
    } catch (error) {
        console.error('Prescription create error:', error);
        return NextResponse.json({ error: 'Failed to create prescription' }, { status: 500 });
    }
}

// DELETE - Delete a prescription
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
        const prescriptionId = searchParams.get('id');

        if (!prescriptionId) {
            return NextResponse.json({ error: 'Prescription ID required' }, { status: 400 });
        }

        // Verify ownership
        const prescription = await prisma.prescription.findFirst({
            where: { id: prescriptionId, userId: user.id }
        });

        if (!prescription) {
            return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
        }

        await prisma.prescription.delete({
            where: { id: prescriptionId }
        });

        return NextResponse.json({ message: 'Prescription deleted successfully' });
    } catch (error) {
        console.error('Prescription delete error:', error);
        return NextResponse.json({ error: 'Failed to delete prescription' }, { status: 500 });
    }
}
