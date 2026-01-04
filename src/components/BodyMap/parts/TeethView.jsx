import React, { useState } from 'react';
import './TeethView.css';

const TeethView = ({ onSelect }) => {
    const [selectedTooth, setSelectedTooth] = useState(null);

    const handleToothClick = (id) => {
        setSelectedTooth(id);
        onSelect({ id, label: `Tooth #${id}` });
    };

    // Coordinates for 32 teeth based on the specific image layout (approximate %)
    // Tips: Top Arch 1-16 (Right to Left), Bottom Arch 32-17 (Right to Left)
    // Image layout: Top Arch is roughly top 45%, Bottom is bottom 45%.
    const toothPositions = [
        // --- Upper Arch (Right -> Left) ---
        // Right Molars/Premolars
        { id: 1, top: 43, left: 16 }, { id: 2, top: 37, left: 16 }, { id: 3, top: 30, left: 17 },
        { id: 4, top: 24, left: 20 }, { id: 5, top: 18, left: 23 },
        // Front
        { id: 6, top: 13, left: 30 }, { id: 7, top: 10, left: 38 }, { id: 8, top: 9, left: 45 },
        { id: 9, top: 9, left: 53 }, { id: 10, top: 10, left: 60 }, { id: 11, top: 13, left: 68 },
        // Left
        { id: 12, top: 18, left: 75 }, { id: 13, top: 24, left: 78 }, { id: 14, top: 30, left: 81 },
        { id: 15, top: 37, left: 82 }, { id: 16, top: 43, left: 82 },

        // --- Lower Arch (Left -> Right) ---
        // Left Molars
        { id: 17, top: 56, left: 82 }, { id: 18, top: 62, left: 82 }, { id: 19, top: 68, left: 80 },
        { id: 20, top: 74, left: 76 }, { id: 21, top: 79, left: 72 },
        // Front
        { id: 22, top: 83, left: 65 }, { id: 23, top: 86, left: 58 }, { id: 24, top: 87, left: 51 },
        { id: 25, top: 87, left: 44 }, { id: 26, top: 86, left: 37 }, { id: 27, top: 83, left: 30 },
        // Right
        { id: 28, top: 79, left: 24 }, { id: 29, top: 74, left: 20 }, { id: 30, top: 68, left: 17 },
        { id: 31, top: 62, left: 16 }, { id: 32, top: 56, left: 16 }
    ];

    return (
        <div className="teeth-view-container">
            <h4 className="diagram-title">Select Tooth (1-32)</h4>

            <div className="dental-chart-wrapper">
                <img src="/dental_chart.png" alt="Dental Chart" className="dental-chart-img" />

                {toothPositions.map((pos) => (
                    <button
                        key={pos.id}
                        className={`tooth-hitbox ${selectedTooth === pos.id ? 'selected' : ''}`}
                        style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                        onClick={() => handleToothClick(pos.id)}
                        title={`Tooth #${pos.id}`}
                    >
                        {selectedTooth === pos.id && <span className="tooth-number-badge">{pos.id}</span>}
                    </button>
                ))}
            </div>

            <p className="diagram-hint">
                {selectedTooth ? `Selected: Tooth #${selectedTooth}` : "Tap on a specific tooth"}
            </p>
        </div>
    );
};

export default TeethView;
