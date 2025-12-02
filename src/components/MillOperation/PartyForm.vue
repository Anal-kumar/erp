<template>
  <v-container fluid>
    <v-row>
      <!-- Form Section -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="rounded-lg">
          <v-card-title class="text-h6 font-weight-bold text-center py-4 bg-primary text-white">
            {{ isEditMode ? 'Update Party' : 'Add Party' }}
          </v-card-title>

          <v-card-text class="pt-6">
            <v-form ref="formRef" @submit.prevent="isEditMode ? updateParty() : addParty()">
              <v-text-field v-model="form.party_name" label="Party Name" placeholder="Enter a party name"
                variant="outlined" density="comfortable" :rules="[v => !!v || 'Party name is required']"
                @input="form.party_name = $event.target.value.toUpperCase()" class="mb-2"></v-text-field>

              <v-text-field v-model="form.party_mob_no" label="Mobile Number" placeholder="Enter a mobile number"
                variant="outlined" density="comfortable" :rules="[
                  v => !!v || 'Mobile number is required',
                  v => /^\d{10}$/.test(v) || 'Mobile number must be 10 digits'
                ]" @input="form.party_mob_no = $event.target.value.replace(/\D/g, '')" maxlength="10"
                class="mb-2"></v-text-field>

              <v-text-field v-model="form.party_address" label="Address" placeholder="Enter an address"
                variant="outlined" density="comfortable" :rules="[v => !!v || 'Address is required']"
                @input="form.party_address = $event.target.value.toUpperCase()" class="mb-2"></v-text-field>

              <v-select v-model="form.party_type" :items="Parties_type" item-title="label" item-value="label"
                label="Party Type" placeholder="Select party type" variant="outlined" density="comfortable"
                :rules="[v => !!v || 'Party type is required']" class="mb-2"></v-select>

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
            <span class="text-h6 font-weight-bold text-grey-darken-3">Party List</span>
          </v-card-title>

          <v-card-text class="pa-4">
            <v-row class="mb-4">
              <v-col cols="12" md="4">
                <v-text-field v-model="filters.name" label="Filter by Name" prepend-inner-icon="mdi-magnify"
                  variant="outlined" density="compact" hide-details></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="filters.address" label="Filter by Address" prepend-inner-icon="mdi-map-marker"
                  variant="outlined" density="compact" hide-details></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-select v-model="filters.type" :items="['All Types', ...Parties_type.map(t => t.label)]"
                  label="Filter by Type" variant="outlined" density="compact" hide-details></v-select>
              </v-col>
            </v-row>

            <v-data-table :headers="headers" :items="filteredParties" :items-per-page="firm.page_size || 10"
              class="elevation-1 border rounded" hover>
              <template v-slot:item.sno="{ index }">
                {{ index + 1 }}
              </template>

              <template v-slot:item.actions="{ item }">
                <v-btn icon="mdi-pencil" size="small" color="primary" variant="text" @click="editParty(item)"></v-btn>
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
import { millService, moduleService, adminService } from '@/services'
import { useToast } from 'vue-toastification'

const toast = useToast()
const isEditMode = ref(false)
const selectedPartyId = ref(null)
const isModuleEnabled = ref(true)
const user = JSON.parse(sessionStorage.getItem('user')) || null
const formRef = ref(null)

// List of fetched parties
const parties = ref([])
const firm = ref({ page_size: 10 })

// Party types array for the dropdown
const Parties_type = ref([
  { label: 'FARMER' },
  { label: 'FCI - CMR' },
  { label: 'NAN - CMR' },
  { label: 'GOVT' },
  { label: 'RICE MILL' },
  { label: 'EXPORTER' },
  { label: 'BROKER' },
])

const filters = reactive({
  name: '',
  address: '',
  type: 'All Types',
})

const headers = [
  { title: 'SNO', key: 'sno', align: 'center', sortable: false },
  { title: 'NAME', key: 'party_name', align: 'start' },
  { title: 'MOBILE', key: 'party_mob_no', align: 'center' },
  { title: 'ADDRESS', key: 'party_address', align: 'start' },
  { title: 'TYPE', key: 'party_type', align: 'center' },
  { title: 'REMARK', key: 'remarks', align: 'start' },
  { title: 'ENTRY BY', key: 'user_login', align: 'center' },
  { title: 'ACTION', key: 'actions', align: 'center', sortable: false },
]

// Compute filtered parties
const filteredParties = computed(() => {
  return parties.value.filter((party) => {
    const matchesName = filters.name
      ? party.party_name.toLowerCase().includes(filters.name.toLowerCase())
      : true
    const matchesAddress = filters.address
      ? party.party_address.toLowerCase().includes(filters.address.toLowerCase())
      : true
    const matchesType = filters.type && filters.type !== 'All Types'
      ? party.party_type === filters.type
      : true
    return matchesName && matchesAddress && matchesType
  })
})

// Reactive form
const form = reactive({
  party_name: '',
  party_mob_no: '',
  party_address: '',
  party_type: null,
  remarks: '',
  user_login_id: '',
})

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

// Fetch parties
const fetchParties = async () => {
  try {
    const response = await millService.getParties()
    parties.value = response.data
  } catch (error) {
    console.error('Error fetching parties:', error)
    toast.error('Failed to fetch parties.')
  }
}

// Submit function for adding a party
const addParty = async () => {
  if (!isModuleEnabled.value) {
    toast.info('Please purchase the Mill Operations module to add a party.')
    return
  }

  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    const payload = {
      user_login_id: form.user_login_id,
      party_name: form.party_name,
      party_mob_no: form.party_mob_no,
      party_address: form.party_address,
      party_type: form.party_type,
      remarks: form.remarks,
    }

    const response = await millService.addParty(payload)

    if (response.status === 200 || response.status === 201) {
      toast.success('Successfully added party details')
      resetForm()
      fetchParties()
      fetchModuleStatus()
    }
  } catch (error) {
    console.error('Error submitting form:', error)
    toast.error(error.response?.data?.detail || 'Failed to save entry.')
  }
}

// Edit party
const editParty = (party) => {
  if (!user || user.role !== 'admin') {
    toast.error('Only admins can edit party details.');
    return;
  }
  isEditMode.value = true
  selectedPartyId.value = party.id
  form.party_name = party.party_name
  form.party_mob_no = party.party_mob_no
  form.party_address = party.party_address
  form.party_type = party.party_type
  form.remarks = party.remarks
}

// Cancel edit
const cancelEdit = () => {
  isEditMode.value = false
  selectedPartyId.value = null
  resetForm()
}

const resetForm = () => {
  form.party_name = ''
  form.party_mob_no = ''
  form.party_address = ''
  form.party_type = null
  form.remarks = ''
  if (formRef.value) formRef.value.resetValidation()
}

// Update party
const updateParty = async () => {
  if (!isModuleEnabled.value) {
    toast.info('Please purchase the Mill Operations module to update a party.')
    return
  }

  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    const payload = {
      id: selectedPartyId.value,
      user_login_id: form.user_login_id,
      party_name: form.party_name,
      party_mob_no: form.party_mob_no,
      party_address: form.party_address,
      party_type: form.party_type,
      remarks: form.remarks,
    }

    const response = await millService.updateParty(selectedPartyId.value, payload)

    if (response.status === 200 || response.status === 201) {
      toast.success('Party details updated')
      resetForm()
      isEditMode.value = false
      selectedPartyId.value = null
      fetchParties()
      fetchModuleStatus()
    }
  } catch (error) {
    console.error('Error updating party:', error)
    toast.error(error.response?.data?.detail || 'Failed to update party.')
  }
}

// On component mount
onMounted(() => {
  const sessionUser = sessionStorage.getItem('user')
  if (sessionUser) {
    const user = JSON.parse(sessionUser)
    form.user_login_id = user.id
  }
  fetchModuleStatus()
  fetchParties()
  fetchFirmDetails()
})
</script>
