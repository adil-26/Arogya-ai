import React, { useState } from 'react';
import { Plus, Trash2, AlertTriangle, ShieldAlert, Upload } from 'lucide-react';
import VoiceInput from '../../common/VoiceInput';

const AllergyHistoryStep = ({ onNext, onBack, data, isSaving, language }) => {
    const [allergies, setAllergies] = useState(data?.allergies || []);
    const [showForm, setShowForm] = useState(false);

    // Detailed initial state
    const [newAllergy, setNewAllergy] = useState({
        type: 'Drug',
        allergen: '',
        reaction: '',
        severity: 'Mild',
        onset: '', // When did it start?
        duration: '', // How long?
        status: 'Active', // Active/Recovered
        medication: '', // Medicine taken
        notes: '',
        imageUrl: ''
    });

    const COMMON_ALLERGENS = {
        'Drug': ['Penicillin', 'Aspirin/NSAIDs', 'Sulfa Drugs', 'Codeine/Morphine', 'Ibuprofen', 'Amoxicillin'],
        'Food': ['Peanuts', 'Tree Nuts', 'Milk/Dairy', 'Eggs', 'Shellfish', 'Soy', 'Wheat/Gluten'],
        'Environmental': ['Pollen', 'Dust Mites', 'Mold', 'Cat Dander', 'Dog Dander', 'Latex'],
        'Other': ['Insect Stings', 'Contrast Dye']
    };

    const handleAdd = () => {
        if (!newAllergy.allergen) return;
        setAllergies([...allergies, { ...newAllergy, id: Date.now().toString() }]);
        setNewAllergy({
            type: 'Drug', allergen: '', reaction: '', severity: 'Mild',
            onset: '', duration: '', status: 'Active', medication: '', notes: '', imageUrl: ''
        });
        setShowForm(false);
    };

    const handleRemove = (id) => {
        setAllergies(allergies.filter(a => a.id !== id));
    };

    const handleNext = () => {
        onNext({ allergy: allergies });
    };

    return (
        <div className="step-container">
            <div className="step-heading">
                <div className="step-icon-hero">
                    <ShieldAlert size={48} />
                </div>
                <h2>{language === 'hi' ? 'एलर्जी इतिहास (Allergies)' : 'Allergies'}</h2>
                <p>{language === 'hi' ? 'क्या आपको किसी दवा, भोजन या अन्य चीज़ से एलर्जी है?' : 'Do you have any known allergies?'}</p>
            </div>

            {allergies.length === 0 && !showForm && (
                <div className="question-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <AlertTriangle size={32} color="#eab308" />
                    <p>{language === 'hi' ? 'इलाज से पहले ड्रग एलर्जी जानना बहुत जरूरी है।' : 'Many drug allergies are critical to know before treatment.'}</p>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                        <button
                            onClick={handleNext}
                            style={{ padding: '10px 20px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                        >
                            {language === 'hi' ? 'कोई एलर्जी नहीं (No Known Allergies)' : 'No Known Allergies'}
                        </button>
                        <button
                            onClick={() => setShowForm(true)}
                            style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                        >
                            {language === 'hi' ? 'हां, मुझे एलर्जी है (Yes)' : 'Yes, I have allergies'}
                        </button>
                    </div>
                </div>
            )}

            {(allergies.length > 0 || showForm) && (
                <>
                    {allergies.map((a, i) => (
                        <div key={i} className="question-card" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <strong>{a.allergen}</strong>
                                <span style={{ display: 'block', color: '#64748b', fontSize: '0.9rem' }}>{a.type} - {a.severity} Reaction ({a.status})</span>
                            </div>
                            <button onClick={() => handleRemove(a.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}

                    {showForm ? (
                        <div className="question-card" style={{ border: '2px solid #2563eb' }}>
                            <h3 style={{ marginTop: 0 }}>{language === 'hi' ? 'एलर्जी का विवरण जोड़ें' : 'Add Allergy Details'}</h3>
                            <div style={{ display: 'grid', gap: '12px' }}>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', color: '#64748b' }}>Type</label>
                                        <select
                                            className="text-input"
                                            value={newAllergy.type}
                                            onChange={e => setNewAllergy({ ...newAllergy, type: e.target.value })}
                                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                        >
                                            <option>Drug</option>
                                            <option>Food</option>
                                            <option>Environmental</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', color: '#64748b' }}>Status</label>
                                        <select
                                            className="text-input"
                                            value={newAllergy.status}
                                            onChange={e => setNewAllergy({ ...newAllergy, status: e.target.value })}
                                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                        >
                                            <option>Active</option>
                                            <option>Recovered / Childhood</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', color: '#64748b' }}>
                                        {language === 'hi' ? 'एलर्जी का नाम' : 'Allergen Name'}
                                    </label>
                                    <input
                                        className="text-input"
                                        list="common-allergens"
                                        placeholder={language === 'hi' ? "उदा. पेनिसिलिन, मूंगफली" : "e.g., Penicillin, Peanuts"}
                                        value={newAllergy.allergen}
                                        onChange={e => setNewAllergy({ ...newAllergy, allergen: e.target.value })}
                                        style={{ width: '100%' }}
                                    />
                                    <datalist id="common-allergens">
                                        {COMMON_ALLERGENS[newAllergy.type]?.map(a => <option key={a} value={a} />)}
                                    </datalist>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <input
                                        className="text-input" type="date"
                                        placeholder={language === 'hi' ? "कब शुरू हुआ?" : "Onset Date"}
                                        value={newAllergy.onset}
                                        onChange={e => setNewAllergy({ ...newAllergy, onset: e.target.value })}
                                    />
                                    <input
                                        className="text-input"
                                        placeholder={language === 'hi' ? "अवधि (कितने दिन?)" : "Duration (e.g. 5 days)"}
                                        value={newAllergy.duration}
                                        onChange={e => setNewAllergy({ ...newAllergy, duration: e.target.value })}
                                    />
                                </div>

                                <input
                                    className="text-input"
                                    placeholder={language === 'hi' ? "प्रतिक्रिया (उदा. दाने, सूजन)" : "Reaction (e.g., Hives, Swelling, Anaphylaxis)"}
                                    value={newAllergy.reaction}
                                    onChange={e => setNewAllergy({ ...newAllergy, reaction: e.target.value })}
                                />

                                <input
                                    className="text-input"
                                    placeholder={language === 'hi' ? "ली गई दवा? (Treatment/Medication)" : "Medication Taken?"}
                                    value={newAllergy.medication}
                                    onChange={e => setNewAllergy({ ...newAllergy, medication: e.target.value })}
                                />

                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', color: '#64748b' }}>Severity</label>
                                    <div className="options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                                        {['Mild', 'Moderate', 'Severe'].map(sev => (
                                            <button
                                                key={sev}
                                                className={`option-btn ${newAllergy.severity === sev ? 'selected' : ''}`}
                                                onClick={() => setNewAllergy({ ...newAllergy, severity: sev })}
                                                style={{ textAlign: 'center' }}
                                            >
                                                {sev}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ position: 'relative' }}>
                                    <textarea
                                        className="text-input"
                                        placeholder={language === 'hi' ? "अन्य जानकारी... (Notes)" : "Additional Notes..."}
                                        value={newAllergy.notes}
                                        onChange={e => setNewAllergy({ ...newAllergy, notes: e.target.value })}
                                        style={{ minHeight: '60px', paddingRight: '40px' }}
                                    />
                                    <div style={{ position: 'absolute', right: '5px', top: '5px' }}>
                                        <VoiceInput onTranscript={(text) => setNewAllergy(prev => ({ ...prev, notes: (prev.notes ? prev.notes + ' ' : '') + text }))} />
                                    </div>
                                </div>

                                <div style={{ border: '1px dashed #cbd5e1', padding: '10px', borderRadius: '6px', textAlign: 'center', cursor: 'pointer', background: '#f8fafc' }}>
                                    <Upload size={16} style={{ marginBottom: '5px' }} />
                                    <p style={{ fontSize: '0.8rem', margin: 0, color: '#64748b' }}>
                                        {language === 'hi' ? "रिपोर्ट/तस्वीर अपलोड करें (जल्द ही आ रहा है)" : "Upload Report/Image (Coming Soon)"}
                                    </p>
                                    <input type="file" style={{ opacity: 0, position: 'absolute', pointerEvents: 'none' }} />
                                </div>

                                <button
                                    onClick={handleAdd}
                                    style={{ padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' }}
                                >
                                    {language === 'hi' ? 'सेव करें (Save Allergy)' : 'Save Allergy'}
                                </button>
                            </div>
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
                            <Plus size={18} /> {language === 'hi' ? 'एक और एलर्जी जोड़ें' : 'Add Another Allergy'}
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

export default AllergyHistoryStep;
