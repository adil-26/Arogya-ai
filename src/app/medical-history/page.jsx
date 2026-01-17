import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Direct import from lib/auth
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
        // Attempt server-side fetch with timeout safety
        // We use Promise.race to timeout strict server fetches if DB is slow
        // But here simpler try/catch for the whole block is enough for now

        const historyPromise = prisma.patientMedicalHistory.findUnique({
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

        const userPromise = prisma.user.findUnique({
            where: { id: session.user.id },
            select: { gender: true }
        });

        // Run in parallel
        const [history, user] = await Promise.all([historyPromise, userPromise]);

        existingHistory = history;
        userGender = user?.gender || 'Other';

    } catch (error) {
        console.warn("⚠️ Server-side history fetch timed out (Connection Limit 1). Failover to client-side fetch active.");
        // Fallback: We will let the client component fetch data if initialData is null
        // This prevents the whole page from crashing with 500
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
