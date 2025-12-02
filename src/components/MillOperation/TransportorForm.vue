<template>
  <v-container fluid>
    <v-row>
      <!-- Form Section -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="rounded-lg">
          <v-card-title class="text-h6 font-weight-bold text-center py-4 bg-primary text-white">
            {{ isEditMode ? 'Update Transportor' : 'Add Transportor' }}
          </v-card-title>

          <v-card-text class="pt-6">
            <v-form ref="formRef" @submit.prevent="isEditMode ? updatetransportor() : addtransportor()">
              <v-text-field v-model="form.transportor_name" label="Name" placeholder="Enter a transportor name"
                variant="outlined" density="comfortable" :rules="[v => !!v || 'Transportor name is required']"
                @input="form.transportor_name = $event.target.value.toUpperCase()" class="mb-2"></v-text-field>

              <v-text-field v-model="form.transportor_mob_no" label="Mobile Number" placeholder="Enter a mobile number"
                variant="outlined" density="comfortable" :rules="[
                  v => !!v || 'Mobile number is required',
                  v => /^\d{10}$/.test(v) || 'Mobile number must be 10 digits'
                ]" @input="form.transportor_mob_no = $event.target.value.replace(/\D/g, '')" maxlength="10"
                class="mb-2"></v-text-field>

              <v-textarea v-model="form.remarks" label="Remarks" rows="3" variant="outlined" density="comfortable"
                :rules="[v => !!v || 'Remarks is required']" @input="form.remarks = $event.target.value.toUpperCase()"
                class="mb-2"></v-textarea>

              <div class="d-flex justify-center ga-4 mt-4">
                <v-btn type="submit" color="primary" :disabled="!isModuleEnabled" width="120">
                  {{ isEditMode ? 'Update' : 'Add' }}
                </v-btn>
                <v-btn v-if="isEditMode" color="error" variant="outlined" @click="cancelEdit" width="120">
                  Cancel
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Table Section -->
      <v-col cols="12" md="8">
        <v-card elevation="2" class="rounded-lg h-100">
          <v-card-title class="d-flex align-center justify-space-between py-4 px-6 bg-grey-lighten-4 border-b">
            <span class="text-h6 font-weight-bold text-grey-darken-3">Transportor List</span>
          </v-card-title>

          <v-card-text class="pa-4">
            <v-data-table :headers="headers" :items="transportors" :items-per-page="firm.page_size || 10"
              class="elevation-1 border rounded" hover>
              <template v-slot:item.sno="{ index }">
                {{ index + 1 }}
              </template>

              <template v-slot:item.actions="{ item }">
                <v-btn icon="mdi-pencil" size="small" color="primary" variant="text"
                  @click="edittransportor(item)"></v-btn>
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
import { millService, moduleService, adminService } from '@/services'
import { useToast } from 'vue-toastification'

const toast = useToast()
const isEditMode = ref(false)
const selectedtransportorId = ref(null)
const isModuleEnabled = ref(true)
const transportors = ref([])
const firm = ref({ page_size: 10 })
const user = JSON.parse(sessionStorage.getItem('user')) || null
const formRef = ref(null)

const form = reactive({
  transportor_name: '',
  transportor_mob_no: '',
  remarks: '',
  user_login_id: '',
})

const headers = [
  { title: 'SNO', key: 'sno', align: 'center', sortable: false },
  { title: 'NAME', key: 'transportor_name', align: 'start' },
  { title: 'MOBILE', key: 'transportor_mob_no', align: 'center' },
  { title: 'REMARK', key: 'remarks', align: 'start' },
  { title: 'ENTRY BY', key: 'user_login', align: 'center' },
  { title: 'ACTIONS', key: 'actions', align: 'center', sortable: false },
]

// fetch firm details
const fetchFirmDetails = async () => {
  try {
    const response = await adminService.getFirmDetails()

    if (response.status === 200 && response.data) {
      firm.value = {
        page_size: response.data.page_size || 10
      }
    }
  } catch (err) {
    console.error('Failed to fetch firm details:', err)
  }
};

const fetchtransportors = async () => {
  try {
    const response = await millService.getTransporters()
    if (response.status === 200) {
      transportors.value = response.data
    }
  } catch (error) {
    console.error('Error fetching transportors:', error)
  }
}

//Fetch module status
const fetchModuleStatus = async () => {
  try {
    const response = await moduleService.getModules()
    const modules = response.data
    // Check if mill_operations module is enabled
    const millOperationsModule = modules.find((m) => m.module_name === 'mill_operations')
    isModuleEnabled.value = millOperationsModule ? millOperationsModule.module_enabled : false
  } catch (error) {
    console.error('Error fetching module status:', error)
    isModuleEnabled.value = false // Default to disabled if API fails
    toast.error('Failed to fetch module status.')
  }
}

const addtransportor = async () => {
  if (!isModuleEnabled.value) {
    toast.info('Please purchase the Mill Operations module to add a transportor.')
    return
  }

  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    const payload = {
      user_login_id: form.user_login_id,
      transportor_name: form.transportor_name,
      transportor_mob_no: form.transportor_mob_no,
      remarks: form.remarks,
    }
    const response = await millService.addTransporter(payload)
    if (response.status === 200 || response.status === 201) {
      toast.success('Transportor Added Successfully!')
      resetForm()
      fetchtransportors()
      fetchModuleStatus()
    }
  } catch (error) {
    console.error('Error submitting form:', error)
    toast.error(error.response?.data?.detail || 'Failed to save entry.')
  }
}

// edit transportor
const edittransportor = (transportor) => {
  if (!user || user.role !== 'admin') {
    toast.error('Only admins can edit transportor details.');
    return;
  }
  isEditMode.value = true
  selectedtransportorId.value = transportor.id
  form.transportor_name = transportor.transportor_name
  form.transportor_mob_no = transportor.transportor_mob_no
  form.remarks = transportor.remarks
}

const updatetransportor = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    const payload = {
      id: selectedtransportorId.value,
      user_login_id: form.user_login_id,
      transportor_name: form.transportor_name,
      transportor_mob_no: form.transportor_mob_no,
      remarks: form.remarks,
    }
    const response = await millService.updateTransporter(selectedtransportorId.value, payload)
    if (response.status === 200 || response.status === 201) {
      toast.success('Transportor details updated')
      resetForm()
      isEditMode.value = false
      selectedtransportorId.value = null
      fetchtransportors()
    }
  } catch (error) {
    console.error('Error updating:', error)
    toast.error(error.response?.data?.detail || 'Failed to update transportor')
  }
}

const cancelEdit = () => {
  isEditMode.value = false
  selectedtransportorId.value = null
  resetForm()
}

const resetForm = () => {
  form.transportor_name = ''
  form.transportor_mob_no = ''
  form.remarks = ''
  if (formRef.value) formRef.value.resetValidation()
}

onMounted(() => {
  const sessionUser = sessionStorage.getItem('user')
  if (sessionUser) {
    const user = JSON.parse(sessionUser)
    form.user_login_id = user.id
  }
  fetchtransportors()
  fetchModuleStatus()
  fetchFirmDetails()
})
</script>
