import apiClient from './api'

export default {
    // Get Reminders
    getReminders() {
        return apiClient.get('/reminders/get_reminders')
    },

    // Create Reminder
    createReminder(payload) {
        return apiClient.post('/reminders/create_reminder', payload)
    },

    // Update Reminder
    updateReminder(id, payload) {
        return apiClient.put(`/reminders/update_reminder/${id}`, payload)
    },

    // Delete Reminder
    deleteReminder(id) {
        return apiClient.delete(`/reminders/delete_reminder/${id}`)
    },

    // Get Latest Renewal Dates
    getLatestRenewalDates() {
        return apiClient.get('/renewal/get_latest_renewal_dates')
    },

    // Get Renewal History
    getRenewalHistory(reminderId) {
        return apiClient.get(`/reminders/get_renewal_history/${reminderId}`)
    },

    // Renew Document
    renewDocument(payload) {
        return apiClient.post('/renewal/renewal_doc', payload)
    },
}
