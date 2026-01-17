import React, { useState } from 'react';
import { Plus, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';

const AllergyHistoryStep = ({ onNext, onBack, data, isSaving }) => {
    const [allergies, setAllergies] = useState(data?.allergies || []);
    const [showForm, setShowForm] = useState(false);
    const [newAllergy, setNewAllergy] = useState({ type: 'Drug', allergen: '', reaction: '', severity: 'Mild' });

    const handleAdd = () => {
        if (!newAllergy.allergen) return;
        setAllergies([...allergies, { ...newAllergy, id: Date.now().toString() }]);
        setNewAllergy({ type: 'Drug', allergen: '', reaction: '', severity: 'Mild' });
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
                <h2>Allergies</h2>
                <p>Do you have any known allergies?</p>
            </div>

            {allergies.length === 0 && !showForm && (
                <div className="question-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <AlertTriangle size={32} color="#eab308" />
                    <p>Many drug allergies are critical to know before treatment.</p>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                        <button
                            onClick={handleNext}
                            style={{ padding: '10px 20px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                        >
                            No Known Allergies
                        </button>
                        <button
                            onClick={() => setShowForm(true)}
                            style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                        >
                            Yes, I have allergies
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
                                <span style={{ display: 'block', color: '#64748b', fontSize: '0.9rem' }}>{a.type} - {a.severity} Reaction</span>
                            </div>
                            <button onClick={() => handleRemove(a.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}

                    {showForm ? (
                        <div className="question-card" style={{ border: '2px solid #2563eb' }}>
                            <h3 style={{ marginTop: 0 }}>Add Allergy</h3>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Type</label>
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

                                <input
                                    className="text-input"
                                    placeholder="Allergen (e.g., Peanuts, Penicillin)"
                                    value={newAllergy.allergen}
                                    onChange={e => setNewAllergy({ ...newAllergy, allergen: e.target.value })}
                                />

                                <input
                                    className="text-input"
                                    placeholder="Reaction (e.g., Hives, Swelling)"
                                    value={newAllergy.reaction}
                                    onChange={e => setNewAllergy({ ...newAllergy, reaction: e.target.value })}
                                />

                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Severity</label>
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

                                <button
                                    onClick={handleAdd}
                                    style={{ padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' }}
                                >
                                    Save Allergy
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
                            <Plus size={18} /> Add Another Allergy
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
