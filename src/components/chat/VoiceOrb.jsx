'use client';
import React from 'react';
import { Mic, X, Volume2, Loader2 } from 'lucide-react';
import './VoiceOrb.css';

const VoiceOrb = ({
    isActive,
    isListening,
    isSpeaking,
    isProcessing,
    transcript,
    onClose,
    onStartListening,
    onStopListening
}) => {
    if (!isActive) return null;

    // Determine current state
    const getOrbClass = () => {
        if (isListening) return 'listening';
        if (isProcessing) return 'processing';
        if (isSpeaking) return 'speaking';
        return '';
    };

    return (
        <div className="voice-overlay">
            <div className="voice-backdrop" onClick={onClose} />

            <div className="voice-container">
                {/* Close Button */}
                <button className="voice-close" onClick={onClose}>
                    <X size={24} />
                </button>

                {/* Animated Orb */}
                <div className={`voice-orb ${getOrbClass()}`} onClick={isListening ? onStopListening : (!isProcessing && !isSpeaking ? onStartListening : null)}>
                    {/* Outer Glow Rings */}
                    <div className="orb-ring ring-1" />
                    <div className="orb-ring ring-2" />
                    <div className="orb-ring ring-3" />

                    {/* Core Orb */}
                    <div className="orb-core">
                        <div className="orb-gradient" />
                        {/* Wave Bars Animation */}
                        <div className="wave-container">
                            <div className="wave-bar" />
                            <div className="wave-bar" />
                            <div className="wave-bar" />
                            <div className="wave-bar" />
                            <div className="wave-bar" />
                        </div>
                        {/* Premium Orbiting Dots Loader */}
                        {isProcessing && (
                            <div className="orbit-loader">
                                <div className="orbit-dot dot-1" />
                                <div className="orbit-dot dot-2" />
                                <div className="orbit-dot dot-3" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Text */}
                <div className="voice-status">
                    {isListening && (
                        <p className="status-text listening">
                            <span className="pulse-dot" />
                            Listening...
                        </p>
                    )}
                    {isProcessing && (
                        <p className="status-text processing">
                            <Loader2 size={16} className="spin" />
                            Thinking...
                        </p>
                    )}
                    {isSpeaking && (
                        <p className="status-text speaking">
                            <Volume2 size={16} />
                            Speaking...
                        </p>
                    )}
                    {!isListening && !isSpeaking && !isProcessing && (
                        <p className="status-text idle">Tap the orb to speak</p>
                    )}
                </div>

                {/* Transcript Display */}
                {transcript && (
                    <div className="voice-transcript">
                        <p>"{transcript}"</p>
                    </div>
                )}

                {/* Action Button */}
                {!isProcessing && !isSpeaking && (
                    <button
                        className={`voice-action-btn ${isListening ? 'active' : ''}`}
                        onClick={isListening ? onStopListening : onStartListening}
                    >
                        <Mic size={28} />
                        <span>{isListening ? 'Stop & Send' : 'Start Speaking'}</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default VoiceOrb;
