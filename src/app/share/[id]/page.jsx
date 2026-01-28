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

    // 3. Authorized: Fetch FULL medical info
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
            medications: {
                where: { isActive: true },
                select: { name: true, dosage: true, frequency: true }
            },
            medicalHistory: {
                select: {
                    birthHistory: true,
                    childhoodHistory: true,
                    femaleHistory: {
                        include: { pregnancies: true }
                    },
                    maleHistory: true,
                    familyHistory: true,
                    allergies: true,
                    surgeries: true,
                    accidents: {
                        include: { injuries: true }
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

    const mh = user.medicalHistory || {};

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
                {/* 1. Critical Allergies */}
                {mh.allergies?.length > 0 && (
                    <section className="info-card critical-card">
                        <h2 className="card-title text-red-600">
                            <AlertCircle size={20} /> Allergies
                        </h2>
                        <ul className="list-disc pl-5">
                            {mh.allergies.map((a, idx) => (
                                <li key={idx} className="mb-1">
                                    <strong>{a.allergen}</strong> ({a.type})
                                    {a.severity && <span className="text-sm text-red-600 ml-2"> - {a.severity}</span>}
                                    {a.reaction && <div className="text-xs text-gray-500">Reaction: {a.reaction}</div>}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* 2. Active Conditions */}
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

                {/* 3. Current Medications */}
                {user.medications?.length > 0 && (
                    <section className="info-card">
                        <h2 className="card-title text-blue-600">Current Medications</h2>
                        <ul className="space-y-2">
                            {user.medications.map((m, i) => (
                                <li key={i} className="text-sm border-b pb-1 last:border-0">
                                    <strong>{m.name}</strong> - {m.dosage} ({m.frequency})
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* 4. Surgeries */}
                {mh.surgeries?.length > 0 && (
                    <section className="info-card">
                        <h2 className="card-title">Surgical History</h2>
                        <div className="space-y-3">
                            {mh.surgeries.map((s, i) => (
                                <div key={i} className="text-sm bg-gray-50 p-2 rounded">
                                    <div className="font-semibold">{s.type} ({s.year || new Date(s.surgeryDate).getFullYear()})</div>
                                    {s.hospital && <div>🏥 {s.hospital}</div>}
                                    {s.surgeon && <div>👨‍⚕️ Dr. {s.surgeon}</div>}
                                    {s.notes && <div className="text-gray-500 italic">"{s.notes}"</div>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 5. Accidents */}
                {mh.accidents?.length > 0 && (
                    <section className="info-card">
                        <h2 className="card-title">Major Accidents</h2>
                        <div className="space-y-3">
                            {mh.accidents.map((a, i) => (
                                <div key={i} className="text-sm bg-gray-50 p-2 rounded">
                                    <div className="font-semibold">{a.type} ({a.year || new Date(a.accidentDate).getFullYear()})</div>
                                    {a.treatment && <div>Treatment: {a.treatment}</div>}
                                    {a.residualEffects && <div className="text-red-500 text-xs">Residual: {a.residualEffects}</div>}
                                    {a.injuries?.length > 0 && (
                                        <ul className="list-disc pl-4 mt-1 text-xs text-gray-600">
                                            {a.injuries.map((inj, j) => <li key={j}>{inj.injuryType} on {inj.bodyPart}</li>)}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 6. Family History */}
                {mh.familyHistory?.length > 0 && (
                    <section className="info-card">
                        <h2 className="card-title">Family History</h2>
                        <ul className="space-y-1 text-sm">
                            {mh.familyHistory.map((f, i) => (
                                <li key={i}>
                                    <strong>{f.relation}:</strong> {f.conditions.join(', ')}
                                    {f.ageDiagnosed && <span className="text-xs text-gray-500"> (Diagnosed at {f.ageDiagnosed})</span>}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* 7. Birth & Childhood (Collapsed/Secondary) */}
                {(mh.birthHistory || mh.childhoodHistory) && (
                    <section className="info-card">
                        <h2 className="card-title">Early Life History</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {mh.birthHistory && (
                                <div>
                                    <h4 className="font-semibold mb-1">Birth</h4>
                                    <p>Type: {mh.birthHistory.deliveryType} ({mh.birthHistory.birthTerm})</p>
                                    <p>Weight: {mh.birthHistory.birthWeight}</p>
                                    {mh.birthHistory.complications?.length > 0 && <p className="text-red-500">Complications: {mh.birthHistory.complications.join(', ')}</p>}
                                </div>
                            )}
                            {mh.childhoodHistory && (
                                <div>
                                    <h4 className="font-semibold mb-1">Childhood</h4>
                                    <p>Vaccinations: {mh.childhoodHistory.vaccinationStatus}</p>
                                    {mh.childhoodHistory.childhoodIllnesses?.length > 0 && <p>Illnesses: {mh.childhoodHistory.childhoodIllnesses.join(', ')}</p>}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* 8. Reproductive History (Gender Specific) */}
                {user.gender?.toLowerCase() === 'female' && mh.femaleHistory && (
                    <section className="info-card">
                        <h2 className="card-title">Reproductive Health</h2>
                        <div className="text-sm">
                            <p>Menarche Age: {mh.femaleHistory.menarcheAge}</p>
                            <p>Cycle: {mh.femaleHistory.cycleRegularity}</p>
                            {mh.femaleHistory.pregnancies?.length > 0 && (
                                <div className="mt-2">
                                    <strong>Pregnancies:</strong>
                                    <ul className="list-disc pl-4">
                                        {mh.femaleHistory.pregnancies.map((p, i) => (
                                            <li key={i}>{p.outcome} ({p.year}) - {p.deliveryType}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
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
