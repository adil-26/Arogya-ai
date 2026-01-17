import React from 'react';

const HumanBodyImage = ({ gender = 'male', view = 'front', selectedPart, onPartClick }) => {
    // Image path based on props
    const imagePath = `/images/bodymap/${gender}-${view}.png`;

    // Interaction Zoning (Percentage based for responsiveness)
    // Format: { id: 'partId', top: '10%', left: '20%', width: '10%', height: '10%' }
    // Interaction Zoning (Recalibrated for centered 3D render)
    const zones = {
        front: [
            // Head & Neck (Shifted Down)
            { id: 'head', top: '10%', left: '42%', width: '16%', height: '12%' },
            { id: 'neck', top: '22%', left: '44%', width: '12%', height: '5%' },

            // Torso
            { id: 'shoulders', top: '27%', left: '30%', width: '40%', height: '10%' },
            { id: 'chest', top: '34%', left: '35%', width: '30%', height: '15%' }, // Heart/Lungs
            { id: 'stomach', top: '48%', left: '38%', width: '24%', height: '15%' }, // Abdomen
            { id: 'pelvis', top: '63%', left: '38%', width: '24%', height: '10%' },

            // Arms (Left/Right from viewer perspective)
            { id: 'left_shoulder', top: '27%', left: '22%', width: '12%', height: '12%' },
            { id: 'right_shoulder', top: '27%', left: '66%', width: '12%', height: '12%' },
            { id: 'left_arm', top: '38%', left: '18%', width: '14%', height: '25%' },
            { id: 'right_arm', top: '38%', left: '68%', width: '14%', height: '25%' },
            { id: 'left_hand', top: '62%', left: '12%', width: '12%', height: '10%' },
            { id: 'right_hand', top: '62%', left: '76%', width: '12%', height: '10%' },

            // Legs
            { id: 'left_thigh', top: '65%', left: '32%', width: '14%', height: '18%' },
            { id: 'right_thigh', top: '65%', left: '54%', width: '14%', height: '18%' },
            { id: 'left_knee', top: '82%', left: '34%', width: '12%', height: '7%' },
            { id: 'right_knee', top: '82%', left: '54%', width: '12%', height: '7%' },
            { id: 'left_leg', top: '88%', left: '34%', width: '12%', height: '10%' },
            { id: 'right_leg', top: '88%', left: '54%', width: '12%', height: '10%' },
            { id: 'feet', top: '96%', left: '30%', width: '40%', height: '4%' }, // Kept at bottom
        ],
        back: [
            { id: 'head', top: '10%', left: '42%', width: '16%', height: '12%' },
            { id: 'neck', top: '22%', left: '44%', width: '12%', height: '5%' },
            { id: 'upper_back', top: '28%', left: '32%', width: '36%', height: '20%' },
            { id: 'lower_back', top: '48%', left: '35%', width: '30%', height: '15%' },
            { id: 'glutes', top: '62%', left: '32%', width: '36%', height: '15%' },

            // Arms
            { id: 'left_arm', top: '38%', left: '18%', width: '14%', height: '25%' },
            { id: 'right_arm', top: '38%', left: '68%', width: '14%', height: '25%' },

            // Legs
            { id: 'left_thigh', top: '75%', left: '32%', width: '14%', height: '15%' },
            { id: 'right_thigh', top: '75%', left: '54%', width: '14%', height: '15%' },
            { id: 'calves', top: '89%', left: '32%', width: '36%', height: '12%' },
        ]
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
            <img
                src={imagePath}
                alt={`${gender} ${view} body map`}
                style={{ height: '100%', width: '100%', objectFit: 'contain' }}
            />

            {/* Clickable Overlay */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
                {zones[view].map((zone, idx) => (
                    <div
                        key={idx}
                        onClick={() => onPartClick(zone.id)}
                        className={`body-zone ${selectedPart === zone.id ? 'active-zone' : ''}`}
                        title={zone.id.charAt(0).toUpperCase() + zone.id.slice(1)}
                        style={{
                            position: 'absolute',
                            top: zone.top,
                            left: zone.left,
                            width: zone.width,
                            height: zone.height,
                            cursor: 'pointer',
                            pointerEvents: 'auto', // Re-enable clicks
                            // Debug border - remove later or keep transparent
                            // border: '1px solid red', 
                            backgroundColor: selectedPart === zone.id ? 'rgba(37, 99, 235, 0.3)' : 'transparent',
                            borderRadius: '50%',
                            transition: 'background-color 0.2s'
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default HumanBodyImage;
