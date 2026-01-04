import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Dashboard stats
export async function GET() {
    try {
        const totalPatients = await prisma.user.count({ where: { role: 'patient' } });
        const totalDoctors = await prisma.user.count({ where: { role: 'doctor' } });
        const pendingDoctors = await prisma.user.count({ where: { role: 'doctor', status: 'pending' } });
        const approvedDoctors = await prisma.user.count({ where: { role: 'doctor', status: 'approved' } });
        const totalAppointments = await prisma.appointment.count();

        return NextResponse.json({
            totalPatients,
            totalDoctors,
            pendingDoctors,
            approvedDoctors,
            totalAppointments
        });
    } catch (error) {
        console.error("Stats fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
