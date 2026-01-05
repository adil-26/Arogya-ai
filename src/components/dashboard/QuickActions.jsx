'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Calendar, Upload, Activity, Sparkles, Clock, FileText, TrendingUp, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import './QuickActions.css';

const QuickActions = () => {
    const router = useRouter();
    const navigate = (path) => router.push(path);

    // State for dynamic data
    const [aiStatus, setAiStatus] = useState('ready'); // ready, analyzing, busy
    const [nextSlot, setNextSlot] = useState('Today 4:00 PM');
    const [lastDoctor, setLastDoctor] = useState('Dr. Sharma');
    const [lastUpload, setLastUpload] = useState(null);
    const [weekSummary, setWeekSummary] = useState({ daysLogged: 5, hasAnomaly: false });

    // Fetch appointment data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch upcoming appointment
                const apptRes = await fetch('/api/appointments?limit=1');
                if (apptRes.ok) {
                    const apptData = await apptRes.json();
                    if (apptData.appointments?.length > 0) {
                        const apt = apptData.appointments[0];
                        const date = new Date(apt.date);
                        const isToday = date.toDateString() === new Date().toDateString();
                        setNextSlot(isToday ? `Today ${apt.time}` : `${date.toLocaleDateString('en-US', { weekday: 'short' })} ${apt.time}`);
                        setLastDoctor(apt.doctor?.name || 'Dr. Available');
                    }
                }
            } catch (error) {
                console.log('QuickActions fetch error:', error);
            }
        };
        fetchData();
    }, []);

    // Context-aware AI prompts based on time/vitals
    const getAiPrompt = () => {
        const hour = new Date().getHours();
        const prompts = [
            "Ask about today's BP",
            "Explain my sugar reading",
            "How's my sleep pattern?",
            "Analyze my vitals trend"
        ];

        if (hour < 12) return "Ask about morning vitals";
        if (hour < 17) return "Check my health status";
        return "Review today's readings";
    };

    return (
        <div className="quick-actions-bar">
            {/* 💬 CHAT AI CARD */}
            <button className="action-card enhanced" onClick={() => navigate('/chat')}>
                <div className="action-icon-wrapper chat">
                    <div className="action-icon">
                        <MessageSquare size={20} />
                    </div>
                    <span className={`status-dot ${aiStatus}`}></span>
                </div>
                <div className="action-content">
                    <span className="action-label">Chat AI</span>
                    <span className="action-hint">{getAiPrompt()}</span>
                </div>
                <Sparkles size={14} className="action-accent" />
            </button>

            {/* 📅 BOOK DOCTOR CARD */}
            <button className="action-card enhanced" onClick={() => navigate('/appointments')}>
                <div className="action-icon-wrapper appointment">
                    <div className="action-icon">
                        <Calendar size={20} />
                    </div>
                </div>
                <div className="action-content">
                    <span className="action-label">Book Dr.</span>
                    <span className="action-hint">
                        <Clock size={10} /> {nextSlot}
                    </span>
                </div>
                <ChevronRight size={14} className="action-accent" />
            </button>

            {/* 📤 UPLOAD CARD */}
            <button className="action-card enhanced" onClick={() => navigate('/records')}>
                <div className="action-icon-wrapper upload">
                    <div className="action-icon">
                        <Upload size={20} />
                    </div>
                </div>
                <div className="action-content">
                    <span className="action-label">Upload</span>
                    <span className="action-hint">
                        <FileText size={10} /> Add reports
                    </span>
                </div>
                <ChevronRight size={14} className="action-accent" />
            </button>

            {/* 📊 TIMELINE CARD */}
            <button className="action-card enhanced" onClick={() => document.getElementById('vitals-section')?.scrollIntoView({ behavior: 'smooth' })}>
                <div className="action-icon-wrapper timeline">
                    <div className="action-icon">
                        <Activity size={20} />
                    </div>
                    {weekSummary.hasAnomaly && (
                        <span className="anomaly-badge">!</span>
                    )}
                </div>
                <div className="action-content">
                    <span className="action-label">Timeline</span>
                    <span className="action-hint">
                        <TrendingUp size={10} /> {weekSummary.daysLogged} days logged
                    </span>
                </div>
                <ChevronRight size={14} className="action-accent" />
            </button>
        </div>
    );
};

export default QuickActions;
