import apiClient from './api'

export default {
    // Get Modules
    getModules() {
        return apiClient.get('/modules/get_modules')
    },

    // Get Enabled Modules
    getEnabledModules() {
        return apiClient.get('/modules/enabled_modules')
    },

    // Get Single Module
    getModule(moduleId) {
        return apiClient.get(`/modules/get_module/${moduleId}`)
    },

    // Update Module
    updateModule(moduleId, payload) {
        return apiClient.put(`/modules/update_modules/${moduleId}`, payload)
    },
}
