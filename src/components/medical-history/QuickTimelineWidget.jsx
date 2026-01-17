import React from 'react';
import { Calendar, ChevronRight, Clock } from 'lucide-react';

const QuickTimelineWidget = ({ history = [] }) => {
    // Sort by date (descending) and take top 3
    const recentEvents = [...history].sort((a, b) => {
        // Mock date parsing if strings are loose, better to ensure standard format
        return new Date(b.date) - new Date(a.date);
    }).slice(0, 4);

    return (
        <div className="quick-timeline-widget" style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={18} color="#64748b" /> Recent Activity
                </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {recentEvents.length > 0 ? (
                    recentEvents.map((item, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            gap: '12px',
                            paddingBottom: idx === recentEvents.length - 1 ? 0 : '16px',
                            position: 'relative'
                        }}>
                            {/* Vertical Line */}
                            {idx !== recentEvents.length - 1 && (
                                <div style={{
                                    position: 'absolute',
                                    left: '5px',
                                    top: '20px',
                                    bottom: '-4px',
                                    width: '2px',
                                    background: '#f1f5f9'
                                }}></div>
                            )}

                            <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: item.severity === 'active' ? '#ef4444' : '#3b82f6',
                                marginTop: '6px',
                                flexShrink: 0,
                                border: '2px solid white',
                                boxShadow: `0 0 0 2px ${item.severity === 'active' ? '#fee2e2' : '#dbeafe'}`
                            }}></div>

                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                                    {item.issue}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{item.date}</span>
                                    <span style={{ textTransform: 'capitalize' }}>{item.domain}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '10px', color: '#94a3b8', fontSize: '0.9rem' }}>
                        No recent activity recorded.
                    </div>
                )}
            </div>

            <button style={{
                width: '100%',
                marginTop: '16px',
                padding: '10px',
                background: '#f8fafc',
                border: 'none',
                borderRadius: '8px',
                color: '#0F766E',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
            }}>
                View Full Timeline <ChevronRight size={14} />
            </button>
        </div>
    );
};

export default QuickTimelineWidget;
