import React from 'react';
import { Droplet, Activity, Users, AlertTriangle } from 'lucide-react';

const HealthSummaryCard = ({ data }) => {
    // data structure: { bloodGroup, conditionCount, familyRisks, allergyCount, surgeryCount }
    const { bloodGroup, conditionCount, familyRisks, allergyCount, surgeryCount, medicationCount } = data || {};

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            marginBottom: '24px',
            border: '1px solid #f1f5f9'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <Activity size={20} color="#3b82f6" style={{ marginRight: '8px' }} />
                <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b', fontWeight: 600 }}>Health Snapshot</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                {/* Blood Group */}
                <div style={{ display: 'flex', flexDirection: 'column', padding: '12px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                    <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Droplet size={12} /> Blood Type
                    </span>
                    <span style={{ fontSize: '24px', fontWeight: 700, color: '#b91c1c', marginTop: '4px' }}>
                        {bloodGroup || 'N/A'}
                    </span>
                </div>

                {/* Chronic Conditions */}
                <div style={{ display: 'flex', flexDirection: 'column', padding: '12px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #dbeafe' }}>
                    <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 600 }}>Active Conditions</span>
                    <span style={{ fontSize: '24px', fontWeight: 700, color: '#1d4ed8', marginTop: '4px' }}>
                        {conditionCount || 0}
                    </span>
                </div>

                {/* Medications */}
                <div style={{ display: 'flex', flexDirection: 'column', padding: '12px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                    <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>Active Meds</span>
                    <span style={{ fontSize: '24px', fontWeight: 700, color: '#15803d', marginTop: '4px' }}>
                        {medicationCount || 0}
                    </span>
                </div>

                {/* Past Procedures */}
                <div style={{ display: 'flex', flexDirection: 'column', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Surgeries</span>
                    <span style={{ fontSize: '24px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                        {surgeryCount || 0}
                    </span>
                </div>

                {/* Family Risks */}
                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', padding: '12px', background: '#fff7ed', borderRadius: '12px', border: '1px solid #ffedd5' }}>
                    <span style={{ fontSize: '12px', color: '#f97316', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={12} /> Family Risks
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                        {familyRisks && familyRisks.length > 0 ? (
                            familyRisks.slice(0, 3).map((risk, idx) => (
                                <span key={idx} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: '#ffedd5', color: '#c2410c', fontWeight: 500 }}>
                                    {risk}
                                </span>
                            ))
                        ) : (
                            <span style={{ fontSize: '14px', color: '#9ca3af' }}>None recorded</span>
                        )}
                        {familyRisks && familyRisks.length > 3 && (
                            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: '#ffedd5', color: '#c2410c', fontWeight: 500 }}>
                                +{familyRisks.length - 3} more
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthSummaryCard;
