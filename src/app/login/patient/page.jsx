'use client';
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock } from 'lucide-react';

export default function PatientLogin() {
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
                portal: 'patient', // Enforce patient portal check
                redirect: false,
            });

            if (res.error) {
                setError("Invalid credentials or access denied.");
                setLoading(false);
            } else {
                // Redirect will be handled by middleware mostly, but explicit here too
                router.push('/dashboard/health');
            }
        } catch (err) {
            setError("Something went wrong");
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                <a href="/login" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#6B7280', marginBottom: '20px', textDecoration: 'none', fontSize: '0.9rem' }}>
                    <ArrowLeft size={16} /> Back
                </a>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ color: '#1E40AF', fontSize: '1.8rem', marginBottom: '5px' }}>Patient Portal</h1>
                    <p style={{ color: '#6B7280' }}>Access your health records</p>
                </div>

                {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#374151' }}>Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}
                            placeholder="patient@example.com"
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
                        style={{ padding: '14px', background: '#1E40AF', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Securing Access...' : 'Login Securely'}
                    </button>
                </form>

                <div style={{ margin: '30px 0', borderTop: '1px solid #E5E7EB', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '0 10px', color: '#9CA3AF', fontSize: '0.85rem' }}>OR</span>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <button
                        onClick={() => signIn('google', { callbackUrl: '/dashboard/health' })}
                        style={{ width: '100%', padding: '12px', background: 'white', border: '1px solid #D1D5DB', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', fontWeight: '500', color: '#374151', marginBottom: '20px' }}
                    >
                        {/* Google Icon SVG */}
                        <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        Sign in with Google
                    </button>

                    <a href="/signup/patient" style={{ color: '#1E40AF', fontSize: '0.9rem', fontWeight: '600' }}>Create New Account</a>
                </div>
            </div>
        </div>
    );
}
