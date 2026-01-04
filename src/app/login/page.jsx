'use client';
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [role, setRole] = useState('patient'); // patient | doctor
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
                email: email.trim().toLowerCase(), // sanitize input
                password,
                role,
                redirect: false,
            });

            if (res.error) {
                setError(res.error);
                setLoading(false);
            } else {
                // Success - redirect based on role
                if (role === 'doctor') {
                    router.push('/doctor');
                } else {
                    router.push('/dashboard/health');
                }
            }
        } catch (err) {
            setError("Something went wrong");
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setLoading(true);
        // Real Google Login
        signIn('google', { callbackUrl: '/dashboard/health' });
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '450px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ color: '#1E40AF', fontSize: '2rem', marginBottom: '10px' }}>Aarogya AI</h1>
                    <p style={{ color: '#6B7280' }}>Portal Login</p>
                </div>

                {/* Role Toggles */}
                <div style={{ display: 'flex', background: '#F9FAFB', padding: '4px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #E5E7EB' }}>
                    <button
                        onClick={() => setRole('patient')}
                        style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: role === 'patient' ? '#fff' : 'transparent', color: role === 'patient' ? '#1E40AF' : '#6B7280', fontWeight: 'bold', boxShadow: role === 'patient' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer' }}
                    >
                        Patient
                    </button>
                    <button
                        onClick={() => setRole('doctor')}
                        style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: role === 'doctor' ? '#fff' : 'transparent', color: role === 'doctor' ? '#1E40AF' : '#6B7280', fontWeight: 'bold', boxShadow: role === 'doctor' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer' }}
                    >
                        Doctor
                    </button>
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
                            placeholder="you@example.com"
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
                        {loading ? 'Signing in...' : `Login as ${role === 'patient' ? 'Patient' : 'Doctor'}`}
                    </button>
                </form>

                <div style={{ margin: '30px 0', borderTop: '1px solid #E5E7EB', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '0 10px', color: '#9CA3AF', fontSize: '0.85rem' }}>OR CONTINUE WITH</span>
                </div>

                <button
                    onClick={handleGoogle}
                    style={{ width: '100%', padding: '12px', background: 'white', border: '1px solid #D1D5DB', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', fontWeight: '500', color: '#374151' }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                    Google
                </button>

                <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.9rem' }}>
                    Don't have an account? <br />
                    <a href="/signup/patient" style={{ color: '#1E40AF', fontWeight: '600', textDecoration: 'none' }}>Register as Patient</a>  |  <a href="/signup/doctor" style={{ color: '#10B981', fontWeight: '600', textDecoration: 'none' }}>Register as Doctor</a>
                </div>
            </div>
        </div>
    );
}
