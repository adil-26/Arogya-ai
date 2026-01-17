import React from 'react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AppShell from '../../../components/layout/AppShell';
import HealthDashboard from '../../../pages-old-react-router/Dashboard/HealthDashboard';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    // Fetch fresh user data to check onboarding status and role
    // Role-based access control - redirect non-patients
    // Trust session role first to avoid DB call for redirects
    if (session.user.role === 'admin') redirect('/admin');
    if (session.user.role === 'doctor') redirect('/doctor');

    // 2. Fetch User + Medical History in ONE query to save connections
    let user = null;
    try {
        user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                medicalHistory: {
                    select: { completionStatus: true }
                }
            }
        });
    } catch (error) {
        console.error("Dashboard DB Error (Non-fatal):", error.message);
        // Fallback: If DB fails, we rely purely on session data.
        // We'll skip the strict onboarding/role checks from DB and assume session is correct.
    }

    if (user) {
        // Double check role from DB in case session is stale
        if (user.role === 'admin') redirect('/admin');
        if (user.role === 'doctor') redirect('/doctor');

        // Check if essential profile fields are missing
        const isProfileIncomplete = !user.dob || !user.bloodGroup || !user.gender || !user.phone;

        if (isProfileIncomplete) {
            redirect('/onboarding');
        }
    }

    const completionStatus = user?.medicalHistory?.completionStatus || 0;

    return (
        <AppShell>
            <HealthDashboard completionStatus={completionStatus} />
        </AppShell>
    );
}
