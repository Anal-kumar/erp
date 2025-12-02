import apiClient from './api'

export default {
  getOutgoingById(id) {
    return apiClient.get(`/incoming_outgoing/get_outgoing/${id}`)
  },

  getOutgoings() {
    return apiClient.get('/incoming_outgoing/get_incoming_outgoing')
  },

  createOutgoing(data) {
    return apiClient.post('/incoming_outgoing/create_outgoing', data)
  },

  updateOutgoing(id, data) {
    return apiClient.put(`/incoming_outgoing/update_outgoing/${id}`, data)
  }
}