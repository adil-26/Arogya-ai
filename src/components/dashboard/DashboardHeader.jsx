'use client';

import React from 'react';
import { User } from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import './DashboardHeader.css';

const DashboardHeader = ({ patient }) => {
    // Get time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="dashboard-top-header">
            <div className="header-left">
                <h1 className="greeting">{getGreeting()}, {patient.name?.split(' ')[0] || 'User'}</h1>
                <div className="health-status-badge">
                    <span className="status-dot"></span>
                    Stable
                </div>
            </div>

            <div className="header-right">
                {/* Notification Bell with Panel */}
                <NotificationPanel />

                {/* Profile Avatar */}
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
