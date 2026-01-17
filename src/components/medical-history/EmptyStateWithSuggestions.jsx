import React from 'react';
import { Activity, Clipboard, PlusCircle, ArrowRight } from 'lucide-react';

const EmptyStateWithSuggestions = ({ onAction }) => {
    return (
        <div className="empty-state-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center',
            padding: '40px',
            color: '#64748b'
        }}>
            <div style={{
                width: '120px',
                height: '120px',
                background: '#f1f5f9',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
            }}>
                <Activity size={48} color="#94a3b8" />
            </div>

            <h2 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '8px' }}>Start Building Your Health Story</h2>
            <p style={{ maxWidth: '400px', marginBottom: '32px', lineHeight: '1.6' }}>
                Your medical history helps AI provide better insights.
                Select a body part on the left or choose an action below to begin.
            </p>

            <div className="suggestions-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                width: '100%',
                maxWidth: '600px'
            }}>
                <button className="suggestion-card" onClick={() => onAction('log_symptom')} style={cardStyle}>
                    <div className="icon-badge" style={{ ...iconBadgeStyle, background: '#fee2e2', color: '#ef4444' }}>
                        <Activity size={20} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <h4 style={cardTitleStyle}>Log Current Symptom</h4>
                        <p style={cardDescStyle}>Track pain or discomfort</p>
                    </div>
                    <ArrowRight size={16} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                </button>

                <button className="suggestion-card" onClick={() => onAction('complete_history')} style={cardStyle}>
                    <div className="icon-badge" style={{ ...iconBadgeStyle, background: '#dbeafe', color: '#3b82f6' }}>
                        <Clipboard size={20} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <h4 style={cardTitleStyle}>Complete History</h4>
                        <p style={cardDescStyle}>Birth, childhood & family</p>
                    </div>
                    <ArrowRight size={16} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                </button>

                <button className="suggestion-card" onClick={() => onAction('log_meds')} style={cardStyle}>
                    <div className="icon-badge" style={{ ...iconBadgeStyle, background: '#dcfce7', color: '#16a34a' }}>
                        <PlusCircle size={20} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <h4 style={cardTitleStyle}>Add Medications</h4>
                        <p style={cardDescStyle}>Track prescriptions</p>
                    </div>
                    <ArrowRight size={16} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                </button>
            </div>
        </div>
    );
};

// Simple inline styles for the component
const cardStyle = {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
};

const iconBadgeStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
};

const cardTitleStyle = {
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#334155'
};

const cardDescStyle = {
    margin: '2px 0 0',
    fontSize: '0.8rem',
    color: '#94a3b8'
};

export default EmptyStateWithSuggestions;
