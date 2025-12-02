import apiClient from './api'

export default {
    // --- Batch Operators ---
    getBatchOperators() {
        return apiClient.get('/batch_operators/get_operators')
    },
    createBatchOperator(payload) {
        return apiClient.post('/batch_operators/create_operator', payload)
    },
    updateBatchOperator(id, payload) {
        return apiClient.put(`/batch_operators/update_operator/${id}`, payload)
    },

    // --- Clerks ---
    getClerks() {
        return apiClient.get('/clerks/clerks/')
    },
    createClerk(payload) {
        return apiClient.post('/clerks/clerk/', payload)
    },
    updateClerk(id, payload) {
        return apiClient.put(`/clerks/clerk/${id}`, payload)
    },

    // --- Batches ---
    getBatches() {
        return apiClient.get('/batches/get_all_batches')
    },
    createBatch(payload) {
        return apiClient.post('/batches/create_batch', payload)
    },
    updateBatch(id, payload) {
        return apiClient.put(`/batches/update_batch/${id}`, payload)
    },

    // --- Steam On ---
    getSteamOnDetails() {
        return apiClient.get('/steam_on/get_steam_ons')
    },
    createSteamOn(payload) {
        return apiClient.post('/steam_on/create_steam_on', payload)
    },
    updateSteamOn(id, payload) {
        return apiClient.put(`/steam_on/update_steam_on/${id}`, payload)
    },

    // --- Steam Off ---
    getSteamOffDetails() {
        return apiClient.get('/steam_off/get_all_steam_offs')
    },
    createSteamOff(payload) {
        return apiClient.post('/steam_off/create_steam_off', payload)
    },
    updateSteamOff(id, payload) {
        return apiClient.put(`/steam_off/update_steam_off/${id}`, payload)
    },

    // --- Drainage ---
    getDrainageDetails() {
        return apiClient.get('/drainages/get_drainages')
    },
    createDrainage(payload) {
        return apiClient.post('/drainages/create_drainage', payload)
    },

    // --- Immerse ---
    getImmerseDetails() {
        return apiClient.get('/immerses/get_immerses')
    },
    createImmerse(payload) {
        return apiClient.post('/immerses/create_immerse', payload)
    },

    updateImmerse(id, payload) {
        return apiClient.put(`/immerses/update_immerse/${id}`, payload)
    },

    // --- Milling Analysis ---
    getMillingAnalysisDetails() {
        return apiClient.get('/milling_analysis/get_milling_analysis')
    },
    createMillingAnalysis(payload) {
        return apiClient.post('/milling_analysis/create_milling_analysis', payload)
    },

    updateMillingAnalysis(id, payload) {
        return apiClient.put(`/milling_analysis/update_milling_analysis/${id}`, payload)
    },

    // --- Sorting Analysis ---
    getSortingAnalysisDetails() {
        return apiClient.get('/sorting_analysis/get_sorting_analysis/')
    },
    createSortingAnalysis(payload) {
        return apiClient.post('/sorting_analysis/create_sorting_analysis', payload)
    },
    updateSortingAnalysis(id, payload) {
        return apiClient.put(`/sorting_analysis/update_sorting_analysis/${id}`, payload)
    },

    // --- Cross Verification ---
    getCrossVerificationDetails() {
        return apiClient.get('/cross_verifications/get_cross_verifications/')
    },
    createCrossVerification(payload) {
        return apiClient.post('/cross_verifications/create_cross_verification', payload)
    },
    updateCrossVerification(id, payload) {
        return apiClient.put(`/cross_verifications/update_cross_verification/${id}`, payload)
    },

    // --- Lot Details ---
    getLotDetailsById(id) {
        return apiClient.get(`/lots/get_lot/${id}`)
    },
    getLotDetails() {
        return apiClient.get('/lots/get_all_lots')
    },
    createLotDetails(payload) {
        return apiClient.post('/lots/create_lot', payload)
    },
    updateLotDetails(id, payload) {
      return apiClient.put(`/lots/update_lot/${id}`, payload)
    },
    downloadLotReport(params) {
      return apiClient.get('/lots/generate_lot_report', {
        responseType: 'blob',
        params: params,
      });
    }
}
