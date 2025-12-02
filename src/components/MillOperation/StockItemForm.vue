<template>
  <v-container fluid>
    <v-row>
      <!-- Form Section -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="rounded-lg">
          <v-card-title class="text-h6 font-weight-bold text-center py-4 bg-primary text-white">
            {{ isEditMode ? 'Update Stock Item' : 'Add Stock Item' }}
          </v-card-title>

          <v-card-text class="pt-6">
            <v-form ref="formRef" @submit.prevent="isEditMode ? updateStock() : addStock()">
              <v-text-field v-model="form.stock_item_name" label="Stock Item Name"
                placeholder="Enter a stock name (RICE(MOTA,PATLA), HUSK, BRAN, etc)" variant="outlined"
                density="comfortable" :rules="[v => !!v || 'Stock item name is required']"
                @input="form.stock_item_name = $event.target.value.toUpperCase()" class="mb-2"></v-text-field>

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
            <span class="text-h6 font-weight-bold text-grey-darken-3">Stock Items List</span>
          </v-card-title>

          <v-card-text class="pa-4">
            <v-data-table :headers="headers" :items="stockItems" :items-per-page="firm.page_size || 10"
              class="elevation-1 border rounded" hover>
              <template v-slot:item.sno="{ index }">
                {{ index + 1 }}
              </template>

              <template v-slot:item.actions="{ item }">
                <v-btn icon="mdi-pencil" size="small" color="primary" variant="text" @click="editStock(item)"></v-btn>
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
const selectedStockItemId = ref(null)
const isModuleEnabled = ref(true)
const user = JSON.parse(sessionStorage.getItem('user')) || null
const formRef = ref(null)

const form = reactive({
  stock_item_name: '',
  remarks: '',
  user_login_id: '',
})

const stockItems = ref([])
const firm = ref({ page_size: 10 })

const headers = [
  { title: 'SNO', key: 'sno', align: 'center', sortable: false },
  { title: 'ITEM NAME', key: 'stock_item_name', align: 'start' },
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

const fetchStockItems = async () => {
  try {
    const response = await millService.getStockItems()
    if (response.status === 200) {
      stockItems.value = response.data || []
    }
  } catch (error) {
    console.error('Error fetching stock items:', error)
  }
}

const addStock = async () => {
  if (!isModuleEnabled.value) {
    toast.info('Please purchase the Mill Operations module to add a stock item.')
    return
  }

  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    const payload = {
      user_login_id: form.user_login_id,
      stock_item_name: form.stock_item_name,
      remarks: form.remarks,
    }
    const response = await millService.addStockItem(payload)
    if (response.status === 200 || response.status === 201) {
      toast.success('Stock item added successfully!')
      resetForm()
      fetchStockItems()
      fetchModuleStatus()
    }
  } catch (error) {
    console.error('Error submitting form:', error)
    toast.error(error.response?.data?.detail || 'Failed to add stock item.')
  }
}

const editStock = (item) => {
  if (!user || user.role !== 'admin') {
    toast.error('Only admins can edit stock item details.');
    return;
  }
  isEditMode.value = true
  selectedStockItemId.value = item.id
  form.stock_item_name = item.stock_item_name
  form.remarks = item.remarks
}

const updateStock = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    const payload = {
      id: selectedStockItemId.value,
      user_login_id: form.user_login_id,
      stock_item_name: form.stock_item_name,
      remarks: form.remarks,
    }
    const response = await millService.updateStockItem(selectedStockItemId.value, payload)
    if (response.status === 200 || response.status === 201) {
      toast.success('Stock item updated successfully!')
      resetForm()
      isEditMode.value = false
      selectedStockItemId.value = null
      fetchStockItems()
    }
  } catch (error) {
    console.error('Error updating stock item:', error)
    toast.error(error.response?.data?.detail || 'Failed to update stock item.')
  }
}

const cancelEdit = () => {
  isEditMode.value = false
  selectedStockItemId.value = null
  resetForm()
}

const resetForm = () => {
  form.stock_item_name = ''
  form.remarks = ''
  if (formRef.value) formRef.value.resetValidation()
}

onMounted(() => {
  const sessionUser = sessionStorage.getItem('user')
  if (sessionUser) {
    const user = JSON.parse(sessionUser)
    form.user_login_id = user.id
  }
  fetchStockItems()
  fetchModuleStatus();
  fetchFirmDetails()
})
</script>
