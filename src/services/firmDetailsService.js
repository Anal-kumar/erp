import apiClient from './api'

export default {
    // Get Firm Details
    getFirmDetails() {
        return apiClient.get('/firm_details/get_firm_details')
    },
}
