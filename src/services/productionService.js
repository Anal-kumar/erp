import apiClient from './api'

export default {
    // --- Batch Operators ---
    getBatchOperators() {
        return apiClient.get('/production/get_batch_operators')
    },
    createBatchOperator(payload) {
        return apiClient.post('/production/create_batch_operator', payload)
    },
    updateBatchOperator(id, payload) {
        return apiClient.put(`/production/update_batch_operator/${id}`, payload)
    },

    // --- Clerks ---
    getClerks() {
        return apiClient.get('/production/get_clerks')
    },
    createClerk(payload) {
        return apiClient.post('/production/create_clerk', payload)
    },
    updateClerk(id, payload) {
        return apiClient.put(`/production/update_clerk/${id}`, payload)
    },

    // --- Batches ---
    getBatches() {
        return apiClient.get('/production/get_all_batches')
    },
    createBatch(payload) {
        return apiClient.post('/production/create_batch', payload)
    },
    updateBatch(id, payload) {
        return apiClient.put(`/production/update_batch/${id}`, payload)
    },

    // --- Steam On ---
    getSteamOnDetails() {
        return apiClient.get('/production/get_steam_on_details')
    },
    createSteamOn(payload) {
        return apiClient.post('/production/create_steam_on', payload)
    },

    // --- Steam Off ---
    getSteamOffDetails() {
        return apiClient.get('/production/get_steam_off_details')
    },
    createSteamOff(payload) {
        return apiClient.post('/production/create_steam_off', payload)
    },

    // --- Drainage ---
    getDrainageDetails() {
        return apiClient.get('/production/get_drainage_details')
    },
    createDrainage(payload) {
        return apiClient.post('/production/create_drainage', payload)
    },

    // --- Immerse ---
    getImmerseDetails() {
        return apiClient.get('/production/get_immerse_details')
    },
    createImmerse(payload) {
        return apiClient.post('/production/create_immerse', payload)
    },

    // --- Milling Analysis ---
    getMillingAnalysisDetails() {
        return apiClient.get('/production/get_milling_analysis_details')
    },
    createMillingAnalysis(payload) {
        return apiClient.post('/production/create_milling_analysis', payload)
    },

    // --- Sorting Analysis ---
    getSortingAnalysisDetails() {
        return apiClient.get('/production/get_sorting_analysis_details')
    },
    createSortingAnalysis(payload) {
        return apiClient.post('/production/create_sorting_analysis', payload)
    },

    // --- Cross Verification ---
    getCrossVerificationDetails() {
        return apiClient.get('/production/get_cross_verification_details')
    },
    createCrossVerification(payload) {
        return apiClient.post('/production/create_cross_verification', payload)
    },

    // --- Lot Details ---
    getLotDetails() {
        return apiClient.get('/production/get_lot_details')
    },
    createLotDetails(payload) {
        return apiClient.post('/production/create_lot_details', payload)
    },
}
