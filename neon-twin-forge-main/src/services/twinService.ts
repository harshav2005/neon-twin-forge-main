import api from './api';

export interface OnboardingAnswer {
    question: string;
    answer: string;
}

export interface ExtractedMemory {
    originalText?: string;
    analyzedSummary?: string;
    category: string;
    importance: number;
    source: string;
}

const twinService = {
    // ── Twin Profile ──
    getProfile: async () => {
        const response = await api.get('/twin/profile');
        return response.data;
    },

    /**
     * Analyzes onboarding answers and returns a profile + memory preview.
     * Accepts structured { answers, transcript } instead of raw text.
     */
    analyze: async (answersOrText: OnboardingAnswer[] | string, transcript?: string) => {
        // Support both structured array and legacy plain text
        if (Array.isArray(answersOrText)) {
            const response = await api.post('/twin/analyze', { answers: answersOrText, transcript: transcript || '' });
            return response.data;
        } else {
            // Legacy plain text fallback
            const response = await api.post('/twin/analyze', { text: answersOrText });
            return response.data;
        }
    },

    /**
     * Saves twin profile AND persists onboarding memories to vector store.
     * Pass answers[] so the backend can extract and embed memories.
     */
    updateProfile: async (profileData: any) => {
        const response = await api.put('/twin/update', profileData);
        return response.data;
    },

    initialize: async (payload: { answers: OnboardingAnswer[], transcript?: string, longTermMemory: boolean }) => {
        const response = await api.post('/twin/initialize', payload);
        return response.data;
    },

    // ── Chat & RAG ──
    chat: async (message: string, sessionId: string) => {
        const response = await api.post('/chat/send', { message, sessionId });
        return response.data;
    },

    // ── Long-Term Memory ──
    getMemories: async () => {
        const response = await api.get('/memory');
        return response.data;
    },

    saveMemory: async (memoryData: { memoryText: string, category: string, importance: number }) => {
        const response = await api.post('/memory/save', memoryData);
        return response.data;
    },

    updateMemory: async (id: string, memoryData: any) => {
        const response = await api.put(`/memory/${id}`, memoryData);
        return response.data;
    },

    deleteMemory: async (id: string) => {
        const response = await api.delete(`/memory/${id}`);
        return response.data;
    },

    clearAllMemories: async () => {
        const response = await api.delete('/memory/clear/all');
        return response.data;
    },

    // ── Chat Sessions & History ──
    getSessions: async () => {
        const response = await api.get('/chat/sessions');
        return response.data || [];
    },

    getHistory: async (sessionId: string) => {
        const response = await api.get('/chat/history', { params: { sessionId } });
        return response.data || [];
    },

    clearHistory: async (sessionId: string) => {
        const response = await api.delete('/chat/history', { data: { sessionId } });
        return response.data;
    },

    // ── Voice Memory ──
    saveVoiceMemory: async (transcript: string) => {
        const response = await api.post('/voice-memory', { transcript });
        return response.data;
    },

    getVoiceMemories: async () => {
        const response = await api.get('/voice-memory');
        return response.data;
    },

    deleteVoiceMemory: async (id: string) => {
        const response = await api.delete(`/voice-memory/${id}`);
        return response.data;
    },

    searchVoiceMemories: async (query: string) => {
        const response = await api.post('/voice-memory/search', { query });
        return response.data;
    }
};

export default twinService;
