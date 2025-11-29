// Centralized logging utility with environment awareness
const LOG_LEVELS = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
}

class Logger {
    constructor() {
        this.environment = import.meta.env.VITE_APP_ENV || 'development'
        this.enableLogging = import.meta.env.VITE_ENABLE_LOGGING !== 'false'
    }

    /**
     * Format log message with timestamp and context
     */
    formatMessage(level, message, context = {}) {
        const timestamp = new Date().toISOString()
        return {
            timestamp,
            level,
            message,
            environment: this.environment,
            ...context
        }
    }

    /**
     * Log error messages
     */
    error(message, error = null, context = {}) {
        if (!this.enableLogging) return

        const logData = this.formatMessage(LOG_LEVELS.ERROR, message, {
            ...context,
            error: error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : null
        })

        console.error('[ERROR]', logData)

        // In production, send to error tracking service
        if (this.environment === 'production') {
            this.sendToErrorTracking(logData)
        }
    }

    /**
     * Log warning messages
     */
    warn(message, context = {}) {
        if (!this.enableLogging) return

        const logData = this.formatMessage(LOG_LEVELS.WARN, message, context)
        console.warn('[WARN]', logData)
    }

    /**
     * Log info messages
     */
    info(message, context = {}) {
        if (!this.enableLogging) return
        if (this.environment === 'production') return // Don't log info in production

        const logData = this.formatMessage(LOG_LEVELS.INFO, message, context)
        console.info('[INFO]', logData)
    }

    /**
     * Log debug messages
     */
    debug(message, context = {}) {
        if (!this.enableLogging) return
        if (this.environment !== 'development') return // Only in development

        const logData = this.formatMessage(LOG_LEVELS.DEBUG, message, context)
        console.debug('[DEBUG]', logData)
    }

    /**
     * Log API requests
     */
    logRequest(method, url, data = null) {
        this.debug('API Request', {
            method,
            url,
            data: data ? JSON.stringify(data) : null
        })
    }

    /**
     * Log API responses
     */
    logResponse(method, url, status, data = null) {
        this.debug('API Response', {
            method,
            url,
            status,
            data: data ? JSON.stringify(data) : null
        })
    }

    /**
     * Send error to tracking service (placeholder for future integration)
     */
    sendToErrorTracking(logData) {
        // TODO: Integrate with error tracking service like Sentry
        // Example: Sentry.captureException(logData)
        console.log('Would send to error tracking:', logData)
    }

    /**
     * Log user action for analytics
     */
    logUserAction(action, details = {}) {
        this.info('User Action', {
            action,
            ...details
        })

        // In production, send to analytics service
        if (this.environment === 'production') {
            this.sendToAnalytics({ action, ...details })
        }
    }

    /**
     * Send to analytics service (placeholder)
     */
    sendToAnalytics(data) {
        // TODO: Integrate with analytics service
        console.log('Would send to analytics:', data)
    }
}

// Export singleton instance
export default new Logger()
