// Environment-based configuration
const config = {
  development: {
    apiBaseUrl: 'http://192.168.1.49:8000',
    apiVersion: import.meta.env.VITE_API_VERSION,
    tokenExpiry: 900, // 15 minutes
    refreshTokenExpiry: 604800, // 7 days
    enableLogging: true,
    environment: 'development'
  },
  staging: {
    apiBaseUrl: 'http://staging-api.ricemillerp.com',
    apiVersion: import.meta.env.VITE_API_VERSION,
    tokenExpiry: 900,
    refreshTokenExpiry: 604800,
    enableLogging: true,
    environment: 'staging'
  },
  production: {
    apiBaseUrl: 'https://api.ricemillerp.com',
    apiVersion: import.meta.env.VITE_API_VERSION,
    tokenExpiry: 900,
    refreshTokenExpiry: 604800,
    enableLogging: false,
    environment: 'production'
  }
}

// Get current environment from env variable or default to development
const currentEnv = import.meta.env.VITE_APP_ENV || 'development'

// Export configuration for current environment
export default {
  ...config[currentEnv],
  // Allow env variables to override config
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || config[currentEnv].apiBaseUrl,
  tokenExpiry: import.meta.env.VITE_TOKEN_EXPIRY || config[currentEnv].tokenExpiry,
  enableLogging: import.meta.env.VITE_ENABLE_LOGGING !== 'false',
}
