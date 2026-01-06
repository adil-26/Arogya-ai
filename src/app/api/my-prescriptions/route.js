import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch prescriptions given TO the patient (by doctors)
// Note: This returns prescriptions created for this patient by doctors
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

        // Try to fetch prescriptions - handle cases where table might not exist or have different schema
        let prescriptions = [];
        let medications = [];

        try {
            // Fetch prescriptions where this patient is the recipient
            prescriptions = await prisma.prescription.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' }
            });

            // For now, return prescriptions directly
            // Doctor-prescribed medications will show when the doctor panel creates them
            for (const rx of prescriptions) {
                // Always include doctor prescriptions as medications
                medications.push({
                    id: rx.id,
                    prescriptionId: rx.id,
                    name: rx.title || 'Prescribed Medication',
                    dosage: rx.description ? (rx.description.split('-')[0] || '').trim() : '',
                    frequency: rx.description ? (rx.description.split('-')[1] || 'As directed').trim() : 'As directed',
                    timing: [],
                    instructions: rx.description || 'Follow doctor\'s instructions',
                    doctorName: rx.doctorName || 'Doctor',
                    isFromDoctor: true,
                    createdAt: rx.createdAt
                });
            }
        } catch (dbError) {
            // If database table doesn't exist or has issues, return empty array
            console.log('Prescription query info:', dbError.message);
        }

        return NextResponse.json({
            prescriptions,
            medications
        });
    } catch (error) {
        console.error('Doctor prescriptions fetch error:', error);
        // Return empty results instead of error to prevent UI breaking
        return NextResponse.json({
            prescriptions: [],
            medications: []
        });
    }
}
