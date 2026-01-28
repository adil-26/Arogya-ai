import { prisma } from '@/lib/prisma';
import React from 'react';
import { notFound } from 'next/navigation';
import { AlertCircle, Phone, Heart } from 'lucide-react';
import './ShareProfile.css';
import { cookies } from 'next/headers';
import ShareGate from '@/components/share/ShareGate';

// Force dynamic rendering since this depends on the ID param
export const dynamic = 'force-dynamic';

export default async function SharedProfilePage({ params }) {
    const resolvedParams = await params; // Properly await params in Next.js 15+
    const { id } = resolvedParams;

    if (!id) return notFound();

    // 1. Check for Authorization Cookie
    const cookieStore = await cookies();
    const hasAccess = cookieStore.get(`med_share_access_${id}`);

    // 2. Gate: If no secure cookie, show PIN entry screen
    if (!hasAccess) {
        return <ShareGate userId={id} />;
    }

    // 3. Authorized: Fetch vital medical info only (Restriction for privacy)
    const user = await prisma.user.findUnique({
        where: { id: id },
        select: {
            name: true,
            bloodGroup: true,
            dob: true,
            gender: true,
            emergencyContact: true,
            conditions: {
                where: { status: 'active' },
                select: { name: true, type: true }
            },
            medicalHistory: {
                select: {
                    allergies: {
                        select: { allergen: true, type: true, severity: true }
                    },
                    surgeries: {
                        select: { type: true, year: true }
                    },
                    accidents: {
                        select: { type: true, year: true, accidentDate: true }
                    }
                }
            }
        }
    });

    if (!user) {
        return (
            <div className="share-container error-screen">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h1>Profile Not Found</h1>
                <p>The medical ID you are looking for does not exist or has been removed.</p>
            </div>
        );
    }

    // Calculate Age
    const getAge = (dob) => {
        if (!dob) return '--';
        const birthDate = new Date(dob);
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    return (
        <div className="share-container">
            <header className="share-header">
                <div className="header-badge">MEDICAL ID</div>
                <h1>{user.name}</h1>
                <div className="vital-grid">
                    <div className="vital-item">
                        <span className="label">Blood Type</span>
                        <span className="value critical">{user.bloodGroup || '--'}</span>
                    </div>
                    <div className="vital-item">
                        <span className="label">Age/Gender</span>
                        <span className="value">{getAge(user.dob)} / {user.gender || '--'}</span>
                    </div>
                </div>
            </header>

            <main className="share-content">
                {/* Allergies - HIGH PRIORITY */}
                {user.medicalHistory?.allergies?.length > 0 && (
                    <section className="info-card critical-card">
                        <h2 className="card-title text-red-600">
                            <AlertCircle size={20} /> Allergies
                        </h2>
                        <ul className="list-disc pl-5">
                            {user.medicalHistory.allergies.map((allergy, idx) => (
                                <li key={idx} className="mb-1">
                                    <strong>{allergy.allergen}</strong>
                                    {allergy.severity && <span className="text-sm text-red-600 ml-2">({allergy.severity})</span>}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Active Conditions */}
                <section className="info-card">
                    <h2 className="card-title">
                        <Heart size={20} className="text-pink-500" /> Medical Conditions
                    </h2>
                    {user.conditions?.length > 0 ? (
                        <div className="chip-container">
                            {user.conditions.map((c, idx) => (
                                <span key={idx} className="chip">{c.name}</span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No active conditions listed.</p>
                    )}
                </section>

                {/* Surgeries & Accidents (Brief) */}
                {(user.medicalHistory?.surgeries?.length > 0 || user.medicalHistory?.accidents?.length > 0) && (
                    <section className="info-card">
                        <h2 className="card-title text-blue-600">History Summary</h2>
                        <ul className="text-sm text-gray-700 space-y-2">
                            {user.medicalHistory?.surgeries?.map((s, i) => (
                                <li key={`s-${i}`}>Surgery: {s.type} ({s.year})</li>
                            ))}
                            {user.medicalHistory?.accidents?.map((a, i) => (
                                <li key={`a-${i}`}>Accident: {a.type} ({a.year})</li>
                            ))}
                        </ul>
                    </section>
                )}


                {/* Emergency Contact */}
                {user.emergencyContact && (
                    <section className="info-card contact-card">
                        <h2 className="card-title">
                            <Phone size={20} className="text-green-600" /> Emergency Contact
                        </h2>
                        <p className="contact-number">{user.emergencyContact}</p>
                    </section>
                )}

                <div className="footer-note">
                    <p>Verified by E2Care • {new Date().toLocaleDateString()}</p>
                </div>
            </main>
        </div>
    );
}
