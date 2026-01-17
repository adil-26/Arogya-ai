import React from 'react';
import { CheckCircle, AlertCircle, ClipboardCheck } from 'lucide-react';

const ReviewStep = ({ onNext, onBack, data, isSaving }) => {

    // Simple verification check
    const sections = [
        { id: 'birth', label: 'Birth History', completed: !!data.birthHistory },
        { id: 'childhood', label: 'Childhood History', completed: !!data.childhoodHistory },
        { id: 'family', label: 'Family History', completed: data.familyHistory?.length > 0 },
        { id: 'surgery', label: 'Surgical History', completed: true }, // Optional
        { id: 'allergy', label: 'Allergies', completed: true },
        { id: 'accident', label: 'Accidents', completed: true }
    ];

    return (
        <div className="step-container">
            <div className="step-heading" style={{ textAlign: 'center' }}>
                <div className="step-icon-hero" style={{ background: '#ecfccb', color: '#4d7c0f', animation: 'none', boxShadow: '0 0 0 8px rgba(132, 204, 22, 0.1)' }}>
                    <ClipboardCheck size={48} />
                </div>
                <h2>You're Almost Done!</h2>
                <p>Please review your medical profile summary before finalizing.</p>
            </div>

            <div className="question-card">
                <h3>Summary</h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                    {sections.map(s => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {s.completed ? <CheckCircle size={18} color="#22c55e" /> : <AlertCircle size={18} color="#eab308" />}
                                <span style={{ fontWeight: '500', color: '#334155' }}>{s.label}</span>
                            </div>
                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{s.completed ? 'Completed' : 'Skipped/Empty'}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="question-card" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
                <p style={{ fontSize: '0.9rem', color: '#1e40af', lineHeight: '1.5' }}>
                    <strong>Privacy Note:</strong> Your medical history is encrypted and securely stored. It will only be visible to doctors you explicitly authorize during appointments.
                </p>
            </div>

            <div className="wizard-footer">
                <button className="btn-back" onClick={onBack}>Back</button>
                <button
                    className="btn-next"
                    onClick={() => onNext({})}
                    disabled={isSaving}
                    style={{ background: '#16a34a' }} // Green for finish
                >
                    {isSaving ? 'Finalizing...' : 'Complete Profile 🎉'}
                </button>
            </div>
        </div>
    );
};

export default ReviewStep;
