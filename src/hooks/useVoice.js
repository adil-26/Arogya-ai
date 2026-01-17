'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

export function useVoice(onSpeechEnd = null) {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [voices, setVoices] = useState([]);
    const recognitionRef = useRef(null);
    const finalTranscriptRef = useRef('');

    // Load available voices
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis?.getVoices() || [];
            setVoices(availableVoices);
        };

        loadVoices();
        window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);

        return () => {
            window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
        };
    }, []);

    // Get best English-Indian voice (avoid Hindi voice that reads emojis/numbers in Hindi)
    const getIndianVoice = useCallback(() => {
        // Prioritize English voices with Indian accent
        const priorities = [
            'Microsoft Ravi',      // English-Indian male
            'Microsoft Neerja',    // English-Indian female  
            'Google UK English',   // Good English fallback
            'en-IN',               // Any English-Indian voice
            'en-GB',               // British English
            'en-US'                // US English
        ];

        for (const keyword of priorities) {
            const match = voices.find(v =>
                v.name.includes(keyword) || v.lang.includes(keyword)
            );
            if (match) return match;
        }

        // Fallback to any English voice (avoid Hindi)
        return voices.find(v => v.lang.startsWith('en')) || voices[0];
    }, [voices]);

    // Speech-to-Text: Start listening
    const startListening = useCallback(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition not supported in this browser');
            return;
        }

        // Reset transcript
        setTranscript('');
        finalTranscriptRef.current = '';

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'en-IN';
        recognition.interimResults = true;
        recognition.continuous = false;

        recognition.onstart = () => setIsListening(true);

        recognition.onend = () => {
            setIsListening(false);
            // Auto-trigger callback with final transcript when speech ends
            if (finalTranscriptRef.current && onSpeechEnd) {
                onSpeechEnd(finalTranscriptRef.current);
            }
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                } else {
                    interimTranscript += result[0].transcript;
                }
            }

            const currentTranscript = finalTranscript || interimTranscript;
            setTranscript(currentTranscript);

            if (finalTranscript) {
                finalTranscriptRef.current = finalTranscript;
            } else if (interimTranscript) {
                finalTranscriptRef.current = interimTranscript;
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech error:', event.error);
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [onSpeechEnd]);

    // Stop listening manually
    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
    }, []);

    // Text-to-Speech: Speak text
    const speak = useCallback((text) => {
        if (!text || !window.speechSynthesis) return;

        window.speechSynthesis.cancel();

        // Clean text: remove emojis, special characters, markdown
        const cleanText = text
            .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')  // Remove emojis
            .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Remove misc symbols
            .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Remove dingbats
            .replace(/[#*_`~]/g, '')                 // Remove markdown
            .replace(/---/g, '')                     // Remove horizontal rules
            .replace(/\s+/g, ' ')                    // Normalize whitespace
            .trim();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        const indianVoice = getIndianVoice();

        if (indianVoice) {
            utterance.voice = indianVoice;
        }

        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [getIndianVoice]);

    // Stop speaking
    const stopSpeaking = useCallback(() => {
        window.speechSynthesis?.cancel();
        setIsSpeaking(false);
    }, []);

    return {
        isListening,
        isSpeaking,
        transcript,
        setTranscript,
        startListening,
        stopListening,
        speak,
        stopSpeaking
    };
}
