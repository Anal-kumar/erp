<template>
  <v-container fluid>
    <v-row>
      <!-- Form -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="rounded-lg">
          <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
            {{ isEditMode ? 'Update Location' : 'Add Location' }}
          </v-card-title>
          <v-card-text class="pa-4">
            <v-form @submit.prevent="isEditMode ? updateLocation() : addLocation()">
              <!-- Work Location -->
              <v-text-field v-model="form.work_location" label="Work Location" placeholder="Enter work location"
                variant="outlined" density="compact" class="mb-2"
                @input="form.work_location = $event.target.value.toUpperCase()"
                :rules="[v => !!v || 'Work location is required']"></v-text-field>

              <!-- Remarks -->
              <v-textarea v-model="form.remarks" label="Remarks" placeholder="Enter remarks" variant="outlined"
                density="compact" class="mb-2" rows="3" @input="form.remarks = $event.target.value.toUpperCase()"
                :rules="[v => !!v || 'Remarks is required']"></v-textarea>

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
            Locations List
          </v-card-title>
          <v-card-text class="pa-0">
            <v-data-table :headers="headers" :items="locations" :items-per-page="firm.page_size || 10" density="compact"
              class="elevation-0" hover>
              <template v-slot:item.sno="{ index }">
                {{ index + 1 }}
              </template>
              <template v-slot:item.work_location="{ item }">
                {{ item.work_locations || item.work_location }}
              </template>
              <template v-slot:item.actions="{ item }">
                <v-icon color="primary" @click="editLocation(item)" class="cursor-pointer">mdi-pencil</v-icon>
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
import storage from '@/utils/storage'
import { labourService, firmDetailsService, getModuleStatus } from '@/services'
import { useToast } from 'vue-toastification'

const toast = useToast()
const isEditMode = ref(false)
const selectedLocationId = ref(null)
const isModuleEnabled = ref(false)
const locations = ref([])
const firm = ref({ page_size: 10 }) // Initialize with a default page_size
const user = storage.getUser() || null;
const form = reactive({
  work_location: '',
  remarks: '',
})

const headers = [
  { title: 'SNO', key: 'sno', align: 'center', sortable: false },
  { title: 'WORK LOCATION', key: 'work_location', align: 'center' },
  { title: 'REMARKS', key: 'remarks', align: 'center' },
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
    const response = await firmDetailsService.getFirmDetails()

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

const fetchLocations = async () => {
  try {
    const response = await labourService.getLabourWorkLocations()
    if (response.status === 200) {
      locations.value = response.data
    }
  } catch (error) {
    console.error('Error fetching locations:', error)
    toast.error('Failed to fetch locations.')
  }
}

onMounted(() => {
  const sessionUser = storage.getUser()
  if (sessionUser) {
    const user = sessionUser
    form.user_login_id = user.id
  }
  fetchLocations()
  fetchModuleStatus()
  fetchFirmDetails()
})

const addLocation = async () => {
  if (!isModuleEnabled.value) {
    toast.info('Please purchase the Laybor payment module to add a location.')
    return
  }
  // Form validation is now handled by Vuetify's rules on v-text-field/v-textarea
  // For a complete solution, you might want to use a ref on v-form and call its validate() method.
  // Example: if (!formRef.value.validate()) return;
  try {
    const payload = {
      work_locations: form.work_location,
      remarks: form.remarks,
    }
    const response = await labourService.createLabourWorkLocation(payload)
    if (response.status === 200 || response.status === 201) {
      toast.success('Location Added Successfully!')
      // Reset form
      form.work_location = ''
      form.remarks = ''
    }
    fetchLocations()
    fetchModuleStatus()
  } catch (error) {
    console.error('Error submitting form:', error)
    if (error.response?.status === 422 && error.response?.data?.detail) {
      const errors = error.response.data.detail
      errors.forEach((err) => {
        toast.error(err.msg || 'Failed to save location details.')
      })
    } else {
      toast.error(error.response?.data?.detail || 'Failed to save location details.')
    }
  }
}

// Edit location
const editLocation = (location) => {
  if (!user || user.role !== 'admin') {
    toast.error('Only admin can edit location');
    return;
  }
  isEditMode.value = true
  selectedLocationId.value = location.id
  form.work_location = location.work_locations || location.work_location // Handle both field names
  form.remarks = location.remarks
}

const updateLocation = async () => {
  // Form validation is now handled by Vuetify's rules on v-text-field/v-textarea
  // For a complete solution, you might want to use a ref on v-form and call its validate() method.
  // Example: if (!formRef.value.validate()) return;
  try {
    const payload = {
      id: selectedLocationId.value,
      work_locations: form.work_location,
      remarks: form.remarks,
    }
    const response = await axios.put(
      `${config.apiBaseUrl}/api/${config.version}/work-location/update_labour_work_location/${selectedLocationId.value}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      },
    )
    if (response.status === 200 || response.status === 201) {
      toast.success('Location details updated')
      form.work_location = ''
      form.remarks = ''
      isEditMode.value = false
      selectedLocationId.value = null
      fetchLocations()
    }
  } catch (error) {
    console.error('Error updating:', error)
    if (error.response?.status === 422 && error.response?.data?.detail) {
      const errors = error.response.data.detail
      errors.forEach((err) => {
        toast.error(err.msg || 'Failed to update location details.')
      })
    } else {
      toast.error(error.response?.data?.detail || 'Failed to update location details.')
    }
  }
}

const cancelEdit = () => {
  isEditMode.value = false
  selectedLocationId.value = null
  form.work_location = ''
  form.remarks = ''
}
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>
