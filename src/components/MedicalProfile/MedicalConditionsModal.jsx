
import React, { useState } from 'react';
import { X, Check, Activity, Heart, Wind, AlertTriangle } from 'lucide-react';
import './MedicalConditionsModal.css';

export const COMMON_CONDITIONS = [
    { id: 'diabetes', label: 'Diabetes', icon: <Activity size={20} />, types: ['Type 1', 'Type 2', 'Prediabetic'] },
    { id: 'hypertension', label: 'Hypertension', icon: <Heart size={20} />, types: ['Stage 1', 'Stage 2', 'Controlled'] },
    { id: 'asthma', label: 'Asthma', icon: <Wind size={20} />, types: ['Mild', 'Severe', 'Allergic'] },
    { id: 'thyroid', label: 'Thyroid', icon: <Activity size={20} />, types: ['Hypo', 'Hyper'] },
    { id: 'arthritis', label: 'Arthritis', icon: <Activity size={20} />, types: ['Osteo', 'Rheumatoid'] },
    { id: 'migraine', label: 'Chronic Migraine', icon: <AlertTriangle size={20} />, types: [] },
];

const MedicalConditionsModal = ({ onClose, onSave, existingData = {} }) => {
    // Structure: { diabetes: { active: true, type: 'Type 2', year: '2020' } }
    const [profile, setProfile] = useState(existingData);

    const toggleCondition = (id) => {
        setProfile(prev => {
            const current = prev[id] || {};
            // Toggle active state
            if (current.active) {
                const newState = { ...prev };
                delete newState[id]; // Remove if unselecting
                return newState;
            } else {
                return { ...prev, [id]: { active: true, type: '', year: new Date().getFullYear().toString() } };
            }
        });
    };

    const updateDetail = (id, field, value) => {
        setProfile(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };

    const handleSave = async () => {
        // Transform profile object to array for Bulk Sync
        const payload = [];
        Object.entries(profile).forEach(([key, value]) => {
            if (value.active) {
                payload.push({
                    name: COMMON_CONDITIONS.find(c => c.id === key)?.label || key,
                    type: value.type,
                    since: value.year
                });
            }
        });

        try {
            await fetch('/api/conditions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            onSave(profile);
        } catch (error) {
            console.error("Failed to save profile:", error);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <div>
                        <h3>My Medical Profile</h3>
                        <p>Select diagnosed chronic conditions based on your doctor's reports.</p>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body">
                    <div className="conditions-grid">
                        {COMMON_CONDITIONS.map((cond) => {
                            const isSelected = !!profile[cond.id];
                            return (
                                <div key={cond.id} className={`condition-card ${isSelected ? 'selected' : ''}`}>
                                    <div className="card-header" onClick={() => toggleCondition(cond.id)}>
                                        <div className="icon-badge">{cond.icon}</div>
                                        <span className="card-label">{cond.label}</span>
                                        {isSelected && <div className="check-badge"><Check size={12} /></div>}
                                    </div>

                                    {isSelected && (
                                        <div className="card-details">
                                            {cond.types.length > 0 && (
                                                <div className="form-group">
                                                    <label>Type/Stage</label>
                                                    <select
                                                        value={profile[cond.id].type}
                                                        onChange={(e) => updateDetail(cond.id, 'type', e.target.value)}
                                                    >
                                                        <option value="">Select Type</option>
                                                        {cond.types.map(t => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                            <div className="form-group">
                                                <label>Since (Year)</label>
                                                <input
                                                    type="number"
                                                    value={profile[cond.id].year}
                                                    onChange={(e) => updateDetail(cond.id, 'year', e.target.value)}
                                                    placeholder="YYYY"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-save" onClick={handleSave}>Save Profile</button>
                </div>
            </div>
        </div>
    );
};

export default MedicalConditionsModal;
