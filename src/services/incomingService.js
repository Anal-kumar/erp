import apiClient from './api'

export default {
    getIncomings() {
        return apiClient.get('/incoming_outgoing/get_incoming_outgoing')
    },
    getIncomingById(id) {
        return apiClient.get(`/incoming_outgoing/get_incoming/${id}`)
    },

    createIncoming(data) {
        return apiClient.post('/incoming_outgoing/create_incoming', data)
    },

    updateIncoming(id, data) {
        return apiClient.put(`/incoming_outgoing/update_incoming/${id}`, data)
    }
}