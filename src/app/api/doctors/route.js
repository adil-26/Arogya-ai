import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch all approved doctors
export async function GET(request) {
    try {
        const doctors = await prisma.user.findMany({
            where: {
                role: 'doctor',
                status: 'approved'
            },
            select: {
                id: true,
                name: true,
                email: true,
                specialty: true,
                phone: true,
                // Additional fields for display
                licenseNo: true,
                createdAt: true
            },
            orderBy: { name: 'asc' }
        });

        // Transform for frontend
        const formattedDoctors = doctors.map(doc => ({
            id: doc.id,
            name: `Dr. ${doc.name}`,
            specialty: doc.specialty || 'General Physician',
            experience: '5+ years', // TODO: Add experience field to schema
            rating: 4.5, // TODO: Add rating system
            reviewCount: 0,
            location: 'Clinic', // TODO: Add location field
            fee: 500, // TODO: Add fee field
            email: doc.email,
            phone: doc.phone,
            imageUrl: null
        }));

        return NextResponse.json(formattedDoctors);
    } catch (error) {
        console.error("Doctors fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch doctors" }, { status: 500 });
    }
}
