// Axios interceptors for authentication and error handling
import axios from 'axios'
import storage from './storage'
import logger from './logger'
import { useToast } from 'vue-toastification'

const toast = useToast()

/**
 * Setup request interceptor
 */
export const setupRequestInterceptor = (axiosInstance) => {
    axiosInstance.interceptors.request.use(
        (config) => {
            // Add auth token to headers
            const token = storage.getToken()
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }

            // Log request in development
            logger.logRequest(config.method?.toUpperCase(), config.url, config.data)

            return config
        },
        (error) => {
            logger.error('Request interceptor error', error)
            return Promise.reject(error)
        }
    )
}

/**
 * Setup response interceptor
 */
export const setupResponseInterceptor = (axiosInstance) => {
    axiosInstance.interceptors.response.use(
        (response) => {
            // Log response in development
            logger.logResponse(
                response.config.method?.toUpperCase(),
                response.config.url,
                response.status,
                response.data
            )

            return response
        },
        async (error) => {
            const originalRequest = error.config

            // Log error
            logger.error('API Error', error, {
                url: error.config?.url,
                method: error.config?.method,
                status: error.response?.status
            })

            // Handle 401 Unauthorized - Token expired
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true

                try {
                    // Try to refresh token
                    const refreshToken = storage.getRefreshToken()

                    if (refreshToken) {
                        const response = await axios.post('/auth/refresh', {
                            refresh_token: refreshToken
                        })

                        const { access_token, expires_in } = response.data

                        // Update token in storage
                        storage.setToken(access_token, expires_in)

                        // Retry original request with new token
                        originalRequest.headers.Authorization = `Bearer ${access_token}`
                        return axiosInstance(originalRequest)
                    } else {
                        // No refresh token, redirect to login
                        handleAuthError()
                    }
                } catch (refreshError) {
                    logger.error('Token refresh failed', refreshError)
                    handleAuthError()
                    return Promise.reject(refreshError)
                }
            }

            // Handle 403 Forbidden
            if (error.response?.status === 403) {
                toast.error('You do not have permission to perform this action')
            }

            // Handle 404 Not Found
            if (error.response?.status === 404) {
                toast.error('The requested resource was not found')
            }

            // Handle 429 Too Many Requests
            if (error.response?.status === 429) {
                toast.error('Too many requests. Please try again later.')
            }

            // Handle 500 Server Error
            if (error.response?.status >= 500) {
                toast.error('Server error. Please try again later.')
            }

            // Handle network errors
            if (!error.response) {
                toast.error('Network error. Please check your connection.')
            }

            return Promise.reject(error)
        }
    )
}

/**
 * Handle authentication errors
 */
const handleAuthError = () => {
    storage.clearAuth()
    toast.error('Session expired. Please login again.')

    // Redirect to login page
    window.location.href = '/login'
}

/**
 * Initialize all interceptors
 */
export const initializeInterceptors = (axiosInstance) => {
    setupRequestInterceptor(axiosInstance)
    setupResponseInterceptor(axiosInstance)
}
