<template>
  <v-container fluid>
    <v-row>
      <!-- Form -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="rounded-lg">
          <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
            {{ isEditMode ? 'Update Particular' : 'Add Particular' }}
          </v-card-title>
          <v-card-text class="pa-4">
            <v-form @submit.prevent="isEditMode ? updateWork() : addWork()">
              <!-- Work Name -->
              <v-text-field v-model="form.work_name" label="Work Name" placeholder="Enter work name" variant="outlined"
                density="compact" class="mb-2" @input="form.work_name = $event.target.value.toUpperCase()"
                :rules="[v => !!v || 'Work name is required']"></v-text-field>

              <!-- Remarks -->
              <v-textarea v-model="form.remarks" label="Remarks" placeholder="Enter remarks" variant="outlined"
                density="compact" class="mb-2" rows="3" @input="form.remarks = $event.target.value.toUpperCase()"
                :rules="[v => !!v || 'Remarks is required']"></v-textarea>

              <!-- Buttons -->
              <div class="d-flex justify-center gap-2 mt-4">
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
            Particulars List
          </v-card-title>
          <v-card-text class="pa-0">
            <v-data-table :headers="headers" :items="works" :items-per-page="firm.page_size || 10" density="compact"
              class="elevation-0" hover>
              <template v-slot:item.sno="{ index }">
                {{ index + 1 }}
              </template>
              <template v-slot:item.actions="{ item }">
                <v-icon color="primary" @click="editWork(item)" class="cursor-pointer">mdi-pencil</v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import axios from 'axios'
import config from '@/config'
import { useToast } from 'vue-toastification'

const toast = useToast()
const isEditMode = ref(false)
const selectedWorkId = ref(null)
const isModuleEnabled = ref(false)
const works = ref([])
const firm = ref({ page_size: 10 }) // Initialize with a default page_size
const user = JSON.parse(sessionStorage.getItem('user')) || null;
const form = reactive({
  work_name: '',
  remarks: '',
})

const headers = [
  { title: 'SNO', key: 'sno', align: 'center', sortable: false },
  { title: 'WORK NAME', key: 'work_name', align: 'center' },
  { title: 'REMARKS', key: 'remarks', align: 'center' },
  { title: 'ENTRY BY', key: 'user_login_id', align: 'center' },
  { title: 'ACTIONS', key: 'actions', align: 'center', sortable: false },
]

// Form validation
const validateForm = () => {
  if (!form.work_name.trim()) {
    toast.error('Work name is required.')
    return false
  }
  if (!form.remarks.trim()) {
    toast.error('Remarks is required.')
    return false
  }
  return true
}


// fetch firm details
const fetchFirmDetails = async () => {
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/firm_details/get_firm_details`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      }
    )

    if (response.status === 200 && response.data) {
      firm.value = {
        firm_name: response.data.firm_name || 'Unknown Firm',
        firm_address: response.data.firm_address || 'Unknown Address',
        page_size: response.data.page_size || 10 // Default to 10 if not provided
      }
    } else {
      firm.value = {
        firm_name: 'Unavailable',
        firm_address: 'Unavailable',
        page_size: 10 // Default to 10
      }
      toast.error('Failed to fetch firm details: Invalid response')
    }
  } catch (err) {
    console.error('Failed to fetch firm details:', err)
    firm.value = {
      firm_name: 'Error',
      firm_address: 'Error',
      page_size: 10 // Default to 10
    }
    toast.error('Failed to fetch firm details')
  }
};
const fetchWorks = async () => {
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/work-particular/get_labour_work_particulars_details`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      },
    )
    if (response.status === 200) {
      works.value = response.data
    }
  } catch (error) {
    console.error('Error fetching  particulars:', error)
    toast.error('Failed to fetch  particulars.')
  }
}
// Fetch module status
const fetchModuleStatus = async () => {
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/modules/get_modules`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      },
    )
    // Debug API response
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
  const sessionUser = sessionStorage.getItem('user')
  if (sessionUser) {
    const user = JSON.parse(sessionUser)
    form.user_login_id = user.id
  }
  fetchWorks()
  fetchModuleStatus()
  fetchFirmDetails()
})

const addWork = async () => {
  if (!isModuleEnabled.value) {
    toast.info('Please purchase the Laybor payment module to add a work item.')
    return
  }
  if (!validateForm()) return
  try {
    const payload = {
      work_name: form.work_name,
      remarks: form.remarks,
    }
    const response = await axios.post(
      `${config.apiBaseUrl}/api/${config.version}/work-particular/create_labour_work_particulars`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      },
    )
    if (response.status === 200 || response.status === 201) {
      toast.success('Particular Added Successfully!')
      // Reset form
      form.work_name = ''
      form.remarks = ''
    }
    fetchWorks()
    fetchModuleStatus()
  } catch (error) {
    console.error('Error submitting form:', error)
    toast.error(error.response?.data?.detail || 'Failed to save work particular details.')
  }
}

// Edit work
const editWork = (work) => {
  if (!user || user.role !== 'admin') {
    toast.error('Only admin can edit particular list');
    return;
  }
  isEditMode.value = true
  selectedWorkId.value = work.id
  form.work_name = work.work_name
  form.remarks = work.remarks
}

const updateWork = async () => {
  if (!validateForm()) return
  try {
    const payload = {
      id: selectedWorkId.value,
      work_name: form.work_name,
      remarks: form.remarks,
    }
    const response = await axios.put(
      `${config.apiBaseUrl}/api/${config.version}/work-particular/update_labour_work_particulars/${selectedWorkId.value}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      },
    )
    if (response.status === 200 || response.status === 201) {
      toast.success(' particular details updated')
      form.work_name = ''
      form.remarks = ''
      isEditMode.value = false
      selectedWorkId.value = null
      fetchWorks()
    }
  } catch (error) {
    console.error('Error updating:', error)
    toast.error(error.response?.data?.detail || 'Failed to update work particular details')
  }
}

const cancelEdit = () => {
  isEditMode.value = false
  selectedWorkId.value = null
  form.work_name = ''
  form.remarks = ''
}
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>
