import apiClient from './api'

export default {

  // Get DayBook entries
    getDayBookEntries() {
        return apiClient.get('/daybook/get_daybook')
    },

    // Create DayBook entry
    createDayBookEntry(payload) {
        return apiClient.post('/daybook/create_daybook', payload)
    },

    // Update DayBook entry
    updateDayBookEntry(id, payload) {
        return apiClient.put(`/daybook/update_daybook/${id}`, payload)
    },

    // Get DayBook Report
    getDayBookReport() {
        return apiClient.get('/daybook/daybook_report')
    },

    // Download DayBook Report
    downloadDayBookReport(params) {
        return apiClient.get(`/daybook/download_daybook_report?${params.toString()}`, {
            responseType: 'blob',
        })
    },
}
