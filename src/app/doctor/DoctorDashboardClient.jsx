'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import {
    Stethoscope, Users, Calendar, FileText, Activity,
    Clock, CheckCircle, Plus, Search, ChevronRight,
    LogOut, User, Zap, MessageSquare, Send, Bell, Gift, Wallet, Copy
} from 'lucide-react';

// Acupuncture Points Database
const ACUPOINTS = [
    // Large Intestine (LI) Meridian
    { code: 'LI-4', name: 'Hegu', meridian: 'Large Intestine', location: 'Web between thumb and index finger', indications: 'Headaches, pain relief, immune boost, stress' },
    { code: 'LI-11', name: 'Quchi', meridian: 'Large Intestine', location: 'Lateral end of elbow crease', indications: 'Clears heat, skin problems, blood pressure' },
    { code: 'LI-10', name: 'Shousanli', meridian: 'Large Intestine', location: 'Forearm below elbow', indications: 'Digestion, abdominal pain, fatigue' },
    { code: 'LI-20', name: 'Yingxiang', meridian: 'Large Intestine', location: 'Beside the nose', indications: 'Sinus congestion, allergies, rhinitis' },

    // Stomach (ST) Meridian
    { code: 'ST-36', name: 'Zusanli', meridian: 'Stomach', location: 'Below the knee', indications: 'Energy boost, digestion, immune function, overall wellness' },
    { code: 'ST-25', name: 'Tianshu', meridian: 'Stomach', location: '2 inches from belly button', indications: 'Constipation, diarrhea, intestinal regulation' },
    { code: 'ST-44', name: 'Neiting', meridian: 'Stomach', location: 'Between 2nd and 3rd toes', indications: 'Stomach pain, toothache, clears heat' },

    // Spleen (SP) Meridian
    { code: 'SP-6', name: 'Sanyinjiao', meridian: 'Spleen', location: '3 cun above medial malleolus', indications: 'Reproductive health, digestion, blood nourishment' },
    { code: 'SP-9', name: 'Yinlingquan', meridian: 'Spleen', location: 'Below knee, medial side', indications: 'Dampness, edema, water retention' },
    { code: 'SP-3', name: 'Taibai', meridian: 'Spleen', location: 'Medial side of foot', indications: 'Digestive issues, malabsorption' },

    // Heart (HT) Meridian
    { code: 'HT-7', name: 'Shenmen', meridian: 'Heart', location: 'Wrist crease, ulnar side', indications: 'Anxiety, insomnia, heart palpitations, emotional balance' },

    // Lung (LU) Meridian
    { code: 'LU-7', name: 'Lieque', meridian: 'Lung', location: 'Above wrist, radial side', indications: 'Cough, cold, headache, neck stiffness' },
    { code: 'LU-9', name: 'Taiyuan', meridian: 'Lung', location: 'Wrist crease, radial artery', indications: 'Lung deficiency, cough, respiratory issues' },

    // Kidney (KI) Meridian
    { code: 'KI-3', name: 'Taixi', meridian: 'Kidney', location: 'Behind inner ankle', indications: 'Kidney deficiency, lower back pain, hearing issues' },
    { code: 'KI-1', name: 'Yongquan', meridian: 'Kidney', location: 'Sole of foot', indications: 'Emergency revival, calming, grounding' },

    // Liver (LR) Meridian
    { code: 'LR-3', name: 'Taichong', meridian: 'Liver', location: 'Top of foot, between 1st and 2nd toes', indications: 'Stress, anger, headaches, eye problems' },

    // Gallbladder (GB) Meridian
    { code: 'GB-20', name: 'Fengchi', meridian: 'Gallbladder', location: 'Base of skull, behind ears', indications: 'Headaches, neck pain, dizziness, common cold' },
    { code: 'GB-34', name: 'Yanglingquan', meridian: 'Gallbladder', location: 'Below knee, lateral side', indications: 'Tendon/muscle issues, knee pain' },

    // Pericardium (PC) Meridian
    { code: 'PC-6', name: 'Neiguan', meridian: 'Pericardium', location: 'Inner forearm, 2 cun above wrist', indications: 'Nausea, anxiety, chest tightness, motion sickness' },

    // Triple Energizer (TE) Meridian
    { code: 'TE-5', name: 'Waiguan', meridian: 'Triple Energizer', location: 'Outer forearm, above wrist', indications: 'Fever, headache, ear problems' },
];

export default function DoctorDashboardClient({
    doctor,
    initialStats,
    initialAppointments,
    initialPatients,
    initialPrescriptions
}) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats] = useState(initialStats);
    const [appointments] = useState(initialAppointments);
    const [patients] = useState(initialPatients);
    const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
    const [searchTerm, setSearchTerm] = useState('');

    // Chat state
    const [chatPatient, setChatPatient] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const lastMessageCount = useRef(0);
    const pollIntervalRef = useRef(null);
    const readCountsRef = useRef({});  // Track read counts per patient

    // Referral state
    const [referralCode, setReferralCode] = useState('');
    const [referralLink, setReferralLink] = useState('');
    const [referralStats, setReferralStats] = useState({ total: 0, pending: 0, credited: 0, totalEarned: 0 });
    const [referrals, setReferrals] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [copied, setCopied] = useState(false);

    // Load read counts from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(`doctor_read_counts_${doctor.id}`);
        if (stored) {
            readCountsRef.current = JSON.parse(stored);
        }
    }, [doctor.id]);

    // Request notification permission on mount
    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }, []);

    // Fetch referral data when tab is active
    useEffect(() => {
        if (activeTab === 'referral') {
            // Fetch referral code
            fetch('/api/referral/code')
                .then(res => res.json())
                .then(data => {
                    setReferralCode(data.code || '');
                    setReferralLink(data.link || '');
                })
                .catch(console.error);

            // Fetch referral history
            fetch('/api/referral/history')
                .then(res => res.json())
                .then(data => {
                    setReferrals(data.referrals || []);
                    setReferralStats(data.stats || { total: 0, pending: 0, credited: 0, totalEarned: 0 });
                })
                .catch(console.error);

            // Fetch wallet
            fetch('/api/wallet')
                .then(res => res.json())
                .then(data => {
                    setWalletBalance(data.balance || 0);
                })
                .catch(console.error);
        }
    }, [activeTab]);

    // Poll for new messages when chatting
    useEffect(() => {
        if (chatPatient) {
            // Clear existing interval
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }

            // Start polling
            pollIntervalRef.current = setInterval(async () => {
                try {
                    const res = await fetch(`/api/messages?doctorId=${doctor.id}&patientId=${chatPatient.id}`);
                    if (res.ok) {
                        const data = await res.json();

                        // Check for new messages
                        if (data.length > lastMessageCount.current && lastMessageCount.current > 0) {
                            const newMsgs = data.slice(lastMessageCount.current);
                            const patientMsgs = newMsgs.filter(m => m.sender === 'user');

                            // Show browser notification for patient messages
                            if (patientMsgs.length > 0 && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                                new Notification('New Message from Patient', {
                                    body: `${chatPatient.name}: ${patientMsgs[0].content}`,
                                    icon: '/favicon.ico'
                                });
                            }
                        }

                        lastMessageCount.current = data.length;
                        setChatMessages(data);

                        // Mark as read when viewing
                        readCountsRef.current[chatPatient.id] = data.length;
                        localStorage.setItem(`doctor_read_counts_${doctor.id}`, JSON.stringify(readCountsRef.current));
                    }
                } catch (error) {
                    console.error('Poll failed:', error);
                }
            }, 3000);

            return () => {
                if (pollIntervalRef.current) {
                    clearInterval(pollIntervalRef.current);
                }
            };
        }
    }, [chatPatient, doctor.id]);

    // Check for unread messages across all patients
    useEffect(() => {
        const checkUnread = async () => {
            let count = 0;
            for (const p of patients) {
                try {
                    const res = await fetch(`/api/messages?doctorId=${doctor.id}&patientId=${p.id}`);
                    if (res.ok) {
                        const msgs = await res.json();
                        const totalMsgs = msgs.length;
                        const readCount = readCountsRef.current[p.id] || 0;
                        const unread = Math.max(0, totalMsgs - readCount);
                        count += unread;
                    }
                } catch { }
            }
            setUnreadCount(count);
        };

        if (patients.length > 0) {
            checkUnread();
            const interval = setInterval(checkUnread, 10000);
            return () => clearInterval(interval);
        }
    }, [patients, doctor.id]);

    // Prescription form state
    const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
    const [prescriptionType, setPrescriptionType] = useState('acupuncture');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedPoints, setSelectedPoints] = useState([]);
    const [prescriptionData, setPrescriptionData] = useState({
        diagnosis: '',
        notes: '',
        duration: '',
        frequency: '',
        medicines: ''
    });

    const togglePoint = (point, technique) => {
        const existing = selectedPoints.find(p => p.code === point.code);
        if (existing) {
            if (existing.technique === technique) {
                setSelectedPoints(prev => prev.filter(p => p.code !== point.code));
            } else {
                setSelectedPoints(prev => prev.map(p =>
                    p.code === point.code ? { ...p, technique } : p
                ));
            }
        } else {
            setSelectedPoints(prev => [...prev, { ...point, technique }]);
        }
    };

    const handleCreatePrescription = async () => {
        if (!selectedPatient) {
            alert("Please select a patient");
            return;
        }

        const payload = {
            doctorId: doctor.id,
            doctorName: doctor.name,
            patientId: selectedPatient.id,
            patientName: selectedPatient.name,
            type: prescriptionType,
            diagnosis: prescriptionData.diagnosis,
            notes: prescriptionData.notes,
            duration: prescriptionData.duration,
            frequency: prescriptionData.frequency,
            acupoints: prescriptionType === 'acupuncture' ? JSON.stringify(selectedPoints) : null,
            medicines: prescriptionType === 'medicine' ? prescriptionData.medicines : null
        };

        try {
            const res = await fetch('/api/doctor/prescriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const newPrescription = await res.json();
                setPrescriptions(prev => [newPrescription, ...prev]);
                setShowPrescriptionForm(false);
                setSelectedPoints([]);
                setSelectedPatient(null);
                setPrescriptionData({ diagnosis: '', notes: '', duration: '', frequency: '', medicines: '' });
                alert("Prescription created successfully!");
            } else {
                alert("Failed to create prescription");
            }
        } catch (error) {
            alert("Error creating prescription");
        }
    };

    // Chat functions
    const openChat = async (patient) => {
        setChatPatient(patient);
        setActiveTab('chat');
        setLoadingMessages(true);
        try {
            const res = await fetch(`/api/messages?doctorId=${doctor.id}&patientId=${patient.id}`);
            if (res.ok) {
                const data = await res.json();
                setChatMessages(data);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !chatPatient) return;

        const msgContent = newMessage.trim();
        setNewMessage('');

        // Optimistic update
        const tempMsg = { sender: 'doctor', content: msgContent, createdAt: new Date() };
        setChatMessages(prev => [...prev, tempMsg]);

        try {
            await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctorId: doctor.id,
                    patientId: chatPatient.id,
                    content: msgContent,
                    sender: 'doctor'
                })
            });
        } catch (error) {
            console.error('Send failed:', error);
        }
    };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: Activity },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'patients', label: 'My Patients', icon: Users },
        { id: 'chat', label: 'Messages', icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : null },
        { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
        { id: 'prescribe', label: 'New Prescription', icon: Plus },
        { id: 'referral', label: 'Refer & Earn', icon: Gift }
    ];

    const filteredPatients = patients.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #0D9488, #14B8A6)', padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '14px' }}>
                        <Stethoscope size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'white' }}>Doctor Portal</h1>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>Welcome, Dr. {doctor.name}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Link href="/library" style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={18} /> Library
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: '/login' })} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex' }}>
                {/* Sidebar */}
                <div style={{ width: '260px', background: 'white', borderRight: '1px solid #E2E8F0', minHeight: 'calc(100vh - 80px)', padding: '20px 0' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); if (tab.id === 'prescribe') setShowPrescriptionForm(true); }}
                            style={{
                                width: '100%',
                                padding: '14px 24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                background: activeTab === tab.id ? '#F0FDFA' : 'transparent',
                                border: 'none',
                                borderLeft: activeTab === tab.id ? '3px solid #0D9488' : '3px solid transparent',
                                color: activeTab === tab.id ? '#0D9488' : '#475569',
                                fontWeight: activeTab === tab.id ? '600' : '500',
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                textAlign: 'left',
                                position: 'relative'
                            }}
                        >
                            <tab.icon size={20} />
                            {tab.label}
                            {tab.badge && (
                                <span style={{
                                    position: 'absolute',
                                    right: '20px',
                                    background: '#EF4444',
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    minWidth: '20px',
                                    textAlign: 'center'
                                }}>
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    ))}

                    {/* Doctor Profile Mini */}
                    <div style={{ margin: '30px 20px', padding: '20px', background: '#F8FAFC', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                {doctor.name?.[0]}
                            </div>
                            <div>
                                <p style={{ margin: 0, fontWeight: '600', color: '#1E293B' }}>Dr. {doctor.name}</p>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>{doctor.specialty || 'General'}</p>
                            </div>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>License: {doctor.licenseNo || 'N/A'}</p>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>

                    {/* DASHBOARD TAB */}
                    {activeTab === 'dashboard' && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', color: '#1E293B', marginBottom: '25px' }}>Dashboard Overview</h2>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                                <StatCard title="Today's Appointments" value={stats.todayAppointments} color="#0D9488" icon={Clock} />
                                <StatCard title="Total Patients" value={stats.totalPatients} color="#3B82F6" icon={Users} />
                                <StatCard title="All Appointments" value={stats.totalAppointments} color="#8B5CF6" icon={Calendar} />
                                <StatCard title="Prescriptions" value={stats.totalPrescriptions} color="#F59E0B" icon={FileText} />
                            </div>

                            {/* Quick Actions */}
                            <div style={{ background: 'white', borderRadius: '16px', padding: '25px', marginBottom: '25px' }}>
                                <h3 style={{ margin: '0 0 20px 0', color: '#1E293B' }}>Quick Actions</h3>
                                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                    <button onClick={() => { setActiveTab('prescribe'); setShowPrescriptionForm(true); setPrescriptionType('acupuncture'); }} style={{ padding: '15px 25px', background: 'linear-gradient(135deg, #0D9488, #14B8A6)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Zap size={20} /> Acupuncture Prescription
                                    </button>
                                    <button onClick={() => { setActiveTab('prescribe'); setShowPrescriptionForm(true); setPrescriptionType('medicine'); }} style={{ padding: '15px 25px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FileText size={20} /> Medicine Prescription
                                    </button>
                                </div>
                            </div>

                            {/* Recent Appointments */}
                            <div style={{ background: 'white', borderRadius: '16px', padding: '25px' }}>
                                <h3 style={{ margin: '0 0 20px 0', color: '#1E293B' }}>Recent Appointments</h3>
                                {appointments.slice(0, 5).map(apt => (
                                    <div key={apt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#F8FAFC', borderRadius: '10px', marginBottom: '10px' }}>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: '600', color: '#1E293B' }}>{apt.patientName || 'Patient'}</p>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>{apt.type || 'General Checkup'}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ margin: 0, fontWeight: '500', color: '#0D9488' }}>{new Date(apt.date).toLocaleDateString('en-GB')}</p>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>{apt.time || '10:00 AM'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* APPOINTMENTS TAB */}
                    {activeTab === 'appointments' && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', color: '#1E293B', marginBottom: '25px' }}>Appointments ({appointments.length})</h2>
                            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#F8FAFC' }}>
                                            <th style={{ padding: '14px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Patient</th>
                                            <th style={{ padding: '14px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Date</th>
                                            <th style={{ padding: '14px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Time</th>
                                            <th style={{ padding: '14px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Type</th>
                                            <th style={{ padding: '14px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointments.map(apt => (
                                            <tr key={apt.id}>
                                                <td style={{ padding: '14px', borderBottom: '1px solid #F1F5F9', fontWeight: '500' }}>{apt.patientName || 'N/A'}</td>
                                                <td style={{ padding: '14px', borderBottom: '1px solid #F1F5F9' }}>{new Date(apt.date).toLocaleDateString('en-GB')}</td>
                                                <td style={{ padding: '14px', borderBottom: '1px solid #F1F5F9' }}>{apt.time || '-'}</td>
                                                <td style={{ padding: '14px', borderBottom: '1px solid #F1F5F9' }}>{apt.type || 'General'}</td>
                                                <td style={{ padding: '14px', borderBottom: '1px solid #F1F5F9' }}>
                                                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', background: apt.status === 'completed' ? '#DCFCE7' : '#DBEAFE', color: apt.status === 'completed' ? '#16A34A' : '#2563EB' }}>
                                                        {apt.status || 'scheduled'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* PATIENTS TAB */}
                    {activeTab === 'patients' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                <h2 style={{ fontSize: '1.5rem', color: '#1E293B', margin: 0 }}>My Patients ({patients.length})</h2>
                                <div style={{ position: 'relative' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                    <input
                                        type="text"
                                        placeholder="Search patients..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ padding: '10px 10px 10px 40px', borderRadius: '10px', border: '1px solid #E2E8F0', width: '250px' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                                {filteredPatients.map(patient => (
                                    <div key={patient.id} style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.3rem' }}>
                                                {patient.name?.[0] || '?'}
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: '600', fontSize: '1.1rem', color: '#1E293B' }}>{patient.name}</p>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>{patient.email}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                            <div><span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Gender</span><p style={{ margin: 0, fontWeight: '500' }}>{patient.gender || '-'}</p></div>
                                            <div><span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Blood</span><p style={{ margin: 0, fontWeight: '500' }}>{patient.bloodGroup || '-'}</p></div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => openChat(patient)}
                                                style={{ flex: 1, padding: '10px', background: '#DBEAFE', color: '#2563EB', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                            >
                                                <MessageSquare size={16} /> Chat
                                            </button>
                                            <button
                                                onClick={() => { setSelectedPatient(patient); setActiveTab('prescribe'); setShowPrescriptionForm(true); }}
                                                style={{ flex: 1, padding: '10px', background: '#F0FDFA', color: '#0D9488', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
                                            >
                                                Prescribe
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CHAT TAB */}
                    {activeTab === 'chat' && (
                        <div style={{ height: 'calc(100vh - 150px)', display: 'flex', gap: '20px' }}>
                            {/* Patient List */}
                            <div style={{ width: '280px', background: 'white', borderRadius: '16px', overflow: 'hidden' }}>
                                <div style={{ padding: '20px', borderBottom: '1px solid #E2E8F0' }}>
                                    <h3 style={{ margin: 0, color: '#1E293B' }}>Conversations</h3>
                                </div>
                                <div style={{ padding: '10px', maxHeight: '500px', overflowY: 'auto' }}>
                                    {patients.length === 0 ? (
                                        <p style={{ color: '#64748B', textAlign: 'center', padding: '20px' }}>No patients yet</p>
                                    ) : (
                                        patients.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => openChat(p)}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    background: chatPatient?.id === p.id ? '#F0FDFA' : 'transparent',
                                                    border: 'none',
                                                    borderRadius: '10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    cursor: 'pointer',
                                                    marginBottom: '5px',
                                                    textAlign: 'left'
                                                }}
                                            >
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                                                    {p.name?.[0]}
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: '600', color: '#1E293B' }}>{p.name}</p>
                                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>{p.email}</p>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Chat Window */}
                            <div style={{ flex: 1, background: 'white', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                {chatPatient ? (
                                    <>
                                        {/* Chat Header */}
                                        <div style={{ padding: '20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                    {chatPatient.name?.[0]}
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: '600', color: '#1E293B' }}>{chatPatient.name}</p>
                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>{chatPatient.email}</p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => {
                                                        if (chatPatient.phone) {
                                                            window.open(`tel:${chatPatient.phone}`, '_self');
                                                        } else {
                                                            alert('Phone number not available. Please contact via chat.');
                                                        }
                                                    }}
                                                    title="Call Patient"
                                                    style={{
                                                        width: '40px', height: '40px', borderRadius: '10px',
                                                        border: '1px solid #E2E8F0', background: 'white',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        cursor: 'pointer', color: '#64748B'
                                                    }}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const meetUrl = `https://meet.google.com/new`;
                                                        window.open(meetUrl, '_blank');
                                                    }}
                                                    title="Start Video Call"
                                                    style={{
                                                        width: '40px', height: '40px', borderRadius: '10px',
                                                        border: '1px solid #E2E8F0', background: 'white',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        cursor: 'pointer', color: '#64748B'
                                                    }}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Messages */}
                                        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#F8FAFC' }}>
                                            {loadingMessages ? (
                                                <p style={{ textAlign: 'center', color: '#64748B' }}>Loading...</p>
                                            ) : chatMessages.length === 0 ? (
                                                <p style={{ textAlign: 'center', color: '#64748B' }}>No messages yet. Start the conversation!</p>
                                            ) : (
                                                chatMessages.map((msg, idx) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: msg.sender === 'doctor' ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
                                                        <div style={{
                                                            maxWidth: '70%',
                                                            padding: '12px 16px',
                                                            borderRadius: msg.sender === 'doctor' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                                            background: msg.sender === 'doctor' ? '#0D9488' : 'white',
                                                            color: msg.sender === 'doctor' ? 'white' : '#1E293B',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                                        }}>
                                                            <p style={{ margin: 0 }}>{msg.content}</p>
                                                            <p style={{ margin: '8px 0 0 0', fontSize: '0.7rem', opacity: 0.7 }}>
                                                                {new Date(msg.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* Input */}
                                        <div style={{ padding: '20px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '12px' }}>
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                                placeholder="Type a message..."
                                                style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '1rem' }}
                                            />
                                            <button onClick={sendMessage} style={{ padding: '14px 24px', background: '#0D9488', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Send size={18} /> Send
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                        <MessageSquare size={48} color="#94A3B8" style={{ marginBottom: '15px' }} />
                                        <p style={{ color: '#64748B' }}>Select a patient to start chatting</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* PRESCRIPTIONS TAB */}
                    {activeTab === 'prescriptions' && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', color: '#1E293B', marginBottom: '25px' }}>Prescription History ({prescriptions.length})</h2>

                            {prescriptions.length === 0 ? (
                                <div style={{ background: 'white', borderRadius: '16px', padding: '60px', textAlign: 'center' }}>
                                    <FileText size={48} color="#94A3B8" style={{ marginBottom: '15px' }} />
                                    <p style={{ color: '#64748B' }}>No prescriptions yet. Create your first one!</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '15px' }}>
                                    {prescriptions.map(rx => (
                                        <div key={rx.id} style={{ background: 'white', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', background: rx.type === 'acupuncture' ? '#F0FDFA' : '#DBEAFE', color: rx.type === 'acupuncture' ? '#0D9488' : '#2563EB' }}>
                                                        {rx.type === 'acupuncture' ? '⚡ ACUPUNCTURE' : '💊 MEDICINE'}
                                                    </span>
                                                </div>
                                                <p style={{ margin: '0 0 5px 0', fontWeight: '600', color: '#1E293B' }}>Patient: {rx.patientName}</p>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>{rx.diagnosis || 'No diagnosis noted'}</p>
                                                {rx.acupoints && (
                                                    <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#0D9488' }}>
                                                        Points: {JSON.parse(rx.acupoints).map(p => `${p.code} (${p.technique})`).join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ margin: 0, fontWeight: '500', color: '#1E293B' }}>{new Date(rx.createdAt).toLocaleDateString('en-GB')}</p>
                                                <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', background: rx.status === 'active' ? '#DCFCE7' : '#F1F5F9', color: rx.status === 'active' ? '#16A34A' : '#64748B' }}>
                                                    {rx.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* PRESCRIBE TAB - Acupuncture Prescription Form */}
                    {(activeTab === 'prescribe' || showPrescriptionForm) && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', color: '#1E293B', marginBottom: '25px' }}>
                                {prescriptionType === 'acupuncture' ? '⚡ Acupuncture Therapy Prescription' : '💊 Medicine Prescription'}
                            </h2>

                            {/* Type Toggle */}
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                                <button onClick={() => setPrescriptionType('acupuncture')} style={{ padding: '12px 24px', background: prescriptionType === 'acupuncture' ? '#0D9488' : 'white', color: prescriptionType === 'acupuncture' ? 'white' : '#475569', border: '1px solid #E2E8F0', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                                    ⚡ Acupuncture
                                </button>
                                <button onClick={() => setPrescriptionType('medicine')} style={{ padding: '12px 24px', background: prescriptionType === 'medicine' ? '#3B82F6' : 'white', color: prescriptionType === 'medicine' ? 'white' : '#475569', border: '1px solid #E2E8F0', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                                    💊 Medicine
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                                {/* Left: Patient & Details */}
                                <div style={{ background: 'white', borderRadius: '16px', padding: '25px' }}>
                                    <h3 style={{ margin: '0 0 20px 0', color: '#1E293B' }}>Patient & Diagnosis</h3>

                                    {/* Patient Selection */}
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>Select Patient *</label>
                                        <select
                                            value={selectedPatient?.id || ''}
                                            onChange={(e) => setSelectedPatient(patients.find(p => p.id === e.target.value))}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}
                                        >
                                            <option value="">Choose a patient...</option>
                                            {patients.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>Diagnosis / Condition</label>
                                        <input type="text" value={prescriptionData.diagnosis} onChange={(e) => setPrescriptionData({ ...prescriptionData, diagnosis: e.target.value })} placeholder="e.g., Chronic lower back pain" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                                    </div>

                                    {prescriptionType === 'acupuncture' && (
                                        <>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>Duration</label>
                                                    <input type="text" value={prescriptionData.duration} onChange={(e) => setPrescriptionData({ ...prescriptionData, duration: e.target.value })} placeholder="e.g., 30 mins, 6 sessions" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>Frequency</label>
                                                    <input type="text" value={prescriptionData.frequency} onChange={(e) => setPrescriptionData({ ...prescriptionData, frequency: e.target.value })} placeholder="e.g., Twice weekly" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {prescriptionType === 'medicine' && (
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>Medicines</label>
                                            <textarea value={prescriptionData.medicines} onChange={(e) => setPrescriptionData({ ...prescriptionData, medicines: e.target.value })} placeholder="List medicines with dosage..." style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', minHeight: '120px' }} />
                                        </div>
                                    )}

                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>Additional Notes</label>
                                        <textarea value={prescriptionData.notes} onChange={(e) => setPrescriptionData({ ...prescriptionData, notes: e.target.value })} placeholder="Any special instructions..." style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', minHeight: '80px' }} />
                                    </div>

                                    {/* Selected Points Summary */}
                                    {prescriptionType === 'acupuncture' && selectedPoints.length > 0 && (
                                        <div style={{ background: '#F0FDFA', borderRadius: '12px', padding: '15px', marginBottom: '20px' }}>
                                            <h4 style={{ margin: '0 0 10px 0', color: '#0D9488' }}>Selected Acupoints ({selectedPoints.length})</h4>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {selectedPoints.map(p => (
                                                    <span key={p.code} style={{ padding: '6px 12px', background: p.technique === 'tonify' ? '#DCFCE7' : p.technique === 'sedate' ? '#FEE2E2' : '#F1F5F9', color: p.technique === 'tonify' ? '#16A34A' : p.technique === 'sedate' ? '#DC2626' : '#475569', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                                                        {p.code} ({p.technique})
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <button onClick={handleCreatePrescription} style={{ width: '100%', padding: '14px', background: prescriptionType === 'acupuncture' ? '#0D9488' : '#3B82F6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer' }}>
                                        Create Prescription
                                    </button>
                                </div>

                                {/* Right: Acupoint Selection */}
                                {prescriptionType === 'acupuncture' && (
                                    <div style={{ background: 'white', borderRadius: '16px', padding: '25px', maxHeight: '600px', overflowY: 'auto' }}>
                                        <h3 style={{ margin: '0 0 10px 0', color: '#1E293B' }}>Select Acupuncture Points</h3>
                                        <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#64748B' }}>Click to select technique: Tonify (positive) or Sedate (negative)</p>

                                        {ACUPOINTS.map(point => {
                                            const selected = selectedPoints.find(p => p.code === point.code);
                                            return (
                                                <div key={point.code} style={{ background: selected ? '#F0FDFA' : '#F8FAFC', borderRadius: '12px', padding: '15px', marginBottom: '12px', border: selected ? '2px solid #0D9488' : '1px solid #E2E8F0' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                                        <div>
                                                            <span style={{ fontWeight: '700', color: '#0D9488', fontSize: '1rem' }}>{point.code}</span>
                                                            <span style={{ marginLeft: '10px', color: '#64748B' }}>({point.name})</span>
                                                        </div>
                                                        <span style={{ fontSize: '0.75rem', background: '#E2E8F0', padding: '2px 8px', borderRadius: '10px', color: '#475569' }}>{point.meridian}</span>
                                                    </div>
                                                    <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#64748B' }}>{point.location}</p>
                                                    <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: '#94A3B8' }}>📌 {point.indications}</p>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => togglePoint(point, 'tonify')} style={{ flex: 1, padding: '8px', background: selected?.technique === 'tonify' ? '#16A34A' : '#DCFCE7', color: selected?.technique === 'tonify' ? 'white' : '#16A34A', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                            ➕ Tonify
                                                        </button>
                                                        <button onClick={() => togglePoint(point, 'sedate')} style={{ flex: 1, padding: '8px', background: selected?.technique === 'sedate' ? '#DC2626' : '#FEE2E2', color: selected?.technique === 'sedate' ? 'white' : '#DC2626', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                            ➖ Sedate
                                                        </button>
                                                        <button onClick={() => togglePoint(point, 'neutral')} style={{ flex: 1, padding: '8px', background: selected?.technique === 'neutral' ? '#475569' : '#F1F5F9', color: selected?.technique === 'neutral' ? 'white' : '#475569', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                            ⚪ Neutral
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Referral Tab */}
                    {activeTab === 'referral' && (
                        <div>
                            {/* Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '25px' }}>
                                <div style={{ background: 'white', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#0D948815', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Gift size={24} color="#0D9488" />
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1E293B' }}>{referralStats.total}</p>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>Total Referrals</p>
                                    </div>
                                </div>
                                <div style={{ background: 'white', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#F59E0B15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Clock size={24} color="#F59E0B" />
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1E293B' }}>{referralStats.pending}</p>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>Pending</p>
                                    </div>
                                </div>
                                <div style={{ background: 'white', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#10B98115', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Wallet size={24} color="#10B981" />
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#10B981' }}>₹{walletBalance}</p>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>Wallet Balance</p>
                                    </div>
                                </div>
                            </div>

                            {/* Referral Code Card */}
                            <div style={{ background: 'white', borderRadius: '16px', padding: '25px', marginBottom: '25px' }}>
                                <h3 style={{ margin: '0 0 20px', color: '#1E293B' }}>Your Referral Code</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#F0FDFA', padding: '16px 20px', borderRadius: '12px', border: '2px dashed #0D9488', marginBottom: '20px' }}>
                                    <span style={{ flex: 1, fontSize: '1.5rem', fontWeight: '800', color: '#0D9488', letterSpacing: '3px', fontFamily: 'monospace' }}>
                                        {referralCode || '------'}
                                    </span>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(referralCode);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        }}
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
                                            gap: '6px'
                                        }}
                                    >
                                        {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => window.open(`https://wa.me/?text=Join%20our%20health%20app%20using%20my%20referral%20code:%20${referralCode}%20${encodeURIComponent(referralLink)}`, '_blank')}
                                        style={{ padding: '12px 20px', background: '#25D366', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        Share on WhatsApp
                                    </button>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(referralLink)}
                                        style={{ padding: '12px 20px', background: '#E0E7FF', color: '#4F46E5', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
                                    >
                                        Copy Link
                                    </button>
                                </div>
                            </div>

                            {/* Referral History */}
                            <div style={{ background: 'white', borderRadius: '16px', padding: '25px' }}>
                                <h3 style={{ margin: '0 0 20px', color: '#1E293B' }}>Your Referrals</h3>
                                {referrals.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                                        <Users size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
                                        <p style={{ margin: 0 }}>No referrals yet. Start sharing your code!</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {referrals.map((ref, idx) => (
                                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#F8FAFC', borderRadius: '12px' }}>
                                                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#0D9488', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                                                    {ref.refereeName?.[0] || '?'}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ margin: 0, fontWeight: '600', color: '#1E293B' }}>{ref.refereeName || 'User'}</p>
                                                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748B' }}>{new Date(ref.signupDate).toLocaleDateString()}</p>
                                                </div>
                                                {ref.status === 'credited' ? (
                                                    <span style={{ background: '#D1FAE5', color: '#059669', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>+₹{ref.rewardAmount}</span>
                                                ) : (
                                                    <span style={{ background: '#FEF3C7', color: '#D97706', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>Pending</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({ title, value, color, icon: Icon }) {
    return (
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={24} color={color} />
                </div>
            </div>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '5px' }}>{title}</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1E293B', margin: 0 }}>{value}</p>
        </div>
    );
}
