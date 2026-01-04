import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// POST: Create a new prescription
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify the user is a doctor
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user || user.role !== 'doctor') {
            return NextResponse.json({ error: "Only doctors can create prescriptions" }, { status: 403 });
        }

        const data = await request.json();

        const prescription = await prisma.prescription.create({
            data: {
                doctorId: data.doctorId,
                doctorName: data.doctorName,
                patientId: data.patientId,
                patientName: data.patientName,
                type: data.type, // "medicine" or "acupuncture"
                diagnosis: data.diagnosis || null,
                notes: data.notes || null,
                medicines: data.medicines || null,
                acupoints: data.acupoints || null,
                duration: data.duration || null,
                frequency: data.frequency || null,
                status: 'active'
            }
        });

        return NextResponse.json(prescription);
    } catch (error) {
        console.error("Prescription create error:", error);
        return NextResponse.json({ error: "Failed to create prescription: " + error.message }, { status: 500 });
    }
}

// GET: Get prescriptions for a doctor or patient
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // Optional filter

        let where = {};
        if (user.role === 'doctor') {
            where.doctorId = user.id;
        } else if (user.role === 'patient') {
            where.patientId = user.id;
        }

        if (type) {
            where.type = type;
        }

        const prescriptions = await prisma.prescription.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(prescriptions);
    } catch (error) {
        console.error("Prescription fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch prescriptions" }, { status: 500 });
    }
}
