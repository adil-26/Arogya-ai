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
            email: true,
            image: true,
            phone: true,
            address: true,
            bloodGroup: true,
            dob: true,
            gender: true,
            emergencyContact: true,

            // Medical Data
            conditions: {
                where: { status: 'active' },
                select: { name: true, type: true }
            },
            bodyIssues: {
                where: { status: 'active' },
                select: { issue: true, organId: true, severity: true, note: true }
            },
            metrics: {
                orderBy: { recordedAt: 'desc' },
                take: 5,
                select: { type: true, value: true, unit: true, recordedAt: true }
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
                <div className="flex items-center gap-4 mb-4">
                    {user.image ? (
                        <img src={user.image} alt={user.name} className="w-20 h-20 rounded-full border-4 border-white shadow-sm object-cover" />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold text-2xl border-4 border-white shadow-sm">
                            {user.name?.charAt(0) || 'U'}
                        </div>
                    )}
                    <div>
                        <h1>{user.name}</h1>
                        <p className="text-sm opacity-90">{user.email}</p>
                    </div>
                </div>

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
                {/* 1. Personal Info */}
                <section className="info-card">
                    <h2 className="card-title text-gray-700">Personal Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500 block text-xs">Phone</span>
                            <span className="font-medium">{user.phone || '--'}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block text-xs">Address</span>
                            <span className="font-medium">{user.address || '--'}</span>
                        </div>
                    </div>
                </section>

                {/* 2. Critical Allergies */}
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

                {/* 3. Active Conditions & Body Issues */}
                <section className="info-card">
                    <h2 className="card-title">
                        <Heart size={20} className="text-pink-500" /> Current Health Status
                    </h2>

                    {user.conditions?.length > 0 && (
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-600 mb-2">Diagnosed Conditions</h3>
                            <div className="chip-container">
                                {user.conditions.map((c, idx) => (
                                    <span key={idx} className="chip">{c.name}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {user.bodyIssues?.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-2">Current Symptoms (Body Map)</h3>
                            <ul className="space-y-2">
                                {user.bodyIssues.map((b, idx) => (
                                    <li key={idx} className="text-sm bg-orange-50 p-2 rounded border border-orange-100">
                                        <div className="font-medium text-orange-800">{b.issue} ({b.organId})</div>
                                        {b.note && <div className="text-xs text-gray-600 mt-1">{b.note}</div>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>

                {/* 4. Recent Vitals */}
                {user.metrics?.length > 0 && (
                    <section className="info-card">
                        <h2 className="card-title text-green-600">Recent Vitals</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {user.metrics.map((m, i) => (
                                <div key={i} className="text-center p-2 bg-gray-50 rounded">
                                    <div className="text-xs text-gray-500 uppercase">{m.type}</div>
                                    <div className="font-bold text-lg">{m.value} <span className="text-xs font-normal text-gray-400">{m.unit}</span></div>
                                    <div className="text-[10px] text-gray-400">{new Date(m.recordedAt).toLocaleDateString()}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 5. Current Medications */}
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

                {/* 6. Surgeries */}
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

                {/* 7. Accidents */}
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

                {/* 8. Family History */}
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

                {/* 9. Birth & Childhood (Collapsed/Secondary) */}
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

                {/* 10. Reproductive History (Gender Specific) */}
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
