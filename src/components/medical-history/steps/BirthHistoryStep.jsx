import React, { useState } from 'react';
import VoiceInput from '../../common/VoiceInput';

const BirthHistoryStep = ({ onNext, onBack, data, isSaving, language }) => {
    // Initialize form with existing data or defaults
    const [formData, setFormData] = useState({
        birthTerm: data?.birthHistory?.birthTerm || '',
        birthWeight: data?.birthHistory?.birthWeight || '',
        deliveryType: data?.birthHistory?.deliveryType || '',
        complications: data?.birthHistory?.complications || [],
        motherHealthIssues: data?.birthHistory?.motherHealthIssues || [],
        notes: data?.birthHistory?.notes || ''
    });

    const handleOptionSelect = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleComplication = (value) => {
        setFormData(prev => {
            const current = prev.complications || [];
            if (current.includes(value)) {
                return { ...prev, complications: current.filter(item => item !== value) };
            } else {
                return { ...prev, complications: [...current, value] };
            }
        });
    };

    const handleNext = () => {
        // Validate if needed
        onNext({ birthHistory: formData }); // Pass nested structure
    };

    return (
        <div className="step-container">
            <div className="step-heading">
                <h2>{language === 'hi' ? 'जन्म इतिहास' : 'Birth History'}</h2>
                <p>{language === 'hi' ? 'आइए शुरुआत से शुरू करें।' : "Let's start from the very beginning."}</p>
            </div>

            <div className="question-card">
                <h3>1. Were you born full-term or premature?</h3>
                <div className="options-grid">
                    {['Full-term', 'Premature (<37 weeks)', 'Post-term (>42 weeks)', 'Unknown'].map(opt => (
                        <button
                            key={opt}
                            className={`option-btn ${formData.birthTerm === opt ? 'selected' : ''}`}
                            onClick={() => handleOptionSelect('birthTerm', opt)}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div className="question-card">
                <h3>2. How were you delivered?</h3>
                <div className="options-grid">
                    {['Normal/Vaginal', 'C-Section (Planned)', 'C-Section (Emergency)', 'Assisted (Forceps/Vacuum)'].map(opt => (
                        <button
                            key={opt}
                            className={`option-btn ${formData.deliveryType === opt ? 'selected' : ''}`}
                            onClick={() => handleOptionSelect('deliveryType', opt)}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div className="question-card">
                <h3>3. What was your birth weight?</h3>
                <div className="options-grid">
                    {['Low (<2.5kg)', 'Normal (2.5-4kg)', 'High (>4kg)', 'Unknown'].map(opt => (
                        <button
                            key={opt}
                            className={`option-btn ${formData.birthWeight === opt ? 'selected' : ''}`}
                            onClick={() => handleOptionSelect('birthWeight', opt)}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div className="question-card">
                <h3>4. Were there any complications at birth? (Select all that apply)</h3>
                <div className="options-grid">
                    {['None', 'Jaundice', 'NICU Admission', 'Breathing Issues', 'Infection'].map(opt => (
                        <button
                            key={opt}
                            className={`option-btn ${formData.complications.includes(opt) ? 'selected' : ''}`}
                            onClick={() => toggleComplication(opt)}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div className="wizard-footer">
                <button className="btn-back" onClick={onBack} disabled>Back</button>
                <button className="btn-next" onClick={handleNext} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Next Step'}
                </button>
            </div>
        </div>
    );
};

export default BirthHistoryStep;
