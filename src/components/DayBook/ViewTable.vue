<template>
  <v-container fluid>
    <!-- Filters -->
    <v-row class="mb-4" justify="center" align="center">
      <v-col cols="12" sm="4" md="3">
        <v-text-field v-model="partyNameFilter" label="Party Name" placeholder="Filter by Party Name" variant="outlined"
          density="compact" hide-details clearable></v-text-field>
      </v-col>
      <v-col cols="12" sm="4" md="3">
        <v-text-field v-model="start_dateFilter" label="Start Date" type="date" variant="outlined" density="compact"
          hide-details></v-text-field>
      </v-col>
      <v-col cols="12" sm="4" md="3">
        <v-text-field v-model="end_dateFilter" label="End Date" type="date" variant="outlined" density="compact"
          hide-details></v-text-field>
      </v-col>
    </v-row>

    <v-row>
      <!-- RECEIPT TABLE -->
      <v-col cols="12" lg="6">
        <v-card class="h-100" elevation="2">
          <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-blue-lighten-4 text-blue-darken-4">
            RECEIPT
          </v-card-title>
          <v-card-text class="pa-0">
            <v-data-table :headers="headers" :items="filteredIncomeEntries" :items-per-page="firm.page_size || 10"
              density="compact" class="elevation-0" hover fixed-header height="500px">
              <template v-slot:item.sno="{ index }">
                {{ index + 1 }}
              </template>
              <template v-slot:item.time_stamp="{ item }">
                {{ formatDate(item.time_stamp) }}
              </template>
              <template v-slot:item.party_name="{ item }">
                {{ item.party_name?.toUpperCase() }}
              </template>
              <template v-slot:item.particular="{ item }">
                {{ item.particular?.toUpperCase() }}
              </template>
              <template v-slot:item.amount="{ item }">
                <span :class="item.is_bank ? 'text-blue font-weight-bold' : 'text-pink font-weight-bold'">
                  ₹ {{ item.amount }}
                </span>
              </template>
              <template v-slot:item.opening_bal="{ item }">
                ₹ {{ item.opening_bal }}
              </template>
              <template v-slot:item.closing_bal="{ item }">
                ₹ {{ item.closing_bal }}
              </template>
              <template v-slot:item.ref_no="{ item }">
                {{ item.ref_no || '-' }}
              </template>
              <template v-slot:item.remarks="{ item }">
                {{ item.remarks?.toUpperCase() }}
              </template>
              <template v-slot:item.actions="{ item }">
                <v-icon color="primary" size="small" class="cursor-pointer" @click="openEdit(item)">
                  mdi-pencil
                </v-icon>
              </template>
              <template v-slot:no-data>
                <div class="text-center text-grey-darken-1 py-4">
                  No entries available.
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- PAYMENT TABLE -->
      <v-col cols="12" lg="6">
        <v-card class="h-100" elevation="2">
          <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-red-lighten-4 text-red-darken-4">
            PAYMENT
          </v-card-title>
          <v-card-text class="pa-0">
            <v-data-table :headers="headers" :items="filteredExpenseEntries" :items-per-page="firm.page_size || 10"
              density="compact" class="elevation-0" hover fixed-header height="500px">
              <template v-slot:item.sno="{ index }">
                {{ index + 1 }}
              </template>
              <template v-slot:item.time_stamp="{ item }">
                {{ formatDate(item.time_stamp) }}
              </template>
              <template v-slot:item.party_name="{ item }">
                {{ item.party_name?.toUpperCase() }}
              </template>
              <template v-slot:item.particular="{ item }">
                {{ item.particular?.toUpperCase() }}
              </template>
              <template v-slot:item.amount="{ item }">
                <span :class="item.is_bank ? 'text-blue font-weight-bold' : 'text-pink font-weight-bold'">
                  ₹ {{ item.amount }}
                </span>
              </template>
              <template v-slot:item.opening_bal="{ item }">
                ₹ {{ item.opening_bal }}
              </template>
              <template v-slot:item.closing_bal="{ item }">
                ₹ {{ item.closing_bal }}
              </template>
              <template v-slot:item.ref_no="{ item }">
                {{ item.ref_no || '-' }}
              </template>
              <template v-slot:item.remarks="{ item }">
                {{ item.remarks?.toUpperCase() }}
              </template>
              <template v-slot:item.actions="{ item }">
                <v-icon color="primary" size="small" class="cursor-pointer" @click="openEdit(item)">
                  mdi-pencil
                </v-icon>
              </template>
              <template v-slot:no-data>
                <div class="text-center text-grey-darken-1 py-4">
                  No entries available.
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Edit Modal -->
    <v-dialog v-model="OpenEditModal" max-width="500px">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
          Edit Entry
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form @submit.prevent="saveEdit">
            <v-row dense>
              <v-col cols="12">
                <v-text-field v-model="editEntry.io_date" label="Date" type="date" variant="outlined"
                  density="compact"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="editEntry.party_name" label="Party Name" variant="outlined" density="compact"
                  @input="editEntry.party_name = $event.target.value.toUpperCase()"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="editEntry.particular" label="Particular" variant="outlined" density="compact"
                  @input="editEntry.particular = $event.target.value.toUpperCase()"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select v-model="editEntry.is_receipt"
                  :items="[{ text: 'RECEIPT', value: true }, { text: 'PAYMENT', value: false }]" item-title="text"
                  item-value="value" label="Transaction Type" variant="outlined" density="compact"></v-select>
              </v-col>
              <v-col cols="12">
                <v-select v-model="editEntry.is_bank"
                  :items="[{ text: 'BANK', value: true }, { text: 'CASH', value: false }]" item-title="text"
                  item-value="value" label="Transaction Category" variant="outlined" density="compact"></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model.number="editEntry.amount" label="Amount" type="number" variant="outlined"
                  density="compact"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="editEntry.ref_no" label="Reference Number" variant="outlined"
                  density="compact"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="editEntry.remarks" label="Remarks" variant="outlined" density="compact"
                  @input="editEntry.remarks = $event.target.value.toUpperCase()"></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-center pb-4">
          <v-btn color="primary" variant="elevated" @click="saveEdit" :loading="isUpdating">
            {{ isUpdating ? 'Updating...' : 'Update' }}
          </v-btn>
          <v-btn color="error" variant="outlined" @click="closeEditModal">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'
import config from '@/config.js'
import daybookService from '@/services/daybookService'
import { useToast } from 'vue-toastification'

const toast = useToast()

const incomeEntries = ref([])
const expenseEntries = ref([])
const firm = ref({})
const OpenEditModal = ref(false)
const partyNameFilter = ref('')
const start_dateFilter = ref('')
const end_dateFilter = ref('')
const user = ref(JSON.parse(sessionStorage.getItem('user')))
const isUpdating = ref(false)
const editEntryId = ref(null)

const editEntry = reactive({
  io_date: '',
  party_name: '',
  particular: '',
  is_receipt: true,
  is_bank: false,
  amount: '',
  user_login_id: '',
  ref_no: '',
  remarks: '',
})

const headers = [
  { title: 'SNO', key: 'sno', align: 'start', sortable: false },
  { title: 'Tid', key: 'id', align: 'start' },
  { title: 'Date', key: 'time_stamp', align: 'start' },
  { title: 'Opening Balance', key: 'opening_bal', align: 'end' },
  { title: 'Party Name', key: 'party_name', align: 'start' },
  { title: 'Particular', key: 'particular', align: 'start' },
  { title: 'Amount', key: 'amount', align: 'end' },
  { title: 'Cheque No', key: 'ref_no', align: 'start' },
  { title: 'Closing Balance', key: 'closing_bal', align: 'end' },
  { title: 'Remark', key: 'remarks', align: 'start' },
  { title: 'Entry By', key: 'user_login', align: 'start' },
  { title: 'Action', key: 'actions', align: 'center', sortable: false },
]

onMounted(() => {
  fetchEntries()
  fetchFirmDetails()
  if (user.value) {
    editEntry.user_login_id = user.value.id
  }
})

const filteredIncomeEntries = computed(() => {
  return incomeEntries.value.filter((entry) => {
    const matchesPartyName = partyNameFilter.value
      ? entry.party_name.toLowerCase().includes(partyNameFilter.value.toLowerCase())
      : true
    const entryDate = new Date(entry.time_stamp)
    const startDate = start_dateFilter.value ? new Date(start_dateFilter.value) : null
    const endDate = end_dateFilter.value ? new Date(end_dateFilter.value) : null

    const matchesDate =
      (!startDate || entryDate >= startDate) && (!endDate || entryDate <= endDate)
    return matchesPartyName && matchesDate
  })
})

const filteredExpenseEntries = computed(() => {
  return expenseEntries.value.filter((entry) => {
    const matchesPartyName = partyNameFilter.value
      ? entry.party_name.toLowerCase().includes(partyNameFilter.value.toLowerCase())
      : true
    const entryDate = new Date(entry.time_stamp)
    const startDate = start_dateFilter.value ? new Date(start_dateFilter.value) : null
    const endDate = end_dateFilter.value ? new Date(end_dateFilter.value) : null

    const matchesDate =
      (!startDate || entryDate >= startDate) && (!endDate || entryDate <= endDate)
    return matchesPartyName && matchesDate
  })
})

const fetchFirmDetails = async () => {
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/firm_details/get_firm_details`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      }
    );
    if (response.status === 200 && response.data) {
      firm.value = {
        firm_name: response.data.firm_name || 'Unknown Firm',
        firm_address: response.data.firm_address || 'Unknown Address',
        page_size: response.data.page_size
      };
    } else {
      firm.value = {
        firm_name: 'Unavailable',
        firm_address: 'Unavailable',
        page_size: 10
      };
      toast.error('Failed to fetch firm details: Invalid response');
    }
  } catch (err) {
    console.error('Failed to fetch firm details:', err);
    firm.value = {
      firm_name: 'Error',
      firm_address: 'Error',
      page_size: 10
    };
    toast.error('Failed to fetch firm details');
  }
}

const fetchEntries = async () => {
  try {
    const response = await daybookService.getDayBookEntries()

    incomeEntries.value = response.data.filter((entry) => entry.is_receipt === true)
    expenseEntries.value = response.data.filter((entry) => entry.is_receipt === false)
  } catch (error) {
    console.error('Error fetching entries:', error)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const openEdit = (entry) => {
  // Check if user exists and has 'admin' or 'superadmin' role
  if (!user.value || (user.value.role !== 'admin' && user.value.role !== 'superadmin')) {
    toast.error('Only admins can edit entries')
    return
  }

  // Populate editEntry
  Object.assign(editEntry, {
    ...entry,
    io_date: new Date(entry.time_stamp).toISOString().split('T')[0], // Convert to YYYY-MM-DD
  })
  editEntryId.value = entry.id
  OpenEditModal.value = true
}

const closeEditModal = () => {
  OpenEditModal.value = false
  // Reset editEntry
  Object.assign(editEntry, {
    io_date: '',
    party_name: '',
    particular: '',
    is_receipt: true,
    is_bank: false,
    amount: '',
    ref_no: '',
    remarks: '',
  })
}

const saveEdit = async () => {
  isUpdating.value = true
  try {
    const payload = {
      user_login_id: user.value?.id || editEntry.user_login_id,
      party_name: editEntry.party_name,
      particular: editEntry.particular,
      is_receipt: editEntry.is_receipt,
      is_bank: editEntry.is_bank,
      amount: editEntry.amount,
      ref_no: editEntry.ref_no,
      remarks: editEntry.remarks,
      time_stamp: new Date(editEntry.io_date).toISOString(),
    }

    await daybookService.updateDayBookEntry(editEntryId.value, payload)

    OpenEditModal.value = false
    fetchEntries()
    toast.success('Entry updated successfully')
  } catch (error) {
    console.error('Update failed:', error.response?.data || error.message)
    toast.error('Update failed')
  } finally {
    isUpdating.value = false
  }
}
</script>

<style scoped>
.text-blue {
  color: #0000ff !important;
}

.text-pink {
  color: #ff00ff !important;
}
</style>
