import React from 'react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminPage() {
    const session = await getServerSession(authOptions);
    console.log("AdminPage: Rendering for user", session?.user?.email);

    // 1. Check if user is logged in
    if (!session) {
        redirect('/admin/login');
    }

    // 2. Check if user is an admin (Use Session to save DB connection)
    if (!session?.user?.role || session.user.role !== 'admin') {
        // Not an admin - redirect to their dashboard
        redirect('/dashboard/health');
    }

    // 3. Fetch initial data server-side (Optimized for single connection)

    // Stats: Use groupBy to get User counts in one query
    const userGroups = await prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
    });

    const pendingDoctorsCount = await prisma.user.count({ where: { role: 'doctor', status: 'pending' } });
    const totalAppointments = await prisma.appointment.count();

    // Map groupBy results
    let totalPatients = 0;
    let totalDoctors = 0;

    userGroups.forEach(group => {
        if (group.role === 'patient') totalPatients = group._count.role;
        if (group.role === 'doctor') totalDoctors = group._count.role;
    });

    const stats = { totalPatients, totalDoctors, pendingDoctors: pendingDoctorsCount, totalAppointments };

    // Pending Doctors
    const pendingDoctors = await prisma.user.findMany({
        where: { role: 'doctor', status: 'pending' },
        select: { id: true, name: true, email: true, specialty: true, licenseNo: true, createdAt: true }
    });

    // All Users
    const allUsers = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, status: true, isPremium: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 100
    });

    // All Appointments
    const allAppointments = await prisma.appointment.findMany({
        orderBy: { date: 'desc' },
        take: 50
    });

    // Library Items
    const libraryItems = await prisma.libraryItem.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <AdminDashboardClient
            initialStats={stats}
            initialPendingDoctors={pendingDoctors}
            initialUsers={allUsers}
            initialAppointments={allAppointments}
            initialLibraryItems={libraryItems}
            currentAdmin={session.user}
        />
    );
}
