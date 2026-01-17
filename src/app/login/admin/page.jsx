'use client';
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
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
                portal: 'admin', // Enforce admin portal check
                redirect: false,
            });

            if (res.error) {
                setError("Restricted Access. Admin only.");
                setLoading(false);
            } else {
                router.push('/admin');
            }
        } catch (err) {
            setError("Something went wrong");
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111827' }}>
            <div style={{ background: '#1F2937', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', width: '100%', maxWidth: '400px', border: '1px solid #374151' }}>
                <a href="/login" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#9CA3AF', marginBottom: '20px', textDecoration: 'none', fontSize: '0.9rem' }}>
                    <ArrowLeft size={16} /> Exit
                </a>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: '#374151', color: '#F87171', marginBottom: '10px' }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h1 style={{ color: '#F3F4F6', fontSize: '1.8rem', marginBottom: '5px' }}>Admin Console</h1>
                    <p style={{ color: '#9CA3AF' }}>Restricted Access Area</p>
                </div>

                {error && <div style={{ background: '#7F1D1D', color: '#FECACA', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid #EF4444' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#D1D5DB' }}>Admin Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #4B5563', outline: 'none', background: '#374151', color: 'white' }}
                            placeholder="admin@p2c.com"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#D1D5DB' }}>Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #4B5563', outline: 'none', background: '#374151', color: 'white' }}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ padding: '14px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Verifying...' : 'Access Console'}
                    </button>
                </form>
            </div>
        </div>
    );
}
