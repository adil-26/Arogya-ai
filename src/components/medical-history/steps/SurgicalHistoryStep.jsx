import React, { useState } from 'react';
import VoiceInput from '../../common/VoiceInput';
import { Plus, Trash2, Scissors, Upload } from 'lucide-react';

const SurgicalHistoryStep = ({ onNext, onBack, data, isSaving, language }) => {
    const [surgeries, setSurgeries] = useState(data?.surgeries || []);
    const [showForm, setShowForm] = useState(false);

    // New entry state
    const [newSurgery, setNewSurgery] = useState({
        type: '', year: '', complications: '',
        hospital: '', surgeon: '', notes: '', imageUrl: ''
    });

    const handleAdd = () => {
        if (!newSurgery.type || !newSurgery.year) return;
        setSurgeries([...surgeries, { ...newSurgery, id: Date.now().toString() }]);
        setNewSurgery({ type: '', year: '', complications: '', hospital: '', surgeon: '', notes: '', imageUrl: '' });
        setShowForm(false);
    };

    const handleRemove = (id) => {
        setSurgeries(surgeries.filter(s => s.id !== id && s.type !== id)); // Handle mismatching IDs in case
    };

    const handleNext = () => {
        onNext({ surgery: surgeries });
    };

    return (
        <div className="step-container">
            <div className="step-heading">
                <div className="step-icon-hero">
                    <Scissors size={48} />
                </div>
                <h2>{language === 'hi' ? 'सर्जिकल इतिहास' : 'Surgical History'}</h2>
                <p>{language === 'hi' ? 'क्या आपकी कोई सर्जरी हुई है?' : 'Have you had any surgeries in the past?'}</p>
            </div>

            {surgeries.length === 0 && !showForm && (
                <div className="question-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <p>No surgeries recorded.</p>
                    <button
                        onClick={() => setShowForm(true)}
                        style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        + Add Surgery
                    </button>
                    <div style={{ marginTop: '20px' }}>
                        <button
                            onClick={handleNext}
                            style={{ background: 'none', border: 'none', color: '#64748b', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                            I have never had surgery (Skip)
                        </button>
                    </div>
                </div>
            )}

            {(surgeries.length > 0 || showForm) && (
                <>
                    {surgeries.map((s, i) => (
                        <div key={i} className="question-card" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <strong>{s.type}</strong>
                                <span style={{ display: 'block', color: '#64748b', fontSize: '0.9rem' }}>Year: {s.year}</span>
                            </div>
                            <button onClick={() => handleRemove(s.id || s.type)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}

                    {showForm ? (
                        <div className="question-card" style={{ border: '2px solid #2563eb' }}>
                            <h3 style={{ marginTop: 0 }}>Add Surgery Details</h3>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                <input
                                    className="text-input"
                                    placeholder="Surgery Name / Type"
                                    value={newSurgery.type}
                                    onChange={e => setNewSurgery({ ...newSurgery, type: e.target.value })}
                                />
                                <input
                                    className="text-input" type="number"
                                    placeholder="Year"
                                    value={newSurgery.year}
                                    onChange={e => setNewSurgery({ ...newSurgery, year: e.target.value })}
                                />
                                <input
                                    className="text-input"
                                    placeholder={language === 'hi' ? "अस्पताल का नाम" : "Hospital Name"}
                                    value={newSurgery.hospital}
                                    onChange={e => setNewSurgery({ ...newSurgery, hospital: e.target.value })}
                                />
                                <input
                                    className="text-input"
                                    placeholder={language === 'hi' ? " सर्जन का नाम" : "Surgeon Name"}
                                    value={newSurgery.surgeon}
                                    onChange={e => setNewSurgery({ ...newSurgery, surgeon: e.target.value })}
                                />
                                <div style={{ position: 'relative' }}>
                                    <textarea
                                        className="text-input"
                                        placeholder={language === 'hi' ? "अन्य विवरण / जटिलताएं..." : "Complications / Notes..."}
                                        value={newSurgery.notes || newSurgery.complications} // fallback for legacy
                                        onChange={e => setNewSurgery({ ...newSurgery, notes: e.target.value, complications: e.target.value })}
                                        style={{ minHeight: '60px', paddingRight: '40px' }}
                                    />
                                    <div style={{ position: 'absolute', right: '5px', top: '5px' }}>
                                        <VoiceInput onTranscript={(text) => setNewSurgery(prev => ({ ...prev, notes: (prev.notes ? prev.notes + ' ' : '') + text }))} />
                                    </div>
                                </div>
                                <div style={{ border: '1px dashed #cbd5e1', padding: '10px', borderRadius: '6px', textAlign: 'center', cursor: 'pointer', background: '#f8fafc' }}>
                                    <Upload size={16} style={{ marginBottom: '5px' }} />
                                    <p style={{ fontSize: '0.8rem', margin: 0, color: '#64748b' }}>
                                        {language === 'hi' ? "रिपोर्ट/तस्वीर अपलोड करें" : "Upload Report/Image (Coming Soon)"}
                                    </p>
                                    <input type="file" style={{ opacity: 0, position: 'absolute', pointerEvents: 'none' }} />
                                </div>
                                <button
                                    onClick={handleAdd}
                                    style={{ padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    Save Entry
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
                            <Plus size={18} /> Add Another Surgery
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

export default SurgicalHistoryStep;
