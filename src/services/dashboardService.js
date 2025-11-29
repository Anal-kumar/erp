import apiClient from './api'

export default {
    // Get Dashboard Data
    getDashboardData() {
        return apiClient.get('/dashboard/get_dashboard_data')
    },

    // Get Events
    getEvents() {
        return apiClient.get('/events/get_events')
    },

    // Add Event
    addEvent(payload) {
        return apiClient.post('/events/create_event', payload)
    },

    // Update Event
    updateEvent(eventId, payload) {
        return apiClient.put(`/events/update_event/${eventId}`, payload)
    },

    // Delete Event
    deleteEvent(eventId) {
        return apiClient.delete(`/events/delete_event/${eventId}`)
    },

    // --- Announcements ---
    getAnnouncements() {
        return apiClient.get('/events/get_announcements')
    },
    addAnnouncement(payload) {
        return apiClient.post('/events/create_announcement', payload)
    },
    updateAnnouncement(id, payload) {
        return apiClient.put(`/events/update_announcement/${id}`, payload)
    },
    deleteAnnouncement(id) {
        return apiClient.delete(`/events/delete_announcement/${id}`)
    },
}
