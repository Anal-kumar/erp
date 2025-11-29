<template>
  <v-container fluid>
    <v-row>
      <!-- Form Section -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="rounded-lg">
          <v-card-title class="text-h6 font-weight-bold text-center py-4 bg-primary text-white">
            {{ isEditMode ? 'Update WB Operator' : 'Add WB Operator' }}
          </v-card-title>

          <v-card-text class="pt-6">
            <v-form ref="formRef" @submit.prevent="isEditMode ? updateOperator() : addOperator()">
              <v-text-field v-model="form.operator_name" label="Name" placeholder="Enter operator name"
                variant="outlined" density="comfortable" :rules="[v => !!v || 'Operator name is required']"
                @input="form.operator_name = $event.target.value.toUpperCase()" class="mb-2"></v-text-field>

              <v-text-field v-model="form.operator_mob_no" label="Mobile" placeholder="Enter mobile number"
                variant="outlined" density="comfortable" :rules="[
                  v => !!v || 'Mobile number is required',
                  v => /^\d{10}$/.test(v) || 'Mobile number must be 10 digits'
                ]" @input="form.operator_mob_no = $event.target.value.replace(/\D/g, '')" maxlength="10"
                class="mb-2"></v-text-field>

              <v-textarea v-model="form.remarks" label="Remarks" rows="3" variant="outlined" density="comfortable"
                :rules="[v => !!v || 'Remarks is required']" @input="form.remarks = $event.target.value.toUpperCase()"
                class="mb-2"></v-textarea>

              <v-checkbox v-model="form.is_active" label="Is Active" color="primary" hide-details
                class="mb-4"></v-checkbox>

              <div class="d-flex justify-center gap-4 mt-4">
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
            <span class="text-h6 font-weight-bold text-grey-darken-3">Weight Bridge Operator List</span>
          </v-card-title>

          <v-card-text class="pa-4">
            <v-data-table :headers="headers" :items="operators" :items-per-page="firm.page_size || 10"
              class="elevation-1 border rounded" hover>
              <template v-slot:item.sno="{ index }">
                {{ index + 1 }}
              </template>

              <template v-slot:item.is_active="{ item }">
                <v-chip :color="item.is_active ? 'success' : 'error'" size="small" class="text-uppercase">
                  {{ item.is_active ? 'Yes' : 'No' }}
                </v-chip>
              </template>

              <template v-slot:item.actions="{ item }">
                <v-btn icon="mdi-pencil" size="small" color="primary" variant="text"
                  @click="editOperator(item)"></v-btn>
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
import millService from '@/services/millService'
import moduleService from '@/services/moduleService'
import adminService from '@/services/adminService'
import { useToast } from 'vue-toastification'

const toast = useToast()
const isEditMode = ref(false)
const selectedOperatorId = ref(null)
const isModuleEnabled = ref(true)
const operators = ref([])
const user = JSON.parse(sessionStorage.getItem('user')) || null
const firm = ref({ page_size: 10 })
const formRef = ref(null)

const form = reactive({
  operator_name: '',
  operator_mob_no: '',
  remarks: '',
  is_active: false,
  user_login_id: '',
})

const headers = [
  { title: 'SNo', key: 'sno', align: 'center', sortable: false },
  { title: 'NAME', key: 'operator_name', align: 'start' },
  { title: 'MOBILE', key: 'operator_mob_no', align: 'center' },
  { title: 'REMARKS', key: 'remarks', align: 'start' },
  { title: 'ACTIVE', key: 'is_active', align: 'center' },
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

const fetchOperators = async () => {
  try {
    const response = await millService.getWeighbridges()
    if (response.status === 200) {
      operators.value = response.data
    }
  } catch (error) {
    console.error('Error fetching operators:', error)
    toast.error('Failed to fetch operator details.')
  }
}

// Fetch module status
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
    isModuleEnabled.value = false
    toast.error('Failed to fetch module status.')
  }
}

const addOperator = async () => {
  if (!isModuleEnabled.value) {
    toast.info('Please purcheased the Mill Operations module to add a Weight Bridge operator.')
    return
  }

  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    const payload = {
      user_login_id: form.user_login_id,
      operator_name: form.operator_name,
      operator_mob_no: form.operator_mob_no,
      is_active: form.is_active,
      remarks: form.remarks,
    }
    const response = await millService.addWeighbridge(payload)
    if (response.status === 200 || response.status === 201) {
      toast.success('Operator Added Successfully!')
      resetForm()
      fetchOperators()
      fetchModuleStatus()
    }
  } catch (error) {
    console.error('Error submitting form:', error)
    toast.error(error.response?.data?.detail || 'Failed to save operator.')
  }
}

// Edit Operator
const editOperator = (operator) => {
  if (!user || user.role !== 'admin') {
    toast.error('Only admins can edit WB operator details.');
    return;
  }
  isEditMode.value = true
  selectedOperatorId.value = operator.id
  form.operator_name = operator.operator_name
  form.operator_mob_no = operator.operator_mob_no
  form.remarks = operator.remarks
  form.is_active = operator.is_active
}

const updateOperator = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    const payload = {
      id: selectedOperatorId.value,
      user_login_id: form.user_login_id,
      operator_name: form.operator_name,
      operator_mob_no: form.operator_mob_no,
      remarks: form.remarks,
      is_active: form.is_active,
    }
    const response = await millService.updateWeighbridge(selectedOperatorId.value, payload)
    if (response.status === 200 || response.status === 201) {
      toast.success('Operator details updated')
      resetForm()
      isEditMode.value = false
      selectedOperatorId.value = null
      fetchOperators()
    }
  } catch (error) {
    console.error('Error updating:', error)
    toast.error(error.response?.data?.detail || 'Failed to update operator')
  }
}

const cancelEdit = () => {
  isEditMode.value = false
  selectedOperatorId.value = null
  resetForm()
}

const resetForm = () => {
  form.operator_name = ''
  form.operator_mob_no = ''
  form.remarks = ''
  form.is_active = false
  if (formRef.value) formRef.value.resetValidation()
}

onMounted(() => {
  const sessionUser = sessionStorage.getItem('user')
  if (sessionUser) {
    const user = JSON.parse(sessionUser)
    form.user_login_id = user.id
  }
  fetchOperators()
  fetchModuleStatus()
  fetchFirmDetails()
})
</script>
