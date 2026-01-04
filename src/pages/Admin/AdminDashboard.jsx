import React, { useState } from 'react';
import { Users, Calendar, Activity, CheckCircle, XCircle } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [appointments, setAppointments] = useState([
        { id: 1, patient: "Adil", doctor: "Dr. Ayesha Khan", date: "2023-10-26", time: "10:00 AM", status: "Pending" },
        { id: 2, patient: "Sarah Smith", doctor: "Dr. Rahul Verma", date: "2023-10-27", time: "02:00 PM", status: "Pending" },
        { id: 3, patient: "John Doe", doctor: "Dr. Emily Chen", date: "2023-10-25", time: "11:30 AM", status: "Confirmed" },
    ]);

    const handleStatusChange = (id, newStatus) => {
        setAppointments(prev => prev.map(app =>
            app.id === id ? { ...app, status: newStatus } : app
        ));
    };

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <h1>Admin Dashboard</h1>
                <button className="btn-logout" onClick={() => window.location.href = '/admin'}>Logout</button>
            </header>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon user-bg"><Users size={24} /></div>
                    <div className="stat-info">
                        <h3>1,254</h3>
                        <span>Total Patients</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon appt-bg"><Calendar size={24} /></div>
                    <div className="stat-info">
                        <h3>45</h3>
                        <span>Appointments Today</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon ai-bg"><Activity size={24} /></div>
                    <div className="stat-info">
                        <h3>320</h3>
                        <span>AI Queries</span>
                    </div>
                </div>
            </div>

            {/* Appointment Management */}
            <div className="management-section">
                <h2>Recent Appointments</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Date & Time</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map(appt => (
                                <tr key={appt.id}>
                                    <td>{appt.patient}</td>
                                    <td>{appt.doctor}</td>
                                    <td>{appt.date} at {appt.time}</td>
                                    <td>
                                        <span className={`status-pill ${appt.status.toLowerCase()}`}>{appt.status}</span>
                                    </td>
                                    <td>
                                        {appt.status === 'Pending' && (
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-icon-sm success"
                                                    title="Approve"
                                                    onClick={() => handleStatusChange(appt.id, 'Confirmed')}
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button
                                                    className="btn-icon-sm danger"
                                                    title="Reject"
                                                    onClick={() => handleStatusChange(appt.id, 'Cancelled')}
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
