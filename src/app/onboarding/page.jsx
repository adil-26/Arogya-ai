'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function OnboardingPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        age: '', bloodGroup: '', gender: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/user/update', {
                method: 'POST', // or PATCH
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: session?.user?.email,
                    ...form
                })
            });

            if (res.ok) {
                // Force reload/redirect to refresh session data if needed
                window.location.href = '/dashboard/health';
            } else {
                alert("Failed to update profile");
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F9FF' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '16px', maxWidth: '500px', width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <h1 style={{ color: '#1E40AF', marginTop: 0 }}>Welcome, {session?.user?.name}! 👋</h1>
                <p style={{ color: '#4B5563', marginBottom: '30px' }}>Let's complete your health profile to personalize your experience.</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>Date of Birth</label>
                            <input
                                type="date"
                                required
                                value={form.dob || ''}
                                onChange={e => setForm({ ...form, dob: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>Gender</label>
                            <select
                                required
                                value={form.gender}
                                onChange={e => setForm({ ...form, gender: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                            >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>Blood Group</label>
                            <select
                                required
                                value={form.bloodGroup}
                                onChange={e => setForm({ ...form, bloodGroup: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                            >
                                <option value="">Select</option>
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
                            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>Phone Number</label>
                            <input
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={form.phone || ''}
                                onChange={e => setForm({ ...form, phone: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>Address</label>
                        <input
                            type="text"
                            placeholder="Full Address"
                            value={form.address || ''}
                            onChange={e => setForm({ ...form, address: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>Emergency Contact</label>
                        <input
                            type="text"
                            placeholder="Name & Number"
                            value={form.emergencyContact || ''}
                            onChange={e => setForm({ ...form, emergencyContact: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ marginTop: '10px', padding: '14px', background: '#1E40AF', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Saving...' : 'Complete Setup'}
                    </button>
                </form>
            </div>
        </div>
    );
}
