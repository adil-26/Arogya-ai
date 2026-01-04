import React, { useState, useEffect } from 'react';
import { Star, MapPin, Clock, ArrowLeft, MessageCircle, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import './DoctorsPage.css'; // Reusing styles

const DoctorProfile = ({ doctorId }) => {
    const router = useRouter();
    const [doctor, setDoctor] = useState(null);

    // Mock Database (Since we don't have a full Doctor API yet)
    // In real app, fetch /api/doctors/:id
    const mockDoctors = [
        { id: 1, name: "Dr. Ayesha Khan", specialty: "Cardiologist", experience: "8 years", rating: 4.9, reviewCount: 124, location: "City Hospital, Block A", fee: 1500, bio: "Dr. Ayesha is a senior cardiologist with expertise in interventional cardiology. She has performed over 500 successful procedures.", education: "MBBS, MD (Cardiology) - AIIMS", hours: "Mon-Sat: 10:00 AM - 07:00 PM" },
        { id: 2, name: "Dr. Rahul Verma", specialty: "General Physician", experience: "12 years", rating: 4.5, reviewCount: 89, location: "Health Plus Clinic", fee: 800, bio: "Dr. Rahul specializes in family medicine and preventive healthcare. He is known for his patient-centric approach.", education: "MBBS, DNB (Internal Medicine)", hours: "Mon-Sat: 09:00 AM - 09:00 PM" },
        { id: 3, name: "Dr. Emily Chen", specialty: "Dermatologist", experience: "5 years", rating: 4.8, reviewCount: 56, location: "Care Point Center", fee: 1200, bio: "Dr. Emily is an expert in clinical and cosmetic dermatology.", education: "MBBS, MD (Dermatology)", hours: "Mon-Fri: 11:00 AM - 05:00 PM" },
        { id: 4, name: "Dr. Sameer Patel", specialty: "Dentist", experience: "10 years", rating: 4.7, reviewCount: 210, location: "Smile Dental Studio", fee: 1000, bio: "Dr. Sameer is a certified orthodontist with a decade of experience in smile designing.", education: "BDS, MDS (Orthodontics)", hours: "Mon-Sat: 10:00 AM - 08:00 PM" },
    ];

    useEffect(() => {
        const found = mockDoctors.find(d => d.id.toString() === doctorId);
        setDoctor(found);
    }, [doctorId]);

    if (!doctor) return <div style={{ padding: 40 }}>Loading Doctor Profile...</div>;

    return (
        <div className="doctor-profile-page" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', marginBottom: '20px', color: '#666' }}>
                <ArrowLeft size={18} /> Back to List
            </button>

            {/* Profile Header Card */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', gap: '30px', alignItems: 'start' }}>
                <div style={{ width: '120px', height: '120px', background: '#E0E7FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#4F46E5', fontWeight: 'bold' }}>
                    {doctor.name[4]}
                </div>
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', color: '#1F2937' }}>{doctor.name}</h1>
                    <p style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#4F46E5', fontWeight: '500' }}>{doctor.specialty}</p>

                    <div style={{ display: 'flex', gap: '20px', color: '#6B7280', fontSize: '0.95rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={16} fill="#FBBF24" color="#FBBF24" /> {doctor.rating} ({doctor.reviewCount} Reviews)</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> {doctor.location}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> {doctor.experience} Exp</div>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '200px' }}>
                    <button style={{ padding: '12px', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Calendar size={18} /> Book Appointment
                    </button>
                    <button style={{ padding: '12px', background: 'white', color: '#4F46E5', border: '1px solid #4F46E5', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <MessageCircle size={18} /> Chat with Doctor
                    </button>
                </div>
            </div>

            {/* Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '30px' }}>
                <div style={{ background: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>About Doctor</h3>
                    <p style={{ lineHeight: '1.6', color: '#374151' }}>{doctor.bio}</p>

                    <h4 style={{ marginTop: '30px', marginBottom: '10px' }}>Education & Training</h4>
                    <p style={{ color: '#374151' }}>{doctor.education}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                        <h4 style={{ margin: '0 0 15px 0' }}>Consultation Fee</h4>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10B981' }}>₹{doctor.fee} <span style={{ fontSize: '0.9rem', color: '#9CA3AF', fontWeight: 'normal' }}>/ visit</span></div>
                    </div>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                        <h4 style={{ margin: '0 0 15px 0' }}>Clinic Timings</h4>
                        <div style={{ color: '#374151' }}>{doctor.hours}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
