import React, { useState } from 'react';
import { User, Heart } from 'lucide-react';

const GenderSpecificStep = ({ onNext, onBack, data, isSaving, userGender, language }) => {
    // Local state for gender in case it's missing or 'Other'
    const [currentGender, setCurrentGender] = useState(userGender?.toLowerCase() || '');

    // Determine normalization based on local selection
    const normalizedGender = currentGender.trim().toLowerCase();
    const isFemale = normalizedGender === 'female' || normalizedGender === 'f' || normalizedGender === 'woman';
    const isMale = normalizedGender === 'male' || normalizedGender === 'm' || normalizedGender === 'man';

    // State for Female
    const [femaleData, setFemaleData] = useState({
        menarcheAge: data?.femaleHistory?.menarcheAge || '',
        cycleRegularity: data?.femaleHistory?.cycleRegularity || '',
        flowCharacteristics: data?.femaleHistory?.flowCharacteristics || '',
        pregnancies: data?.femaleHistory?.pregnancies || [],
        contraception: data?.femaleHistory?.contraception || ''
    });

    // State for Male
    const [maleData, setMaleData] = useState({
        pubertyAge: data?.maleHistory?.pubertyAge || '',
        circumcision: data?.maleHistory?.circumcision === true,
        sexualHealth: data?.maleHistory?.sexualHealth || []
    });

    const handleNext = () => {
        if (isFemale) {
            onNext({ gender_female: femaleData });
        } else if (isMale) {
            onNext({ gender_male: maleData });
        } else {
            // Handle other or skip
            onNext({});
        }
    };

    if (!isFemale && !isMale) {
        return (
            <div className="step-container">
                <div className="step-heading">
                    <div className="step-icon-hero">
                        <User size={48} />
                    </div>
                    <h2>{language === 'hi' ? 'प्रजनन स्वास्थ्य' : 'Reproductive Health'}</h2>
                    <p>{language === 'hi' ? 'कृपया आगे बढ़ने के लिए अपना लिंग चुनें।' : 'Please select your gender to proceed with relevant questions.'}</p>
                </div>

                <div className="options-grid" style={{ maxWidth: '400px', margin: '0 auto' }}>
                    <button
                        className="option-btn"
                        onClick={() => setCurrentGender('female')}
                        style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
                    >
                        <Heart size={32} color="#ec4899" />
                        <span>{language === 'hi' ? 'महिला (Female)' : 'Female'}</span>
                    </button>
                    <button
                        className="option-btn"
                        onClick={() => setCurrentGender('male')}
                        style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
                    >
                        <User size={32} color="#3b82f6" />
                        <span>{language === 'hi' ? 'पुरुष (Male)' : 'Male'}</span>
                    </button>
                </div>

                <div className="wizard-footer" style={{ marginTop: '40px' }}>
                    <button className="btn-back" onClick={onBack}>Back</button>
                    <button className="btn-next" onClick={handleNext}>Skip Section</button>
                </div>
            </div>
        );
    }

    return (
        <div className="step-container">
            <div className="step-heading">
                <div className="step-icon-hero">
                    {isFemale ? <Heart size={48} /> : <User size={48} />}
                </div>
                <h2>{isFemale ? (language === 'hi' ? 'स्त्री रोग इतिहास' : 'Gynecological History') : (language === 'hi' ? 'पुरुष स्वास्थ्य इतिहास' : 'Men\'s Health History')}</h2>
                <p>{language === 'hi' ? 'आपके प्रजनन स्वास्थ्य के बारे में निजी और गोपनीय प्रश्न।' : 'Private and confidential questions about your reproductive health.'}</p>
            </div>

            {isFemale && (
                <>
                    <div className="question-card">
                        <h3>1. At what age did you get your first period?</h3>
                        <input
                            type="number"
                            className="text-input"
                            value={femaleData.menarcheAge}
                            onChange={(e) => setFemaleData({ ...femaleData, menarcheAge: e.target.value })}
                            placeholder="Age (e.g., 12)"
                        />
                    </div>

                    <div className="question-card">
                        <h3>2. How are your menstrual cycles?</h3>
                        <div className="options-grid">
                            {['Regular', 'Irregular', 'Heavy Flow', 'Painful', 'No Periods'].map(opt => (
                                <button
                                    key={opt}
                                    className={`option-btn ${femaleData.cycleRegularity === opt ? 'selected' : ''}`}
                                    onClick={() => setFemaleData({ ...femaleData, cycleRegularity: opt })}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="question-card">
                        <h3>3. Contraception / Family Planning</h3>
                        <div className="options-grid">
                            {['Pil', 'IUD', 'Injection', 'None', 'Permanent'].map(opt => (
                                <button
                                    key={opt}
                                    className={`option-btn ${femaleData.contraception === opt ? 'selected' : ''}`}
                                    onClick={() => setFemaleData({ ...femaleData, contraception: opt })}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {isMale && (
                <>
                    <div className="question-card">
                        <h3>1. Puberty Onset</h3>
                        <div className="options-grid">
                            {['Early (<11)', 'Normal (11-14)', 'Late (>14)'].map(opt => (
                                <button
                                    key={opt}
                                    className={`option-btn ${maleData.pubertyAge === opt ? 'selected' : ''}`}
                                    onClick={() => setMaleData({ ...maleData, pubertyAge: opt })}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="question-card">
                        <h3>2. Do you have any sexual health concerns?</h3>
                        <div className="options-grid">
                            {['None', 'Erectile Dysfunction', 'Fertility Issues', 'STI History'].map(opt => (
                                <button
                                    key={opt}
                                    className={`option-btn ${maleData.sexualHealth.includes(opt) ? 'selected' : ''}`}
                                    onClick={() => {
                                        const current = maleData.sexualHealth;
                                        const newVal = current.includes(opt) ? current.filter(i => i !== opt) : [...current, opt];
                                        setMaleData({ ...maleData, sexualHealth: newVal });
                                    }}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            <div className="wizard-footer">
                <button className="btn-back" onClick={onBack}>Back</button>
                <button className="btn-next" onClick={handleNext} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Next Step'}
                </button>
            </div>
        </div>
    );
};

export default GenderSpecificStep;
