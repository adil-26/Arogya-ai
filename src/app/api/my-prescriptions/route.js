import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch prescriptions given TO the patient (by doctors)
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

        // Fetch prescriptions where patient is the current user
        // These are prescriptions given BY doctors TO this patient
        const prescriptions = await prisma.prescription.findMany({
            where: {
                // Use patientId if it exists, otherwise use userId
                OR: [
                    { patientId: user.id },
                    { userId: user.id }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        // Parse medicines from each prescription and create medication entries
        const medications = [];
        for (const rx of prescriptions) {
            if (rx.medicines) {
                try {
                    const meds = JSON.parse(rx.medicines);
                    if (Array.isArray(meds)) {
                        meds.forEach((med, idx) => {
                            medications.push({
                                id: `${rx.id}-${idx}`,
                                prescriptionId: rx.id,
                                name: med.name || med.medicine || 'Unknown',
                                dosage: med.dosage || med.dose || '',
                                frequency: med.frequency || med.times || 'As directed',
                                timing: med.timing || [],
                                instructions: med.instructions || med.notes || '',
                                doctorName: rx.doctorName,
                                diagnosis: rx.diagnosis,
                                isFromDoctor: true,
                                status: rx.status || 'active',
                                createdAt: rx.createdAt
                            });
                        });
                    }
                } catch (e) {
                    // If medicines is not valid JSON, skip
                    console.error('Failed to parse medicines:', e);
                }
            }
        }

        return NextResponse.json({
            prescriptions,
            medications
        });
    } catch (error) {
        console.error('Doctor prescriptions fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 });
    }
}
