import React, { useState, useEffect, useCallback } from 'react';
import { Award, Moon, Activity, Footprints, Droplets, Check, X, Flame, Target, TrendingUp, Loader2 } from 'lucide-react';
import './RoutineTracker.css';

const RoutineTracker = () => {
    const [waterIntake, setWaterIntake] = useState(0);
    const waterGoal = 8;
    const [sleep, setSleep] = useState(7);
    const [exercise, setExercise] = useState(null); // null = not logged, true = done, false = skipped
    const [exerciseStreak, setExerciseStreak] = useState(0); // Days streak
    const [steps, setSteps] = useState(0);
    const stepsGoal = 6000;
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Fetch today's data on mount
    useEffect(() => {
        const fetchLog = async () => {
            try {
                const res = await fetch('/api/daily-log');
                if (res.ok) {
                    const data = await res.json();
                    setWaterIntake(data.water || 0);
                    setSleep(data.sleep || 7);
                    setExercise(data.exercise === true ? true : data.exercise === false ? false : null);
                    setSteps(data.steps || 0);
                    setExerciseStreak(data.exerciseStreak || 0);
                }
            } catch (error) {
                console.error('Failed to fetch daily log:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLog();
    }, []);

    // Save to database (debounced)
    const saveToDatabase = useCallback(async (updates) => {
        setSaving(true);
        try {
            await fetch('/api/daily-log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
        } catch (error) {
            console.error('Failed to save daily log:', error);
        } finally {
            setSaving(false);
        }
    }, []);

    const addWater = () => {
        if (waterIntake < waterGoal) {
            const newValue = waterIntake + 1;
            setWaterIntake(newValue);
            saveToDatabase({ water: newValue });
        }
    };

    const updateSleep = (newValue) => {
        setSleep(newValue);
        saveToDatabase({ sleep: newValue });
    };

    const updateExercise = (done) => {
        setExercise(done);
        const newStreak = done ? exerciseStreak + 1 : 0;
        setExerciseStreak(newStreak);
        saveToDatabase({ exercise: done, exerciseStreak: newStreak });
    };

    const waterPercentage = (waterIntake / waterGoal) * 100;
    const stepsPercentage = Math.min((steps / stepsGoal) * 100, 100);
    const stepsRemaining = Math.max(stepsGoal - steps, 0);

    // Get water status
    const getWaterStatus = () => {
        const expected = Math.floor((new Date().getHours() / 24) * waterGoal);
        if (waterIntake >= expected + 1) return { status: 'ahead', text: '🎉 Ahead of schedule!' };
        if (waterIntake >= expected) return { status: 'ontrack', text: '✓ On track' };
        return { status: 'behind', text: `⚠ ${expected - waterIntake} glasses behind` };
    };

    // Get sleep quality
    const getSleepQuality = () => {
        if (sleep >= 7 && sleep <= 9) return { quality: 'good', label: 'Good', color: '#10B981' };
        if (sleep >= 6 && sleep < 7) return { quality: 'average', label: 'Average', color: '#F59E0B' };
        return { quality: 'poor', label: 'Poor', color: '#EF4444' };
    };

    const waterStatus = getWaterStatus();
    const sleepQuality = getSleepQuality();


    if (loading) {
        return (
            <div className="routine-tracker-container routine-loading">
                <div className="glow-loader">
                    <div className="loader-ring"></div>
                    <div className="loader-ring"></div>
                    <div className="loader-ring"></div>
                    <div className="loader-core">
                        <Droplets size={20} />
                    </div>
                </div>
                <p className="loading-text">Loading your routine...</p>
            </div>
        );
    }

    return (
        <div className="routine-tracker-container">
            <div className="tracker-header">
                <h3>
                    <span>Daily Routine</span>
                    <span className="date-badge">Today</span>
                </h3>
            </div>

            <div className="tracker-grid">
                {/* 💧 HYDRATION SECTION */}
                <div className="water-section" onClick={addWater}>
                    <div className="section-header">
                        <Droplets size={18} />
                        <h4>Hydration</h4>
                    </div>
                    <div className="bottle-container">
                        <div className="bottle-body">
                            <div
                                className="water-fill"
                                style={{ height: `${waterPercentage}%` }}
                            >
                                <div className="water-surface"></div>
                                <div className="water-bubbles">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                            <div className="water-marks">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                        <div className="water-info">
                            <span className="big-text">{waterIntake}<span className="goal-text">/{waterGoal}</span></span>
                            <span className="unit">Glasses</span>
                            <span className={`water-status ${waterStatus.status}`}>
                                {waterStatus.text}
                            </span>
                        </div>
                    </div>
                    <p className="hint-text">Tap to drink (+1 glass)</p>
                </div>

                {/* HABITS COLUMN */}
                <div className="habits-list">
                    {/* 😴 SLEEP */}
                    <div className="habit-item sleep-item">
                        <div className="habit-icon sleep"><Moon size={20} /></div>
                        <div className="habit-details">
                            <div className="habit-header">
                                <span className="label">Sleep</span>
                                <span
                                    className="quality-badge"
                                    style={{ background: sleepQuality.color + '20', color: sleepQuality.color }}
                                >
                                    {sleepQuality.label}
                                </span>
                            </div>
                            <div className="control-row">
                                <button onClick={() => updateSleep(Math.max(0, sleep - 0.5))}>−</button>
                                <span className="value">{sleep} hrs</span>
                                <button onClick={() => updateSleep(Math.min(12, sleep + 0.5))}>+</button>
                            </div>
                            <span className="hint">Recommended: 7-9 hours</span>
                        </div>
                    </div>

                    {/* 🏃 EXERCISE */}
                    <div className="habit-item exercise-item">
                        <div className="habit-icon exercise"><Activity size={20} /></div>
                        <div className="habit-details">
                            <div className="habit-header">
                                <span className="label">Exercise</span>
                                {exerciseStreak > 0 && (
                                    <span className="streak-badge">
                                        <Flame size={14} /> {exerciseStreak} days
                                    </span>
                                )}
                            </div>
                            <div className="exercise-buttons">
                                <button
                                    className={`exercise-btn done ${exercise === true ? 'active' : ''}`}
                                    onClick={() => updateExercise(true)}
                                >
                                    <Check size={16} /> Done
                                </button>
                                <button
                                    className={`exercise-btn skipped ${exercise === false ? 'active' : ''}`}
                                    onClick={() => updateExercise(false)}
                                >
                                    <X size={16} /> Skipped
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 🚶 STEPS */}
                    <div className="habit-item steps-item">
                        <div className="habit-icon steps"><Footprints size={20} /></div>
                        <div className="habit-details">
                            <div className="habit-header">
                                <span className="label">Steps</span>
                                <span className="goal-tag">
                                    <Target size={12} /> Goal: {stepsGoal.toLocaleString()}
                                </span>
                            </div>
                            <div className="steps-progress">
                                <div className="progress-ring-container">
                                    <svg className="progress-ring" viewBox="0 0 36 36">
                                        <path
                                            className="progress-ring-bg"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                        <path
                                            className="progress-ring-fill"
                                            strokeDasharray={`${stepsPercentage}, 100`}
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                    </svg>
                                    <span className="progress-ring-text">{Math.round(stepsPercentage)}%</span>
                                </div>
                                <div className="steps-info">
                                    <span className="steps-count">{steps.toLocaleString()}</span>
                                    {stepsRemaining > 0 ? (
                                        <span className="steps-remaining">{stepsRemaining.toLocaleString()} to go</span>
                                    ) : (
                                        <span className="steps-complete">🎉 Goal reached!</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoutineTracker;
