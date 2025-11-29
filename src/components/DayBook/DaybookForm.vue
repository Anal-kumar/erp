<template>
  <v-container fluid>
    <v-row>
      <!-- Form Section -->
      <v-col cols="12" md="4">
        <v-card class="h-100" elevation="2">
          <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
            Daybook Entry
          </v-card-title>
          <v-card-text class="pa-4">
            <v-form @submit.prevent="submitForm" ref="formRef">
              <v-row dense>
                <!-- Date -->
                <v-col cols="12">
                  <v-text-field v-model="dateInput" label="Date" type="date" variant="outlined" density="compact"
                    required :rules="[v => !!v || 'Date is required']"></v-text-field>
                </v-col>

                <!-- Party Name -->
                <v-col cols="12">
                  <v-text-field v-model="form.party_name" label="Party Name" placeholder="Enter Party Name"
                    variant="outlined" density="compact" required :rules="[v => !!v || 'Party Name is required']"
                    @input="form.party_name = $event.target.value.toUpperCase()"></v-text-field>
                </v-col>

                <!-- Particular -->
                <v-col cols="12">
                  <v-text-field v-model="form.particular" label="Particular" placeholder="Enter Particular"
                    variant="outlined" density="compact" required :rules="[v => !!v || 'Particular is required']"
                    @input="form.particular = $event.target.value.toUpperCase()"></v-text-field>
                </v-col>

                <!-- Transaction Type -->
                <v-col cols="12">
                  <v-select v-model="form.is_receipt" :items="transactionTypes" item-title="text" item-value="value"
                    label="Transaction Type" placeholder="Select type" variant="outlined" density="compact" required
                    :rules="[v => v !== '' || 'Transaction Type is required']"></v-select>
                </v-col>

                <!-- Transaction Mode -->
                <v-col cols="12">
                  <v-select v-model="form.is_bank" :items="transactionModes" item-title="text" item-value="value"
                    label="Transaction Mode" placeholder="Select Category" variant="outlined" density="compact" required
                    :rules="[v => v !== '' || 'Transaction Mode is required']">
                    <template v-slot:item="{ props, item }">
                      <v-list-item v-bind="props" :class="item.raw.color"></v-list-item>
                    </template>
                    <template v-slot:selection="{ item }">
                      <span :class="item.raw.color">{{ item.title }}</span>
                    </template>
                  </v-select>
                </v-col>

                <!-- Amount -->
                <v-col cols="12">
                  <v-text-field v-model="form.amount" label="Amount" placeholder="Enter an Amount" variant="outlined"
                    density="compact" required :rules="[v => !!v || 'Amount is required']"
                    @input="form.amount = form.amount.replace(/[^0-9]/g, '')"></v-text-field>
                </v-col>

                <!-- Reference Number -->
                <v-col cols="12">
                  <v-text-field v-model="form.ref_no" label="Reference Number" placeholder="Enter Cheque Number"
                    variant="outlined" density="compact" maxlength="22"
                    @input="form.ref_no = $event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')"></v-text-field>
                </v-col>

                <!-- Remark -->
                <v-col cols="12">
                  <v-textarea v-model="form.remarks" label="Remark" rows="3" variant="outlined" density="compact"
                    required :rules="[v => !!v || 'Remark is required']"
                    @input="form.remarks = $event.target.value.toUpperCase()"></v-textarea>
                </v-col>

                <!-- Submit Button -->
                <v-col cols="12" class="text-center">
                  <v-btn color="primary" type="submit" :disabled="!isModuleEnabled" class="px-6">
                    Submit
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Transaction Table Section -->
      <v-col cols="12" md="8">
        <v-card class="h-100" elevation="2">
          <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-grey-lighten-3">
            Last 9 Transactions
          </v-card-title>
          <v-card-text class="pa-0">
            <v-data-table :headers="headers" :items="lastTransactions" density="compact" class="elevation-0" hover
              fixed-header height="calc(100vh - 200px)" :items-per-page="-1" hide-default-footer>
              <template v-slot:item.time_stamp="{ item }">
                {{ formatDate(item.time_stamp) }}
              </template>
              <template v-slot:item.is_receipt="{ item }">
                {{ item.is_receipt ? 'Receipt' : 'Payment' }}
              </template>
              <template v-slot:item.opening_bal="{ item }">
                ₹ {{ item.opening_bal }}
              </template>
              <template v-slot:item.amount="{ item }">
                <span class="font-weight-medium">₹ {{ item.amount }}</span>
              </template>
              <template v-slot:item.closing_bal="{ item }">
                ₹ {{ item.closing_bal }}
              </template>
              <template v-slot:no-data>
                <div class="text-center text-grey-darken-1 py-4">
                  No transactions available.
                </div>
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
import daybookService from '@/services/daybookService'
import { useToast } from 'vue-toastification'

// Reactive form object
const form = reactive({
  ie_date: '',
  user_login_id: '',
  party_name: '',
  particular: '',
  is_receipt: '',
  is_bank: '',
  amount: '',
  ref_no: '',
  remarks: '',
})

const dateInput = ref('')
const toast = useToast()
const isModuleEnabled = ref(true)
const lastTransactions = ref([])
const formRef = ref(null)

const transactionTypes = [
  { text: 'RECEIPT', value: true },
  { text: 'PAYMENT', value: false },
]

const transactionModes = [
  { text: 'BANK', value: true, color: 'text-blue' },
  { text: 'CASH', value: false, color: 'text-pink' },
]

const headers = [
  { title: 'S.No', key: 'id', align: 'start' },
  { title: 'Date', key: 'time_stamp', align: 'start' },
  { title: 'Transaction Type', key: 'is_receipt', align: 'start' },
  { title: 'Opening Balance', key: 'opening_bal', align: 'start' },
  { title: 'Party Name', key: 'party_name', align: 'start' },
  { title: 'Particular', key: 'particular', align: 'start' },
  { title: 'Amount (₹)', key: 'amount', align: 'end' },
  { title: 'Closing Balance', key: 'closing_bal', align: 'end' },
]

// Load user ID from sessionStorage on mount
onMounted(() => {
  const sessionUser = sessionStorage.getItem('user')
  if (sessionUser) {
    const user = JSON.parse(sessionUser)
    form.user_login_id = user.id
  }
  fetchModuleStatus()
  fetchLastTransactions()
})

// Fetch module status
const fetchModuleStatus = async () => {
  try {
    const response = await daybookService.getModuleStatus()

    const modules = response.data
    const DayBookModule = modules.find((m) => m.module_name === 'day_book')
    if (!DayBookModule) {
      console.warn('Day book Operations module not found')
      isModuleEnabled.value = false
      toast.error('Day book module not found. Contact support.')
      return
    }
    isModuleEnabled.value = DayBookModule.module_enabled

  } catch (error) {
    console.error('Error fetching module status:', error)
    isModuleEnabled.value = false
    toast.error('Failed to fetch module status. Please check your network or contact support.')
  }
}

// Fetch last transactions
async function fetchLastTransactions() {
  try {
    const response = await daybookService.getDayBookEntries()
    if (response.status === 200) {
      lastTransactions.value = response.data.slice(-9)
    }
  } catch (error) {
    console.error('Error fetching last transactions:', error)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// Submit form
const submitForm = async () => {
  if (!isModuleEnabled.value) {
    toast.info('Please purchase the day book module.')
    return
  }

  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    if (!dateInput.value) {
      toast.error('Please enter a date')
      return
    }

    const isoDate = dateInput.value

    const payload = {
      user_login_id: form.user_login_id,
      party_name: form.party_name,
      particular: form.particular,
      is_receipt: form.is_receipt,
      is_bank: form.is_bank,
      amount: parseInt(form.amount),
      ref_no: form.ref_no || null,
      remarks: form.remarks || '',
      ie_date: isoDate,
    }

    const response = await daybookService.createDayBookEntry(payload)

    if (response.status === 200 || response.status === 201) {
      toast.success('Entry saved successfully')
      // Reset form
      form.party_name = ''
      form.particular = ''
      form.is_receipt = ''
      form.is_bank = ''
      form.amount = ''
      form.ref_no = ''
      form.remarks = ''
      dateInput.value = ''
      if (formRef.value) formRef.value.resetValidation()

      // Refetch last transactions to update list
      fetchLastTransactions()
      fetchModuleStatus()
    }
  } catch (error) {
    console.error('Error submitting form:', error)
    toast.error(error.response?.data?.detail || 'Failed to save entry. See console for details.')
  }
}
</script>

<style scoped>
/* Custom styles if needed, mostly handled by Vuetify */
.text-blue {
  color: #0000ff !important;
}

.text-pink {
  color: #ff00ff !important;
}
</style>
