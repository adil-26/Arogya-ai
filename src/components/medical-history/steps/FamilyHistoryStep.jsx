import React, { useState } from 'react';
import VoiceInput from '../../common/VoiceInput';
import { Plus, Trash2, Users } from 'lucide-react';

const FamilyHistoryStep = ({ onNext, onBack, data, isSaving, language }) => {
    // Array of family members with conditions
    // Start with default template if empty
    const [familyMembers, setFamilyMembers] = useState(
        data?.familyHistory?.length > 0 ? data.familyHistory : [
            { relation: 'Mother', conditions: [], onsetAge: '', relativeAge: '', relativeDOB: '', notes: '' },
            { relation: 'Father', conditions: [], onsetAge: '', relativeAge: '', relativeDOB: '', notes: '' }
        ]
    );

    const CONDITIONS_LIST = ['Diabetes', 'Hypertension', 'Heart Disease', 'Cancer', 'Asthma', 'Healthy'];

    const toggleCondition = (index, condition) => {
        const updated = [...familyMembers];
        const currentConditions = updated[index].conditions || [];

        if (currentConditions.includes(condition)) {
            updated[index].conditions = currentConditions.filter(c => c !== condition);
        } else {
            // Cannot be healthy AND sick
            if (condition === 'Healthy') {
                updated[index].conditions = ['Healthy'];
            } else {
                updated[index].conditions = [...currentConditions.filter(c => c !== 'Healthy'), condition];
            }
        }
        setFamilyMembers(updated);
    };

    const addMember = () => {
        setFamilyMembers([...familyMembers, { relation: 'Sibling', conditions: [], onsetAge: '', relativeAge: '', relativeDOB: '', notes: '' }]);
    };

    const updateMemberField = (index, field, value) => {
        const updated = [...familyMembers];
        updated[index][field] = value;
        setFamilyMembers(updated);
    };

    const removeMember = (index) => {
        const updated = [...familyMembers];
        updated.splice(index, 1);
        setFamilyMembers(updated);
    };

    const handleNext = () => {
        onNext({ familyHistory: familyMembers });
    };

    return (
        <div className="step-container">
            <div className="step-heading">
                <div className="step-icon-hero">
                    <Users size={48} />
                </div>
                <h2>{language === 'hi' ? 'पारिवारिक चिकित्सा इतिहास' : 'Family Medical History'}</h2>
                <p>{language === 'hi' ? 'क्या आपके परिवार में कोई आनुवंशिक बीमारी है?' : 'Do any of these conditions run in your family?'}</p>
            </div>

            {familyMembers.map((member, index) => (
                <div key={index} className="question-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h3>
                            {/* Allow editing relation if not Mother/Father? For simplicity, static or dropdown */}
                            {member.relation}
                        </h3>
                        {index > 1 && (
                            <button onClick={() => removeMember(index)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>

                    <div className="options-grid">
                        {CONDITIONS_LIST.map(cond => (
                            <button
                                key={cond}
                                className={`option-btn ${member.conditions?.includes(cond) ? 'selected' : ''}`}
                                onClick={() => toggleCondition(index, cond)}
                            >
                                {cond}
                            </button>
                        ))}
                    </div>

                    <div style={{ marginTop: '15px', display: 'grid', gap: '10px' }}>
                        <input
                            className="text-input"
                            placeholder={language === 'hi' ? "समस्या कब शुरू हुई? (उदा. 45 वर्ष की आयु में)" : "When did it start? (e.g. at age 45)"}
                            value={member.onsetAge || ''}
                            onChange={(e) => updateMemberField(index, 'onsetAge', e.target.value)}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <input
                                className="text-input"
                                type="number"
                                placeholder={language === 'hi' ? "वर्तमान आयु (Age)" : "Current Age (Approx)"}
                                value={member.relativeAge || ''}
                                onChange={(e) => updateMemberField(index, 'relativeAge', e.target.value)}
                            />
                            <input
                                className="text-input"
                                type={member.relativeDOB ? "date" : "text"}
                                onFocus={(e) => e.target.type = 'date'}
                                placeholder={language === 'hi' ? "जन्म तिथि (DOB)" : "Date of Birth (Optional)"}
                                value={member.relativeDOB || ''}
                                onChange={(e) => updateMemberField(index, 'relativeDOB', e.target.value)}
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <textarea
                                className="text-input"
                                placeholder={language === 'hi' ? "अतिरिक्त टिप्पणियाँ..." : "Additional notes..."}
                                value={member.notes || ''}
                                onChange={(e) => updateMemberField(index, 'notes', e.target.value)}
                                style={{ width: '100%', minHeight: '60px', paddingRight: '40px' }}
                            />
                            <div style={{ position: 'absolute', right: '5px', top: '5px' }}>
                                <VoiceInput onTranscript={(text) => updateMemberField(index, 'notes', (member.notes ? member.notes + ' ' : '') + text)} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <button
                onClick={addMember}
                style={{
                    width: '100%', padding: '12px', border: '2px dashed #cbd5e1',
                    borderRadius: '8px', color: '#64748b', background: 'none',
                    cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
            >
                <Plus size={18} /> Add Sibling / Grandparent
            </button>

            <div className="wizard-footer">
                <button className="btn-back" onClick={onBack}>Back</button>
                <button className="btn-next" onClick={handleNext} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Next Step'}
                </button>
            </div>
        </div>
    );
};

export default FamilyHistoryStep;
