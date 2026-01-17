import React from 'react';
import { Activity, TrendingUp } from 'lucide-react';

const HealthScoreWidget = ({ score = 85, trend = 'stable' }) => {
    // Determine color based on score
    const getColor = (s) => {
        if (s >= 80) return '#10b981'; // Emerald
        if (s >= 60) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
    };

    const color = getColor(score);
    const circumference = 2 * Math.PI * 36; // r=36
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="health-score-widget" style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
            borderRadius: '16px',
            padding: '20px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            marginBottom: '20px'
        }}>
            <div>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Health Score</h4>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1, margin: '8px 0' }}>
                    {score}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <Activity size={14} /> Based on records
                </div>
            </div>

            <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                {/* SVG Ring */}
                <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                        cx="40" cy="40" r="36"
                        stroke="#334155"
                        strokeWidth="8"
                        fill="transparent"
                    />
                    <circle
                        cx="40" cy="40" r="36"
                        stroke={color}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                </svg>
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%', height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <TrendingUp size={24} color={color} />
                </div>
            </div>
        </div>
    );
};

export default HealthScoreWidget;
