import React from 'react';
import { MessageSquare, Calendar, Upload, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import './QuickActions.css';

const QuickActions = () => {
    const router = useRouter();
    const navigate = (path) => router.push(path);

    return (
        <div className="quick-actions-bar">
            <button className="action-card" onClick={() => navigate('/chat')}>
                <div className="action-icon chat">
                    <MessageSquare size={20} />
                </div>
                <span className="action-label">Chat AI</span>
            </button>

            <button className="action-card" onClick={() => navigate('/appointments')}>
                <div className="action-icon appointment">
                    <Calendar size={20} />
                </div>
                <span className="action-label">Book Dr.</span>
            </button>

            <button className="action-card" onClick={() => navigate('/records')}>
                <div className="action-icon upload">
                    <Upload size={20} />
                </div>
                <span className="action-label">Upload</span>
            </button>

            <button className="action-card" onClick={() => document.getElementById('vitals-section').scrollIntoView({ behavior: 'smooth' })}>
                <div className="action-icon timeline">
                    <Activity size={20} />
                </div>
                <span className="action-label">Timeline</span>
            </button>
        </div>
    );
};

export default QuickActions;
