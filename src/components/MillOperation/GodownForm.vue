<template>
  <v-container fluid>
    <v-row>
      <!-- Form Section -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="rounded-lg">
          <v-card-title class="text-h6 font-weight-bold text-center py-4 bg-primary text-white">
            {{ isEditMode ? 'Update Godown' : 'Add Godown' }}
          </v-card-title>

          <v-card-text class="pt-6">
            <v-form ref="formRef" @submit.prevent="isEditMode ? updateGodown() : addGodown()">
              <v-text-field v-model="form.godown_name" label="Godown Name" placeholder="Enter a godown name"
                variant="outlined" density="comfortable" :rules="[v => !!v || 'Godown name is required']"
                @input="form.godown_name = $event.target.value.toUpperCase()" class="mb-2"></v-text-field>

              <v-text-field v-model="form.godown_qtl_capacity" label="Godown Capacity (Quintal)"
                placeholder="Enter godown capacity" type="number" variant="outlined" density="comfortable" min="0"
                step="0.01" :rules="[v => v >= 0 || 'Capacity must be non-negative']" class="mb-2"></v-text-field>

              <v-text-field v-model="form.godown_bags_capacity" label="Godown Bag Capacity"
                placeholder="Enter godown bag capacity" type="number" variant="outlined" density="comfortable" min="0"
                step="1" :rules="[v => v >= 0 || 'Capacity must be non-negative']" class="mb-2"></v-text-field>

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
            <span class="text-h6 font-weight-bold text-grey-darken-3">Godown List</span>
          </v-card-title>

          <v-card-text class="pa-4">
            <v-data-table :headers="headers" :items="godowns" :items-per-page="firm.page_size || 10"
              class="elevation-1 border rounded" hover>
              <template v-slot:item.sno="{ index }">
                {{ index + 1 }}
              </template>

              <template v-slot:item.godown_qtl_capacity="{ item }">
                {{ item.godown_qtl_capacity }} Qtl
              </template>

              <template v-slot:item.godown_bags_capacity="{ item }">
                {{ item.godown_bags_capacity }} Bags
              </template>

              <template v-slot:item.actions="{ item }">
                <v-btn icon="mdi-pencil" size="small" color="primary" variant="text" @click="editGodown(item)"></v-btn>
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
const selectedGodownId = ref(null)
const firm = ref({ page_size: 10 })
const godowns = ref([])
const user = JSON.parse(sessionStorage.getItem('user')) || null
const isModuleEnabled = ref(true)
const formRef = ref(null)

const form = reactive({
  godown_name: '',
  godown_qtl_capacity: '',
  godown_bags_capacity: '',
  remarks: '',
  user_login_id: '',
})

const headers = [
  { title: 'SNO', key: 'sno', align: 'center', sortable: false },
  { title: 'NAME', key: 'godown_name', align: 'start' },
  { title: 'CAPACITY (QUINTAL)', key: 'godown_qtl_capacity', align: 'center' },
  { title: 'CAPACITY (BAGS)', key: 'godown_bags_capacity', align: 'center' },
  { title: 'REMARKS', key: 'remarks', align: 'start' },
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

const fetchGodowns = async () => {
  try {
    const response = await millService.getGodowns()
    if (response.status === 200) {
      godowns.value = response.data
    }
  } catch (error) {
    console.error('Error fetching godowns:', error)
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
    console.error('Error fetching module status:', error)
    isModuleEnabled.value = false
    toast.error('Failed to fetch module status.')
  }
}

const addGodown = async () => {
  if (!isModuleEnabled.value) {
    toast.info("Please purchase the Mill Operation module to add a godown.")
    return
  }

  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    const payload = {
      user_login_id: form.user_login_id,
      godown_name: form.godown_name,
      godown_qtl_capacity: form.godown_qtl_capacity,
      godown_bags_capacity: form.godown_bags_capacity,
      remarks: form.remarks,
    }
    const response = await millService.addGodown(payload)
    if (response.status === 200 || response.status === 201) {
      toast.success('Godown Added Successfully!')
      resetForm()
      fetchGodowns()
      fetchModuleStatus()
    }
  } catch (error) {
    console.error('Error submitting form:', error)
    toast.error(error.response?.data?.detail || 'Failed to add godown. Please try again.')
  }
}

// edit godown
const editGodown = (godown) => {
  if (!user || user.role !== 'admin') {
    toast.error('Only admins can edit godown details.');
    return;
  }
  isEditMode.value = true
  selectedGodownId.value = godown.id
  form.godown_name = godown.godown_name
  form.godown_qtl_capacity = godown.godown_qtl_capacity
  form.godown_bags_capacity = godown.godown_bags_capacity
  form.remarks = godown.remarks
}

const updateGodown = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    const payload = {
      id: selectedGodownId.value,
      user_login_id: form.user_login_id,
      godown_name: form.godown_name,
      godown_qtl_capacity: form.godown_qtl_capacity,
      godown_bags_capacity: form.godown_bags_capacity,
      remarks: form.remarks,
    }
    const response = await millService.updateGodown(selectedGodownId.value, payload)
    if (response.status === 200 || response.status === 201) {
      toast.success('Godown details updated')
      resetForm()
      isEditMode.value = false
      selectedGodownId.value = null
      fetchGodowns()
      fetchModuleStatus()
    }
  } catch (error) {
    console.error('Error updating:', error)
    toast.error(error.response?.data?.detail || 'Failed to update godown')
  }
}

const cancelEdit = () => {
  isEditMode.value = false
  selectedGodownId.value = null
  resetForm()
}

const resetForm = () => {
  form.godown_name = ''
  form.godown_qtl_capacity = ''
  form.godown_bags_capacity = ''
  form.remarks = ''
  if (formRef.value) formRef.value.resetValidation()
}

onMounted(() => {
  const sessionUser = sessionStorage.getItem('user')
  if (sessionUser) {
    const user = JSON.parse(sessionUser)
    form.user_login_id = user.id
  }
  fetchGodowns()
  fetchModuleStatus()
  fetchFirmDetails()
})
</script>
