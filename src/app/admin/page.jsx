import React from 'react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminPage() {
    const session = await getServerSession(authOptions);

    // 1. Check if user is logged in
    if (!session) {
        redirect('/admin/login');
    }

    // 2. Check if user is an admin
    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user || user.role !== 'admin') {
        // Not an admin - redirect to their dashboard
        redirect('/dashboard/health');
    }

    // 3. Fetch initial data server-side for faster load
    const [stats, pendingDoctors, allUsers, allAppointments, libraryItems] = await Promise.all([
        // Stats
        prisma.user.count({ where: { role: 'patient' } }).then(async (patients) => {
            const doctors = await prisma.user.count({ where: { role: 'doctor' } });
            const pending = await prisma.user.count({ where: { role: 'doctor', status: 'pending' } });
            const appointments = await prisma.appointment.count();
            return { totalPatients: patients, totalDoctors: doctors, pendingDoctors: pending, totalAppointments: appointments };
        }),
        // Pending Doctors
        prisma.user.findMany({
            where: { role: 'doctor', status: 'pending' },
            select: { id: true, name: true, email: true, specialty: true, licenseNo: true, createdAt: true }
        }),
        // All Users
        prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 100
        }),
        // All Appointments
        prisma.appointment.findMany({
            orderBy: { date: 'desc' },
            take: 50
        }),
        // Library Items
        prisma.libraryItem.findMany({
            orderBy: { createdAt: 'desc' }
        })
    ]);

    return (
        <AdminDashboardClient
            initialStats={stats}
            initialPendingDoctors={pendingDoctors}
            initialUsers={allUsers}
            initialAppointments={allAppointments}
            initialLibraryItems={libraryItems}
            currentAdmin={user}
        />
    );
}
