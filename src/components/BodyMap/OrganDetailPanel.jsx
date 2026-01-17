import React, { useState, useEffect } from 'react';
import { X, Save, Activity, ChevronRight, Plus, Calendar, FileText, AlertTriangle } from 'lucide-react';
import TeethView from './parts/TeethView';
import EyeView from './parts/EyeView';
import StomachView from './parts/StomachView';
import LegView from './parts/LegView';
import ArmView from './parts/ArmView';
import PelvisView from './parts/PelvisView';
import './OrganDetailPanel.css';


// Mock Config for Domains and Issues with Organ Images
const BODY_DOMAINS = {
    head: {
        name: 'Head & Neck',
        subDomains: [
            { id: 'Brain', label: 'Brain', hasVisual: false, image: '/images/organs/brain_icon.png' },
            { id: 'Eyes', label: 'Eyes', hasVisual: true, image: '/images/organs/eye_icon.png' },
            { id: 'Teeth', label: 'Teeth', hasVisual: true, image: '/images/organs/teeth_icon.png' },
            { id: 'Ears', label: 'Ears', hasVisual: false, image: null }
        ],
        commonIssues: {
            'Brain': ['Migraine', 'Headache', 'Dizziness', 'Concussion'],
            'Teeth': ['Tooth Pain', 'Cavity', 'Sensitivity', 'Bleeding Gums', 'Root Canal', 'Missing/Removed', 'Implant'],
            'Eyes': ['Blurry Vision', 'Redness', 'Dry Eyes', 'Itching', 'Strain'],
            'default': ['Pain', 'Inflammation']
        }
    },
    chest: {
        name: 'Chest Area',
        subDomains: [
            { id: 'Heart', label: 'Heart', hasVisual: false, image: '/images/organs/heart_icon.png' },
            { id: 'Lungs', label: 'Lungs', hasVisual: false, image: '/images/organs/lungs_icon.png' }
        ],
        commonIssues: {
            'Heart': ['Palpitations', 'Chest Pain', 'High BP'],
            'Lungs': ['Shortness of Breath', 'Cough', 'Asthma'],
            'default': ['Pain', 'Discomfort']
        }
    },
    stomach: {
        name: 'Abdomen',
        subDomains: [
            { id: 'Stomach', label: 'Stomach', hasVisual: true, image: '/images/organs/stomach_icon.png' },
            { id: 'Liver', label: 'Liver', hasVisual: true, image: '/images/organs/liver_icon.png' },
            { id: 'Intestines', label: 'Intestines', hasVisual: true, image: null },
            { id: 'Kidneys', label: 'Kidneys', hasVisual: true, image: '/images/organs/kidney_icon.png' },
            { id: 'Pelvis', label: 'Lower Abdomen / Pelvis', hasVisual: true, image: null }
        ],
        commonIssues: {
            'Stomach': ['Stomach Ache', 'Acidity', 'Reflux', 'Ulcer'],
            'Liver': ['Fatty Liver', 'Pain', 'Jaundice'],
            'Kidneys': ['Stone Pain', 'Infection'],
            'Pelvis': ['Bladder Infection', 'Pain', 'Cramps'],
            'default': ['Stomach Ache', 'Bloating', 'Indigestion']
        }
    },
    arms: {
        name: 'Arms & Hands',
        subDomains: [
            { id: 'Shoulder', label: 'Shoulder', hasVisual: true, image: '/images/organs/shoulder_icon.png' },
            { id: 'Arm', label: 'Arm (General)', hasVisual: true, image: null },
            { id: 'Hand', label: 'Hand/Wrist', hasVisual: true, image: '/images/organs/hand_icon.png' }
        ],
        commonIssues: {
            'Shoulder': ['Frozen Shoulder', 'Dislocation', 'Pain'],
            'Hand': ['Carpal Tunnel', 'Arthritis', 'Sprain'],
            'default': ['Pain', 'Fracture', 'Weakness']
        }
    },
    legs: {
        name: 'Legs & Feet',
        subDomains: [
            { id: 'Thigh', label: 'Thigh/Hip', hasVisual: true, image: null },
            { id: 'Knee', label: 'Knee', hasVisual: true, image: '/images/organs/knee_icon.png' },
            { id: 'Foot', label: 'Foot/Ankle', hasVisual: true, image: '/images/organs/foot_icon.png' }
        ],
        commonIssues: {
            'Knee': ['ACL Tear', 'Arthritis', 'Pain', 'Swelling'],
            'Foot': ['Plantar Fasciitis', 'Sprain', 'Gout', 'Corns'],
            'default': ['Pain', 'Cramps', 'Varicose Veins']
        }
    },
    default: {
        name: 'Body Part',
        subDomains: [],
        commonIssues: { 'default': ['Pain', 'Inflammation'] }
    }
};

const OrganDetailPanel = ({ organId, existingIssue, onUpdate, onClose }) => {
    const [issuesList, setIssuesList] = useState([]);
    const [step, setStep] = useState('summary'); // Default to summary/dashboard view
    const [activeTab, setActiveTab] = useState('current'); // 'current' | 'history' | 'ai'
    const [formData, setFormData] = useState({ domain: '', specificPart: '', issue: '', severity: 'mild', painLevel: 5, frequency: 'daily', procedureDate: '', note: '' });

    const config = BODY_DOMAINS[organId] || BODY_DOMAINS.default;

    const [aiAnalysis, setAiAnalysis] = useState(null); // New State for AI Text
    const [isLoadingAi, setIsLoadingAi] = useState(false);

    useEffect(() => {
        setFormData({ domain: '', specificPart: '', issue: '', severity: 'mild', painLevel: 5, frequency: 'daily', procedureDate: '', note: '' });
        setAiAnalysis(null); // Reset AI on change

        if (existingIssue && Array.isArray(existingIssue)) {
            setIssuesList(existingIssue);
        } else if (existingIssue && existingIssue.issue) {
            setIssuesList([existingIssue]);
        } else {
            setIssuesList([]);
        }
        setStep('summary'); // Always show summary first
        setAiAnalysis(null);
    }, [organId, existingIssue]);

    // Fetch AI when switching to AI tab
    useEffect(() => {
        if (activeTab === 'ai' && !aiAnalysis) {
            fetchAiAnalysis();
        }
    }, [activeTab, organId]);

    const fetchAiAnalysis = async () => {
        setIsLoadingAi(true);
        try {
            const res = await fetch('/api/ai-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ organId: organId })
            });
            if (res.ok) {
                const data = await res.json();
                setAiAnalysis(data.analysis);
            }
        } catch (e) { console.error("AI Fetch Error", e); }
        setIsLoadingAi(false);
    };

    const handleSave = async () => {
        const payload = { organId, ...formData };

        try {
            const res = await fetch('/api/body-issues', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const savedIssue = await res.json();
                setIssuesList(prev => [...prev, savedIssue]);
                onUpdate(formData);
                setStep('summary');
            }
        } catch (error) {
            console.error("Failed to save issue:", error);
        }
    };

    const handleAddNew = () => {
        setFormData({ domain: '', specificPart: '', issue: '', severity: 'mild', painLevel: 5, frequency: 'daily', procedureDate: '', note: '' });
        setStep('domain');
    };


    const handleDomainSelect = (sub) => {
        setFormData({ ...formData, domain: sub.id, specificPart: sub.label });
        // Skip visual selection if organ has an image - go directly to issue
        // Only show visual_selection for teeth/eyes that need pinpoint
        if (sub.id === 'Teeth' || sub.id === 'Eyes') {
            setStep('visual_selection');
        } else {
            setStep('issue');
        }
    };

    const isStatusIssue = ['Missing/Removed', 'Implant', 'Root Canal', 'Crown'].includes(formData.issue);

    const renderDomainSelection = () => (
        <div className="panel-step">
            <h4>Select Region</h4>
            <div className="organ-card-grid">
                {(config.subDomains || []).map(sub => (
                    <button
                        key={sub.id}
                        className={`organ-card ${formData.domain === sub.id ? 'active' : ''}`}
                        onClick={() => handleDomainSelect(sub)}
                    >
                        {sub.image ? (
                            <img src={sub.image} alt={sub.label} className="organ-image" />
                        ) : (
                            <div className="organ-placeholder">
                                <Activity size={32} />
                            </div>
                        )}
                        <span className="organ-label">{sub.label}</span>
                    </button>
                ))}
                {(!config.subDomains || config.subDomains.length === 0) && (
                    <button className="btn-secondary" onClick={() => { setFormData({ ...formData, domain: 'General' }); setStep('issue'); }}>Continue</button>
                )}
            </div>
        </div>
    );

    const renderVisualSelection = () => (
        <div className="panel-step">
            <button className="btn-back" onClick={() => setStep('domain')}>&larr; Back</button>
            <h4>Pinpoint Location</h4>
            {formData.domain === 'Teeth' && (
                <TeethView onSelect={(part) => { setFormData({ ...formData, specificPart: part.label }); setTimeout(() => setStep('issue'), 400); }} />
            )}
            {formData.domain === 'Eyes' && (
                <EyeView onSelect={(part) => { setFormData({ ...formData, specificPart: part.label }); setTimeout(() => setStep('issue'), 400); }} />
            )}
            {['Stomach', 'Liver', 'Intestines', 'Kidneys', 'Pelvis'].includes(formData.domain) && (
                <>
                    {formData.domain === 'Pelvis' ? (
                        <PelvisView onSelect={(part) => { setFormData({ ...formData, specificPart: part.label }); setTimeout(() => setStep('issue'), 400); }} />
                    ) : (
                        <StomachView onSelect={(part) => { setFormData({ ...formData, specificPart: part.label, domain: part.id === 'liver' ? 'Liver' : 'Stomach' }); setTimeout(() => setStep('issue'), 400); }} />
                    )}
                </>
            )}
            {['Thigh', 'Knee', 'Foot', 'Leg'].includes(formData.domain) && (
                <LegView onSelect={(part) => { setFormData({ ...formData, specificPart: part.label }); setTimeout(() => setStep('issue'), 400); }} />
            )}
            {['Shoulder', 'Arm', 'Hand'].includes(formData.domain) && (
                <ArmView onSelect={(part) => { setFormData({ ...formData, specificPart: part.label }); setTimeout(() => setStep('issue'), 400); }} />
            )}
        </div>
    );

    const renderIssueSelection = () => {
        const domainIssues = config.commonIssues[formData.domain] || config.commonIssues['default'] || [];
        return (
            <div className="panel-step">
                <button className="btn-back" onClick={() => setStep(formData.specificPart ? 'visual_selection' : 'domain')}>&larr; Back</button>
                <h4>Condition / Symptom</h4>
                <div className="selection-list">
                    {domainIssues.map(issue => (
                        <button key={issue} className="selection-item" onClick={() => { setFormData({ ...formData, issue }); setStep('form'); }}>
                            {issue}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderForm = () => (
        <div className="panel-step form-step">
            <button className="btn-back" onClick={() => setStep('issue')}>&larr; Back</button>
            <h4>Details: {formData.issue}</h4>
            {formData.specificPart && <div className="highlight-tag">Location: {formData.specificPart}</div>}

            {!isStatusIssue && (
                <>
                    <div className="form-group" style={{ marginTop: '16px' }}>
                        <label>Pain Level (1-10)</label>
                        <input
                            type="range" min="1" max="10" value={formData.painLevel}
                            onChange={(e) => setFormData({ ...formData, painLevel: parseInt(e.target.value) })}
                            className={`range-slider severity-${formData.painLevel > 7 ? 'high' : formData.painLevel > 4 ? 'med' : 'low'}`}
                        />
                        <div className="range-value">{formData.painLevel}</div>
                    </div>
                    <div className="form-group">
                        <label>Severity</label>
                        <div className="toggle-group">
                            {['mild', 'moderate', 'severe'].map(s => (
                                <button key={s} className={`toggle-opt ${formData.severity === s ? 'active' : ''}`} onClick={() => setFormData({ ...formData, severity: s })}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            <div className="form-group" style={{ marginTop: '16px' }}>
                <label>Date Started / Occurred</label>
                <div className="input-with-icon">
                    <Calendar size={16} />
                    <input
                        type="date"
                        className="date-input"
                        value={formData.procedureDate}
                        onChange={(e) => setFormData({ ...formData, procedureDate: e.target.value })}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Medical Notes (Optional)</label>
                <textarea
                    className="text-input"
                    placeholder="E.g., Dr. Smith recommended..."
                    rows={3}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                ></textarea>
            </div>

            <button className="btn-save full-width" onClick={handleSave}>
                <Save size={18} /> Save Record
            </button>
        </div >
    );

    const renderTabs = () => (
        <div className="panel-tabs">
            <button
                className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`}
                onClick={() => setActiveTab('current')}
            >
                Current Issues
            </button>
            <button
                className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
            >
                History ({issuesList.length})
            </button>
            <button
                className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
                onClick={() => setActiveTab('ai')}
            >
                AI Analysis
            </button>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'current':
                return (
                    <div className="tab-content">
                        <div className="summary-header">
                            <h4>Active Details</h4>
                            <button className="btn-add-new" onClick={() => { handleAddNew(); setStep('domain'); }}>
                                <Plus size={16} /> Add Issue
                            </button>
                        </div>

                        {/* Visual for Teeth/Eyes if applicable */}
                        {formData.domain === 'Teeth' && (
                            <div className="visual-showcase-box">
                                <TeethView readOnly={true} markedParts={issuesList} />
                            </div>
                        )}

                        {issuesList.length === 0 ? (
                            <div className="empty-state-mini">
                                <p>No active issues recorded.</p>
                                <button className="btn-link" onClick={() => { handleAddNew(); setStep('domain'); }}>Log Current Issue</button>
                            </div>
                        ) : (
                            <div className="records-list">
                                {issuesList.map((item, idx) => (
                                    <div key={idx} className="record-card-mini">
                                        <div className="record-icon">
                                            <AlertTriangle size={18} color="#ef4444" />
                                        </div>
                                        <div className="record-details">
                                            <span className="record-title">{item.issue}</span>
                                            <span className="record-meta">{item.domain} • {item.date}</span>
                                        </div>
                                        <span className={`severity-badge ${item.severity}`}>{item.severity}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'history':
                return (
                    <div className="tab-content">
                        <div className="timeline-mini">
                            {issuesList.map((item, idx) => (
                                <div key={idx} className="timeline-mini-item">
                                    <div className="mini-date">{item.date}</div>
                                    <div className="mini-dot"></div>
                                    <div className="mini-content">
                                        <strong>{item.issue}</strong>
                                        <p>{item.note || 'No notes'}</p>
                                    </div>
                                </div>
                            ))}
                            {issuesList.length === 0 && <p className="text-muted">No history available.</p>}
                        </div>
                    </div>
                );
            case 'ai':
                return (
                    <div className="tab-content">
                        {isLoadingAi ? (
                            <div className="ai-loading">Analyzing...</div>
                        ) : (
                            <div className="ai-insight-box">
                                <div className="ai-header"><Activity size={16} /> Analysis</div>
                                <p className="ai-text">{aiAnalysis || "No analysis available yet."}</p>
                            </div>
                        )}
                    </div>
                );
            default: return null;
        }
    };

    const renderSummary = () => (
        <div className="panel-step summary-step">
            {renderTabs()}
            {renderTabContent()}
        </div>
    );

    return (
        <div className="organ-detail-panel slide-in">
            <div className="panel-header">
                <div>
                    <h3>{config.name}</h3>
                    <span className="panel-subtitle">Manage Health Records</span>
                </div>
                <button className="btn-close" onClick={onClose}><X size={20} /></button>
            </div>
            <div className="panel-content">
                {step === 'domain' && renderDomainSelection()}
                {step === 'visual_selection' && renderVisualSelection()}
                {step === 'issue' && renderIssueSelection()}
                {step === 'form' && renderForm()}
                {step === 'summary' && renderSummary()}
            </div>
        </div>
    );
};

export default OrganDetailPanel;
