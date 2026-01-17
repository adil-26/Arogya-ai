import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';

const AllergyAlertBanner = ({ allergies }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!allergies || allergies.length === 0) return null;

    return (
        <div style={{
            background: '#fee2e2',
            borderBottom: '1px solid #fecaca',
            color: '#b91c1c',
            position: 'sticky',
            top: 0,
            zIndex: 100, // Ensure it stays on top
            width: '100%'
        }}>
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 20px',
                    cursor: 'pointer',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ShieldAlert size={20} className="pulse-animation" />
                    <span style={{ fontWeight: 600 }}>
                        {allergies.length} Critical Allergies Detected:
                        <span style={{ fontWeight: 400, marginLeft: '6px' }}>
                            {allergies.map(a => a.allergen).join(', ')}
                        </span>
                    </span>
                </div>
                <div>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </div>

            {isExpanded && (
                <div style={{ background: '#fef2f2', padding: '10px 20px 20px', borderTop: '1px solid #fecaca' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                        {allergies.map((allergy, idx) => (
                            <div key={idx} style={{
                                background: 'white',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid #fee2e2',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <span style={{ fontWeight: 700, color: '#ef4444' }}>{allergy.allergen}</span>
                                <span style={{ fontSize: '13px', color: '#7f1d1d' }}>Type: {allergy.type}</span>
                                {allergy.reaction && (
                                    <span style={{ fontSize: '12px', marginTop: '4px', fontStyle: 'italic' }}>
                                        Reacts: {allergy.reaction}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <style jsx>{`
                @keyframes pulse-red {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .pulse-animation {
                    animation: pulse-red 2s infinite;
                }
            `}</style>
        </div>
    );
};

export default AllergyAlertBanner;
