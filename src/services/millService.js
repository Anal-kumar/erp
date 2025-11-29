import apiClient from './api'

export default {
    // --- Transactions ---
    getStockSummary() {
        return apiClient.get('/transactions/stock_summary')
    },

    // --- Brokers ---
    getBrokers() {
        return apiClient.get('/master_data/get_broker_details')
    },
    addBroker(payload) {
        return apiClient.post('/master_data/create_broker_details', payload)
    },
    updateBroker(brokerId, payload) {
        return apiClient.put(`/master_data/update_broker_details/${brokerId}`, payload)
    },
    deleteBroker(brokerId) {
        return apiClient.delete(`/master_data/delete_broker_details/${brokerId}`)
    },

    // --- Godowns ---
    getGodowns() {
        return apiClient.get('/master_data/get_godown_details')
    },
    addGodown(payload) {
        return apiClient.post('/master_data/create_godown_details', payload)
    },
    updateGodown(godownId, payload) {
        return apiClient.put(`/master_data/update_godown_details/${godownId}`, payload)
    },
    deleteGodown(godownId) {
        return apiClient.delete(`/master_data/delete_godown_details/${godownId}`)
    },

    // --- Packaging ---
    getPackagings() {
        return apiClient.get('/master_data/get_packaging_details')
    },
    addPackaging(payload) {
        return apiClient.post('/master_data/create_packaging_details', payload)
    },
    updatePackaging(packagingId, payload) {
        return apiClient.put(`/master_data/update_packaging_details/${packagingId}`, payload)
    },
    deletePackaging(packagingId) {
        return apiClient.delete(`/master_data/delete_packaging_details/${packagingId}`)
    },

    // --- Parties ---
    getParties() {
        return apiClient.get('/master_data/get_party_details')
    },
    addParty(payload) {
        return apiClient.post('/master_data/create_party_details', payload)
    },
    updateParty(partyId, payload) {
        return apiClient.put(`/master_data/update_party_details/${partyId}`, payload)
    },
    deleteParty(partyId) {
        return apiClient.delete(`/master_data/delete_party_details/${partyId}`)
    },

    // --- Stock Items ---
    getStockItems() {
        return apiClient.get('/master_data/get_stock_items_details')
    },
    addStockItem(payload) {
        return apiClient.post('/master_data/create_stock_items_details', payload)
    },
    updateStockItem(itemId, payload) {
        return apiClient.put(`/master_data/update_stock_items_details/${itemId}`, payload)
    },
    deleteStockItem(itemId) {
        return apiClient.delete(`/master_data/delete_stock_items_details/${itemId}`)
    },

    // --- Transporters ---
    getTransporters() {
        return apiClient.get('/master_data/get_transportor_details')
    },
    addTransporter(payload) {
        return apiClient.post('/master_data/create_transportor_details', payload)
    },
    updateTransporter(transporterId, payload) {
        return apiClient.put(`/master_data/update_transportor_details/${transporterId}`, payload)
    },
    deleteTransporter(transporterId) {
        return apiClient.delete(`/master_data/delete_transportor/${transporterId}`)
    },

    // --- Weighbridge ---
    getWeighbridges() {
        return apiClient.get('/master_data/get_weight_bridge_operator_details')
    },
    addWeighbridge(payload) {
        return apiClient.post('/master_data/create_weight_bridge_operator_details', payload)
    },
    updateWeighbridge(wbId, payload) {
        return apiClient.put(`/master_data/update_weight_bridge_operator_details/${wbId}`, payload)
    },
    deleteWeighbridge(wbId) {
        return apiClient.delete(`/master_data/delete_weight_bridge_operator_details/${wbId}`)
    },

    // --- Transactions (Sales/Purchase) ---
    getTransactions() {
        return apiClient.get('/transactions/get_transactions')
    },
    addTransaction(payload) {
        return apiClient.post('/transactions/create_transaction', payload)
    },
    updateTransaction(transactionId, payload) {
        return apiClient.put(`/transactions/update_transaction/${transactionId}`, payload)
    },
    deleteTransaction(transactionId) {
        return apiClient.delete(`/transactions/delete_transaction/${transactionId}`)
    },
    getTransactionById(transactionId) {
        return apiClient.get(`/transactions/get_transaction/${transactionId}`)
    },
    downloadTransactionReport(params) {
        return apiClient.get('/transactions/download_transaction_report', {
            params,
            responseType: 'blob',
        })
    },
}
