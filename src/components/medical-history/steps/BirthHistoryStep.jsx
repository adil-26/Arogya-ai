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
        birthCry: data?.birthHistory?.birthCry || '',
        birthSkinColor: data?.birthHistory?.birthSkinColor || '',
        birthStool: data?.birthHistory?.birthStool || '',
        birthFeeding: data?.birthHistory?.birthFeeding || '',
        birthSleep: data?.birthHistory?.birthSleep || '',
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
                <h3>{language === 'hi' ? '1. क्या आपका जन्म पूर्ण अवधि का था या समय से पहले?' : '1. Was the birth Full-term or Premature?'}</h3>
                <p className="helper-text" style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '10px' }}>
                    {language === 'hi' ? '(क्या गर्भावस्था के पूरे 9 महीने पूरे हुए थे?)' : '(Did the pregnancy complete full 9 months?)'}
                </p>
                <div className="options-grid">
                    {['Full-term (37-40 wks)', 'Premature (<37 weeks)', 'Post-term (>42 weeks)', 'Unknown'].map(opt => (
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
                <h3>{language === 'hi' ? '2. प्रसव (Delivery) कैसे हुआ?' : '2. How was the delivery conducted?'}</h3>
                <p className="helper-text" style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '10px' }}>
                    {language === 'hi' ? '(क्या यह सामान्य था या ऑपरेशन की आवश्यकता थी?)' : '(Was it normal or required surgery/C-section?)'}
                </p>
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
                <h3>{language === 'hi' ? '3. जन्म के समय वजन क्या था?' : '3. What was the Birth Weight?'}</h3>
                <p className="helper-text" style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '10px' }}>
                    {language === 'hi' ? '(क्या बच्चा बहुत छोटा या कमजोर था?)' : '(Was the baby very small or underweight?)'}
                </p>
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
                <h3>{language === 'hi' ? '4. क्या जन्म के समय कोई जटिलताएँ थीं?' : '4. Any complications during birth?'}</h3>
                <p className="helper-text" style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '10px' }}>
                    {language === 'hi' ? '(जैसे पीलिया, सांस लेने में दिक्कत, या संक्रमण?)' : '(e.g. Jaundice, Breathing issues, Infection, NICU stay?)'}
                </p>
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

            <div className="question-card">
                <h3>{language === 'hi' ? '5. जन्म के तुरंत बाद रोना (Cry History)' : '5. Did the baby cry immediately?'}</h3>
                <p className="helper-text" style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '10px' }}>
                    {language === 'hi' ? '(क्या रोना तुरंत था या देर से? आवाज़ कैसी थी?)' : '(Was the cry immediate or delayed? Weak or high-pitched?)'}
                </p>
                <div style={{ position: 'relative' }}>
                    <textarea
                        className="text-input"
                        placeholder={language === 'hi' ? "उदाहरण: तुरंत रोया, तेज आवाज़..." : "e.g., Cried immediately, loud and clear..."}
                        value={formData.birthCry}
                        onChange={(e) => handleOptionSelect('birthCry', e.target.value)}
                        style={{ width: '100%', minHeight: '60px', paddingRight: '50px' }}
                    />
                    <div style={{ position: 'absolute', right: '10px', top: '10px' }}>
                        <VoiceInput onTranscript={(text) => handleOptionSelect('birthCry', (formData.birthCry ? formData.birthCry + ' ' : '') + text)} />
                    </div>
                </div>
            </div>

            <div className="question-card">
                <h3>{language === 'hi' ? '6. त्वचा का रंग (Skin Color)' : '6. Skin Color at Birth'}</h3>
                <p className="helper-text" style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '10px' }}>
                    {language === 'hi' ? '(क्या बच्चा नीला, पीला या फीका था?)' : '(Was the baby Blue, Pale, Yellow, or Pink?)'}
                </p>
                <div style={{ position: 'relative' }}>
                    <textarea
                        className="text-input"
                        placeholder={language === 'hi' ? "उदाहरण: हाथ-पैर नीले थे, बाकी शरीर गुलाबी..." : "e.g., Pink body, blue extremities..."}
                        value={formData.birthSkinColor}
                        onChange={(e) => handleOptionSelect('birthSkinColor', e.target.value)}
                        style={{ width: '100%', minHeight: '60px', paddingRight: '50px' }}
                    />
                    <div style={{ position: 'absolute', right: '10px', top: '10px' }}>
                        <VoiceInput onTranscript={(text) => handleOptionSelect('birthSkinColor', (formData.birthSkinColor ? formData.birthSkinColor + ' ' : '') + text)} />
                    </div>
                </div>
            </div>

            <div className="question-card">
                <h3>{language === 'hi' ? '7. मल और मूत्र (Stool & Urine)' : '7. First Stool & Urine'}</h3>
                <p className="helper-text" style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '10px' }}>
                    {language === 'hi' ? '(पहला मल (Meconium) कब पास हुआ? रंग कैसा था?)' : '(When was the first stool passed? Color/Consistency?)'}
                </p>
                <div style={{ position: 'relative' }}>
                    <textarea
                        className="text-input"
                        placeholder={language === 'hi' ? "उदाहरण: 24 घंटे के भीतर, काला और चिपचिपा..." : "e.g., Within 24 hours, black and sticky..."}
                        value={formData.birthStool}
                        onChange={(e) => handleOptionSelect('birthStool', e.target.value)}
                        style={{ width: '100%', minHeight: '60px', paddingRight: '50px' }}
                    />
                    <div style={{ position: 'absolute', right: '10px', top: '10px' }}>
                        <VoiceInput onTranscript={(text) => handleOptionSelect('birthStool', (formData.birthStool ? formData.birthStool + ' ' : '') + text)} />
                    </div>
                </div>
            </div>

            <div className="question-card">
                <h3>{language === 'hi' ? '8. दूध पीना (Feeding History)' : '8. Feeding History'}</h3>
                <p className="helper-text" style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '10px' }}>
                    {language === 'hi' ? '(क्या बच्चे ने माँ का दूध ठीक से पिया? चूसने की क्षमता कैसी थी?)' : '(Breastfeeding or Formula? How was the sucking reflex?)'}
                </p>
                <div style={{ position: 'relative' }}>
                    <textarea
                        className="text-input"
                        placeholder={language === 'hi' ? "उदाहरण: माँ का दूध, चूसने में दिक्कत..." : "e.g., Breastfed, good sucking reflex..."}
                        value={formData.birthFeeding}
                        onChange={(e) => handleOptionSelect('birthFeeding', e.target.value)}
                        style={{ width: '100%', minHeight: '60px', paddingRight: '50px' }}
                    />
                    <div style={{ position: 'absolute', right: '10px', top: '10px' }}>
                        <VoiceInput onTranscript={(text) => handleOptionSelect('birthFeeding', (formData.birthFeeding ? formData.birthFeeding + ' ' : '') + text)} />
                    </div>
                </div>
            </div>

            <div className="question-card">
                <h3>{language === 'hi' ? '9. अतिरिक्त टिप्पणियाँ (Notes)' : '9. Additional Notes'}</h3>
                <div style={{ position: 'relative' }}>
                    <textarea
                        className="text-input"
                        placeholder={language === 'hi' ? "यहाँ विवरण टाइप करें..." : "Type details here..."}
                        value={formData.notes || ''}
                        onChange={(e) => handleOptionSelect('notes', e.target.value)}
                        style={{ width: '100%', minHeight: '100px', paddingRight: '50px' }}
                    />
                    <div style={{ position: 'absolute', right: '10px', top: '10px' }}>
                        <VoiceInput onTranscript={(text) => handleOptionSelect('notes', (formData.notes ? formData.notes + ' ' : '') + text)} />
                    </div>
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
