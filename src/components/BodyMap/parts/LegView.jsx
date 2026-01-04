import React, { useState } from 'react';
import './TeethView.css';

const LegView = ({ onSelect }) => {
    const [selectedPart, setSelectedPart] = useState(null);

    const handlePartClick = (id, label) => {
        setSelectedPart(id);
        onSelect({ id, label });
    };

    const LegPart = ({ d, id, label }) => (
        <path
            d={d}
            className={`organ-zone ${selectedPart === id ? 'selected' : ''}`}
            fill="#E0F7FA"
            stroke="#4DD0E1"
            strokeWidth="2"
            onClick={() => handlePartClick(id, label)}
        >
            <title>{label}</title>
        </path>
    );

    return (
        <div className="teeth-view-container">
            <h4 className="diagram-title">Select Leg Region</h4>
            <div className="svg-jaw-wrapper">
                <svg viewBox="0 0 200 300" className="jaw-svg">
                    {/* Left Leg */}
                    <LegPart id="l_thigh" label="Left Thigh" d="M 60,20 L 90,20 L 85,100 L 65,100 Z" />
                    <LegPart id="l_knee" label="Left Knee" d="M 65,100 L 85,100 L 85,120 L 65,120 Z" />
                    <LegPart id="l_calf" label="Left Calf/Shin" d="M 65,120 L 85,120 L 80,200 L 70,200 Z" />
                    <LegPart id="l_ankle" label="Left Ankle" d="M 70,200 L 80,200 L 80,215 L 70,215 Z" />
                    <LegPart id="l_foot" label="Left Foot" d="M 70,215 L 80,215 L 90,230 L 60,230 Z" />

                    {/* Right Leg */}
                    <LegPart id="r_thigh" label="Right Thigh" d="M 110,20 L 140,20 L 135,100 L 115,100 Z" />
                    <LegPart id="r_knee" label="Right Knee" d="M 115,100 L 135,100 L 135,120 L 115,120 Z" />
                    <LegPart id="r_calf" label="Right Calf/Shin" d="M 115,120 L 135,120 L 130,200 L 120,200 Z" />
                    <LegPart id="r_ankle" label="Right Ankle" d="M 120,200 L 130,200 L 130,215 L 120,215 Z" />
                    <LegPart id="r_foot" label="Right Foot" d="M 120,215 L 130,215 L 140,230 L 110,230 Z" />
                </svg>
            </div>
            <p className="diagram-hint">
                {selectedPart ? `Selected: ${selectedPart.replace('_', ' ').toUpperCase()}` : "Tap on a leg part"}
            </p>
        </div>
    );
};

export default LegView;
