import React from 'react';
import { Users, AlertTriangle, Heart, Activity } from 'lucide-react';

const FamilyHealthTree = ({ risks }) => {
    // risks is an array of strings e.g. ["Diabetes", "Heart Disease"]
    // Or full objects if we passed them. For now simple list visualization.

    return (
        <div style={{ padding: '20px', background: 'white', borderRadius: '12px', marginTop: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '10px' }}>
                <Users size={24} color="#f97316" />
                <h3 style={{ margin: 0 }}>Family Health & Hereditary Risks</h3>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                {/* Simplified Tree visual */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', position: 'relative' }}>

                    {/* Grandparents Row */}
                    <div style={{ display: 'flex', gap: '60px' }}>
                        <div className="tree-node disabled">👴 Grandparents</div>
                        <div className="tree-node disabled">👵 Grandparents</div>
                    </div>

                    {/* Parents Row */}
                    <div style={{ display: 'flex', gap: '80px', position: 'relative' }}>
                        {/* Connecting Lines would go here with SVG normally */}
                        <div className="tree-node parent">
                            👨 Father
                        </div>
                        <div className="tree-node parent">
                            👩 Mother
                        </div>
                    </div>

                    {/* YOU Row */}
                    <div className="tree-node you">
                        👤 YOU (Patient)
                    </div>

                    {/* Risks Section */}
                    {risks && risks.length > 0 && (
                        <div style={{ marginTop: '20px', width: '100%', textAlign: 'center' }}>
                            <h4 style={{ color: '#64748b', fontSize: '14px', marginBottom: '10px' }}>INHERITED RISK FACTORS</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                                {risks.map((risk, idx) => (
                                    <div key={idx} style={{
                                        background: '#fff7ed',
                                        color: '#c2410c',
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        border: '1px solid #ffedd5',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <AlertTriangle size={14} /> {risk}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .tree-node {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    background: #f8fafc;
                    border: 2px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 600;
                    color: #475569;
                    position: relative;
                }
                .tree-node.parent {
                    border-color: #94a3b8;
                    background: #f1f5f9;
                }
                .tree-node.you {
                    border-color: #3b82f6;
                    background: #eff6ff;
                    color: #1d4ed8;
                    width: 120px;
                    height: 120px;
                    font-size: 14px;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
                }
                .tree-node.disabled {
                    opacity: 0.5;
                    border-style: dashed;
                }
            `}</style>
        </div>
    );
};

export default FamilyHealthTree;
