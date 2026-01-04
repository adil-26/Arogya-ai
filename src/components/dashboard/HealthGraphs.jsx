import React, { useState } from 'react';
import './HealthGraphs.css';

const HealthGraphs = () => {
    const [activeTab, setActiveTab] = useState('hydration');

    // Mock Data Points (Day 1-7)
    const data = {
        hydration: [4, 5, 2, 7, 8, 5, 6], // Glasses of water
        headache: [1, 0, 1, 0, 0, 1, 0], // Headache occurrence (0/1)
        sleep: [6, 7, 5, 8, 7.5, 7, 6.5], // Hours of sleep
        fatigue: [4, 2, 8, 1, 2, 3, 5] // Fatigue level (1-10)
    };

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const renderContent = () => {
        if (activeTab === 'hydration') {
            return (
                <div className="graph-content">
                    <h4>Hydration vs. Headache</h4>
                    <p className="insight-text">
                        Analysis shows a <span className="highlight negative">strong correlation</span>: Days with low water intake (&lt;4 glasses) often trigger headaches.
                    </p>

                    <div className="bar-chart">
                        {data.hydration.map((val, idx) => (
                            <div key={idx} className="chart-column">
                                <div className="bars-wrapper">
                                    {/* Headache Indicator (Overlay) */}
                                    {data.headache[idx] === 1 && (
                                        <div className="headache-dot" title="Headache Reported"></div>
                                    )}
                                    {/* Water Bar */}
                                    <div
                                        className="bar water-bar"
                                        style={{ height: `${(val / 10) * 100}%` }}
                                        title={`${val} glasses`}
                                    ></div>
                                </div>
                                <span className="label">{days[idx]}</span>
                            </div>
                        ))}
                    </div>
                    <div className="legend">
                        <span className="legend-item"><span className="dot water"></span> Water Intake</span>
                        <span className="legend-item"><span className="dot headache"></span> Headache</span>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="graph-content">
                    <h4>Sleep vs. Fatigue</h4>
                    <p className="insight-text">
                        Good sleep (7hrs) keeps fatigue levels low. Wednesday's low sleep spiked fatigue.
                    </p>
                    <div className="bar-chart">
                        {data.sleep.map((val, idx) => (
                            <div key={idx} className="chart-column">
                                <div className="bars-wrapper">
                                    {/* Fatigue Line (represented as a secondary bar for simplicity in CSS) */}
                                    <div
                                        className="bar fatigue-bar"
                                        style={{ height: `${(data.fatigue[idx] / 10) * 100}%` }}
                                        title={`Fatigue: ${data.fatigue[idx]}/10`}
                                    ></div>
                                    {/* Sleep Bar */}
                                    <div
                                        className="bar sleep-bar"
                                        style={{ height: `${(val / 10) * 100}%` }}
                                        title={`Sleep: ${val} hrs`}
                                    ></div>
                                </div>
                                <span className="label">{days[idx]}</span>
                            </div>
                        ))}
                    </div>
                    <div className="legend">
                        <span className="legend-item"><span className="dot sleep"></span> Sleep</span>
                        <span className="legend-item"><span className="dot fatigue"></span> Fatigue Level</span>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="health-graphs-container">
            <div className="graph-header">
                <h3>Health Insights</h3>
                <div className="graph-tabs">
                    <button
                        className={`graph-tab ${activeTab === 'hydration' ? 'active' : ''}`}
                        onClick={() => setActiveTab('hydration')}
                    >
                        Hydration
                    </button>
                    <button
                        className={`graph-tab ${activeTab === 'sleep' ? 'active' : ''}`}
                        onClick={() => setActiveTab('sleep')}
                    >
                        Sleep
                    </button>
                </div>
            </div>
            {renderContent()}
        </div>
    );
};

export default HealthGraphs;
