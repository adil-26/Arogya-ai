import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Generate unique referral code
function generateReferralCode(name, id) {
    const prefix = (name || 'USER').substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X');
    const suffix = id.substring(0, 4).toUpperCase();
    return `${prefix}${suffix}`;
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { role, email: rawEmail, password, name, age, dob, gender, bloodGroup, phone, address, emergencyContact, specialty, licenseNo, referralCode } = body;
        const email = rawEmail.trim().toLowerCase(); // Sanitize email

        // 1. Check if user exists
        const existing = await prisma.user.findUnique({
            where: { email }
        });

        if (existing) {
            // SPECIAL HANDLING FOR MOCK GOOGLE USER (Reset password to ensure login works)
            if (email === 'google-user@example.com') {
                await prisma.user.update({
                    where: { email },
                    data: { password } // Update to the expected mock password
                });
                return NextResponse.json({ message: "Mock User Updated" });
            }
            return NextResponse.json({ error: "Email already registered" }, { status: 400 });
        }

        // 2. Check if referral code is valid
        let referrerId = null;
        let referrer = null;
        if (referralCode) {
            referrer = await prisma.user.findUnique({
                where: { referralCode: referralCode.toUpperCase().trim() }
            });
            if (referrer) {
                referrerId = referrer.id;
            }
        }

        // 3. Create User
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password, // In prod, hash this: await bcrypt.hash(password, 10)
                role,
                // Status: Doctors are pending, Patients are approved
                status: role === 'doctor' ? 'pending' : 'approved',
                referredBy: referrerId,

                // Patient Fields (ignored if undefined)
                age: age ? parseInt(age) : undefined,
                dob,
                gender,
                bloodGroup,
                phone,
                address,
                emergencyContact,

                // Doctor Fields
                specialty,
                licenseNo
            }
        });

        // 4. Generate referral code for new user
        const userReferralCode = generateReferralCode(name, newUser.id);
        await prisma.user.update({
            where: { id: newUser.id },
            data: { referralCode: userReferralCode }
        });

        // 5. Create wallet for new user
        await prisma.wallet.create({
            data: {
                userId: newUser.id,
                balance: 0,
                totalEarned: 0,
                totalWithdrawn: 0
            }
        });

        // 6. Create referral record if referred by someone
        if (referrerId && referrer) {
            // Determine referral type
            let referralType = 'patient_to_patient';
            if (referrer.role === 'doctor' && role === 'doctor') {
                referralType = 'doctor_to_doctor';
            } else if (referrer.role === 'doctor' && role === 'patient') {
                referralType = 'doctor_to_patient';
            }

            await prisma.referral.create({
                data: {
                    referrerId,
                    refereeId: newUser.id,
                    referralType,
                    status: 'pending',
                    rewardAmount: 0
                }
            });
        }

        return NextResponse.json({
            message: "User created",
            user: { ...newUser, referralCode: userReferralCode },
            referredBy: referrer?.name || null
        });

    } catch (error) {
        console.error("Register Error", error);
        return NextResponse.json({ error: "Registration failed" }, { status: 500 });
    }
}
