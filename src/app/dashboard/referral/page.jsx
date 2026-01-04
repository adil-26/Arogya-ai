'use client';
import React, { useState, useEffect } from 'react';
import AppShell from '../../../components/layout/AppShell';
import { Share2, Copy, Users, Gift, CheckCircle, Clock, MessageCircle } from 'lucide-react';

export default function ReferralPage() {
    const [referralData, setReferralData] = useState({ code: '', link: '', whatsappLink: '' });
    const [referrals, setReferrals] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, credited: 0, totalEarned: 0 });
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchReferralCode();
        fetchReferralHistory();
    }, []);

    const fetchReferralCode = async () => {
        try {
            const res = await fetch('/api/referral/code');
            if (res.ok) {
                const data = await res.json();
                setReferralData(data);
            }
        } catch (error) {
            console.error('Failed to get referral code:', error);
        }
    };

    const fetchReferralHistory = async () => {
        try {
            const res = await fetch('/api/referral/history');
            if (res.ok) {
                const data = await res.json();
                setReferrals(data.referrals || []);
                setStats(data.stats || {});
            }
        } catch (error) {
            console.error('Failed to get referral history:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(referralData.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareWhatsApp = () => {
        window.open(referralData.whatsappLink, '_blank');
    };

    return (
        <AppShell>
            <div style={{ padding: '0', minHeight: 'calc(100vh - 140px)' }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #0D9488, #14B8A6)',
                    padding: '30px 24px',
                    color: 'white',
                    borderRadius: '0 0 24px 24px',
                    marginBottom: '24px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                        <div style={{
                            width: '50px', height: '50px',
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Gift size={26} />
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Refer & Earn</h1>
                            <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
                                Invite friends and earn rewards!
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '0 20px 24px' }}>
                    {/* Referral Code Card */}
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '24px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                        marginBottom: '20px'
                    }}>
                        <p style={{
                            margin: '0 0 12px',
                            color: '#64748B',
                            fontSize: '0.85rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontWeight: '600'
                        }}>Your Referral Code</p>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: '#F0FDFA',
                            padding: '16px 20px',
                            borderRadius: '14px',
                            border: '2px dashed #14B8A6',
                            marginBottom: '20px'
                        }}>
                            <span style={{
                                flex: 1,
                                fontSize: '1.5rem',
                                fontWeight: '800',
                                color: '#0D9488',
                                letterSpacing: '3px',
                                fontFamily: 'monospace'
                            }}>
                                {referralData.code || '------'}
                            </span>
                            <button
                                onClick={copyCode}
                                style={{
                                    background: copied ? '#10B981' : '#0D9488',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 18px',
                                    borderRadius: '10px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>

                        {/* Share Buttons */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={shareWhatsApp}
                                style={{
                                    flex: 1,
                                    background: '#25D366',
                                    color: 'white',
                                    border: 'none',
                                    padding: '14px',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <MessageCircle size={18} /> Share on WhatsApp
                            </button>
                            <button
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: 'Join our Health App',
                                            text: `Use my referral code ${referralData.code} to sign up!`,
                                            url: referralData.link
                                        });
                                    }
                                }}
                                style={{
                                    width: '50px',
                                    background: '#E0E7FF',
                                    color: '#4F46E5',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Share2 size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '12px',
                        marginBottom: '24px'
                    }}>
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '20px',
                            textAlign: 'center',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
                        }}>
                            <Users size={24} style={{ color: '#3B82F6', marginBottom: '8px' }} />
                            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1E293B' }}>
                                {stats.total}
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                                Total Referrals
                            </p>
                        </div>
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '20px',
                            textAlign: 'center',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
                        }}>
                            <Gift size={24} style={{ color: '#10B981', marginBottom: '8px' }} />
                            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1E293B' }}>
                                ₹{stats.totalEarned || 0}
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                                Total Earned
                            </p>
                        </div>
                    </div>

                    {/* How it Works */}
                    <div style={{
                        background: '#FEF3C7',
                        borderRadius: '16px',
                        padding: '20px',
                        marginBottom: '24px'
                    }}>
                        <h3 style={{ margin: '0 0 12px', color: '#92400E', fontSize: '1rem' }}>
                            💡 How it works
                        </h3>
                        <ol style={{ margin: 0, paddingLeft: '18px', color: '#78350F', fontSize: '0.9rem', lineHeight: '1.8' }}>
                            <li>Share your referral code with friends</li>
                            <li>They sign up using your code</li>
                            <li>When they complete their first appointment</li>
                            <li style={{ fontWeight: '600' }}>You earn rewards! 🎉</li>
                        </ol>
                    </div>

                    {/* Referral History */}
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '20px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
                    }}>
                        <h3 style={{ margin: '0 0 16px', color: '#1E293B', fontSize: '1.1rem' }}>
                            Your Referrals
                        </h3>

                        {loading ? (
                            <p style={{ textAlign: 'center', color: '#64748B', padding: '20px' }}>Loading...</p>
                        ) : referrals.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
                                <Users size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
                                <p style={{ margin: 0 }}>No referrals yet</p>
                                <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>Start sharing your code!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {referrals.map((ref, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '14px',
                                        padding: '14px',
                                        background: '#F8FAFC',
                                        borderRadius: '14px'
                                    }}>
                                        <div style={{
                                            width: '42px', height: '42px', borderRadius: '50%',
                                            background: '#0D9488', color: 'white',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: '700'
                                        }}>
                                            {ref.refereeName?.[0] || '?'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontWeight: '600', color: '#1E293B' }}>
                                                {ref.refereeName || 'User'}
                                            </p>
                                            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                                                {new Date(ref.signupDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            {ref.status === 'credited' ? (
                                                <span style={{
                                                    background: '#D1FAE5',
                                                    color: '#059669',
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600'
                                                }}>
                                                    +₹{ref.rewardAmount}
                                                </span>
                                            ) : (
                                                <span style={{
                                                    background: '#FEF3C7',
                                                    color: '#D97706',
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <Clock size={12} /> Pending
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
