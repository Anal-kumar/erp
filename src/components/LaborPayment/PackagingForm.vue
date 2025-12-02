<template>
  <v-container fluid>
    <v-row>
      <!-- Form -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="rounded-lg">
          <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
            {{ isEditMode ? 'Update Packaging' : 'Add Packaging' }}
          </v-card-title>
          <v-card-text class="pa-4">
            <v-form @submit.prevent="isEditMode ? updatePackaging() : addPackaging()">
              <!-- Bag Weight -->
              <v-text-field v-model="form.bag_weight" label="Bag Weight (kg)" placeholder="Enter bag weight"
                variant="outlined" density="compact" class="mb-2" type="number" min="0" step="1"
                :rules="[v => (!!v && v > 0) || 'Bag weight must be a positive integer']"></v-text-field>

              <!-- Remarks -->
              <v-textarea v-model="form.remarks" label="Remarks" placeholder="Enter remarks" variant="outlined"
                density="compact" class="mb-2" rows="3" @input="form.remarks = $event.target.value.toUpperCase()"
                maxlength="50" counter
                :rules="[v => !!v || 'Remarks is required', v => (v && v.length <= 50) || 'Remarks must not exceed 50 characters']"></v-textarea>

              <!-- Buttons -->
              <div class="d-flex justify-center ga-2 mt-4">
                <v-btn type="submit" color="primary" class="text-white">
                  {{ isEditMode ? 'Update' : 'Add' }}
                </v-btn>
                <v-btn v-if="isEditMode" color="error" class="text-white" @click="cancelEdit">
                  Cancel
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Table -->
      <v-col cols="12" md="8">
        <v-card elevation="2" class="rounded-lg h-100">
          <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-grey-lighten-3">
            Packaging List
          </v-card-title>
          <v-card-text class="pa-0">
            <v-data-table :headers="headers" :items="packagings" :items-per-page="firm.page_size || 10"
              density="compact" class="elevation-0" hover>
              <template v-slot:item.sno="{ index }">
                {{ index + 1 }}
              </template>
              <template v-slot:item.actions="{ item }">
                <v-icon color="primary" @click="editPackaging(item)" class="cursor-pointer">mdi-pencil</v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import storage from '@/utils/storage'
import { labourService, firmDetailsService, getModuleStatus } from '@/services'
import { useToast } from 'vue-toastification'

const toast = useToast()
const isEditMode = ref(false)
const selectedPackagingId = ref(null)
const isModuleEnabled = ref(false)
const packagings = ref([])
const firm = ref({ page_size: 10 })
const user = storage.getUser() || null;
const form = reactive({
  bag_weight: '',
  remarks: '',
})

const headers = [
  { title: 'SNO', key: 'sno', align: 'center', sortable: false },
  { title: 'BAG WEIGHT (kg)', key: 'bag_weight', align: 'center' },
  { title: 'REMARKS', key: 'remarks', align: 'center' },
  { title: 'ACTIONS', key: 'actions', align: 'center', sortable: false },
]

// Form validation
const validateForm = () => {
  if (!form.bag_weight || isNaN(form.bag_weight) || parseInt(form.bag_weight) <= 0) {
    toast.error('Bag weight must be a positive integer.')
    return false
  }
  if (!form.remarks.trim()) {
    toast.error('Remarks is required.')
    return false
  }
  if (form.remarks.trim().length > 50) {
    toast.error('Remarks must not exceed 50 characters.')
    return false
  }
  return true
}

// fetch firm details
const fetchFirmDetails = async () => {
  try {
    const response = await firmDetailsService.getFirmDetails()

    if (response.status === 200 && response.data) {
      firm.value = {
        firm_name: response.data.firm_name || 'Unknown Firm',
        firm_address: response.data.firm_address || 'Unknown Address',
        page_size: response.data.page_size || 10
      }
    } else {
      firm.value = {
        firm_name: 'Unavailable',
        firm_address: 'Unavailable',
        page_size: 10
      }
      toast.error('Failed to fetch firm details: Invalid response')
    }
  } catch (err) {
    console.error('Failed to fetch firm details:', err)
    firm.value = {
      firm_name: 'Error',
      firm_address: 'Error',
      page_size: 10
    }
    toast.error('Failed to fetch firm details')
  }
};
const fetchPackagings = async () => {
  try {
    const response = await labourService.getLabourBagPackagings()
    if (response.status === 200) {
      packagings.value = response.data
    }
  } catch (error) {
    console.error('Error fetching packaging details:', error)
    toast.error('Failed to fetch packaging details.')
  }
}
// Fetch module status
const fetchModuleStatus = async () => {
  try {
    const response = await getModuleStatus()

    const modules = response.data
    const labourPaymentModule = modules.find((m) => m.module_name === 'labour_payment')
    if (!labourPaymentModule) {
      console.warn('Labour Payment module not found')
      isModuleEnabled.value = false
      toast.error('Labour payment module not found. Contact support.')
      return
    }
    isModuleEnabled.value = labourPaymentModule.module_enabled

  } catch (error) {
    console.error('Error fetching module status:', error)
    isModuleEnabled.value = false
    toast.error('Failed to fetch module status. Please check your network or contact support.')
  }
}
onMounted(() => {
  fetchPackagings()
  fetchModuleStatus()
  fetchFirmDetails()
})

const addPackaging = async () => {
  if (!isModuleEnabled.value) {
    toast.info('Please purchase the Laybor payment module to add a packaging.')
    return
  }
  if (!validateForm()) return
  try {
    const payload = {
      bag_weight: parseInt(form.bag_weight), // Use parseInt for integer
      remarks: form.remarks.trim(),
    }

    const response = await labourService.createLabourBagPackaging(payload)
    if (response.status === 200 || response.status === 201) {
      toast.success('Packaging Added Successfully!')
      form.bag_weight = ''
      form.remarks = ''
    }
    fetchPackagings()
    fetchModuleStatus()
  } catch (error) {
    console.error('Error submitting form:', JSON.stringify(error.response?.data, null, 2))
    toast.error(error.response?.data?.detail || 'Failed to save packaging details.')
  }
}

const editPackaging = (packaging) => {
  if (!user || user.role !== 'admin') {
    toast.error('Only admin can edit packaging list');
    return;
  }
  isEditMode.value = true
  selectedPackagingId.value = packaging.id
  form.bag_weight = packaging.bag_weight
  form.remarks = packaging.remarks
}

const updatePackaging = async () => {
  if (!validateForm()) return
  try {
    const payload = {
      id: selectedPackagingId.value,
      bag_weight: form.bag_weight, // Use parseInt for integer
      remarks: form.remarks.trim(),
    }
    const response = await labourService.updateLabourBagPackaging(payload)
    if (response.status === 200 || response.status === 201) {
      toast.success('Packaging details updated')
      form.bag_weight = ''
      form.remarks = ''
      isEditMode.value = false
      selectedPackagingId.value = null
      fetchPackagings()
      fetchModuleStatus()
    }
  } catch (error) {
    console.error('Error updating:', JSON.stringify(error.response?.data, null, 2))
    toast.error(error.response?.data?.detail || 'Failed to update packaging details')
  }
}

const cancelEdit = () => {
  isEditMode.value = false
  selectedPackagingId.value = null
  form.bag_weight = ''
  form.remarks = ''
}
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>
