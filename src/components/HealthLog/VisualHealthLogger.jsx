
import React, { useState } from 'react';
import { X, Check, Droplets, AlertCircle } from 'lucide-react';
import './VisualHealthLogger.css';

const VisualHealthLogger = ({ onClose, onSave }) => {
    const [step, setStep] = useState(1); // 1: Urine, 2: Stool, 3: Skin
    const [logData, setLogData] = useState({
        urine: null,
        stool: null,
        skin: null
    });

    const urineScale = [
        { color: '#FCFCFC', label: 'Transparent', desc: 'Over-hydrated' },
        { color: '#FEF9E7', label: 'Pale Yellow', desc: 'Healthy & Hydrated' },
        { color: '#F7DC6F', label: 'Yellow', desc: 'Normal' },
        { color: '#F1C40F', label: 'Dark Yellow', desc: 'Drink Water Soon' },
        { color: '#B7950B', label: 'Amber', desc: 'Dehydrated' },
        { color: '#9A7D0A', label: 'Brown/Ale', desc: 'Severe Dehydration or Liver Issue', warning: true },
        { color: '#E74C3C', label: 'Pink/Red', desc: 'Blood (See Doctor)', warning: true },
    ];

    const stoolScale = [
        { color: '#6E2C00', label: 'Brown', desc: 'Healthy' },
        { color: '#1E8449', label: 'Green', desc: 'Food moving too fast / Veggies' },
        { color: '#D4AC0D', label: 'Yellow/Greasy', desc: 'Fat absorption issue' },
        { color: '#2C3E50', label: 'Black', desc: 'Internal bleeding / Iron supplements', warning: true },
        { color: '#BDC3C7', label: 'Clay/Pale', desc: 'Bile duct blockage', warning: true },
        { color: '#C0392B', label: 'Red', desc: 'Bleeding (See Doctor)', warning: true },
    ];

    const skinScale = [
        { color: '#F5CBA7', label: 'Normal', desc: 'No discoloration' },
        { color: '#F1C40F', label: 'Yellowish', desc: 'Jaundice / Liver', warning: true },
        { color: '#AED6F1', label: 'Blueish', desc: 'Cyanosis / Low Oxygen', warning: true },
        { color: '#ECF0F1', label: 'Pale/White', desc: 'Anemia / Shock' },
        { color: '#E74C3C', label: 'Red/Flushed', desc: 'Fever / Infection / Allergy' },
    ];

    const handleSelect = (category, value) => {
        setLogData({ ...logData, [category]: value });
    };

    const nextStep = () => {
        if (step < 3) setStep(step + 1);
        else onSave(logData);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const renderScale = (items, category) => (
        <div className="color-scale-grid">
            {items.map((item, index) => (
                <button
                    key={index}
                    className={`color-btn ${logData[category]?.label === item.label ? 'selected' : ''}`}
                    onClick={() => handleSelect(category, item)}
                >
                    <div className="color-swatch-wrapper">
                        <div
                            className="color-swatch"
                            style={{ backgroundColor: item.color }}
                        >
                            {logData[category]?.label === item.label && <Check size={16} color={index > 3 ? 'white' : 'black'} />}
                        </div>
                    </div>
                    <div className="color-info">
                        <span className="color-label">{item.label}</span>
                        {item.warning && <span className="warning-badge"><AlertCircle size={10} /> Consult</span>}
                    </div>
                </button>
            ))}
        </div>
    );

    return (
        <div className="logger-overlay">
            <div className="logger-modal">
                <div className="logger-header">
                    <h3>Daily Health Check</h3>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="progress-bar">
                    <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
                    <div className="line"></div>
                    <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
                    <div className="line"></div>
                    <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
                </div>

                <div className="logger-content">
                    {step === 1 && (
                        <div className="step-content">
                            <h4><Droplets size={20} className="icon-blue" /> Urine Color</h4>
                            <p className="step-desc">Select the color that best matches your urine today.</p>
                            {renderScale(urineScale, 'urine')}
                            {logData.urine && (
                                <div className="selection-feedback">
                                    <strong>{logData.urine.label}:</strong> {logData.urine.desc}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="step-content">
                            <h4>💩 Stool Color</h4>
                            <p className="step-desc">Select the color that matches your bowel movement.</p>
                            {renderScale(stoolScale, 'stool')}
                            {logData.stool && (
                                <div className="selection-feedback">
                                    <strong>{logData.stool.label}:</strong> {logData.stool.desc}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="step-content">
                            <h4>🖐️ Skin Tone Changes</h4>
                            <p className="step-desc">Have you noticed any unusual discoloration?</p>
                            {renderScale(skinScale, 'skin')}
                            {logData.skin && (
                                <div className="selection-feedback">
                                    <strong>{logData.skin.label}:</strong> {logData.skin.desc}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="logger-footer">
                    {step > 1 ? (
                        <button className="btn-secondary" onClick={prevStep}>Back</button>
                    ) : (
                        <div></div>
                    )}

                    <button
                        className="btn-primary"
                        onClick={nextStep}
                        disabled={
                            (step === 1 && !logData.urine) ||
                            (step === 2 && !logData.stool) ||
                            (step === 3 && !logData.skin)
                        }
                    >
                        {step === 3 ? 'Save Log' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VisualHealthLogger;
