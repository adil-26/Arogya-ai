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
                <h3>{language === 'hi' ? '1. विकासात्मक उपलब्धियां (Developmental Milestones)' : '1. Developmental Milestones History'}</h3>
                <p className="helper-text" style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '10px' }}>
                    {language === 'hi' ? '(क्या बच्चे ने चलना, बोलना सही समय पर शुरू किया?)' : '(Did the child achieve walking, talking etc. on time?)'}
                </p>
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
                <h3>{language === 'hi' ? '2. बचपन की बीमारियाँ (Childhood Illnesses)' : '2. Major Childhood Illnesses'}</h3>
                <p className="helper-text" style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '10px' }}>
                    {language === 'hi' ? '(क्या आपको इनमें से कोई गंभीर संक्रमण हुआ था?)' : '(Did you suffer from any of these specific infections?)'}
                </p>
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
                <h3>{language === 'hi' ? '3. टीकाकरण की स्थिति (Vaccination Status)' : '3. Vaccination History'}</h3>
                <p className="helper-text" style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '10px' }}>
                    {language === 'hi' ? '(क्या सभी टीके समय पर लगवाए गए थे?)' : '(Were all scheduled vaccines administered on time?)'}
                </p>
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
