import apiClient from './api'

export default {
    // --- Transactions ---
    getStockSummary() {
        return apiClient.get('/transactions/stock_summary')
    },

    // --- Brokers ---
    getBrokers() {
        return apiClient.get('/broker_details/get_broker_details')
    },
    addBroker(payload) {
        return apiClient.post('/broker_details/create_broker_details', payload)
    },
    updateBroker(brokerId, payload) {
        return apiClient.put(`/broker_details/update_broker_details/${brokerId}`, payload)
    },
    deleteBroker(brokerId) {
        return apiClient.delete(`/broker_details/delete_broker_details/${brokerId}`)
    },

    // --- Godowns ---
    getGodowns() {
        return apiClient.get('/godowns/get_godown_details')
    },
    addGodown(payload) {
        return apiClient.post('/godowns/create_godown_details', payload)
    },
    updateGodown(godownId, payload) {
        return apiClient.put(`/godowns/update_godown_details/${godownId}`, payload)
    },
    deleteGodown(godownId) {
        return apiClient.delete(`/godowns/delete_godown_details/${godownId}`)
    },

    // --- Packaging ---
    getPackagings() {
        return apiClient.get('/packagings/get_packaging_details')
    },
    addPackaging(payload) {
        return apiClient.post('/packagings/create_packaging_details', payload)
    },
    updatePackaging(packagingId, payload) {
        return apiClient.put(`/packagings/update_packaging_details/${packagingId}`, payload)
    },
    deletePackaging(packagingId) {
        return apiClient.delete(`/packagings/delete_packaging_details/${packagingId}`)
    },

    // --- Parties ---
    getParties() {
        return apiClient.get('/party_details/get_party_details')
    },
    addParty(payload) {
        return apiClient.post('/party_details/create_party_details', payload)
    },
    updateParty(partyId, payload) {
        return apiClient.put(`/party_details/update_party_details/${partyId}`, payload)
    },
    deleteParty(partyId) {
        return apiClient.delete(`/party_details/delete_party_details/${partyId}`)
    },

    // --- Stock Items ---
    getStockItems() {
        return apiClient.get('/stock_items_details/get_stock_items')
    },
    addStockItem(payload) {
        return apiClient.post('/stock_items_details/create_stock_items_details', payload)
    },
    updateStockItem(itemId, payload) {
        return apiClient.put(`/stock_items_details/update_stock_items_details/${itemId}`, payload)
    },
    deleteStockItem(itemId) {
        return apiClient.delete(`/stock_items_details/delete_stock_items_details/${itemId}`)
    },

    // --- Transporters ---
    getTransporters() {
        return apiClient.get('/transportor_details/get_transportors')
    },
    addTransporter(payload) {
        return apiClient.post('/transportor_details/create_transportor_details', payload)
    },
    updateTransporter(transporterId, payload) {
        return apiClient.put(`/transportor_details/update_transportor_details/${transporterId}`, payload)
    },
    deleteTransporter(transporterId) {
        return apiClient.delete(`/transportor_details/delete_transportor/${transporterId}`)
    },

    // --- Weighbridge ---
    getWeighbridges() {
        return apiClient.get('/wb/get_wb_operators')
    },
    addWeighbridge(payload) {
        return apiClient.post('/wb/create_wb_operator', payload)
    },
    updateWeighbridge(wbId, payload) {
        return apiClient.put(`/wb/update_wb_operator/${wbId}`, payload)
    },
    deleteWeighbridge(wbId) {
        return apiClient.delete(`/wb/delete_wb_operator/${wbId}`)
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
