import React from 'react';
import { Bell, User } from 'lucide-react';
import './DashboardHeader.css';

const DashboardHeader = ({ patient }) => {
    return (
        <div className="dashboard-top-header">
            <div className="header-left">
                <h1 className="greeting">Good Morning, {patient.name.split(' ')[0]}</h1>
                <div className="health-status-badge">
                    <span className="status-dot"></span>
                    Stable
                </div>
            </div>

            <div className="header-right">
                <button className="btn-icon-only relative">
                    <Bell size={20} />
                    <span className="notification-dot"></span>
                </button>
                <div className="mini-profile">
                    <div className="avatar-small">
                        {patient.avatar ? <img src={patient.avatar} alt="Profile" /> : <User size={20} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;
