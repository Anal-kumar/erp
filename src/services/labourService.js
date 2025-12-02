import apiClient from './api'

export default {
    // --- Labour Gangs ---
    getLabourGangs() {
        return apiClient.get('/labour-gang/get_labour_gang')
    },
    createLabourGang(payload) {
        return apiClient.post('/labour-gang/create_labour_gang', payload)
    },
    updateLabourGang(id, payload) {
        return apiClient.put(`/labour-gang/update_labour_gang/${id}`, payload)
    },

    // --- Labour Work Items ---
    getLabourWorkItems() {
        return apiClient.get('/work-items/get_labour_work_item')
    },
    createLabourWorkItem(payload) {
        return apiClient.post('/work-items/create_labour_work_item', payload)
    },
    updateLabourWorkItem(id, payload) {
        return apiClient.put(`/work-items/update_labour_work_item/${id}`, payload)
    },

    // --- Labour Work Particulars ---
    getLabourWorkParticulars() {
        return apiClient.get('/work-particular/get_labour_work_particulars_details')
    },
    createLabourWorkParticulars(payload) {
        return apiClient.post('/work-particular/create_labour_work_particulars', payload)
    },
    updateLabourWorkParticulars(id, payload) {
        return apiClient.put(`/work-particular/update_labour_work_particulars/${id}`, payload)
    },

    // --- Labour Work Locations ---
    getLabourWorkLocations() {
        return apiClient.get('/work-location/get_labour_work_location_details')
    },
    createLabourWorkLocation(payload) {
        return apiClient.post('/work-location/create_labour_work_location', payload)
    },
    updateLabourWorkLocation(id, payload) {
        return apiClient.put(`/work-location/update_labour_work_location/${id}`, payload)
    },

    // --- Labour Bag Packagings ---
    getLabourBagPackagings() {
        return apiClient.get('/bag-packaging/get_labour_bag_packaging_details')
    },
    createLabourBagPackaging(payload) {
        return apiClient.post('/bag-packaging/create_labour_bag_packaging', payload)
    },
    updateLabourBagPackaging(id, payload) {
        return apiClient.put(`/bag-packaging/update_labour_bag_packaging/${id}`, payload)
    },

    // --- Labour Payment Vouchers ---
    getVouchers() {
        return apiClient.get('/labour-payment-vouchers/get_vouchers')
    },
    getVoucher(id) {
        return apiClient.get(`/labour-payment-vouchers/get_voucher/${id}`)
    },
    createVoucher(payload) {
        return apiClient.post('/labour-payment-vouchers/create_voucher', payload)
    },
    updateVoucher(id, payload) {
        return apiClient.put(`/labour-payment-vouchers/update_voucher/${id}`, payload)
    },
    downloadVouchersReport(params) {
        return apiClient.get('/labour-payment-vouchers/download_labour_payment_vouchers', {
            params,
            responseType: 'blob',
        })
    },
}
