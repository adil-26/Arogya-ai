import React, { useState } from 'react';
import './TeethView.css';

const PelvisView = ({ onSelect }) => {
    const [selectedPart, setSelectedPart] = useState(null);

    const handlePartClick = (id, label) => {
        setSelectedPart(id);
        onSelect({ id, label });
    };

    const Part = ({ cx, cy, r, d, id, label }) => (
        d ? (
            <path
                d={d}
                className={`organ-zone ${selectedPart === id ? 'selected' : ''}`}
                fill="#FFE0B2"
                stroke="#FFB74D"
                strokeWidth="2"
                onClick={() => handlePartClick(id, label)}
            />
        ) : (
            <circle
                cx={cx} cy={cy} r={r}
                className={`organ-zone ${selectedPart === id ? 'selected' : ''}`}
                fill="#FFE0B2"
                stroke="#FFB74D"
                strokeWidth="2"
                onClick={() => handlePartClick(id, label)}
            />
        )
    );

    return (
        <div className="teeth-view-container">
            <h4 className="diagram-title">Select Pelvic Region</h4>
            <div className="svg-jaw-wrapper">
                <svg viewBox="0 0 200 200" className="jaw-svg">
                    {/* Hips */}
                    <path d="M 20,50 Q 100,0 180,50 L 160,150 Q 100,180 40,150 Z" fill="none" stroke="#E0E0E0" strokeWidth="2" />

                    {/* Bladder */}
                    <Part id="bladder" label="Bladder" cx="100" cy="110" r="25" />

                    {/* Groin Area Left/Right */}
                    <Part id="l_hip" label="Left Hip Joint" cx="50" cy="80" r="20" />
                    <Part id="r_hip" label="Right Hip Joint" cx="150" cy="80" r="20" />
                </svg>
            </div>
            <p className="diagram-hint">
                {selectedPart ? `Selected: ${selectedPart.replace('_', ' ').toUpperCase()}` : "Tap on region"}
            </p>
        </div>
    );
};

export default PelvisView;
