import React, { useState } from 'react';
import VoiceInput from '../../common/VoiceInput';
import { School } from 'lucide-react'; // Icon import

const ChildhoodHistoryStep = ({ onNext, onBack, data, isSaving, language }) => {
    const [formData, setFormData] = useState({
        developmentalDelays: data?.childhoodHistory?.developmentalDelays || 'None',
        childhoodIllnesses: data?.childhoodHistory?.childhoodIllnesses || [],
        vaccinationStatus: data?.childhoodHistory?.vaccinationStatus || '',
        hospitalizations: data?.childhoodHistory?.hospitalizations || [],
        ongoingIssues: data?.childhoodHistory?.ongoingIssues || '',
        notes: data?.childhoodHistory?.notes || ''
    });

    const toggleIllness = (value) => {
        setFormData(prev => {
            const current = prev.childhoodIllnesses || [];
            if (current.includes(value)) {
                return { ...prev, childhoodIllnesses: current.filter(i => i !== value) };
            } else {
                return { ...prev, childhoodIllnesses: [...current, value] };
            }
        });
    };

    // Note: Hospitalization list logic would go here (add/remove items)

    const handleNext = () => {
        onNext({ childhoodHistory: formData });
    };

    return (
        <div className="step-container">
            <div className="step-heading">
                <div className="step-icon-hero">
                    <School size={48} />
                </div>
                <h2>{language === 'hi' ? 'बचपन का इतिहास (0-18 वर्ष)' : 'Childhood History (0-18 years)'}</h2>
                <p>{language === 'hi' ? 'बचपन में क्या आपको कोई स्वास्थ्य समस्या थी?' : 'Growing up, did you have any health issues?'}</p>
            </div>

            <div className="question-card">
                <h3>1. Did you have any developmental delays?</h3>
                <div className="options-grid">
                    {['No delays', 'Late Walking', 'Late Talking', 'Learning Difficulty', 'Behavioral Issues'].map(opt => (
                        <button
                            key={opt}
                            className={`option-btn ${formData.developmentalDelays === opt ? 'selected' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, developmentalDelays: opt }))}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div className="question-card">
                <h3>2. Which childhood illnesses did you have?</h3>
                <div className="options-grid">
                    {['Measles', 'Mumps', 'Chickenpox', 'Whooping Cough', 'Frequent Ear Infections', 'Asthma'].map(opt => (
                        <button
                            key={opt}
                            className={`option-btn ${formData.childhoodIllnesses.includes(opt) ? 'selected' : ''}`}
                            onClick={() => toggleIllness(opt)}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div className="question-card">
                <h3>3. Vaccination Status</h3>
                <div className="options-grid">
                    {['Fully Vaccinated', 'Partially Vaccinated', 'Not Vaccinated', 'Unknown'].map(opt => (
                        <button
                            key={opt}
                            className={`option-btn ${formData.vaccinationStatus === opt ? 'selected' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, vaccinationStatus: opt }))}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div className="wizard-footer">
                <button className="btn-back" onClick={onBack}>Back</button>
                <button className="btn-next" onClick={handleNext} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Next Step'}
                </button>
            </div>
        </div>
    );
};

export default ChildhoodHistoryStep;
