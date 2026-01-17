import React, { useState } from 'react';
import { User, Heart } from 'lucide-react';

const GenderSpecificStep = ({ onNext, onBack, data, isSaving, userGender }) => {
    // Determine gender normalization
    const isFemale = userGender?.toLowerCase() === 'female';
    const isMale = userGender?.toLowerCase() === 'male';

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
                    <h2>Reproductive History</h2>
                    <p>This section is skipped as it requires gender specification.</p>
                </div>
                <div className="wizard-footer">
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
                <h2>{isFemale ? 'Gynecological History' : 'Men\'s Health History'}</h2>
                <p>Private and confidential questions about your reproductive health.</p>
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
