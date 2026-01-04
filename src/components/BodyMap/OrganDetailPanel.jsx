import React, { useState, useEffect } from 'react';
import { X, Save, Activity, ChevronRight, Plus, Calendar, FileText, AlertTriangle } from 'lucide-react';
import TeethView from './parts/TeethView';
import EyeView from './parts/EyeView';
import StomachView from './parts/StomachView';
import LegView from './parts/LegView';
import ArmView from './parts/ArmView';
import PelvisView from './parts/PelvisView';
import './OrganDetailPanel.css';

// Mock Config for Domains and Issues
const BODY_DOMAINS = {
    head: {
        name: 'Head & Neck',
        subDomains: [
            { id: 'Brain', label: 'Brain', hasVisual: false },
            { id: 'Eyes', label: 'Eyes', hasVisual: true },
            { id: 'Teeth', label: 'Teeth', hasVisual: true },
            { id: 'Ears', label: 'Ears', hasVisual: false }
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
            { id: 'Heart', label: 'Heart', hasVisual: false },
            { id: 'Lungs', label: 'Lungs', hasVisual: false }
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
            { id: 'Stomach', label: 'Stomach', hasVisual: true },
            { id: 'Liver', label: 'Liver', hasVisual: true },
            { id: 'Intestines', label: 'Intestines', hasVisual: true },
            { id: 'Kidneys', label: 'Kidneys', hasVisual: true },
            { id: 'Pelvis', label: 'Lower Abdomen / Pelvis', hasVisual: true }
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
            { id: 'Shoulder', label: 'Shoulder', hasVisual: true },
            { id: 'Arm', label: 'Arm (General)', hasVisual: true }, // General uses Arm View
            { id: 'Hand', label: 'Hand/Wrist', hasVisual: true }
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
            { id: 'Thigh', label: 'Thigh/Hip', hasVisual: true },
            { id: 'Knee', label: 'Knee', hasVisual: true }, // Uses Leg View
            { id: 'Foot', label: 'Foot/Ankle', hasVisual: true }
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
    const [step, setStep] = useState('domain');
    const [formData, setFormData] = useState({ domain: '', specificPart: '', issue: '', severity: 'mild', painLevel: 5, frequency: 'daily', procedureDate: '', note: '' });

    const config = BODY_DOMAINS[organId] || BODY_DOMAINS.default;

    const [aiAnalysis, setAiAnalysis] = useState(null); // New State for AI Text
    const [isLoadingAi, setIsLoadingAi] = useState(false);

    useEffect(() => {
        setFormData({ domain: '', specificPart: '', issue: '', severity: 'mild', painLevel: 5, frequency: 'daily', procedureDate: '', note: '' });
        setAiAnalysis(null); // Reset AI on change

        // Priority: Initial List > Single Existing Issue > Empty
        if (existingIssue && Array.isArray(existingIssue)) {
            setIssuesList(existingIssue);
            setStep('summary');
            fetchAiAnalysis(); // Trigger AI when viewing summary
        } else if (existingIssue && existingIssue.issue) {
            setIssuesList([existingIssue]);
            setStep('summary');
            fetchAiAnalysis();
        } else {
            setIssuesList([]);
            setStep('domain');
        }
    }, [organId, existingIssue]);

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
        setFormData({ ...formData, domain: sub.id });
        if (sub.hasVisual) setStep('visual_selection');
        else setStep('issue');
    };

    const isStatusIssue = ['Missing/Removed', 'Implant', 'Root Canal', 'Crown'].includes(formData.issue);

    const renderDomainSelection = () => (
        <div className="panel-step">
            <h4>Select Region</h4>
            <div className="selection-grid">
                {(config.subDomains || []).map(sub => (
                    <button
                        key={sub.id}
                        className={`selection-btn ${formData.domain === sub.id ? 'active' : ''}`}
                        onClick={() => handleDomainSelect(sub)}
                    >
                        {sub.label} <ChevronRight size={16} />
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

            {!isStatusIssue ? (
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
            ) : (
                <div className="form-group" style={{ marginTop: '16px' }}>
                    <label>Date of Procedure / Event</label>
                    <div className="input-with-icon">
                        <Calendar size={16} />
                        <input type="date" className="date-input" onChange={(e) => setFormData({ ...formData, procedureDate: e.target.value })} />
                    </div>
                </div>
            )}

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
        </div>
    );

    const renderSummary = () => (
        <div className="panel-step summary-step">
            <div className="summary-header">
                <h3>{config.name} History</h3>
                <button className="btn-add-new" onClick={handleAddNew}>
                    <Plus size={16} /> Add Note
                </button>
            </div>

            {/* Visual Showcase (Read Only) */}
            {issuesList.length > 0 && formData.domain === 'Teeth' && (
                <div className="visual-showcase-box">
                    <h5>Visual Status Map</h5>
                    <TeethView readOnly={true} markedParts={issuesList} />
                </div>
            )}

            {issuesList.length === 0 ? (
                <div className="empty-state">
                    <p>No records yet.</p>
                    <button className="btn-link" onClick={handleAddNew}>Log First Issue</button>
                </div>
            ) : (
                <div className="records-list">
                    {issuesList.map((item, idx) => (
                        <div key={idx} className="record-card-mini">
                            <div className="record-icon">
                                {['Missing/Removed', 'Implant'].includes(item.issue) ? <FileText size={18} /> : <AlertTriangle size={18} color="#D32F2F" />}
                            </div>
                            <div className="record-details">
                                <span className="record-title">{item.issue}</span>
                                <span className="record-meta">{item.domain} {item.specificPart ? `• ${item.specificPart}` : ''}</span>
                                {item.note && <p className="record-note">"{item.note}"</p>}
                            </div>
                            {!['Missing/Removed', 'Implant'].includes(item.issue) && (
                                <span className={`severity-badge ${item.severity}`}>{item.severity}</span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {issuesList.length > 0 && (
                <div className="ai-insight-box">
                    <div className="ai-header"><Activity size={16} /> <span>Aarogya Analysis (Powered by AI)</span></div>

                    {isLoadingAi ? (
                        <div className="ai-loading">
                            <span className="spinner-dot"></span> Analyzing records...
                        </div>
                    ) : (
                        <p className="ai-text">
                            {aiAnalysis || "Analyzing your health pattern..."}
                        </p>
                    )}
                </div>
            )}
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
