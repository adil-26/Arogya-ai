'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Upload, Book, Trash2, Users, Calendar, Shield, UserCheck, UserX, Search, AlertCircle, Gift, Wallet } from 'lucide-react';

export default function AdminDashboardClient({
    initialStats,
    initialPendingDoctors,
    initialUsers,
    initialAppointments,
    initialLibraryItems,
    currentAdmin
}) {
    const [stats, setStats] = useState(initialStats);
    const [pendingDoctors, setPendingDoctors] = useState(initialPendingDoctors);
    const [users, setUsers] = useState(initialUsers);
    const [appointments, setAppointments] = useState(initialAppointments);
    const [libraryItems, setLibraryItems] = useState(initialLibraryItems);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');

    // Upload form state
    const [uploadForm, setUploadForm] = useState({
        title: '', description: '', author: '', category: 'book', accessLevel: 'all'
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Handlers
    const handleDoctorAction = async (doctorId, action) => {
        try {
            const res = await fetch('/api/admin/doctors', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doctorId, action })
            });

            if (res.ok) {
                setPendingDoctors(prev => prev.filter(d => d.id !== doctorId));
                // Refresh stats
                const statsRes = await fetch('/api/admin/stats');
                if (statsRes.ok) setStats(await statsRes.json());
                alert(`Doctor ${action === 'approve' ? 'Approved' : 'Rejected'}!`);
            }
        } catch (error) {
            alert("Action failed");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        try {
            const res = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' });
            if (res.ok) {
                setUsers(prev => prev.filter(u => u.id !== userId));
                alert("User deleted");
            } else {
                alert("Delete failed");
            }
        } catch (error) {
            alert("Delete failed");
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert("Please select a PDF file");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('title', uploadForm.title);
        formData.append('description', uploadForm.description);
        formData.append('author', uploadForm.author);
        formData.append('category', uploadForm.category);
        formData.append('accessLevel', uploadForm.accessLevel);
        formData.append('file', selectedFile);

        try {
            const res = await fetch('/api/library', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                alert("PDF uploaded successfully!");
                setUploadForm({ title: '', description: '', author: '', category: 'book', accessLevel: 'all' });
                setSelectedFile(null);
                setLibraryItems(prev => [data.item, ...prev]);
            } else {
                const err = await res.json();
                alert("Upload failed: " + err.error);
            }
        } catch (error) {
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteLibraryItem = async (id) => {
        if (!confirm("Delete this item?")) return;

        try {
            const res = await fetch(`/api/library?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setLibraryItems(prev => prev.filter(item => item.id !== id));
            }
        } catch (error) {
            alert("Delete failed");
        }
    };

    // Filter users based on search
    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Shield },
        { id: 'doctors', label: 'Doctor Approvals', icon: UserCheck },
        { id: 'users', label: 'All Users', icon: Users },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'library', label: 'Library', icon: Book },
        { id: 'referrals', label: 'Referrals', icon: Gift, isLink: '/admin/referrals' },
        { id: 'withdrawals', label: 'Withdrawals', icon: Wallet, isLink: '/admin/withdrawals' }
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>
            {/* Header */}
            <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)', padding: '10px', borderRadius: '12px' }}>
                        <Shield size={24} color="white" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#1E293B' }}>Admin Panel</h1>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>Logged in as {currentAdmin.name}</p>
                    </div>
                </div>
                <Link href="/dashboard/health" style={{ padding: '10px 20px', background: '#1E40AF', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
                    Go to App
                </Link>
            </div>

            <div style={{ display: 'flex' }}>
                {/* Sidebar */}
                <div style={{ width: '250px', background: 'white', borderRight: '1px solid #E2E8F0', minHeight: 'calc(100vh - 80px)', padding: '20px 0' }}>
                    {tabs.map(tab => (
                        tab.isLink ? (
                            <Link
                                key={tab.id}
                                href={tab.isLink}
                                style={{
                                    width: '100%',
                                    padding: '14px 24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    background: 'transparent',
                                    borderLeft: '3px solid transparent',
                                    color: '#475569',
                                    fontWeight: '500',
                                    fontSize: '0.95rem',
                                    textDecoration: 'none'
                                }}
                            >
                                <tab.icon size={20} />
                                {tab.label}
                            </Link>
                        ) : (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    width: '100%',
                                    padding: '14px 24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    background: activeTab === tab.id ? '#EFF6FF' : 'transparent',
                                    border: 'none',
                                    borderLeft: activeTab === tab.id ? '3px solid #1E40AF' : '3px solid transparent',
                                    color: activeTab === tab.id ? '#1E40AF' : '#475569',
                                    fontWeight: activeTab === tab.id ? '600' : '500',
                                    fontSize: '0.95rem',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                <tab.icon size={20} />
                                {tab.label}
                            </button>
                        )
                    ))}
                </div>

                {/* Main Content */}
                <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', color: '#1E293B', marginBottom: '25px' }}>Dashboard Overview</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                                <StatCard title="Total Patients" value={stats?.totalPatients || 0} color="#3B82F6" />
                                <StatCard title="Total Doctors" value={stats?.totalDoctors || 0} color="#10B981" />
                                <StatCard title="Pending Approvals" value={stats?.pendingDoctors || 0} color="#F59E0B" />
                                <StatCard title="Total Appointments" value={stats?.totalAppointments || 0} color="#8B5CF6" />
                                <StatCard title="Library Items" value={libraryItems.length} color="#EC4899" />
                            </div>

                            {/* Quick Alerts */}
                            {pendingDoctors.length > 0 && (
                                <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '12px', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <AlertCircle size={24} color="#D97706" />
                                    <div>
                                        <p style={{ margin: 0, fontWeight: '600', color: '#92400E' }}>{pendingDoctors.length} doctor(s) awaiting approval</p>
                                        <button onClick={() => setActiveTab('doctors')} style={{ background: 'none', border: 'none', color: '#1E40AF', cursor: 'pointer', fontWeight: '500', padding: 0, marginTop: '4px' }}>Review now →</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* DOCTOR APPROVALS TAB */}
                    {activeTab === 'doctors' && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', color: '#1E293B', marginBottom: '25px' }}>Pending Doctor Approvals ({pendingDoctors.length})</h2>

                            {pendingDoctors.length === 0 ? (
                                <div style={{ background: 'white', borderRadius: '12px', padding: '60px', textAlign: 'center' }}>
                                    <UserCheck size={48} color="#10B981" style={{ marginBottom: '15px' }} />
                                    <p style={{ color: '#64748B', fontSize: '1.1rem' }}>All caught up! No pending approvals.</p>
                                </div>
                            ) : (
                                <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: '#F8FAFC' }}>
                                                <th style={{ padding: '14px', textAlign: 'left', borderBottom: '1px solid #E2E8F0', fontWeight: '600', color: '#475569' }}>Name</th>
                                                <th style={{ padding: '14px', textAlign: 'left', borderBottom: '1px solid #E2E8F0', fontWeight: '600', color: '#475569' }}>Email</th>
                                                <th style={{ padding: '14px', textAlign: 'left', borderBottom: '1px solid #E2E8F0', fontWeight: '600', color: '#475569' }}>Specialty</th>
                                                <th style={{ padding: '14px', textAlign: 'left', borderBottom: '1px solid #E2E8F0', fontWeight: '600', color: '#475569' }}>License</th>
                                                <th style={{ padding: '14px', textAlign: 'left', borderBottom: '1px solid #E2E8F0', fontWeight: '600', color: '#475569' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingDoctors.map(doctor => (
                                                <tr key={doctor.id}>
                                                    <td style={{ padding: '14px', borderBottom: '1px solid #F1F5F9', fontWeight: '500' }}>{doctor.name}</td>
                                                    <td style={{ padding: '14px', borderBottom: '1px solid #F1F5F9', color: '#64748B' }}>{doctor.email}</td>
                                                    <td style={{ padding: '14px', borderBottom: '1px solid #F1F5F9' }}>{doctor.specialty || '-'}</td>
                                                    <td style={{ padding: '14px', borderBottom: '1px solid #F1F5F9' }}>{doctor.licenseNo || '-'}</td>
                                                    <td style={{ padding: '14px', borderBottom: '1px solid #F1F5F9' }}>
                                                        <button onClick={() => handleDoctorAction(doctor.id, 'approve')} style={{ padding: '6px 14px', background: '#10B981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '8px', fontWeight: '500' }}>Approve</button>
                                                        <button onClick={() => handleDoctorAction(doctor.id, 'reject')} style={{ padding: '6px 14px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Reject</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ALL USERS TAB */}
                    {activeTab === 'users' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                <h2 style={{ fontSize: '1.5rem', color: '#1E293B', margin: 0 }}>All Users ({users.length})</h2>
                                <div style={{ position: 'relative' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #E2E8F0', width: '250px' }}
                                    />
                                </div>
                            </div>

                            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#F8FAFC' }}>
                                            <th style={{ padding: '14px', textAlign: 'left', borderBottom: '1px solid #E2E8F0', fontWeight: '600', color: '#475569' }}>Name</th>
                                            <th style={{ padding: '14px', textAlign: 'left', borderBottom: '1px solid #E2E8F0', fontWeight: '600', color: '#475569' }}>Email</th>
                                            <th style={{ padding: '14px', textAlign: 'left', borderBottom: '1px solid #E2E8F0', fontWeight: '600', color: '#475569' }}>Role</th>
                                            <th style={{ padding: '14px', textAlign: 'left', borderBottom: '1px solid #E2E8F0', fontWeight: '600', color: '#475569' }}>Status</th>
                                            <th style={{ padding: '14px', textAlign: 'left', borderBottom: '1px solid #E2E8F0', fontWeight: '600', color: '#475569' }}>Joined</th>
                                            <th style={{ padding: '14px', textAlign: 'left', borderBottom: '1px solid #E2E8F0', fontWeight: '600', color: '#475569' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(user => (
                                            <tr key={user.id}>
                                                <td style={{ padding: '14px', borderBottom: '1px solid #F1F5F9', fontWeight: '500' }}>{user.name || '-'}</td>
                                                <td style={{ padding: '14px', borderBottom: '1px solid #F1F5F9', color: '#64748B' }}>{user.email}</td>
                                                <td style={{ padding: '14px', borderBottom: '1px solid #F1F5F9' }}>
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600',
                                                        background: user.role === 'admin' ? '#FEE2E2' : user.role === 'doctor' ? '#DCFCE7' : '#DBEAFE',
                                                        color: user.role === 'admin' ? '#DC2626' : user.role === 'doctor' ? '#16A34A' : '#2563EB'
                                                    }}>
                                                        {user.role?.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px', borderBottom: '1px solid #F1F5F9' }}>
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.8rem',
                                                        background: user.status === 'approved' ? '#DCFCE7' : user.status === 'pending' ? '#FEF3C7' : '#F1F5F9',
                                                        color: user.status === 'approved' ? '#16A34A' : user.status === 'pending' ? '#D97706' : '#64748B'
                                                    }}>
                                                        {user.status || 'active'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px', borderBottom: '1px solid #F1F5F9', color: '#64748B' }}>{new Date(user.createdAt).toLocaleDateString('en-GB')}</td>
                                                <td style={{ padding: '14px', borderBottom: '1px solid #F1F5F9' }}>
                                                    {user.role !== 'admin' && (
                                                        <button onClick={() => handleDeleteUser(user.id)} style={{ padding: '6px 12px', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* APPOINTMENTS TAB */}
                    {activeTab === 'appointments' && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', color: '#1E293B', marginBottom: '25px' }}>All Appointments ({appointments.length})</h2>

                            {appointments.length === 0 ? (
                                <div style={{ background: 'white', borderRadius: '12px', padding: '60px', textAlign: 'center' }}>
                                    <Calendar size={48} color="#94A3B8" style={{ marginBottom: '15px' }} />
                                    <p style={{ color: '#64748B', fontSize: '1.1rem' }}>No appointments yet.</p>
                                </div>
                            ) : (
                                <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: '#F8FAFC' }}>
                                                <th style={{ padding: '14px', textAlign: 'left', borderBottom: '1px solid #E2E8F0', fontWeight: '600', color: '#475569' }}>Date</th>
                                                <th style={{ padding: '14px', textAlign: 'left', borderBottom: '1px solid #E2E8F0', fontWeight: '600', color: '#475569' }}>Time</th>
                                                <th style={{ padding: '14px', textAlign: 'left', borderBottom: '1px solid #E2E8F0', fontWeight: '600', color: '#475569' }}>Doctor</th>
                                                <th style={{ padding: '14px', textAlign: 'left', borderBottom: '1px solid #E2E8F0', fontWeight: '600', color: '#475569' }}>Type</th>
                                                <th style={{ padding: '14px', textAlign: 'left', borderBottom: '1px solid #E2E8F0', fontWeight: '600', color: '#475569' }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {appointments.map(apt => (
                                                <tr key={apt.id}>
                                                    <td style={{ padding: '14px', borderBottom: '1px solid #F1F5F9', fontWeight: '500' }}>{new Date(apt.date).toLocaleDateString('en-GB')}</td>
                                                    <td style={{ padding: '14px', borderBottom: '1px solid #F1F5F9' }}>{apt.time || '-'}</td>
                                                    <td style={{ padding: '14px', borderBottom: '1px solid #F1F5F9' }}>{apt.doctorName || 'N/A'}</td>
                                                    <td style={{ padding: '14px', borderBottom: '1px solid #F1F5F9' }}>{apt.type || 'General'}</td>
                                                    <td style={{ padding: '14px', borderBottom: '1px solid #F1F5F9' }}>
                                                        <span style={{
                                                            padding: '4px 10px',
                                                            borderRadius: '20px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '600',
                                                            background: apt.status === 'completed' ? '#DCFCE7' : apt.status === 'cancelled' ? '#FEE2E2' : '#DBEAFE',
                                                            color: apt.status === 'completed' ? '#16A34A' : apt.status === 'cancelled' ? '#DC2626' : '#2563EB'
                                                        }}>
                                                            {apt.status || 'scheduled'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* LIBRARY TAB */}
                    {activeTab === 'library' && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', color: '#1E293B', marginBottom: '25px' }}>Library Management</h2>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                                {/* Upload Form */}
                                <div style={{ background: 'white', borderRadius: '12px', padding: '25px' }}>
                                    <h3 style={{ fontSize: '1.1rem', color: '#1E293B', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Upload size={20} /> Upload New PDF
                                    </h3>

                                    <form onSubmit={handleUpload} style={{ display: 'grid', gap: '15px' }}>
                                        <input type="text" placeholder="Title *" required value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                                        <input type="text" placeholder="Author" value={uploadForm.author} onChange={(e) => setUploadForm({ ...uploadForm, author: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                                        <textarea placeholder="Description" value={uploadForm.description} onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', minHeight: '80px' }} />

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <select value={uploadForm.category} onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                                <option value="book">Book</option>
                                                <option value="research">Research Paper</option>
                                                <option value="guideline">Guideline</option>
                                                <option value="article">Article</option>
                                            </select>

                                            <select value={uploadForm.accessLevel} onChange={(e) => setUploadForm({ ...uploadForm, accessLevel: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                                <option value="all">Everyone</option>
                                                <option value="doctor">Doctors Only</option>
                                                <option value="patient">Patients Only</option>
                                            </select>
                                        </div>

                                        <input type="file" accept=".pdf" onChange={(e) => setSelectedFile(e.target.files[0])} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />

                                        <button type="submit" disabled={uploading} style={{ padding: '14px', background: '#1E40AF', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                            {uploading ? 'Uploading...' : 'Upload PDF'}
                                        </button>
                                    </form>
                                </div>

                                {/* Library List */}
                                <div style={{ background: 'white', borderRadius: '12px', padding: '25px', maxHeight: '500px', overflowY: 'auto' }}>
                                    <h3 style={{ fontSize: '1.1rem', color: '#1E293B', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Book size={20} /> Library Items ({libraryItems.length})
                                    </h3>

                                    {libraryItems.length === 0 ? (
                                        <p style={{ color: '#64748B', textAlign: 'center', padding: '40px' }}>No items yet.</p>
                                    ) : (
                                        <div style={{ display: 'grid', gap: '10px' }}>
                                            {libraryItems.map(item => (
                                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#F8FAFC', borderRadius: '8px' }}>
                                                    <div>
                                                        <p style={{ fontWeight: '600', color: '#1E293B', margin: 0 }}>{item.title}</p>
                                                        <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>{item.category} • {item.accessLevel}</p>
                                                    </div>
                                                    <button onClick={() => handleDeleteLibraryItem(item.id)} style={{ padding: '6px', background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({ title, value, color }) {
    return (
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', borderLeft: `4px solid ${color}` }}>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '5px' }}>{title}</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1E293B', margin: 0 }}>{value}</p>
        </div>
    );
}
