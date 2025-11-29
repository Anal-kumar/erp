import axios from 'axios'
import config from '../config'
import { initializeInterceptors } from '../utils/axios-interceptors'

// Create axios instance
const apiClient = axios.create({
    baseURL: `${config.apiBaseUrl}/api/${config.apiVersion}`,
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json',
    },
})

// Initialize interceptors for auth and error handling
initializeInterceptors(apiClient)

export default apiClient
