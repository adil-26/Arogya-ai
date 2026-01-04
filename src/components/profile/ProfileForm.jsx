'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ProfileForm({ user }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        gender: user?.gender || '',
        dob: user?.dob || '',
        bloodGroup: user?.bloodGroup || '',
        emergencyContact: user?.emergencyContact || ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/user/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, ...formData })
            });

            if (res.ok) {
                alert("Profile Updated Successfully!");
                router.refresh();
            } else {
                alert("Update Failed");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px', color: '#1E40AF' }}>My Profile</h2>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#6B7280', marginBottom: '5px' }}>Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#6B7280', marginBottom: '5px' }}>Email (Read Only)</label>
                    <input type="email" value={formData.email} disabled
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', background: '#F3F4F6' }} />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#6B7280', marginBottom: '5px' }}>Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#6B7280', marginBottom: '5px' }}>Date of Birth</label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#6B7280', marginBottom: '5px' }}>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#6B7280', marginBottom: '5px' }}>Blood Group</label>
                    <input type="text" value={formData.bloodGroup} disabled
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', background: '#F3F4F6' }} />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#6B7280', marginBottom: '5px' }}>Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#6B7280', marginBottom: '5px' }}>Emergency Contact</label>
                    <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
                </div>

                <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                    <button type="submit" disabled={loading}
                        style={{ background: '#1E40AF', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
