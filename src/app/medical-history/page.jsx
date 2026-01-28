import React from 'react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import HistoryWizard from '@/components/medical-history/HistoryWizard';
import AppShell from '@/components/layout/AppShell';

export default async function MedicalHistoryPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    let existingHistory = null;
    let userGender = 'Other';

    try {
        // Fetch User and History
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                medicalHistory: {
                    include: {
                        birthHistory: true,
                        childhoodHistory: true,
                        femaleHistory: true,
                        maleHistory: true,
                        familyHistory: true,
                        surgeries: true,
                        allergies: true,
                        accidents: true
                    }
                }
            }
        });

        if (user) {
            userGender = user.gender || 'Other';

            // If medicalHistory is an array (hasMany) vs single relation (hasOne)
            // Schema implies One-to-One usually for MedicalHistory, but let's check structure
            // Provided code used findUnique on PatientMedicalHistory, assuming independent model?
            // Dashboard used `user.medicalHistory`. Let's stick to the previous successful pattern if possible.
            // But wait, the previous code in this file used `prisma.patientMedicalHistory.findUnique`.
            // Let's keep the user fetch robust.

            existingHistory = user.medicalHistory ? (Array.isArray(user.medicalHistory) ? user.medicalHistory[0] : user.medicalHistory) : null;

            // Double check if we need to fetch independent table if relation is not set up perfectly?
            if (!existingHistory) {
                existingHistory = await prisma.patientMedicalHistory.findUnique({
                    where: { userId: session.user.id },
                    include: {
                        birthHistory: true,
                        childhoodHistory: true,
                        femaleHistory: true,
                        maleHistory: true,
                        familyHistory: true,
                        surgeries: true,
                        allergies: true,
                        accidents: true
                    }
                });
            }
        }

    } catch (error) {
        console.error("Medical History Page DB Error:", error);
        // Fallback to client-side
    }

    return (
        <AppShell>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
                <HistoryWizard
                    initialData={existingHistory}
                    userGender={userGender}
                    shouldFetchClientSide={!existingHistory} // Signal to client to try fetching
                />
            </div>
        </AppShell>
    );
}
