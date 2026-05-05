import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechRecognitionOptions {
    continuous?: boolean;
    lang?: string;
}

interface UseSpeechRecognitionReturn {
    isListening: boolean;
    transcript: string;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
    hasRecognitionSupport: boolean;
}

export default function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
    const { continuous = false, lang = 'en-US' } = options;

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<any>(null);
    const shouldBeListening = useRef(false);
    // Accumulates finalized text across engine restarts
    const finalizedTextRef = useRef('');

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = continuous;
        recognition.interimResults = true;
        recognition.lang = lang;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            // Build current-session final + interim text from the live results buffer
            let sessionFinal = '';
            let interim = '';

            for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    sessionFinal += result[0].transcript;
                } else {
                    interim += result[0].transcript;
                }
            }

            // Full transcript = everything finalized in previous engine cycles + this cycle's final + interim
            const full = finalizedTextRef.current + sessionFinal + interim;
            setTranscript(full);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            // On fatal errors, stop trying
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                shouldBeListening.current = false;
                setIsListening(false);
            }
            // 'no-speech' and 'aborted' are recoverable — onend will handle restart
        };

        recognition.onend = () => {
            // Before restarting, commit whatever was finalized in the results buffer
            // to our persistent accumulator so we don't lose it on restart.
            // The onresult handler already set the transcript, so we just need
            // to snapshot the finalized portion.
            if (continuous && shouldBeListening.current) {
                // Grab all final results from the last session and add to accumulator
                // (onresult already accumulated interim into transcript, but we need
                //  to persist finals across restarts)
                const currentTranscript = transcript;
                // The transcript state includes finalizedTextRef + sessionFinal + interim
                // On restart, the session buffer resets, so we need to promote
                // everything except ongoing interim into finalizedTextRef.
                // Simplest: just set finalizedTextRef to current transcript value
                // (interim will be lost but that's expected — it wasn't finalized)
                finalizedTextRef.current = currentTranscript;

                try {
                    recognition.start();
                } catch (e) {
                    console.warn('Failed to restart recognition:', e);
                    setIsListening(false);
                }
            } else {
                setIsListening(false);
            }
        };

        recognitionRef.current = recognition;

        return () => {
            shouldBeListening.current = false;
            try { recognition.stop(); } catch (e) { /* ignore */ }
        };
    }, [continuous, lang]);

    // Keep the onend handler's closure updated with latest transcript
    useEffect(() => {
        if (!recognitionRef.current) return;
        const recognition = recognitionRef.current;
        const currentTranscriptRef = transcript; // capture for closure

        recognition.onend = () => {
            if (continuous && shouldBeListening.current) {
                finalizedTextRef.current = currentTranscriptRef;
                try {
                    recognition.start();
                } catch (e) {
                    console.warn('Failed to restart recognition:', e);
                    setIsListening(false);
                }
            } else {
                setIsListening(false);
            }
        };
    }, [transcript, continuous]);

    const startListening = useCallback(() => {
        if (!recognitionRef.current) return;
        finalizedTextRef.current = '';
        shouldBeListening.current = true;
        try {
            recognitionRef.current.start();
        } catch (e) {
            console.warn('SpeechRecognition start failed:', e);
        }
    }, []);

    const stopListening = useCallback(() => {
        shouldBeListening.current = false;
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
            setIsListening(false);
        }
    }, []);

    const resetTranscript = useCallback(() => {
        finalizedTextRef.current = '';
        setTranscript('');
    }, []);

    const hasSupport = typeof window !== 'undefined' && 
        !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
        hasRecognitionSupport: hasSupport
    };
}
