import React, { useState } from 'react';
import './TeethView.css'; // Reusing similar styles

const EyeView = ({ onSelect }) => {
    const [selectedPart, setSelectedPart] = useState(null);

    const handlePartClick = (id, label) => {
        setSelectedPart(id);
        onSelect({ id, label });
    };

    const EyePart = ({ id, d, fill, label, className }) => (
        <path
            d={d}
            className={`eye-part ${className} ${selectedPart === id ? 'selected' : ''}`}
            fill={fill}
            stroke="#E0E0E0"
            strokeWidth="1"
            onClick={() => handlePartClick(id, label)}
        >
            <title>{label}</title>
        </path>
    );

    return (
        <div className="teeth-view-container">
            <h4 className="diagram-title">Select Eye Region</h4>
            <div className="svg-jaw-wrapper">
                <svg viewBox="0 0 200 120" className="jaw-svg">
                    {/* Eyeball Outline */}
                    <path d="M 20,60 Q 100,0 180,60 Q 100,120 20,60 Z" fill="#FFFFFF" stroke="#BDBDBD" strokeWidth="2" />

                    {/* Sclera (White part) - Interactive Zones */}
                    <EyePart id="sclera_l" d="M 30,60 Q 60,30 90,60 Q 60,90 30,60 Z" fill="#F5F5F5" label="Outer Sclera" className="sclera" />
                    <EyePart id="sclera_r" d="M 170,60 Q 140,30 110,60 Q 140,90 170,60 Z" fill="#F5F5F5" label="Inner Sclera" className="sclera" />

                    {/* Iris */}
                    <circle cx="100" cy="60" r="30" fill="#81D4FA" className={`iris ${selectedPart === 'iris' ? 'selected' : ''}`} onClick={() => handlePartClick('iris', 'Iris')} />

                    {/* Pupil */}
                    <circle cx="100" cy="60" r="12" fill="#212121" className={`pupil ${selectedPart === 'pupil' ? 'selected' : ''}`} onClick={() => handlePartClick('pupil', 'Pupil')} />

                    {/* Eyelids (Abstract) */}
                    <path d="M 20,60 Q 100,0 180,60" fill="none" stroke="#EF9A9A" strokeWidth="3" className={`eyelid ${selectedPart === 'upper_lid' ? 'selected' : ''}`} onClick={() => handlePartClick('upper_lid', 'Upper Eyelid')} />
                    <path d="M 20,60 Q 100,120 180,60" fill="none" stroke="#EF9A9A" strokeWidth="3" className={`eyelid ${selectedPart === 'lower_lid' ? 'selected' : ''}`} onClick={() => handlePartClick('lower_lid', 'Lower Eyelid')} />

                </svg>
            </div>
            <p className="diagram-hint">
                {selectedPart ? `Selected: ${selectedPart.replace('_', ' ').toUpperCase()}` : "Tap on Eye part"}
            </p>
        </div>
    );
};

export default EyeView;
