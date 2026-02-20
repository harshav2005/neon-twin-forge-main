import api from './api';

const metricsService = {
    // Get latest metrics for the dashboard
    getLatest: async () => {
        const response = await api.get('/metrics/latest');
        return response.data;
    },

    // Get monthly history for charts
    getMonthly: async () => {
        const response = await api.get('/metrics/monthly');
        return response.data;
    },

    // Get aggregated analytics
    getAnalytics: async () => {
        const response = await api.get('/metrics/analytics');
        return response.data;
    },

    // Add new metrics (e.g., from a wearable or manual input)
    add: async (data: any) => {
        const response = await api.post('/metrics', data);
        return response.data;
    }
};

export default metricsService;
