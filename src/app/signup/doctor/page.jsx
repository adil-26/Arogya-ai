'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function DoctorSignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [form, setForm] = useState({
        name: '', email: '', password: '', specialty: '', licenseNo: '', referralCode: ''
    });
    const [loading, setLoading] = useState(false);

    // Pre-fill referral code from URL if present
    useEffect(() => {
        const refCode = searchParams.get('ref');
        if (refCode) {
            setForm(prev => ({ ...prev, referralCode: refCode.toUpperCase() }));
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch('/api/register', {
            method: 'POST',
            body: JSON.stringify({ ...form, role: 'doctor' })
        });

        if (res.ok) {
            alert("Application Submitted! Pending Admin Approval.");
            router.push('/login');
        } else {
            const err = await res.json();
            alert(err.error || "Registration Failed");
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ECFDF5' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderTop: '4px solid #10B981' }}>
                <h2 style={{ color: '#065F46', marginTop: 0 }}>Doctor Partner Program</h2>
                <p style={{ color: '#6B7280', marginBottom: '20px' }}>Join the E2Care Network</p>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
                    <input type="text" placeholder="Dr. Full Name" required
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                        onChange={e => setForm({ ...form, name: e.target.value })} />

                    <input type="email" placeholder="Professional Email" required
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                        onChange={e => setForm({ ...form, email: e.target.value })} />

                    <input type="password" placeholder="Create Password" required
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                        onChange={e => setForm({ ...form, password: e.target.value })} />

                    <select style={{ padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }} required
                        onChange={e => setForm({ ...form, specialty: e.target.value })}>
                        <option value="">Select Specialty</option>
                        <option value="Cardiologist">Cardiologist</option>
                        <option value="Dermatologist">Dermatologist</option>
                        <option value="General Physician">General Physician</option>
                        <option value="Dentist">Dentist</option>
                    </select>

                    <input type="text" placeholder="Medical License Number" required
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                        onChange={e => setForm({ ...form, licenseNo: e.target.value })} />

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#6B7280', marginBottom: '4px' }}>Referral Code (Optional)</label>
                        <input type="text" placeholder="e.g., ADIL1234"
                            value={form.referralCode}
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', width: '100%', textTransform: 'uppercase' }}
                            onChange={e => setForm({ ...form, referralCode: e.target.value.toUpperCase() })} />
                    </div>

                    <button type="submit" disabled={loading}
                        style={{ padding: '14px', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                        {loading ? 'Submitting Application...' : 'Apply for Account'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                        <a href="/login" style={{ fontSize: '0.9rem', color: '#065F46' }}>Already have an account? Login</a>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function DoctorSignup() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div>Loading...</div>
            </div>
        }>
            <DoctorSignupForm />
        </Suspense>
    );
}
