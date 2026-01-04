'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Users, Gift, Settings, CheckCircle, Clock, ArrowLeft, DollarSign } from 'lucide-react';

export default function AdminReferralsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('referrals');
    const [referrals, setReferrals] = useState([]);
    const [stats, setStats] = useState({});
    const [settings, setSettings] = useState({
        patientToPatient: 50,
        doctorToDoctor: 100,
        doctorToPatient: 75,
        minWithdrawal: 100,
        isEnabled: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;
        if (!session || session.user?.role !== 'admin') {
            router.push('/admin/login');
            return;
        }
        fetchReferrals();
        fetchSettings();
    }, [session, status]);

    const fetchReferrals = async () => {
        try {
            const res = await fetch('/api/admin/referrals');
            if (res.ok) {
                const data = await res.json();
                setReferrals(data.referrals || []);
                setStats(data.stats || {});
            }
        } catch (error) {
            console.error('Failed to fetch referrals:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/referral-settings');
            if (res.ok) {
                setSettings(await res.json());
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/referral-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                alert('Settings saved successfully!');
            } else {
                alert('Failed to save settings');
            }
        } catch (error) {
            alert('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    const creditReferral = async (referralId) => {
        if (!confirm('Credit reward for this referral?')) return;

        try {
            const res = await fetch('/api/admin/referrals', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ referralId, action: 'credit' })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                fetchReferrals();
            } else {
                alert(data.error || 'Failed to credit');
            }
        } catch (error) {
            alert('Error processing');
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1E293B' }}>
                <p style={{ color: 'white' }}>Loading...</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0F172A', color: 'white' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1E293B, #334155)',
                padding: '20px 30px',
                borderBottom: '1px solid #334155'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        onClick={() => router.push('/admin')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94A3B8',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Referral Management</h1>
                        <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '0.9rem' }}>
                            Manage referrals, rewards, and settings
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div style={{ padding: '24px 30px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '24px'
                }}>
                    {[
                        { label: 'Total Referrals', value: stats.total || 0, icon: Users, color: '#3B82F6' },
                        { label: 'Pending', value: stats.pending || 0, icon: Clock, color: '#F59E0B' },
                        { label: 'Credited', value: stats.credited || 0, icon: CheckCircle, color: '#10B981' },
                        { label: 'Total Paid', value: `₹${stats.totalPaid || 0}`, icon: DollarSign, color: '#8B5CF6' }
                    ].map((stat, idx) => (
                        <div key={idx} style={{
                            background: '#1E293B',
                            borderRadius: '16px',
                            padding: '20px',
                            border: '1px solid #334155'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '12px',
                                    background: `${stat.color}20`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <stat.icon size={22} color={stat.color} />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>{stat.value}</p>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8' }}>{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '24px',
                    background: '#1E293B',
                    padding: '6px',
                    borderRadius: '12px',
                    width: 'fit-content'
                }}>
                    {['referrals', 'settings'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '10px 20px',
                                background: activeTab === tab ? '#3B82F6' : 'transparent',
                                color: activeTab === tab ? 'white' : '#94A3B8',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab === 'referrals' ? <><Users size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Referrals</> :
                                <><Settings size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Settings</>}
                        </button>
                    ))}
                </div>

                {/* Referrals Tab */}
                {activeTab === 'referrals' && (
                    <div style={{
                        background: '#1E293B',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: '1px solid #334155'
                    }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#0F172A' }}>
                                        <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', color: '#94A3B8' }}>Referrer</th>
                                        <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', color: '#94A3B8' }}>Referee</th>
                                        <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', color: '#94A3B8' }}>Type</th>
                                        <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', color: '#94A3B8' }}>Status</th>
                                        <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', color: '#94A3B8' }}>Reward</th>
                                        <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', color: '#94A3B8' }}>Date</th>
                                        <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', color: '#94A3B8' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {referrals.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                                                No referrals yet
                                            </td>
                                        </tr>
                                    ) : (
                                        referrals.map((ref, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #334155' }}>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <p style={{ margin: 0, fontWeight: '600' }}>{ref.referrer?.name}</p>
                                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>{ref.referrer?.email}</p>
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <p style={{ margin: 0, fontWeight: '600' }}>{ref.referee?.name}</p>
                                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>{ref.referee?.email}</p>
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{
                                                        background: '#334155',
                                                        padding: '4px 10px',
                                                        borderRadius: '6px',
                                                        fontSize: '0.75rem'
                                                    }}>
                                                        {ref.referralType?.replace(/_/g, ' → ')}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{
                                                        background: ref.status === 'credited' ? '#10B98120' : '#F59E0B20',
                                                        color: ref.status === 'credited' ? '#10B981' : '#F59E0B',
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        {ref.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 16px', fontWeight: '600' }}>
                                                    ₹{ref.rewardAmount || 0}
                                                </td>
                                                <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#94A3B8' }}>
                                                    {new Date(ref.createdAt).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    {ref.status === 'pending' || ref.status === 'completed' ? (
                                                        <button
                                                            onClick={() => creditReferral(ref.id)}
                                                            style={{
                                                                background: '#10B981',
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '6px 12px',
                                                                borderRadius: '6px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: '600',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Credit Reward
                                                        </button>
                                                    ) : (
                                                        <span style={{ color: '#10B981', fontSize: '0.8rem' }}>✓ Credited</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div style={{
                        background: '#1E293B',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid #334155',
                        maxWidth: '500px'
                    }}>
                        <h3 style={{ margin: '0 0 24px', fontSize: '1.1rem' }}>
                            <Settings size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            Reward Settings
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '8px' }}>
                                    Patient → Patient Reward (₹)
                                </label>
                                <input
                                    type="number"
                                    value={settings.patientToPatient}
                                    onChange={e => setSettings({ ...settings, patientToPatient: parseFloat(e.target.value) })}
                                    style={{
                                        width: '100%', padding: '12px', borderRadius: '10px',
                                        background: '#0F172A', border: '1px solid #334155', color: 'white', fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '8px' }}>
                                    Doctor → Doctor Reward (₹)
                                </label>
                                <input
                                    type="number"
                                    value={settings.doctorToDoctor}
                                    onChange={e => setSettings({ ...settings, doctorToDoctor: parseFloat(e.target.value) })}
                                    style={{
                                        width: '100%', padding: '12px', borderRadius: '10px',
                                        background: '#0F172A', border: '1px solid #334155', color: 'white', fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '8px' }}>
                                    Doctor → Patient Reward (₹)
                                </label>
                                <input
                                    type="number"
                                    value={settings.doctorToPatient}
                                    onChange={e => setSettings({ ...settings, doctorToPatient: parseFloat(e.target.value) })}
                                    style={{
                                        width: '100%', padding: '12px', borderRadius: '10px',
                                        background: '#0F172A', border: '1px solid #334155', color: 'white', fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '8px' }}>
                                    Minimum Withdrawal (₹)
                                </label>
                                <input
                                    type="number"
                                    value={settings.minWithdrawal}
                                    onChange={e => setSettings({ ...settings, minWithdrawal: parseFloat(e.target.value) })}
                                    style={{
                                        width: '100%', padding: '12px', borderRadius: '10px',
                                        background: '#0F172A', border: '1px solid #334155', color: 'white', fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input
                                    type="checkbox"
                                    checked={settings.isEnabled}
                                    onChange={e => setSettings({ ...settings, isEnabled: e.target.checked })}
                                    style={{ width: '20px', height: '20px' }}
                                />
                                <label style={{ color: '#E2E8F0' }}>Enable Referral Program</label>
                            </div>

                            <button
                                onClick={saveSettings}
                                disabled={saving}
                                style={{
                                    width: '100%', padding: '14px',
                                    background: '#3B82F6', color: 'white',
                                    border: 'none', borderRadius: '10px',
                                    fontWeight: '700', fontSize: '1rem',
                                    cursor: 'pointer', marginTop: '10px'
                                }}
                            >
                                {saving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
