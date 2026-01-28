import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

const VoiceInput = ({ onTranscript, placeholder = "Tap mic to speak..." }) => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setIsSupported(false);
        }
    }, []);

    const toggleListening = () => {
        if (!isSupported) {
            alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
            return;
        }

        if (isListening) {
            setIsListening(false);
            window.recognition?.stop();
        } else {
            setIsListening(true);
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            window.recognition = new SpeechRecognition();

            window.recognition.continuous = false;
            window.recognition.interimResults = false;
            window.recognition.lang = 'en-US'; // Could be dynamic based on user pref

            window.recognition.onstart = () => {
                setIsListening(true);
            };

            window.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (onTranscript) onTranscript(transcript);
                setIsListening(false);
            };

            window.recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            window.recognition.onend = () => {
                setIsListening(false);
            };

            window.recognition.start();
        }
    };

    if (!isSupported) return null;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
                type="button" // Prevent form submission
                onClick={toggleListening}
                className={`voice-btn ${isListening ? 'listening' : ''}`}
                style={{
                    background: isListening ? '#fee2e2' : '#f1f5f9',
                    border: isListening ? '1px solid #ef4444' : '1px solid #cbd5e1',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
                title={isListening ? "Stop Listening" : "Start Voice Input"}
            >
                {isListening ? <Loader2 className="spin" size={20} color="#ef4444" /> : <Mic size={20} color="#475569" />}
            </button>
            {isListening && <span style={{ fontSize: '0.85rem', color: '#ef4444', fontStyle: 'italic' }}>Listening...</span>}
        </div>
    );
};

export default VoiceInput;
