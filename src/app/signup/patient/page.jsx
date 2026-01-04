'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

function PatientSignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [form, setForm] = useState({
        name: '', email: '', password: '',
        dob: '', gender: '', bloodGroup: '', phone: '', address: '', emergencyContact: '',
        referralCode: ''
    });

    // Pre-fill referral code from URL if present
    useEffect(() => {
        const refCode = searchParams.get('ref');
        if (refCode) {
            setForm(prev => ({ ...prev, referralCode: refCode.toUpperCase() }));
        }
    }, [searchParams]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch('/api/register', {
            method: 'POST',
            body: JSON.stringify({ ...form, role: 'patient' })
        });

        if (res.ok) {
            alert("Registration Successful! Please Login.");
            router.push('/login');
        } else {
            const err = await res.json();
            alert(err.error || "Registration Failed");
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EFF6FF', padding: '20px' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '600px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#1E40AF', marginTop: 0 }}>Patient Registration</h2>
                <p style={{ color: '#6B7280', marginBottom: '20px' }}>Create your comprehensive health portfolio</p>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
                    <input type="text" placeholder="Full Name" required
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', width: '100%' }}
                        onChange={e => setForm({ ...form, name: e.target.value })} />

                    <input type="email" placeholder="Email Address" required
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', width: '100%' }}
                        onChange={e => setForm({ ...form, email: e.target.value })} />

                    <input type="password" placeholder="Create Password" required
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', width: '100%' }}
                        onChange={e => setForm({ ...form, password: e.target.value })} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#6B7280', marginBottom: '4px' }}>Date of Birth</label>
                            <input type="date" required
                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', width: '100%' }}
                                onChange={e => setForm({ ...form, dob: e.target.value })} />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#6B7280', marginBottom: '4px' }}>Gender</label>
                            <select style={{ padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', width: '100%' }} required
                                onChange={e => setForm({ ...form, gender: e.target.value })}>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#6B7280', marginBottom: '4px' }}>Blood Group</label>
                            <select style={{ padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', width: '100%' }} required
                                onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>
                                <option value="">Select Blood Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#6B7280', marginBottom: '4px' }}>Phone Number</label>
                            <input type="tel" placeholder="+91..." required
                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', width: '100%' }}
                                onChange={e => setForm({ ...form, phone: e.target.value })} />
                        </div>
                    </div>

                    <input type="text" placeholder="Full Address" required
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', width: '100%' }}
                        onChange={e => setForm({ ...form, address: e.target.value })} />

                    <input type="text" placeholder="Emergency Contact (Name & Phone)" required
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', width: '100%' }}
                        onChange={e => setForm({ ...form, emergencyContact: e.target.value })} />

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#6B7280', marginBottom: '4px' }}>Referral Code (Optional)</label>
                        <input type="text" placeholder="e.g., ADIL1234"
                            value={form.referralCode}
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', width: '100%', textTransform: 'uppercase' }}
                            onChange={e => setForm({ ...form, referralCode: e.target.value.toUpperCase() })} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.85rem', color: '#6B7280' }}>
                        <input type="checkbox" required /> I agree to the <a href="#">Terms & Privacy Policy</a>
                    </div>

                    <button type="submit" disabled={loading}
                        style={{ padding: '14px', background: '#1E40AF', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div style={{ margin: '20px 0', borderTop: '1px solid #E5E7EB', position: 'relative' }}>
                        <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '0 10px', color: '#9CA3AF', fontSize: '0.85rem' }}>OR</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => signIn('google', { callbackUrl: '/dashboard/health' })}
                        style={{ width: '100%', padding: '12px', background: 'white', border: '1px solid #D1D5DB', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', fontWeight: '500', color: '#374151' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        Sign up with Google
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <a href="/login" style={{ fontSize: '0.9rem', color: '#1E40AF' }}>Already have an account? Login</a>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function PatientSignup() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div>Loading...</div>
            </div>
        }>
            <PatientSignupForm />
        </Suspense>
    );
}
