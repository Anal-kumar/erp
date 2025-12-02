import storage from '../utils/storage';
import logger from '../utils/logger';
import apiClient from './api';


const authService = {
    async login(credentials) {
        try {
            const response = await apiClient.post(`/login`, {
                user_login_id: credentials.user_login_id,
                password: credentials.password,
            });

            if (response.data.access_token) {
                const { access_token, user, expires_in } = response.data;

                // Store token with expiration using new storage utility
                storage.setToken(access_token, expires_in);

                // Store user data
                storage.setUser(user);

            }

            return response.data;
        } catch (error) {
            logger.error('Login failed', error, { username: credentials.user_login_id });
            throw error;
        }
    },

    async getUserProfile() {
        try {
            const response = await apiClient.get(`/users/me`);
            return response.data;
        } catch (error) {
            logger.error('Get user profile failed', error);
            throw error;
        }
    },

    async refreshToken() {
        try {
            const token = storage.getToken();

            if (token) {
                // Call backend refresh token endpoint
                const response = await apiClient.post(`/login/refresh-token`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.access_token) {
                    const { access_token, expires_in } = response.data;

                    // Store new token with expiration
                    storage.setToken(access_token, expires_in);
                }
            }
        } catch (error) {
            logger.error('Refresh token error', error);
            throw error;
        }
    },

    getCurrentUser() {
        return storage.getUser();
    },

    getToken() {
        return storage.getToken();
    },

    isAuthenticated() {
        return storage.isAuthenticated();
    },

    getUserLoginId() {
        return storage.getUserLoginId();
    }
};

export default authService;
