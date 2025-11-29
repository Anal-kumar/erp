import apiClient from './api'

export default {
    // --- Firm Details ---
    getSerialKeyStatus() {
        return apiClient.get('/firm_details/serial_key_status')
    },
    getFirmDetails() {
        return apiClient.get('/firm_details/get_firm_details')
    },
    updateFirmDetails(payload) {
        return apiClient.put('/firm_details/update_firm_details', payload)
    },

    // --- User Management ---
    getAllUsers() {
        return apiClient.get('/users/get_users')
    },
    createUser(payload) {
        return apiClient.post('/users/create_user', payload)
    },
    updateUser(userId, payload) {
        return apiClient.put(`/users/update_user/${userId}`, payload)
    },
    deleteUser(userId) {
        return apiClient.delete(`/users/delete_user/${userId}`)
    },
}
