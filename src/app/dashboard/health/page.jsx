import React from 'react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AppShell from '../../../components/layout/AppShell';
import HealthDashboard from '../../../pages/Dashboard/HealthDashboard';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    // Fetch fresh user data to check onboarding status and role
    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    // Role-based access control - redirect non-patients
    if (user) {
        if (user.role === 'admin') {
            redirect('/admin');
        }
        if (user.role === 'doctor') {
            redirect('/doctor');
        }
    }

    if (user && user.role === 'patient') {
        // Check if essential fields are missing
        if (!user.dob || !user.bloodGroup) {
            redirect('/onboarding');
        }
    }

    return (
        <AppShell>
            <HealthDashboard />
        </AppShell>
    );
}
