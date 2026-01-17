import React, { useState } from 'react';
import ThreeDBodyMap from '../../BodyMap/3D/ThreeDBodyMap'; // New 3D Component
import { Plus, Trash2, Activity } from 'lucide-react';

const AccidentHistoryStep = ({ onNext, onBack, data, isSaving }) => {
    const [accidents, setAccidents] = useState(data?.accidents || []);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [currentAccident, setCurrentAccident] = useState({
        type: '',
        year: '',
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
        if (!currentAccident.type || !currentAccident.year) {
            alert("Please enter accident type and year");
            return;
        }
        setAccidents([...accidents, { ...currentAccident, id: Date.now().toString() }]);
        setCurrentAccident({ type: '', year: '', injuries: [] });
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
                <h2>Major Accidents & Injuries</h2>
                <p>Record any serious accidents utilizing the Body Map.</p>
            </div>

            {accidents.length === 0 && !showForm && (
                <div className="question-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <p>Have you had any major accidents (Car crash, Falls, Sports injury)?</p>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                        <button
                            onClick={handleNext}
                            style={{ padding: '10px 20px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                        >
                            No Major Accidents
                        </button>
                        <button
                            onClick={() => setShowForm(true)}
                            style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                        >
                            Yes, Add Details
                        </button>
                    </div>
                </div>
            )}

            {(accidents.length > 0 || showForm) && (
                <>
                    {accidents.map((acc, i) => (
                        <div key={i} className="question-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>{acc.type} ({acc.year})</strong>
                                <Trash2 size={18} color="#ef4444" style={{ cursor: 'pointer' }} />
                            </div>
                            <ul style={{ marginTop: '10px', paddingLeft: '20px', color: '#64748b' }}>
                                {acc.injuries?.map((inj, idx) => (
                                    <li key={idx}>{inj.injuryType} on {inj.bodyPart}</li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {showForm ? (
                        <div className="question-card" style={{ border: '2px solid #2563eb' }}>
                            <h3>Accident Details</h3>
                            <div style={{ marginBottom: '20px', display: 'grid', gap: '10px' }}>
                                <input
                                    className="text-input"
                                    placeholder="Type (e.g. Car Accident)"
                                    value={currentAccident.type}
                                    onChange={e => setCurrentAccident({ ...currentAccident, type: e.target.value })}
                                />
                                <input
                                    className="text-input" type="number"
                                    placeholder="Year"
                                    value={currentAccident.year}
                                    onChange={e => setCurrentAccident({ ...currentAccident, year: e.target.value })}
                                />
                            </div>

                            <p style={{ fontWeight: '500', marginBottom: '10px' }}>Tag Injured Areas (Tap Body Part):</p>

                            {/* Body Map Integration */}
                            <div style={{ height: '500px', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px' }}>
                                <ThreeDBodyMap onOrganSelect={handleOrganSelect} />
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
