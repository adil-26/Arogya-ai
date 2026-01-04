import React from 'react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DoctorDashboardClient from './DoctorDashboardClient';

export default async function DoctorPage() {
    const session = await getServerSession(authOptions);

    // 1. Check if user is logged in
    if (!session) {
        redirect('/login');
    }

    // 2. Get user and check if they're a doctor
    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    // Role-based access control - redirect non-doctors
    if (!user || user.role !== 'doctor') {
        if (user?.role === 'admin') {
            redirect('/admin');
        }
        redirect('/dashboard/health');
    }

    // 3. Check if doctor is approved
    if (user.status !== 'approved') {
        redirect('/doctor/pending');
    }

    // 4. Fetch doctor's data
    const [appointments, prescriptions] = await Promise.all([
        prisma.appointment.findMany({
            where: { doctorId: user.id },
            orderBy: { date: 'desc' },
            take: 50
        }),
        prisma.prescription.findMany({
            where: { doctorId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        })
    ]);

    // Get unique patient IDs from appointments
    const patientIds = [...new Set(appointments.map(a => a.userId).filter(Boolean))];
    const patients = patientIds.length > 0 ? await prisma.user.findMany({
        where: { id: { in: patientIds } },
        select: { id: true, name: true, email: true, phone: true, gender: true, dob: true, bloodGroup: true }
    }) : [];

    // Calculate stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAppointments = appointments.filter(a => new Date(a.date) >= today).length;

    const stats = {
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        todayAppointments,
        totalPrescriptions: prescriptions.length
    };

    return (
        <DoctorDashboardClient
            doctor={user}
            initialStats={stats}
            initialAppointments={appointments}
            initialPatients={patients}
            initialPrescriptions={prescriptions}
        />
    );
}
