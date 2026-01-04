'use client';
import React, { useState, useEffect } from 'react';
import AppShell from '../../../components/layout/AppShell';
import { Wallet, ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle, XCircle, BanknoteIcon } from 'lucide-react';

export default function WalletPage() {
    const [wallet, setWallet] = useState(null);
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawForm, setWithdrawForm] = useState({
        amount: '',
        upiId: '',
        bankAccount: '',
        bankIfsc: '',
        bankName: ''
    });
    const [withdrawMethod, setWithdrawMethod] = useState('upi');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchWallet();
        fetchWithdrawals();
    }, []);

    const fetchWallet = async () => {
        try {
            const res = await fetch('/api/wallet');
            if (res.ok) {
                setWallet(await res.json());
            }
        } catch (error) {
            console.error('Failed to fetch wallet:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWithdrawals = async () => {
        try {
            const res = await fetch('/api/wallet/withdraw');
            if (res.ok) {
                setWithdrawals(await res.json());
            }
        } catch (error) {
            console.error('Failed to fetch withdrawals:', error);
        }
    };

    const submitWithdrawal = async () => {
        if (!withdrawForm.amount || parseFloat(withdrawForm.amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (withdrawMethod === 'upi' && !withdrawForm.upiId) {
            alert('Please enter UPI ID');
            return;
        }

        if (withdrawMethod === 'bank' && (!withdrawForm.bankAccount || !withdrawForm.bankIfsc)) {
            alert('Please enter bank details');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/wallet/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(withdrawForm.amount),
                    ...(withdrawMethod === 'upi' ? { upiId: withdrawForm.upiId } : {
                        bankAccount: withdrawForm.bankAccount,
                        bankIfsc: withdrawForm.bankIfsc,
                        bankName: withdrawForm.bankName
                    })
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert('Withdrawal request submitted successfully!');
                setShowWithdrawModal(false);
                setWithdrawForm({ amount: '', upiId: '', bankAccount: '', bankIfsc: '', bankName: '' });
                fetchWallet();
                fetchWithdrawals();
            } else {
                alert(data.error || 'Failed to submit withdrawal');
            }
        } catch (error) {
            alert('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'processed': return <CheckCircle size={16} color="#10B981" />;
            case 'pending': return <Clock size={16} color="#F59E0B" />;
            case 'rejected': return <XCircle size={16} color="#EF4444" />;
            default: return <Clock size={16} color="#64748B" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'processed': return { bg: '#D1FAE5', color: '#059669' };
            case 'pending': return { bg: '#FEF3C7', color: '#D97706' };
            case 'rejected': return { bg: '#FEE2E2', color: '#DC2626' };
            default: return { bg: '#E2E8F0', color: '#64748B' };
        }
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'credit':
            case 'bonus':
            case 'refund':
                return <ArrowDownCircle size={20} color="#10B981" />;
            case 'withdrawal':
            case 'debit':
                return <ArrowUpCircle size={20} color="#EF4444" />;
            default:
                return <BanknoteIcon size={20} color="#64748B" />;
        }
    };

    if (loading) {
        return (
            <AppShell>
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading wallet...</div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div style={{ padding: '0', minHeight: 'calc(100vh - 140px)' }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #1E40AF, #3B82F6)',
                    padding: '30px 24px',
                    color: 'white',
                    borderRadius: '0 0 24px 24px',
                    marginBottom: '24px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                        <div style={{
                            width: '50px', height: '50px',
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Wallet size={26} />
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>My Wallet</h1>
                            <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
                                Manage your earnings
                            </p>
                        </div>
                    </div>

                    {/* Balance Card */}
                    <div style={{
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: '16px',
                        padding: '20px',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <p style={{ margin: '0 0 8px', opacity: 0.8, fontSize: '0.85rem' }}>Available Balance</p>
                        <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800' }}>
                            ₹{wallet?.availableBalance?.toFixed(2) || '0.00'}
                        </p>
                        {wallet?.pendingWithdrawal > 0 && (
                            <p style={{ margin: '8px 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
                                ₹{wallet.pendingWithdrawal} pending withdrawal
                            </p>
                        )}
                    </div>
                </div>

                <div style={{ padding: '0 20px 24px' }}>
                    {/* Quick Stats */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '12px',
                        marginBottom: '20px'
                    }}>
                        <div style={{
                            background: 'white',
                            borderRadius: '14px',
                            padding: '16px',
                            textAlign: 'center',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
                        }}>
                            <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700', color: '#10B981' }}>
                                ₹{wallet?.totalEarned?.toFixed(0) || 0}
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#64748B' }}>Total Earned</p>
                        </div>
                        <div style={{
                            background: 'white',
                            borderRadius: '14px',
                            padding: '16px',
                            textAlign: 'center',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
                        }}>
                            <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700', color: '#EF4444' }}>
                                ₹{wallet?.totalWithdrawn?.toFixed(0) || 0}
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#64748B' }}>Withdrawn</p>
                        </div>
                    </div>

                    {/* Withdraw Button */}
                    <button
                        onClick={() => setShowWithdrawModal(true)}
                        disabled={!wallet?.availableBalance || wallet.availableBalance < 100}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: wallet?.availableBalance >= 100 ? 'linear-gradient(135deg, #1E40AF, #3B82F6)' : '#E2E8F0',
                            color: wallet?.availableBalance >= 100 ? 'white' : '#94A3B8',
                            border: 'none',
                            borderRadius: '14px',
                            fontWeight: '700',
                            fontSize: '1rem',
                            cursor: wallet?.availableBalance >= 100 ? 'pointer' : 'not-allowed',
                            marginBottom: '24px',
                            boxShadow: wallet?.availableBalance >= 100 ? '0 4px 15px rgba(30, 64, 175, 0.3)' : 'none'
                        }}
                    >
                        Withdraw Funds
                    </button>

                    {/* Transaction History */}
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '20px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                        marginBottom: '20px'
                    }}>
                        <h3 style={{ margin: '0 0 16px', color: '#1E293B', fontSize: '1.1rem' }}>
                            Recent Transactions
                        </h3>

                        {wallet?.transactions?.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#64748B', padding: '20px' }}>
                                No transactions yet
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {wallet?.transactions?.map((txn, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '14px',
                                        padding: '14px',
                                        background: '#F8FAFC',
                                        borderRadius: '12px'
                                    }}>
                                        <div style={{
                                            width: '42px', height: '42px', borderRadius: '12px',
                                            background: txn.type === 'credit' ? '#D1FAE5' : '#FEE2E2',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {getTransactionIcon(txn.type)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontWeight: '600', color: '#1E293B', fontSize: '0.9rem' }}>
                                                {txn.description || txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                                            </p>
                                            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748B' }}>
                                                {new Date(txn.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <p style={{
                                            margin: 0,
                                            fontWeight: '700',
                                            color: txn.amount > 0 ? '#10B981' : '#EF4444'
                                        }}>
                                            {txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Withdrawal History */}
                    {withdrawals.length > 0 && (
                        <div style={{
                            background: 'white',
                            borderRadius: '20px',
                            padding: '20px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
                        }}>
                            <h3 style={{ margin: '0 0 16px', color: '#1E293B', fontSize: '1.1rem' }}>
                                Withdrawal Requests
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {withdrawals.map((w, idx) => {
                                    const statusStyle = getStatusColor(w.status);
                                    return (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '14px',
                                            padding: '14px',
                                            background: '#F8FAFC',
                                            borderRadius: '12px'
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: 0, fontWeight: '700', color: '#1E293B' }}>
                                                    ₹{w.amount}
                                                </p>
                                                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748B' }}>
                                                    {w.upiId ? `UPI: ${w.upiId}` : `Bank: ${w.bankAccount}`}
                                                </p>
                                            </div>
                                            <span style={{
                                                background: statusStyle.bg,
                                                color: statusStyle.color,
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                {getStatusIcon(w.status)}
                                                {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                    zIndex: 1000,
                    padding: '16px'
                }} onClick={() => setShowWithdrawModal(false)}>
                    <div style={{
                        background: 'white',
                        borderRadius: '24px 24px 0 0',
                        width: '100%',
                        maxWidth: '500px',
                        padding: '24px',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ margin: '0 0 20px', color: '#1E293B' }}>Withdraw Funds</h3>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748B', marginBottom: '6px' }}>
                                Amount (Min. ₹100)
                            </label>
                            <input
                                type="number"
                                value={withdrawForm.amount}
                                onChange={e => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                                placeholder="Enter amount"
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    borderRadius: '12px',
                                    border: '1px solid #E2E8F0',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748B', marginBottom: '6px' }}>
                                Payment Method
                            </label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setWithdrawMethod('upi')}
                                    style={{
                                        flex: 1, padding: '12px',
                                        background: withdrawMethod === 'upi' ? '#1E40AF' : '#F1F5F9',
                                        color: withdrawMethod === 'upi' ? 'white' : '#64748B',
                                        border: 'none', borderRadius: '10px',
                                        fontWeight: '600', cursor: 'pointer'
                                    }}
                                >
                                    UPI
                                </button>
                                <button
                                    onClick={() => setWithdrawMethod('bank')}
                                    style={{
                                        flex: 1, padding: '12px',
                                        background: withdrawMethod === 'bank' ? '#1E40AF' : '#F1F5F9',
                                        color: withdrawMethod === 'bank' ? 'white' : '#64748B',
                                        border: 'none', borderRadius: '10px',
                                        fontWeight: '600', cursor: 'pointer'
                                    }}
                                >
                                    Bank Transfer
                                </button>
                            </div>
                        </div>

                        {withdrawMethod === 'upi' ? (
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748B', marginBottom: '6px' }}>
                                    UPI ID
                                </label>
                                <input
                                    type="text"
                                    value={withdrawForm.upiId}
                                    onChange={e => setWithdrawForm({ ...withdrawForm, upiId: e.target.value })}
                                    placeholder="yourname@upi"
                                    style={{
                                        width: '100%', padding: '14px',
                                        borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '1rem'
                                    }}
                                />
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748B', marginBottom: '6px' }}>
                                        Account Number
                                    </label>
                                    <input
                                        type="text"
                                        value={withdrawForm.bankAccount}
                                        onChange={e => setWithdrawForm({ ...withdrawForm, bankAccount: e.target.value })}
                                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748B', marginBottom: '6px' }}>
                                        IFSC Code
                                    </label>
                                    <input
                                        type="text"
                                        value={withdrawForm.bankIfsc}
                                        onChange={e => setWithdrawForm({ ...withdrawForm, bankIfsc: e.target.value })}
                                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748B', marginBottom: '6px' }}>
                                        Account Holder Name
                                    </label>
                                    <input
                                        type="text"
                                        value={withdrawForm.bankName}
                                        onChange={e => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })}
                                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}
                                    />
                                </div>
                            </>
                        )}

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setShowWithdrawModal(false)}
                                style={{
                                    flex: 1, padding: '14px',
                                    background: '#F1F5F9', color: '#64748B',
                                    border: 'none', borderRadius: '12px',
                                    fontWeight: '600', cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitWithdrawal}
                                disabled={submitting}
                                style={{
                                    flex: 1, padding: '14px',
                                    background: '#1E40AF', color: 'white',
                                    border: 'none', borderRadius: '12px',
                                    fontWeight: '600', cursor: 'pointer'
                                }}
                            >
                                {submitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppShell>
    );
}
