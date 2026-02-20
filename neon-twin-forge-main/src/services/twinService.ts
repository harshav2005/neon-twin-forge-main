import api from './api';

const twinService = {
    // Get Twin Profile
    getProfile: async () => {
        const response = await api.get('/twin/profile');
        return response.data;
    },

    // Update Twin Profile (Personality, Preferences)
    updateProfile: async (profileData: any) => {
        const response = await api.post('/twin/profile', profileData);
        return response.data;
    },

    // Run Simulation (Chat/Scenario)
    simulate: async (scenario: string) => {
        const response = await api.post('/twin/simulate', { scenario });
        return response.data;
    },

    // Chat with Twin
    chat: async (message: string) => {
        const response = await api.post('/twin/chat', { message });
        return response.data;
    },

    // Get Chat History
    getHistory: async () => {
        const response = await api.get('/twin/chat/history');
        return response.data;
    }
};

export default twinService;
