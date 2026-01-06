'use client';

import React from 'react';
import './VitalAnimations.css';

// Heartbeat Pulse Animation (Pure CSS)
export const HeartbeatPulse = ({ status = 'normal', size = 40 }) => {
    const getColor = () => {
        switch (status) {
            case 'critical': return '#DC2626';
            case 'high': return '#F59E0B';
            case 'low': return '#3B82F6';
            default: return '#10B981';
        }
    };

    return (
        <div className={`heartbeat-container ${status}`} style={{ width: size, height: size }}>
            <div className="heartbeat-pulse" style={{ '--pulse-color': getColor() }}>
                <svg viewBox="0 0 32 32" fill="none">
                    <path
                        d="M16 28C16 28 4 20 4 12C4 8 7 4 12 4C14 4 15.5 5 16 6C16.5 5 18 4 20 4C25 4 28 8 28 12C28 20 16 28 16 28Z"
                        fill="currentColor"
                    />
                </svg>
            </div>
            <div className="heartbeat-ring"></div>
            <div className="heartbeat-ring delay-1"></div>
            <div className="heartbeat-ring delay-2"></div>
        </div>
    );
};

// Blood Pressure Pulse Animation
export const BPPulse = ({ status = 'normal', systolic, diastolic }) => {
    return (
        <div className={`bp-animation ${status}`}>
            <div className="bp-wave">
                <svg viewBox="0 0 100 40" preserveAspectRatio="none">
                    <path
                        className="bp-line"
                        d="M0,20 L10,20 L15,20 L20,5 L25,35 L30,10 L35,25 L40,20 L50,20 L60,20 L65,20 L70,5 L75,35 L80,10 L85,25 L90,20 L100,20"
                        fill="none"
                        strokeWidth="2"
                    />
                </svg>
            </div>
        </div>
    );
};

// Sugar Level Animation (Glucose molecule visual)
export const SugarAnimation = ({ status = 'normal', value }) => {
    return (
        <div className={`sugar-animation ${status}`}>
            <div className="sugar-molecule">
                <span className="atom a1"></span>
                <span className="atom a2"></span>
                <span className="atom a3"></span>
                <span className="atom a4"></span>
                <span className="atom a5"></span>
                <span className="atom a6"></span>
            </div>
        </div>
    );
};

// Critical Warning Glow Effect
export const CriticalGlow = ({ children, active = false, status = 'normal' }) => {
    if (status === 'critical' || status === 'high') {
        return (
            <div className={`critical-glow-wrapper ${status} ${active ? 'active' : ''}`}>
                {children}
                <div className="glow-effect"></div>
            </div>
        );
    }
    return children;
};

// Water Fill Animation
export const WaterFillAnimation = ({ percentage = 0 }) => {
    return (
        <div className="water-animation-container">
            <div className="water-waves" style={{ height: `${percentage}%` }}>
                <svg className="waves" viewBox="0 0 120 28" preserveAspectRatio="none">
                    <defs>
                        <path
                            id="wave"
                            d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
                        />
                    </defs>
                    <use xlinkHref="#wave" x="0" y="5" fill="rgba(59, 130, 246, 0.3)" />
                    <use xlinkHref="#wave" x="0" y="0" fill="rgba(59, 130, 246, 0.5)" />
                    <use xlinkHref="#wave" x="0" y="3" fill="rgba(59, 130, 246, 0.8)" />
                </svg>
            </div>
            <div className="water-bubbles-animated">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    );
};

// Steps Progress Ring Animation
export const StepsRingAnimation = ({ percentage = 0, size = 60 }) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="steps-ring-animation" style={{ width: size, height: size }}>
            <svg viewBox="0 0 100 100">
                <circle
                    className="ring-bg"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    strokeWidth="8"
                />
                <circle
                    className="ring-progress"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                />
                <circle
                    className="ring-glow"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                />
            </svg>
            <div className="ring-center">
                <span className="ring-value">{Math.round(percentage)}%</span>
            </div>
        </div>
    );
};

export default {
    HeartbeatPulse,
    BPPulse,
    SugarAnimation,
    CriticalGlow,
    WaterFillAnimation,
    StepsRingAnimation
};
