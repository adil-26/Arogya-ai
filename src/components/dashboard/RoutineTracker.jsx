import React, { useState } from 'react';
import { Award, Moon, Activity, Footprints } from 'lucide-react';
import './RoutineTracker.css';

const RoutineTracker = () => {
    const [waterIntake, setWaterIntake] = useState(3); // Glasses
    const waterGoal = 8;
    const [sleep, setSleep] = useState(7);
    const [exercise, setExercise] = useState(false);
    const [steps, setSteps] = useState(4500);

    const addWater = () => {
        if (waterIntake < waterGoal) setWaterIntake(prev => prev + 1);
    };

    const waterPercentage = (waterIntake / waterGoal) * 100;

    return (
        <div className="routine-tracker-container">
            <h3>
                <span>Daily Routine</span>
                <span className="date-badge">Today</span>
            </h3>

            <div className="tracker-grid">
                {/* Water Bottle Visual */}
                <div className="water-section" onClick={addWater}>
                    <h4>Hydration</h4>
                    <div className="bottle-container">
                        <div className="bottle-body">
                            <div
                                className="water-fill"
                                style={{ height: `${waterPercentage}%` }}
                            >
                                <div className="water-surface"></div>
                            </div>
                        </div>
                        <div className="water-info">
                            <span className="big-text">{waterIntake}/{waterGoal}</span>
                            <span className="unit">Glasses</span>
                        </div>
                    </div>
                    <p className="hint-text">Tap to drink (+1)</p>
                </div>

                {/* Habits Checklist */}
                <div className="habits-list">
                    <div className="habit-item">
                        <div className="habit-icon sleep"><Moon size={20} /></div>
                        <div className="habit-details">
                            <span className="label">Sleep</span>
                            <div className="control-row">
                                <button onClick={() => setSleep(s => Math.max(0, s - 0.5))}>-</button>
                                <span className="value">{sleep} hrs</span>
                                <button onClick={() => setSleep(s => s + 0.5)}>+</button>
                            </div>
                        </div>
                    </div>

                    <div className="habit-item">
                        <div className="habit-icon exercise"><Activity size={20} /></div>
                        <div className="habit-details">
                            <span className="label">Exercise</span>
                            <button
                                className={`toggle-btn-habit ${exercise ? 'done' : ''}`}
                                onClick={() => setExercise(!exercise)}
                            >
                                {exercise ? 'Completed' : 'Mark Done'}
                            </button>
                        </div>
                    </div>

                    <div className="habit-item">
                        <div className="habit-icon steps"><Footprints size={20} /></div>
                        <div className="habit-details">
                            <span className="label">Steps</span>
                            <span className="value">{steps.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoutineTracker;
