import apiClient from './api'

export default {
    // Set Database
    setDatabase(payload) {
        return apiClient.post('/backups/set-database', payload)
    },

    // Get Current Database
    getCurrentDatabase() {
        return apiClient.get('/backups/current-database')
    },

    // List Databases
    getDatabases() {
        return apiClient.get('/backups/databases')
    },

    // Download Backup
    downloadBackup() {
        return apiClient.get('/backups/backup_data', {
            responseType: 'blob',
        })
    },

    // Restore Database
    restoreDatabase(formData) {
        return apiClient.post('/backups/restore', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    },

    // Delete Database
    deleteDatabase() {
        return apiClient.delete('/backups/delete_database')
    },
}
