import React from 'react';
import './BodyMap.css';

const HumanBodySVG = ({ view, onPartClick, selectedPart, markerData = [], activeLayer = 'all' }) => {
    // Simplified Schematic Paths for demonstration

    // Coordinate Map for Markers
    const MARKER_COORDS = {
        'head': { x: 100, y: 50 },
        'brain': { x: 100, y: 35 },
        'eyes': { x: 100, y: 45 },
        'teeth': { x: 100, y: 65 },
        'neck': { x: 100, y: 90 },
        'chest': { x: 100, y: 130 },
        'heart': { x: 115, y: 130 },
        'lungs': { x: 85, y: 130 },
        'abdomen': { x: 100, y: 190 },
        'stomach': { x: 100, y: 180 },
        'liver': { x: 90, y: 180 },
        'kidneys': { x: 100, y: 200 },
        'pelvis': { x: 100, y: 230 },
        'left-arm': { x: 55, y: 130 },
        'right-arm': { x: 145, y: 130 },
        'left-leg': { x: 80, y: 300 },
        'right-leg': { x: 120, y: 300 },
        'back': { x: 100, y: 150 }
    };

    const handlePartClick = (partId) => {
        if (onPartClick) onPartClick(partId);
    };

    const getClassName = (partId) => {
        return `body-part ${selectedPart === partId ? 'selected' : ''}`;
    };

    // Filter and Render Markers
    const renderMarkers = () => {
        if (!markerData || markerData.length === 0) return null;

        return markerData.map((item, idx) => {
            // 1. Filter by Layer
            if (activeLayer !== 'all') {
                if (activeLayer === 'surgery' && item.type !== 'surgery') return null;
                if (activeLayer === 'accident' && item.type !== 'accident') return null;
                if (activeLayer === 'issue' && item.type !== 'issue') return null;
            }

            // 2. Resolve Coordinate
            let part = item.organId ? item.organId.toLowerCase() : 'head';
            // Simple fuzzy mapping
            if (part.includes('leg') || part.includes('knee')) part = 'left-leg';
            if (part.includes('arm') || part.includes('hand')) part = 'left-arm';

            const coords = MARKER_COORDS[part] || MARKER_COORDS['head'];

            // 3. Determine Style
            let color = '#ef4444'; // default red (issue)
            let icon = ''; // could use emoji or shape

            if (item.type === 'surgery') { color = '#3b82f6'; } // Blue
            else if (item.type === 'accident') { color = '#f97316'; } // Orange
            else if (item.type === 'condition') { color = '#a855f7'; } // Purple

            // Render Dot
            return (
                <g key={`marker-${idx}`} onClick={(e) => { e.stopPropagation(); handlePartClick(part); }} style={{ cursor: 'pointer' }}>
                    <circle cx={coords.x} cy={coords.y} r="6" fill="white" stroke={color} strokeWidth="2" className="marker-dot" />
                    <circle cx={coords.x} cy={coords.y} r="3" fill={color} className="marker-inner" />
                </g>
            );
        });
    };

    return (
        <svg
            viewBox="0 0 200 400"
            className={`human-body-svg ${view}`}
            xmlns="http://www.w3.org/2000/svg"
        >
            <g className="body-silhouette">
                {/* Head */}
                <path
                    d="M100,20 C115,20 125,35 125,55 C125,75 115,85 100,85 C85,85 75,75 75,55 C75,35 85,20 100,20 Z"
                    className={getClassName('head')}
                    onClick={() => handlePartClick('head')}
                />

                {/* Neck */}
                <path d="M90,85 L110,85 L115,95 L85,95 Z" className="body-part-static" />

                {/* Torso Area (Chest + Abdomen) */}
                {view === 'front' ? (
                    <>
                        {/* Chest / Lungs / Heart Area */}
                        <path
                            d="M70,95 L130,95 L135,160 L65,160 Z"
                            className={getClassName('chest')}
                            onClick={() => handlePartClick('chest')}
                        />
                        {/* Heart Overlay (specific click zone) */}
                        <circle cx="110" cy="125" r="10" className={getClassName('heart')} onClick={(e) => { e.stopPropagation(); handlePartClick('heart'); }} />

                        {/* Abdomen / Stomach / Liver */}
                        <path
                            d="M65,160 L135,160 L130,220 L70,220 Z"
                            className={getClassName('abdomen')}
                            onClick={() => handlePartClick('abdomen')}
                        />
                    </>
                ) : (
                    <>
                        {/* Back Area */}
                        <path
                            d="M70,95 L130,95 L130,220 L70,220 Z"
                            className={getClassName('back')}
                            onClick={() => handlePartClick('back')}
                        />
                        {/* Kidneys Overlay */}
                        <circle cx="90" cy="190" r="8" className={getClassName('kidneys')} onClick={(e) => { e.stopPropagation(); handlePartClick('kidneys'); }} />
                        <circle cx="110" cy="190" r="8" className={getClassName('kidneys')} onClick={(e) => { e.stopPropagation(); handlePartClick('kidneys'); }} />
                    </>
                )}

                {/* Arms */}
                <path d="M70,95 L50,150 L60,155 L75,105 Z" className={getClassName('left-arm')} onClick={() => handlePartClick('left-arm')} /> {/* Left Arm */}
                <path d="M130,95 L150,150 L140,155 L125,105 Z" className={getClassName('right-arm')} onClick={() => handlePartClick('right-arm')} /> {/* Right Arm */}

                {/* Hips/Pelvis */}
                <path d="M70,220 L130,220 L125,240 L75,240 Z" className="body-part-static" />

                {/* Legs */}
                <path d="M75,240 L70,350 L85,350 L90,240 Z" className={getClassName('left-leg')} onClick={() => handlePartClick('left-leg')} />
                <path d="M110,240 L115,350 L130,350 L125,240 Z" className={getClassName('right-leg')} onClick={() => handlePartClick('right-leg')} />

                {/* Data Markers Layer */}
                {renderMarkers()}
            </g>
        </svg>
    );
};

export default HumanBodySVG;
