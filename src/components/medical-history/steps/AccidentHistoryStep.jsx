import React, { useState } from 'react';
import HumanBodyImage from '../../BodyMap/HumanBodyImage';
import { Plus, Trash2, Activity, Upload } from 'lucide-react';
import VoiceInput from '../../common/VoiceInput';

const AccidentHistoryStep = ({ onNext, onBack, data, isSaving, userGender, language }) => {
    const [accidents, setAccidents] = useState(data?.accidents || []);
    const [showForm, setShowForm] = useState(false);

    // Common Accidents List
    const COMMON_ACCIDENTS = [
        'Road Traffic Accident (Car/Bike)', 'Fall from Height', 'Slip and Fall',
        'Sports Injury', 'Burn Incident', 'Workplace Accident', 'Animal Attack (Dog Bite)',
        'Electric Shock', 'Fracture', 'Head Injury', 'Cut/Laceration'
    ];

    // Form State
    const [currentAccident, setCurrentAccident] = useState({
        type: '',
        accidentDate: '',
        year: '',
        treatment: '', // Surgery, Cast, PT
        residualEffects: '', // Pain, Scars
        hospital: '',
        injuries: [] // list of { bodyPart: 'leg', injuryType: 'fracture' }
    });

    const [selectedBodyPart, setSelectedBodyPart] = useState(null);

    const handleOrganSelect = (partId) => {
        setSelectedBodyPart(partId);
    };

    const addInjury = (type) => {
        if (!selectedBodyPart) return;
        setCurrentAccident(prev => ({
            ...prev,
            injuries: [...prev.injuries, { bodyPart: selectedBodyPart, injuryType: type }]
        }));
        setSelectedBodyPart(null); // Reset selection
    };

    const saveAccident = () => {
        if (!currentAccident.type || (!currentAccident.year && !currentAccident.accidentDate)) {
            alert("Please enter accident type and date/year");
            return;
        }
        setAccidents([...accidents, { ...currentAccident, id: Date.now().toString() }]);
        setCurrentAccident({ type: '', accidentDate: '', year: '', treatment: '', residualEffects: '', hospital: '', injuries: [] });
        setShowForm(false);
    };

    const handleNext = () => {
        onNext({ accident: accidents });
    };

    return (
        <div className="step-container">
            <div className="step-heading">
                <div className="step-icon-hero">
                    <Activity size={48} />
                </div>
                <h2>{language === 'hi' ? 'दुर्घटना और चोट (Accidents)' : 'Major Accidents & Injuries'}</h2>
                <p>{language === 'hi' ? 'कोई गंभीर दुर्घटना या चोट दर्ज करें।' : 'Record any serious accidents utilizing the Body Map.'}</p>
            </div>

            {accidents.length === 0 && !showForm && (
                <div className="question-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <p>{language === 'hi' ? 'क्या आपकी कोई बड़ी दुर्घटना हुई है?' : 'Have you had any major accidents (Car crash, Falls, Sports injury)?'}</p>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                        <button
                            onClick={handleNext}
                            style={{ padding: '10px 20px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                        >
                            {language === 'hi' ? 'नहीं (No)' : 'No Major Accidents'}
                        </button>
                        <button
                            onClick={() => setShowForm(true)}
                            style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                        >
                            {language === 'hi' ? 'हां, विवरण जोड़ें (Yes)' : 'Yes, Add Details'}
                        </button>
                    </div>
                </div>
            )}

            {(accidents.length > 0 || showForm) && (
                <>
                    {accidents.map((acc, i) => (
                        <div key={i} className="question-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <strong>{acc.type}</strong>
                                    <span style={{ display: 'block', color: '#64748b', fontSize: '0.9rem' }}>
                                        {acc.accidentDate ? `Date: ${acc.accidentDate}` : `Year: ${acc.year}`}
                                    </span>
                                </div>
                                <Trash2 onClick={() => setAccidents(accidents.filter(a => a.id !== acc.id))} size={18} color="#ef4444" style={{ cursor: 'pointer' }} />
                            </div>
                            <ul style={{ marginTop: '10px', paddingLeft: '20px', color: '#64748b' }}>
                                {acc.injuries?.map((inj, idx) => (
                                    <li key={idx}>{inj.injuryType} on {inj.bodyPart}</li>
                                ))}
                            </ul>
                            {acc.residualEffects && (
                                <p style={{ fontSize: '0.9rem', color: '#ef4444', marginTop: '5px' }}>
                                    <em>Residual: {acc.residualEffects}</em>
                                </p>
                            )}
                        </div>
                    ))}

                    {showForm ? (
                        <div className="question-card" style={{ border: '2px solid #2563eb' }}>
                            <h3>{language === 'hi' ? 'दुर्घटना विवरण' : 'Accident Details'}</h3>
                            <div style={{ marginBottom: '20px', display: 'grid', gap: '10px' }}>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', color: '#64748b' }}>
                                        {language === 'hi' ? 'दुर्घटना का प्रकार' : 'Accident Type'}
                                    </label>
                                    <input
                                        className="text-input"
                                        list="common-accidents"
                                        placeholder={language === 'hi' ? "उदा. कार दुर्घटना" : "e.g. Car Accident, Fall"}
                                        value={currentAccident.type}
                                        onChange={e => setCurrentAccident({ ...currentAccident, type: e.target.value })}
                                    />
                                    <datalist id="common-accidents">
                                        {COMMON_ACCIDENTS.map(a => <option key={a} value={a} />)}
                                    </datalist>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <input
                                        className="text-input" type="date"
                                        value={currentAccident.accidentDate}
                                        onChange={e => {
                                            const val = e.target.value;
                                            const year = val ? val.split('-')[0] : '';
                                            setCurrentAccident({ ...currentAccident, accidentDate: val, year: year });
                                        }}
                                    />
                                    <input
                                        className="text-input"
                                        placeholder={language === 'hi' ? "इलाज? (सर्जरी, प्लास्टर)" : "Treatment (Surgery, Cast?)"}
                                        value={currentAccident.treatment}
                                        onChange={e => setCurrentAccident({ ...currentAccident, treatment: e.target.value })}
                                    />
                                </div>

                                <input
                                    className="text-input"
                                    placeholder={language === 'hi' ? "अस्पताल का नाम" : "Hospital Name"}
                                    value={currentAccident.hospital}
                                    onChange={e => setCurrentAccident({ ...currentAccident, hospital: e.target.value })}
                                />

                                <div style={{ position: 'relative' }}>
                                    <textarea
                                        className="text-input"
                                        placeholder={language === 'hi' ? "क्या अब भी दर्द या समस्या है? (Residual Effects)" : "Any ongoing pain or issues? (Residual Effects)"}
                                        value={currentAccident.residualEffects}
                                        onChange={e => setCurrentAccident({ ...currentAccident, residualEffects: e.target.value })}
                                        style={{ minHeight: '60px', paddingRight: '40px' }}
                                    />
                                    <div style={{ position: 'absolute', right: '5px', top: '5px' }}>
                                        <VoiceInput onTranscript={(text) => setCurrentAccident(prev => ({ ...prev, residualEffects: (prev.residualEffects ? prev.residualEffects + ' ' : '') + text }))} />
                                    </div>
                                </div>
                            </div>


                            <p style={{ fontWeight: '500', marginBottom: '10px' }}>Tag Injured Areas (Tap Body Part):</p>

                            {/* 2D Body Map - Cleaner and faster */}
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px', background: '#f8fafc', borderRadius: '16px', marginBottom: '20px' }}>
                                <HumanBodyImage
                                    view="front"
                                    gender={userGender || 'male'}
                                    selectedPart={selectedBodyPart}
                                    onPartClick={handleOrganSelect}
                                    height={400}
                                />
                            </div>

                            {selectedBodyPart && (
                                <div style={{ padding: '15px', background: '#eff6ff', borderRadius: '8px', marginBottom: '20px' }}>
                                    <p style={{ margin: '0 0 10px 0' }}><strong>Selected: {selectedBodyPart}</strong>. What happened?</p>
                                    <div className="options-grid">
                                        {['Fracture', 'Deep Cut', 'Burn', 'Sprain', 'Internal Injury', 'Other'].map(type => (
                                            <button
                                                key={type}
                                                className="option-btn"
                                                onClick={() => addInjury(type)}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <strong>Recorded Injuries:</strong>
                                <ul>
                                    {currentAccident.injuries.map((inj, idx) => (
                                        <li key={idx}>{inj.injuryType} - {inj.bodyPart}</li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={saveAccident}
                                style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' }}
                            >
                                Save This Accident Record
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowForm(true)}
                            style={{
                                width: '100%', padding: '12px', border: '2px dashed #cbd5e1',
                                borderRadius: '8px', color: '#64748b', background: 'none',
                                cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            <Plus size={18} /> Add Another Accident
                        </button>
                    )}

                    <div className="wizard-footer">
                        <button className="btn-back" onClick={onBack}>Back</button>
                        <button className="btn-next" onClick={handleNext} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Next Step'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default AccidentHistoryStep;
