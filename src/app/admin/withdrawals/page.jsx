'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Wallet, CheckCircle, XCircle, Clock, ArrowLeft, DollarSign, CreditCard } from 'lucide-react';

export default function AdminWithdrawalsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [withdrawals, setWithdrawals] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');

    useEffect(() => {
        if (status === 'loading') return;
        if (!session || session.user?.role !== 'admin') {
            router.push('/admin/login');
            return;
        }
        fetchWithdrawals();
    }, [session, status, filter]);

    const fetchWithdrawals = async () => {
        try {
            const res = await fetch(`/api/admin/withdrawals?status=${filter === 'all' ? '' : filter}`);
            if (res.ok) {
                const data = await res.json();
                setWithdrawals(data.withdrawals || []);
                setStats(data.stats || {});
            }
        } catch (error) {
            console.error('Failed to fetch withdrawals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (withdrawalId, action, note = '') => {
        const confirmMsg = action === 'approve' ? 'Approve this withdrawal?' :
            action === 'reject' ? 'Reject and refund this withdrawal?' :
                'Mark as processed (payment sent)?';
        if (!confirm(confirmMsg)) return;

        try {
            const res = await fetch('/api/admin/withdrawals', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ withdrawalId, action, adminNote: note })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                fetchWithdrawals();
            } else {
                alert(data.error || 'Action failed');
            }
        } catch (error) {
            alert('Error processing');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'processed': return { bg: '#10B98120', color: '#10B981' };
            case 'approved': return { bg: '#3B82F620', color: '#3B82F6' };
            case 'pending': return { bg: '#F59E0B20', color: '#F59E0B' };
            case 'rejected': return { bg: '#EF444420', color: '#EF4444' };
            default: return { bg: '#64748B20', color: '#64748B' };
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
                        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Withdrawal Management</h1>
                        <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '0.9rem' }}>
                            Process payout requests
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div style={{ padding: '24px 30px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '16px',
                    marginBottom: '24px'
                }}>
                    {[
                        { label: 'Pending', value: stats.pending || 0, icon: Clock, color: '#F59E0B' },
                        { label: 'Pending Amount', value: `₹${stats.totalPending || 0}`, icon: Wallet, color: '#F59E0B' },
                        { label: 'Processed', value: stats.processed || 0, icon: CheckCircle, color: '#10B981' },
                        { label: 'Total Paid', value: `₹${stats.totalProcessed || 0}`, icon: DollarSign, color: '#10B981' }
                    ].map((stat, idx) => (
                        <div key={idx} style={{
                            background: '#1E293B',
                            borderRadius: '16px',
                            padding: '18px',
                            border: '1px solid #334155'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '10px',
                                    background: `${stat.color}20`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <stat.icon size={20} color={stat.color} />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>{stat.value}</p>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '24px',
                    flexWrap: 'wrap'
                }}>
                    {['pending', 'approved', 'processed', 'rejected', 'all'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            style={{
                                padding: '8px 16px',
                                background: filter === tab ? '#3B82F6' : '#1E293B',
                                color: filter === tab ? 'white' : '#94A3B8',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                fontSize: '0.85rem'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Withdrawals Table */}
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
                                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', color: '#94A3B8' }}>User</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', color: '#94A3B8' }}>Amount</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', color: '#94A3B8' }}>Payment Details</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', color: '#94A3B8' }}>Status</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', color: '#94A3B8' }}>Date</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', color: '#94A3B8' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {withdrawals.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                                            No {filter !== 'all' ? filter : ''} withdrawals
                                        </td>
                                    </tr>
                                ) : (
                                    withdrawals.map((w, idx) => {
                                        const statusStyle = getStatusStyle(w.status);
                                        return (
                                            <tr key={idx} style={{ borderBottom: '1px solid #334155' }}>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <p style={{ margin: 0, fontWeight: '600' }}>{w.user?.name}</p>
                                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>{w.user?.email}</p>
                                                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748B' }}>{w.user?.phone}</p>
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#10B981' }}>₹{w.amount}</p>
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    {w.upiId ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <CreditCard size={16} color="#94A3B8" />
                                                            <span>UPI: {w.upiId}</span>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p style={{ margin: 0, fontSize: '0.85rem' }}>A/C: ****{w.bankAccount?.slice(-4)}</p>
                                                            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>
                                                                IFSC: {w.bankIfsc}
                                                            </p>
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{
                                                        background: statusStyle.bg,
                                                        color: statusStyle.color,
                                                        padding: '4px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        {w.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#94A3B8' }}>
                                                    {new Date(w.createdAt).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                        {w.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleAction(w.id, 'approve')}
                                                                    style={{
                                                                        background: '#3B82F6',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        padding: '6px 12px',
                                                                        borderRadius: '6px',
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: '600',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAction(w.id, 'reject', 'Request rejected')}
                                                                    style={{
                                                                        background: '#EF4444',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        padding: '6px 12px',
                                                                        borderRadius: '6px',
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: '600',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {w.status === 'approved' && (
                                                            <button
                                                                onClick={() => handleAction(w.id, 'process')}
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
                                                                Mark Paid
                                                            </button>
                                                        )}
                                                        {w.status === 'processed' && (
                                                            <span style={{ color: '#10B981', fontSize: '0.8rem' }}>✓ Completed</span>
                                                        )}
                                                        {w.status === 'rejected' && (
                                                            <span style={{ color: '#EF4444', fontSize: '0.8rem' }}>✗ Rejected</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
