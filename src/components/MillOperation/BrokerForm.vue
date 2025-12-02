<template>
  <v-container fluid>
    <v-row>
      <!-- Form Section -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="rounded-lg">
          <v-card-title class="text-h6 font-weight-bold text-center py-4 bg-primary text-white">
            {{ isEditMode ? 'Update Broker' : 'Add Broker' }}
          </v-card-title>

          <v-card-text class="pt-6">
            <v-form ref="formRef" @submit.prevent="isEditMode ? updateBroker() : addBroker()">
              <v-text-field v-model="form.broker_name" label="Broker Name" placeholder="Enter a broker name"
                variant="outlined" density="comfortable" :rules="[v => !!v || 'Broker name is required']"
                @input="form.broker_name = $event.target.value.toUpperCase()" class="mb-2"></v-text-field>

              <v-text-field v-model="form.broker_mob_no" label="Mobile Number" placeholder="Enter a mobile number"
                variant="outlined" density="comfortable" :rules="[
                  v => !!v || 'Mobile number is required',
                  v => /^\d{10}$/.test(v) || 'Mobile number must be 10 digits'
                ]" @input="form.broker_mob_no = $event.target.value.replace(/\D/g, '')" maxlength="10"
                class="mb-2"></v-text-field>

              <v-text-field v-model="form.brokerage_rate" label="Brokerage Rate" placeholder="Enter brokerage rate"
                type="number" variant="outlined" density="comfortable" min="0" step="0.01" class="mb-2"></v-text-field>

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
            <span class="text-h6 font-weight-bold text-grey-darken-3">Broker List</span>
          </v-card-title>

          <v-card-text class="pa-4">
            <v-data-table :headers="headers" :items="brokers" :items-per-page="firm.page_size || 10"
              class="elevation-1 border rounded" hover>
              <template v-slot:item.sno="{ index }">
                {{ index + 1 }}
              </template>

              <template v-slot:item.actions="{ item }">
                <v-btn icon="mdi-pencil" size="small" color="primary" variant="text" @click="editBroker(item)"></v-btn>
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
const selectedBrokerId = ref(null)
const isModuleEnabled = ref(true)
const brokers = ref([])
const firm = ref({ page_size: 10 })
const user = JSON.parse(sessionStorage.getItem('user')) || null
const formRef = ref(null)

const form = reactive({
  broker_name: '',
  broker_mob_no: '',
  brokerage_rate: '',
  remarks: '',
  user_login_id: '',
})

const headers = [
  { title: 'SNO', key: 'sno', align: 'center', sortable: false },
  { title: 'NAME', key: 'broker_name', align: 'start' },
  { title: 'MOBILE', key: 'broker_mob_no', align: 'center' },
  { title: 'BROKERAGE RATE', key: 'brokerage_rate', align: 'center' },
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
}

//Fetch module status
const fetchModuleStatus = async () => {
  try {
    const response = await moduleService.getModules()
    const modules = response.data
    const millOperationsModule = modules.find((m) => m.module_name === 'mill_operations')
    if (!millOperationsModule) {
      isModuleEnabled.value = false
      toast.error('Mill Operations module not found. Contact support.')
      return
    }
    isModuleEnabled.value = millOperationsModule.module_enabled
  } catch (error) {
    console.error('Error fetching module status:', error)
    isModuleEnabled.value = false
    toast.error('Failed to fetch module status.')
  }
}

const fetchBrokers = async () => {
  try {
    const response = await millService.getBrokers()
    if (response.status === 200) {
      brokers.value = response.data
    }
  } catch (error) {
    console.error('Error fetching brokers:', error)
    toast.error('Failed to load broker list.')
  }
}

const addBroker = async () => {
  if (!isModuleEnabled.value) {
    toast.info('Please purchase the Mill Operations module to add a broker.')
    return
  }

  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    const payload = {
      user_login_id: form.user_login_id,
      broker_name: form.broker_name,
      broker_mob_no: form.broker_mob_no,
      brokerage_rate: form.brokerage_rate,
      remarks: form.remarks,
    }
    const response = await millService.addBroker(payload)
    if (response.status === 200 || response.status === 201) {
      toast.success('Broker Added Successfully!')
      resetForm()
      fetchBrokers()
      fetchModuleStatus()
    }
  } catch (error) {
    console.error('Error submitting form:', error)
    toast.error(error.response?.data?.detail || 'Failed to save entry.')
  }
}

// edit broker
const editBroker = (broker) => {
  if (!user || user.role !== 'admin') {
    toast.error('Only admins can edit broker details.');
    return;
  }
  isEditMode.value = true
  selectedBrokerId.value = broker.id
  form.broker_name = broker.broker_name
  form.broker_mob_no = broker.broker_mob_no
  form.brokerage_rate = broker.brokerage_rate
  form.remarks = broker.remarks
}

const updateBroker = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    const payload = {
      id: selectedBrokerId.value,
      user_login_id: form.user_login_id,
      broker_name: form.broker_name,
      broker_mob_no: form.broker_mob_no,
      brokerage_rate: form.brokerage_rate,
      remarks: form.remarks,
    }

    const response = await millService.updateBroker(selectedBrokerId.value, payload)
    if (response.status === 200 || response.status === 201) {
      toast.success('Broker details updated')
      resetForm()
      isEditMode.value = false
      selectedBrokerId.value = null
      fetchBrokers()
    }
  } catch (error) {
    console.error('Error updating:', error)
    toast.error(error.response?.data?.detail || 'Failed to update broker')
  }
}

const cancelEdit = () => {
  isEditMode.value = false
  selectedBrokerId.value = null
  resetForm()
}

const resetForm = () => {
  form.broker_name = ''
  form.broker_mob_no = ''
  form.brokerage_rate = ''
  form.remarks = ''
  if (formRef.value) formRef.value.resetValidation()
}

onMounted(() => {
  const sessionUser = sessionStorage.getItem('user')
  if (sessionUser) {
    const user = JSON.parse(sessionUser)
    form.user_login_id = user.id
  }
  fetchBrokers()
  fetchModuleStatus()
  fetchFirmDetails()
})
</script>
