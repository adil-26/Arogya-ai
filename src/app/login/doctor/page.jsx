'use client';
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Stethoscope } from 'lucide-react';

export default function DoctorLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn('credentials', {
                email: email.trim().toLowerCase(),
                password,
                portal: 'doctor', // Enforce doctor portal check
                redirect: false,
            });

            if (res.error) {
                setError("Access Denied. Please ensure you are login into the correct portal.");
                setLoading(false);
            } else {
                router.push('/doctor');
            }
        } catch (err) {
            setError("Something went wrong");
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ECFDF5' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', borderTop: '4px solid #10B981' }}>
                <a href="/login" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#6B7280', marginBottom: '20px', textDecoration: 'none', fontSize: '0.9rem' }}>
                    <ArrowLeft size={16} /> Back
                </a>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: '#D1FAE5', color: '#059669', marginBottom: '10px' }}>
                        <Stethoscope size={32} />
                    </div>
                    <h1 style={{ color: '#065F46', fontSize: '1.8rem', marginBottom: '5px' }}>Doctor Portal</h1>
                    <p style={{ color: '#6B7280' }}>Manage appointments & patients</p>
                </div>

                {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#374151' }}>Professional Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}
                            placeholder="dr.name@hospital.com"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#374151' }}>Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ padding: '14px', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Authenticating...' : 'Login to Dashboard'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <a href="/signup/doctor" style={{ color: '#059669', fontSize: '0.9rem', fontWeight: '600', textDecoration: 'none' }}>Join as a Partner Doctor</a>
                </div>
            </div>
        </div>
    );
}
