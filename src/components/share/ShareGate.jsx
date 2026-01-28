'use client';
import React, { useState } from 'react';
import { ShieldAlert, ArrowRight, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ShareGate({ userId }) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/share/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, pin })
            });

            if (res.ok) {
                // Refresh page to load protected content (cookie is now set)
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error || 'Invalid PIN');
            }
        } catch (err) {
            setError('Verification failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#f1f5f9', padding: '20px'
        }}>
            <div style={{
                background: 'white', maxWidth: '400px', width: '100%', padding: '40px',
                borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', textAlign: 'center'
            }}>
                <div style={{
                    width: '64px', height: '64px', background: '#fef2f2', color: '#ef4444',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                }}>
                    <ShieldAlert size={32} />
                </div>

                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '12px' }}>Authentication Required</h1>
                <p style={{ color: '#64748b', marginBottom: '30px', lineHeight: '1.6' }}>
                    This medical profile is protected. Please enter the 6-digit security code shared by the patient.
                </p>

                <form onSubmit={handleVerify}>
                    <input
                        type="text"
                        maxLength="6"
                        placeholder="0 0 0 0 0 0"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        style={{
                            width: '100%', padding: '16px', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '8px',
                            border: '2px solid #e2e8f0', borderRadius: '12px', marginBottom: '20px',
                            outline: 'none', background: '#f8fafc', fontWeight: 'bold'
                        }}
                    />

                    {error && (
                        <p style={{ color: '#ef4444', marginBottom: '20px', fontSize: '0.9rem', background: '#fef2f2', padding: '10px', borderRadius: '8px' }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', padding: '16px', background: '#2563eb', color: 'white',
                            border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? <Loader className="animate-spin" size={20} /> : <>Verify Access <ArrowRight size={20} /></>}
                    </button>

                    <p style={{ marginTop: '20px', fontSize: '0.8rem', color: '#94a3b8' }}>
                        Secured by E2Care Privacy Shield
                    </p>
                </form>
            </div>
        </div>
    );
}
