<template>
  <v-container fluid>
    <v-row>
      <!-- Form -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="rounded-lg">
          <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
            {{ isEditMode ? 'Update Item' : 'Add Item' }}
          </v-card-title>
          <v-card-text class="pa-4">
            <v-form @submit.prevent="isEditMode ? updateLabourItem() : addLabourItem()">
              <!-- Labour Item Name -->
              <v-text-field v-model="form.labour_item_name" label="Name" placeholder="Enter labour item name"
                variant="outlined" density="compact" class="mb-2"
                @input="form.labour_item_name = $event.target.value.toUpperCase()"
                :rules="[v => !!v || 'Labour item name is required']"></v-text-field>

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
            Item List
          </v-card-title>
          <v-card-text class="pa-0">
            <v-data-table :headers="headers" :items="labourItems" :items-per-page="firm.page_size || 10"
              density="compact" class="elevation-0" hover>
              <template v-slot:item.sno="{ index }">
                {{ index + 1 }}
              </template>
              <template v-slot:item.actions="{ item }">
                <v-icon color="primary" @click="editLabourItem(item)" class="cursor-pointer">mdi-pencil</v-icon>
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
const selectedLabourItemId = ref(null)
const isModuleEnabled = ref(false)
const firm = ref({ page_size: 10 })
const user = JSON.parse(sessionStorage.getItem('user')) || null;
const form = reactive({
  labour_item_name: '',
  remarks: '',
})
const labourItems = ref([])

const headers = [
  { title: 'SNO', key: 'sno', align: 'center', sortable: false },
  { title: 'NAME', key: 'labour_item_name', align: 'center' },
  { title: 'REMARKS', key: 'remarks', align: 'center' },
  { title: 'ACTIONS', key: 'actions', align: 'center', sortable: false },
]

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
    // Debug final value
  } catch (error) {
    console.error('Error fetching module status:', error)
    isModuleEnabled.value = false
    toast.error('Failed to fetch module status. Please check your network or contact support.')
  }
}
// Form validation
const validateForm = () => {
  if (!form.labour_item_name.trim()) {
    toast.error('Labour item name is required.')
    return false
  }
  if (!form.remarks.trim()) {
    toast.error('Remarks is required.')
    return false
  }
  return true
}

const fetchLabourItems = async () => {
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/work-items/get_labour_work_item`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      },
    )
    if (response.status === 200) {
      labourItems.value = response.data
    }
  } catch (error) {
    console.error('Error fetching  items:', error)
    toast.error('Failed to fetch item details.')
  }
}

onMounted(() => {
  const sessionUser = sessionStorage.getItem('user')
  if (sessionUser) {
    const user = JSON.parse(sessionUser)
    form.user_login_id = user.id
  }
  fetchLabourItems()
  fetchModuleStatus()
  fetchFirmDetails()
})

const addLabourItem = async () => {
  if (!isModuleEnabled.value) {
    toast.info('Please purchase the Laybor payment module to add a labour items.')
    return
  }
  if (!validateForm()) return
  try {
    const payload = {
      labour_item_name: form.labour_item_name,
      remarks: form.remarks,
    }
    const response = await axios.post(
      `${config.apiBaseUrl}/api/${config.version}/work-items/create_labour_work_item`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      },
    )
    if (response.status === 200 || response.status === 201) {
      toast.success('Item Added Successfully!')
      // Reset form
      form.labour_item_name = ''
      form.remarks = ''
    }
    fetchLabourItems()
    fetchModuleStatus()
  } catch (error) {
    console.error('Error submitting form:', error)
    toast.error(error.response?.data?.detail || 'Failed to save labour item details.')
  }
}

// Edit labour item
const editLabourItem = (item) => {
  if (!user || user.role !== 'admin') {
    toast.error('Only admin can edit item details');
    return;
  }
  isEditMode.value = true
  selectedLabourItemId.value = item.id
  form.labour_item_name = item.labour_item_name
  form.remarks = item.remarks
}

const updateLabourItem = async () => {
  if (!validateForm()) return
  try {
    const payload = {
      id: selectedLabourItemId.value,
      labour_item_name: form.labour_item_name,
      remarks: form.remarks,
    }
    const response = await axios.put(
      `${config.apiBaseUrl}/api/${config.version}/work-items/update_labour_work_item/${selectedLabourItemId.value}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      },
    )
    if (response.status === 200 || response.status === 201) {
      toast.success('Item details updated')
      form.labour_item_name = ''
      form.remarks = ''
      isEditMode.value = false
      selectedLabourItemId.value = null
      fetchLabourItems()
    }
  } catch (error) {
    console.error('Error updating:', error)
    toast.error(error.response?.data?.detail || 'Failed to update labour item details')
  }
}

const cancelEdit = () => {
  isEditMode.value = false
  selectedLabourItemId.value = null
  form.labour_item_name = ''
  form.remarks = ''
}
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>
