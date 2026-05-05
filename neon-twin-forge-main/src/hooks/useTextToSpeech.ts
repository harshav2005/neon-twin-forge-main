import { useState, useCallback } from 'react';

/**
 * Custom hook for Browser-based Text-to-Speech (TTS).
 */
const useTextToSpeech = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    const speak = useCallback((text: string) => {
        if (!window.speechSynthesis) {
            console.warn("Speech Synthesis not supported in this browser.");
            return;
        }

        // Stop any current speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Try to find a nice natural sounding voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Premium')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, []);

    const stop = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    return { speak, stop, isSpeaking };
};

export default useTextToSpeech;
