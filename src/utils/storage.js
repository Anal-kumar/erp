// Storage utility with encryption and automatic expiration
import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = 'rice-mill-erp-secret-key-2025' // In production, use env variable
const TOKEN_KEY = 'auth_token'
const USER_KEY = 'user_data'
const TOKEN_EXPIRY_KEY = 'token_expiry'
const REFRESH_TOKEN_KEY = 'refresh_token'

class StorageService {
    /**
     * Encrypt data before storing
     */
    encrypt(data) {
        try {
            return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString()
        } catch (error) {
            console.error('Encryption error:', error)
            return null
        }
    }

    /**
     * Decrypt data after retrieving
     */
    decrypt(encryptedData) {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY)
            const decryptedData = bytes.toString(CryptoJS.enc.Utf8)
            return JSON.parse(decryptedData)
        } catch (error) {
            console.error('Decryption error:', error)
            return null
        }
    }

    /**
     * Set item in localStorage with optional encryption
     */
    setItem(key, value, encrypt = false) {
        try {
            const dataToStore = encrypt ? this.encrypt(value) : JSON.stringify(value)
            localStorage.setItem(key, dataToStore)
            return true
        } catch (error) {
            console.error('Error setting item:', error)
            return false
        }
    }

    /**
     * Get item from localStorage with optional decryption
     */
    getItem(key, decrypt = false) {
        try {
            const data = localStorage.getItem(key)
            if (!data) return null

            return decrypt ? this.decrypt(data) : JSON.parse(data)
        } catch (error) {
            console.error('Error getting item:', error)
            return null
        }
    }

    /**
     * Remove item from localStorage
     */
    removeItem(key) {
        try {
            localStorage.removeItem(key)
            return true
        } catch (error) {
            console.error('Error removing item:', error)
            return false
        }
    }

    /**
     * Clear all items from localStorage
     */
    clear() {
        try {
            localStorage.clear()
            return true
        } catch (error) {
            console.error('Error clearing storage:', error)
            return false
        }
    }

    // ============ Token Management ============

    /**
     * Set authentication token with expiry
     */
    setToken(token, expiresIn = 900) { // Default 15 minutes
        const expiryTime = Date.now() + (expiresIn * 1000)
        this.setItem(TOKEN_KEY, token, true) // Encrypted
        this.setItem(TOKEN_EXPIRY_KEY, expiryTime, false)
        return true
    }

    /**
     * Get authentication token if not expired
     */
    getToken() {
        const token = this.getItem(TOKEN_KEY, true)
        const expiry = this.getItem(TOKEN_EXPIRY_KEY, false)

        if (!token || !expiry) return null

        // Check if token is expired
        if (Date.now() > expiry) {
            this.clearAuth()
            return null
        }

        return token
    }

    /**
     * Check if token is expired or about to expire
     */
    isTokenExpired() {
        const expiry = this.getItem(TOKEN_EXPIRY_KEY, false)
        if (!expiry) return true

        return Date.now() > expiry
    }

    /**
     * Check if token will expire soon (within 2 minutes)
     */
    isTokenExpiringSoon() {
        const expiry = this.getItem(TOKEN_EXPIRY_KEY, false)
        if (!expiry) return true

        const twoMinutes = 2 * 60 * 1000
        return (expiry - Date.now()) < twoMinutes
    }

    /**
     * Set refresh token
     */
    setRefreshToken(refreshToken, expiresIn = 604800) { // Default 7 days
        const expiryTime = Date.now() + (expiresIn * 1000)
        this.setItem(REFRESH_TOKEN_KEY, refreshToken, true)
        this.setItem(`${REFRESH_TOKEN_KEY}_expiry`, expiryTime, false)
        return true
    }

    /**
     * Get refresh token
     */
    getRefreshToken() {
        const refreshToken = this.getItem(REFRESH_TOKEN_KEY, true)
        const expiry = this.getItem(`${REFRESH_TOKEN_KEY}_expiry`, false)

        if (!refreshToken || !expiry) return null

        if (Date.now() > expiry) {
            this.clearAuth()
            return null
        }

        return refreshToken
    }

    /**
     * Set user data
     */
    setUser(userData) {
        return this.setItem(USER_KEY, userData, true)
    }

    /**
     * Get user data
     */
    getUser() {
        return this.getItem(USER_KEY, true)
    }

    /**
     * Clear all authentication data
     */
    clearAuth() {
        this.removeItem(TOKEN_KEY)
        this.removeItem(TOKEN_EXPIRY_KEY)
        this.removeItem(REFRESH_TOKEN_KEY)
        this.removeItem(`${REFRESH_TOKEN_KEY}_expiry`)
        this.removeItem(USER_KEY)
        return true
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const token = this.getToken()
        return token !== null
    }

    /**
     * Get user login ID
     */
    getUserLoginId() {
        const user = this.getUser()
        return user?.id || null
    }
}

// Export singleton instance
export default new StorageService()
