import React, { useState } from 'react';
import HumanBodyImage from './HumanBodyImage';
import { RotateCw, AlertCircle, User } from 'lucide-react';
import './BodyMap.css';

const BodyMapContainer = ({ onOrganSelect, userGender = 'male' }) => {
    const [view, setView] = useState('front');
    const [gender, setGender] = useState(userGender.toLowerCase()); // Auto-detect from prop
    const [selectedPart, setSelectedPart] = useState(null);

    // Sync if prop changes (e.g. data load)
    React.useEffect(() => {
        if (userGender) setGender(userGender.toLowerCase());
    }, [userGender]);

    const toggleView = () => {
        setView(prev => prev === 'front' ? 'back' : 'front');
    };

    const toggleGender = () => {
        setGender(prev => prev === 'male' ? 'female' : 'male');
    };

    const handlePartClick = (partId) => {
        setSelectedPart(partId);
        if (onOrganSelect) onOrganSelect(partId);
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
                {/* Gender Toggle Removed - Auto-detected via prop */}
                <button className="btn-icon-round" onClick={toggleView} title="Rotate Model">
                    <RotateCw size={18} />
                </button>
            </div>

            <div className="svg-wrapper" style={{ background: 'none' }}>
                <HumanBodyImage
                    gender={gender}
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
