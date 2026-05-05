import api from './api';

const authService = {
    register: async (userData: any) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            // Optionally store refresh token: localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        return response.data;
    },

    login: async (userData: any) => {
        const response = await api.post('/auth/login', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    logout: async () => {
        // Optional: Call backend logout if invalidating refresh tokens
        try {
            await api.post('/auth/logout');
        } catch (e) {
            console.error("Logout error", e);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Clear frontend memory/chat cache
        sessionStorage.clear();
    }
};

export default authService;
