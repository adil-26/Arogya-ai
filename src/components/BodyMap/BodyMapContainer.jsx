import React, { useState } from 'react';
import HumanBodySVG from './HumanBodySVG';
import { RotateCw, AlertCircle } from 'lucide-react';
import './BodyMap.css';

const BodyMapContainer = ({ onOrganSelect }) => {
    const [view, setView] = useState('front');
    const [selectedPart, setSelectedPart] = useState(null);

    const toggleView = () => {
        setView(prev => prev === 'front' ? 'back' : 'front');
    };

    const handlePartClick = (partId) => {
        // ID Normalization Concept: Map specific SVG parts to broader "Domains" used in Config
        let domainId = partId;
        if (partId === 'abdomen') domainId = 'stomach';
        if (partId.includes('arm')) domainId = 'arms';
        if (partId.includes('leg')) domainId = 'legs';

        setSelectedPart(domainId);
        if (onOrganSelect) onOrganSelect(domainId);
    };

    return (
        <div className="body-map-container">
            <div className="map-controls">
                <div className="view-toggle">
                    <button
                        className={`toggle-btn ${view === 'front' ? 'active' : ''}`}
                        onClick={() => setView('front')}
                    >
                        Front
                    </button>
                    <button
                        className={`toggle-btn ${view === 'back' ? 'active' : ''}`}
                        onClick={() => setView('back')}
                    >
                        Back
                    </button>
                </div>
                <button className="btn-icon-round" onClick={toggleView} title="Rotate Model">
                    <RotateCw size={18} />
                </button>
            </div>

            <div className="svg-wrapper">
                <HumanBodySVG
                    view={view}
                    selectedPart={selectedPart}
                    onPartClick={handlePartClick}
                />

                {/* Floating Tooltip/Indicator Example */}
                <div className="map-legend">
                    <div className="legend-item">
                        <span className="dot mild"></span> Mild
                    </div>
                    <div className="legend-item">
                        <span className="dot severe"></span> Severe
                    </div>
                </div>
            </div>

            {!selectedPart && (
                <div className="map-instruction">
                    <AlertCircle size={16} />
                    <span>Tap on a body part to view details</span>
                </div>
            )}
        </div>
    );
};

export default BodyMapContainer;
