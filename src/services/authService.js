import axios from 'axios';
import config from '../config';
import storage from '../utils/storage';
import logger from '../utils/logger';

const API_URL = config.apiBaseUrl;

const authService = {
    async login(username, password) {
        try {
            logger.info('Login attempt', { username });

            const response = await apiClient.post(`/auth/login`, {
                username,
                password,
            });

            if (response.data.access_token) {
                const { access_token, user, expires_in } = response.data;

                // Store token with expiration using new storage utility
                storage.setToken(access_token, expires_in || config.tokenExpiry);

                // Store user data
                storage.setUser(user);

                logger.info('Login successful', { userId: user.id });
            }

            return response.data;
        } catch (error) {
            logger.error('Login failed', error, { username });
            throw error;
        }
    },

    async logout() {
        try {
            const token = storage.getToken();

            if (token) {
                // Call backend logout endpoint to blacklist token
                await axios.post(`${API_URL}/auth/logout`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            // Clear all auth data
            storage.clearAuth();
            logger.info('Logout successful');
        } catch (error) {
            // Clear auth data even if API call fails
            storage.clearAuth();
            logger.error('Logout error', error);
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
