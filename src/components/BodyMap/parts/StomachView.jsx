import React, { useState } from 'react';
import './TeethView.css'; // Reusing similar styles

const StomachView = ({ onSelect }) => {
    const [selectedZone, setSelectedZone] = useState(null);

    const handleZoneClick = (id, label) => {
        setSelectedZone(id);
        onSelect({ id, label });
    };

    const OrganShape = ({ d, fill, label, id }) => (
        <path
            d={d}
            fill={fill}
            stroke="#E0E0E0"
            strokeWidth="2"
            className={`organ-zone ${selectedZone === id ? 'selected' : ''}`}
            onClick={() => handleZoneClick(id, label)}
        >
            <title>{label}</title>
        </path>
    );

    return (
        <div className="teeth-view-container">
            <h4 className="diagram-title">Select Abdominal Region</h4>
            <div className="svg-jaw-wrapper">
                <svg viewBox="0 0 200 250" className="jaw-svg">
                    {/* Esophagus */}
                    <path d="M 100,10 L 100,50" stroke="#FFCCBC" strokeWidth="10" strokeLinecap="round" />

                    {/* Liver - Large upper right */}
                    <OrganShape id="liver" d="M 100,50 Q 160,50 170,100 Q 140,130 100,90 Z" fill="#EF9A9A" label="Liver" />

                    {/* Stomach - Upper Left */}
                    <OrganShape id="stomach" d="M 100,50 Q 40,60 50,110 Q 90,130 110,90 Z" fill="#F48FB1" label="Stomach" />

                    {/* Intestines - Center */}
                    <OrganShape id="intestines" d="M 60,120 Q 140,120 140,180 Q 60,180 60,120 Z" fill="#CE93D8" label="Intestines" />

                    {/* Kidneys (Abstract positions behind) */}
                    <circle cx="50" cy="140" r="15" fill="#BCAAA4" opacity="0.5" className={`organ-zone ${selectedZone === 'l_kidney' ? 'selected' : ''}`} onClick={() => handleZoneClick('l_kidney', 'Left Kidney')} />
                    <circle cx="150" cy="140" r="15" fill="#BCAAA4" opacity="0.5" className={`organ-zone ${selectedZone === 'r_kidney' ? 'selected' : ''}`} onClick={() => handleZoneClick('r_kidney', 'Right Kidney')} />

                </svg>
            </div>
            <style>{`
        .organ-zone { transition: all 0.2s; cursor: pointer; }
        .organ-zone:hover { opacity: 0.8; stroke: var(--color-primary); }
        .organ-zone.selected { fill: var(--color-primary); stroke: var(--color-primary-dark); opacity: 1; }
      `}</style>
            <p className="diagram-hint">
                {selectedZone ? `Selected: ${selectedZone.toUpperCase()}` : "Tap on an internal organ"}
            </p>
        </div>
    );
};

export default StomachView;
