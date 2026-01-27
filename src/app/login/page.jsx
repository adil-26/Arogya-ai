'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { User, Stethoscope, ShieldCheck } from 'lucide-react';

export default function LoginSelectionPage() {
    const router = useRouter();

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6' }}>
            <div style={{ width: '100%', maxWidth: '900px', padding: '20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ color: '#111827', fontSize: '2.5rem', marginBottom: '10px', fontWeight: '800' }}>Welcome to E2Care</h1>
                    <p style={{ color: '#6B7280', fontSize: '1.2rem' }}>Please select your login type to continue</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                    {/* Patient Card */}
                    <div
                        onClick={() => router.push('/login/patient')}
                        style={{ background: 'white', padding: '40px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ padding: '20px', background: '#EFF6FF', borderRadius: '50%', color: '#2563EB' }}>
                            <User size={40} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', color: '#1F2937', margin: 0 }}>Patient</h2>
                            <p style={{ color: '#9CA3AF', margin: '10px 0 0' }}>Access health records & appointments</p>
                        </div>
                        <button style={{ padding: '10px 24px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Login as Patient</button>
                    </div>

                    {/* Doctor Card */}
                    <div
                        onClick={() => router.push('/login/doctor')}
                        style={{ background: 'white', padding: '40px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ padding: '20px', background: '#ECFDF5', borderRadius: '50%', color: '#10B981' }}>
                            <Stethoscope size={40} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', color: '#1F2937', margin: 0 }}>Doctor</h2>
                            <p style={{ color: '#9CA3AF', margin: '10px 0 0' }}>Manage clinic & consultations</p>
                        </div>
                        <button style={{ padding: '10px 24px', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Login as Doctor</button>
                    </div>

                    {/* Admin Card */}
                    <div
                        onClick={() => router.push('/login/admin')}
                        style={{ background: 'white', padding: '40px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ padding: '20px', background: '#F3F4F6', borderRadius: '50%', color: '#374151' }}>
                            <ShieldCheck size={40} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', color: '#1F2937', margin: 0 }}>Admin</h2>
                            <p style={{ color: '#9CA3AF', margin: '10px 0 0' }}>System & Hospital Administration</p>
                        </div>
                        <button style={{ padding: '10px 24px', background: '#374151', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Admin Access</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
