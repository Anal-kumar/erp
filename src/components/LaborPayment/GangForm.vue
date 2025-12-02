<template>
  <v-container fluid>
    <v-row>
      <!-- Form -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="rounded-lg">
          <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
            {{ isEditMode ? 'Update Gang' : 'Add Gang' }}
          </v-card-title>
          <v-card-text class="pa-4">
            <v-form @submit.prevent="isEditMode ? updateGang() : addGang()">
              <!-- Gang Name -->
              <v-text-field v-model="form.gang_name" label="Name" placeholder="Enter gang name" variant="outlined"
                density="compact" class="mb-2" @input="form.gang_name = $event.target.value.toUpperCase()"
                :rules="[v => !!v || 'Gang name is required']"></v-text-field>

              <!-- Mobile Number -->
              <v-text-field v-model="form.gang_mob_no" label="Mobile Number" placeholder="Enter mobile number"
                variant="outlined" density="compact" class="mb-2"
                @input="form.gang_mob_no = $event.target.value.replace(/\D/g, '')" maxlength="10"
                :rules="[v => /^\d{10}$/.test(v) || 'Mobile Number must be 10 digits']"></v-text-field>

              <!-- Work Rate -->
              <v-text-field v-model.number="form.work_rate" label="Work Rate" placeholder="Enter work rate"
                variant="outlined" density="compact" class="mb-2" type="number" step="0.01" min="0"
                @blur="form.work_rate = form.work_rate ? Number(form.work_rate).toFixed(2) : ''"
                :rules="[v => (v !== '' && v >= 0) || 'Work rate is required and must be non-negative']"
                @keydown.down.prevent @keydown.up.prevent></v-text-field>

              <!-- Remarks -->
              <v-textarea v-model="form.remarks" label="Remarks" placeholder="Enter remarks" variant="outlined"
                density="compact" class="mb-2" rows="3" @input="form.remarks = $event.target.value.toUpperCase()"
                :rules="[v => !!v || 'Remarks is required']"></v-textarea>

              <!-- Is Active Checkbox -->
              <v-checkbox v-model="form.is_active" label="Is Active" color="primary" density="compact"
                hide-details></v-checkbox>

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
            Gang List
          </v-card-title>
          <v-card-text class="pa-0">
            <v-data-table :headers="headers" :items="gangs" :items-per-page="firm.page_size || 10" density="compact"
              class="elevation-0" hover>
              <template v-slot:item.sno="{ index }">
                {{ index + 1 }}
              </template>
              <template v-slot:item.work_rate="{ item }">
                {{ Number(item.work_rate).toFixed(2) }}
              </template>
              <template v-slot:item.is_active="{ item }">
                <v-chip :color="item.is_active ? 'success' : 'error'" size="small" label>
                  {{ item.is_active ? 'Yes' : 'No' }}
                </v-chip>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-icon color="primary" @click="editGang(item)" class="cursor-pointer">mdi-pencil</v-icon>
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
import { labourService, firmDetailsService, getModuleStatus } from '@/services'
import storage from '@/utils/storage'
import { useToast } from 'vue-toastification'

const toast = useToast()
const isEditMode = ref(false)
const selectedGangId = ref(null)
const isModuleEnabled = ref(false)
const gangs = ref([])
const user = storage.getUser() || null;
const firm = ref({ page_size: 10 }) // Default page size
const form = reactive({
  gang_name: '',
  gang_mob_no: '',
  work_rate: '',
  remarks: '',
  is_active: false,
})

const headers = [
  { title: 'SNO', key: 'sno', align: 'center', sortable: false },
  { title: 'NAME', key: 'gang_name', align: 'center' },
  { title: 'MOBILE', key: 'gang_mob_no', align: 'center' },
  { title: 'RATE', key: 'work_rate', align: 'center' },
  { title: 'REMARKS', key: 'remarks', align: 'center' },
  { title: 'ACTIVE', key: 'is_active', align: 'center' },
  { title: 'ACTIONS', key: 'actions', align: 'center', sortable: false },
]

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

// fetch firm details
const fetchFirmDetails = async () => {
  try {
    const response = await firmDetailsService.getFirmDetails();
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

const fetchGangs = async () => {
  try {
    const response = await labourService.getLabourGangs()
    if (response.status === 200) {
      gangs.value = response.data.map((gang) => ({
        ...gang,
        is_active: gang.is_active,
      }))
    }
    fetchModuleStatus()
  } catch (error) {
    console.error('Error fetching gangs:', error)
    toast.error('Failed to fetch gang details.')
  }
}

onMounted(() => {
  const sessionUser = storage.getUser()
  if (sessionUser) {
    const user = sessionUser
    form.user_login_id = user.id
  } else {
    toast.error('User session not found. Please log in.')
  }
  fetchGangs()
  fetchModuleStatus()
  fetchFirmDetails()
})

const addGang = async () => {
  if (!isModuleEnabled.value) {
    toast.info('Please purchase the Laybor payment module to add a gang.')
    return
  }
  // Validation is now handled by v-text-field rules, but a final check can be added if needed
  try {
    const payload = {
      gang_name: form.gang_name,
      gang_mob_no: form.gang_mob_no,
      work_rate: parseFloat(form.work_rate),
      remarks: form.remarks,
      is_active: form.is_active,
    }

    const response = await labourService.createLabourGang(payload)
    if (response.status === 200 || response.status === 201) {
      toast.success('Gang Added Successfully!')
      // Reset form
      form.gang_name = ''
      form.gang_mob_no = ''
      form.work_rate = ''
      form.remarks = ''
      form.is_active = false
    }
    fetchGangs()
    fetchModuleStatus()
  } catch (error) {
    console.error('Error submitting form:', error)
    let errorMessage = 'Failed to save gang details.'
    if (error.response?.data?.detail) {
      if (Array.isArray(error.response.data.detail)) {
        errorMessage = error.response.data.detail.map((err) => err.msg).join('; ')
      } else {
        errorMessage = error.response.data.detail
      }
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    toast.error(errorMessage)
  }
}

// Edit gang
const editGang = (gang) => {
  if (!user || user.role !== 'admin') {
    toast.error('Only admin can edit gang details');
    return;
  }
  isEditMode.value = true
  selectedGangId.value = gang.id
  form.gang_name = gang.gang_name
  form.gang_mob_no = gang.gang_mob_no
  form.work_rate = gang.work_rate
  form.remarks = gang.remarks
  form.is_active = gang.is_active
}

// Update gang
const updateGang = async () => {
  // Validation is now handled by v-text-field rules, but a final check can be added if needed
  try {
    const payload = {
      id: selectedGangId.value,
      gang_name: form.gang_name,
      gang_mob_no: form.gang_mob_no,
      work_rate: Number(form.work_rate),
      remarks: form.remarks,
      is_active: form.is_active,
    }
    
    const response = await labourService.updateLabourGang(payload)
    if (response.status === 200 || response.status === 201) {
      toast.success('Gang details updated')
      form.gang_name = ''
      form.gang_mob_no = ''
      form.work_rate = ''
      form.remarks = ''
      form.is_active = false
      isEditMode.value = false
      selectedGangId.value = null
      fetchGangs()
    }
  } catch (error) {
    console.error('Error updating:', error)
    let errorMessage = 'Failed to update gang details.'
    if (error.response?.data?.detail) {
      if (Array.isArray(error.response.data.detail)) {
        errorMessage = error.response.data.detail.map((err) => err.msg).join('; ')
      } else {
        errorMessage = error.response.data.detail
      }
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    toast.error(errorMessage)
  }
}

const cancelEdit = () => {
  isEditMode.value = false
  selectedGangId.value = null
  form.gang_name = ''
  form.gang_mob_no = ''
  form.work_rate = ''
  form.remarks = ''
  form.is_active = false
  form.user_login_id = null
}
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>
