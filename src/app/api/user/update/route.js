import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, dob, gender, bloodGroup, phone, address, emergencyContact, conditions } = body;

        // 1. Update User Profile
        const updatedUser = await prisma.user.update({
            where: { email },
            data: {
                dob,
                gender,
                bloodGroup,
                phone,
                address,
                emergencyContact,
                // Calculate age if needed, or rely on DOB
                // age: calculateAge(dob) 
            }
        });

        // 2. Add Medical Conditions (if any)
        if (conditions && conditions.length > 0) {
            // Find user ID first (needed for relation)
            // Actually updatedUser has ID

            const conditionPromises = conditions.map(cond => {
                return prisma.medicalCondition.create({
                    data: {
                        userId: updatedUser.id,
                        name: cond.name,
                        since: cond.since,
                        type: 'Chronic', // Default type
                        status: 'active'
                    }
                });
            });

            await Promise.all(conditionPromises);
        }

        return NextResponse.json({ message: "Profile & History Updated", user: updatedUser });

    } catch (error) {
        console.error("Update Error", error);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
