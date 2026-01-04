import React, { useState } from 'react';
import './TeethView.css';

const ArmView = ({ onSelect }) => {
    const [selectedPart, setSelectedPart] = useState(null);

    const handlePartClick = (id, label) => {
        setSelectedPart(id);
        onSelect({ id, label });
    };

    const ArmPart = ({ d, id, label }) => (
        <path
            d={d}
            className={`organ-zone ${selectedPart === id ? 'selected' : ''}`}
            fill="#F3E5F5"
            stroke="#CE93D8"
            strokeWidth="2"
            onClick={() => handlePartClick(id, label)}
        >
            <title>{label}</title>
        </path>
    );

    return (
        <div className="teeth-view-container">
            <h4 className="diagram-title">Select Arm Region</h4>
            <div className="svg-jaw-wrapper">
                <svg viewBox="0 0 300 150" className="jaw-svg">
                    {/* Left Arm (shown horizontally) */}
                    <ArmPart id="l_shoulder" label="Left Shoulder" d="M 20,50 L 50,50 L 50,80 L 20,80 Z" />
                    <ArmPart id="l_bicep" label="Left Bicep" d="M 50,50 L 100,50 L 100,80 L 50,80 Z" />
                    <ArmPart id="l_elbow" label="Left Elbow" d="M 100,55 L 120,55 L 120,75 L 100,75 Z" />
                    <ArmPart id="l_forearm" label="Left Forearm" d="M 120,55 L 180,60 L 180,70 L 120,75 Z" />
                    <ArmPart id="l_wrist" label="Left Wrist" d="M 180,60 L 195,60 L 195,70 L 180,70 Z" />
                    <ArmPart id="l_hand" label="Left Hand" d="M 195,50 L 230,50 L 230,80 L 195,80 Z" />
                </svg>
            </div>
            <p className="diagram-hint">
                {selectedPart ? `Selected: ${selectedPart.replace('_', ' ').toUpperCase()}` : "Tap on an arm part"}
            </p>
        </div>
    );
};

export default ArmView;
