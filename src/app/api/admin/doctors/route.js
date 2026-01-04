import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET: List all doctors (optionally filtered by status)
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        // Basic admin check (in production, check session.user.role === 'admin')
        // For now, allowing access for development

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status'); // 'pending', 'approved', 'all'

        const where = { role: 'doctor' };
        if (status && status !== 'all') {
            where.status = status;
        }

        const doctors = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                specialty: true,
                licenseNo: true,
                status: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(doctors);
    } catch (error) {
        console.error("Admin doctors fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch doctors" }, { status: 500 });
    }
}

// PATCH: Approve or Reject a doctor
export async function PATCH(request) {
    try {
        const body = await request.json();
        const { doctorId, action } = body; // action: 'approve' or 'reject'

        if (!doctorId || !action) {
            return NextResponse.json({ error: "Missing doctorId or action" }, { status: 400 });
        }

        const newStatus = action === 'approve' ? 'approved' : 'rejected';

        const updated = await prisma.user.update({
            where: { id: doctorId },
            data: { status: newStatus }
        });

        return NextResponse.json({ message: `Doctor ${newStatus}`, doctor: updated });
    } catch (error) {
        console.error("Admin doctor update error:", error);
        return NextResponse.json({ error: "Failed to update doctor" }, { status: 500 });
    }
}
