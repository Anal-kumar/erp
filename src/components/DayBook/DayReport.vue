<template>
  <v-container fluid>
    <v-card class="mb-4" elevation="2">
      <v-card-title class="text-h4 font-weight-bold text-center py-4 text-grey-darken-3">
        Daybook Report
      </v-card-title>
      <v-card-text>
        <!-- Filters -->
        <v-row justify="center" align="center" dense class="mb-4">
          <v-col cols="12" sm="6" md="3">
            <v-text-field v-model="filters.party_name" label="Party Name" placeholder="Search party name"
              variant="outlined" density="compact" hide-details clearable></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field v-model="filters.particular" label="Particular" placeholder="Search particular"
              variant="outlined" density="compact" hide-details clearable></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field v-model="filters.from_date" label="From Date" type="date" variant="outlined" density="compact"
              hide-details></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field v-model="filters.to_date" label="To Date" type="date" variant="outlined" density="compact"
              hide-details></v-text-field>
          </v-col>
        </v-row>

        <!-- Table -->
        <v-data-table :headers="headers" :items="filteredReport" :items-per-page="10" density="compact"
          class="elevation-1" hover fixed-header height="500px">
          <template v-slot:item.opening_bal="{ item }">
            ₹ {{ item.opening_bal }}
          </template>
          <template v-slot:item.ie_date="{ item }">
            {{ formatDate(item.ie_date) }}
          </template>
          <template v-slot:item.is_receipt="{ item }">
            <span :class="item.is_receipt ? 'text-green font-weight-bold' : 'text-red font-weight-bold'">
              {{ item.is_receipt ? 'RECEIPT' : 'PAYMENT' }}
            </span>
          </template>
          <template v-slot:item.is_bank="{ item }">
            {{ item.is_bank ? 'BANK' : 'CASH' }}
          </template>
          <template v-slot:item.amount="{ item }">
            <span :class="item.is_bank ? 'text-blue font-weight-bold' : 'text-pink font-weight-bold'">
              ₹ {{ item.amount }}
            </span>
          </template>
          <template v-slot:item.cheque_no="{ item }">
            {{ item.cheque_no || '-' }}
          </template>
          <template v-slot:item.closing_bal="{ item }">
            ₹ {{ item.closing_bal }}
          </template>
          <template v-slot:item.users.user_login_id="{ item }">
            {{ item.users?.user_login_id }}
          </template>
          <template v-slot:no-data>
            <div class="text-center text-grey-darken-1 py-4">
              No entries available.
            </div>
          </template>
        </v-data-table>

        <!-- Download Button -->
        <v-row justify="center" class="mt-4">
          <v-col cols="auto">
            <v-btn color="primary" size="large" prepend-icon="mdi-download" @click="downloadReport">
              Download Excel Report
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { daybookService } from '@/services'
import { useToast } from 'vue-toastification'

const toast = useToast()
const report = ref([])
const filters = reactive({
  party_name: '',
  particular: '',
  from_date: '',
  to_date: '',
})

const headers = [
  { title: 'ID', key: 'id', align: 'start' },
  { title: 'Opening Balance', key: 'opening_bal', align: 'end' },
  { title: 'Party Name', key: 'party_name', align: 'start' },
  { title: 'Date', key: 'ie_date', align: 'start' },
  { title: 'Particular', key: 'particular', align: 'start' },
  { title: 'Transaction Type', key: 'is_receipt', align: 'center' },
  { title: 'Transaction Mode', key: 'is_bank', align: 'center' },
  { title: 'Amount', key: 'amount', align: 'end' },
  { title: 'Cheque No.', key: 'cheque_no', align: 'start' },
  { title: 'Closing Balance', key: 'closing_bal', align: 'end' },
  { title: 'Entry by', key: 'users.user_login_id', align: 'start' },
]

onMounted(() => {
  fetchReport()
})

const filteredReport = computed(() => {
  return report.value.filter((entry) => {
    const matchesParty =
      !filters.party_name ||
      entry.party_name?.toLowerCase().includes(filters.party_name.toLowerCase())
    const matchesParticular =
      !filters.particular ||
      entry.particular?.toLowerCase().includes(filters.particular.toLowerCase())

    const entryDate = new Date(entry.ie_date)
    const from = filters.from_date ? new Date(filters.from_date) : null
    const to = filters.to_date ? new Date(filters.to_date) : null
    const matchesDate = (!from || entryDate >= from) && (!to || entryDate <= to)

    return matchesParty && matchesParticular && matchesDate
  })
})

const fetchReport = async () => {
  try {
    const response = await daybookService.getDayBookReport()
    report.value = response.data
  } catch (error) {
    console.error('Fetch failed:', error)
    toast.error('Failed to fetch report')
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

const downloadReport = async () => {
  // Build query parameters from filters
  const params = new URLSearchParams()
  if (filters.party_name) params.append('party_name', filters.party_name)
  if (filters.particular) params.append('particular', filters.particular)
  if (filters.from_date) params.append('from_date', filters.from_date)
  if (filters.to_date) params.append('to_date', filters.to_date)

  params.append('download', 'true')

  try {
    const response = await daybookService.downloadDayBookReport(params)
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'daybook_report_filtered.xlsx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Download failed:', error)
    toast.error('Download failed.')
  }
}
</script>

<style scoped>
.text-green {
  color: #4caf50 !important;
}

.text-red {
  color: #f44336 !important;
}

.text-blue {
  color: #2196f3 !important;
}

.text-pink {
  color: #e91e63 !important;
}
</style>
