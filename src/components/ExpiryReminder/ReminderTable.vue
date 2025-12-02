<template>
  <v-container fluid>
    <v-card elevation="2">
      <v-card-title class="text-h5 font-weight-bold py-4">Document List</v-card-title>
      <v-card-text>
        <v-data-table :headers="headers" :items="documents" :items-per-page="firm.page_size || 10" density="compact"
          class="elevation-1" hover>
          <template v-slot:item.sno="{ index }">
            {{ index + 1 }}
          </template>
          <template v-slot:item.days="{ item }">
            <v-chip :color="getDaysColor(item.expiry_date, item.doc_priority)" size="small" variant="flat"
              class="font-weight-bold">
              {{ calculateDaysRemaining(item.expiry_date) }}
            </v-chip>
          </template>
          <template v-slot:item.document_name="{ item }">
            <span :class="getTextColor(item.expiry_date, item.doc_priority)">
              {{ item.document_name }}
            </span>
          </template>
          <template v-slot:item.issue_date="{ item }">
            {{ formatDate(item.issue_date) }}
          </template>
          <template v-slot:item.renewal_date="{ item }">
            {{ formatDate(item.renewal_date) || '-' }}
          </template>
          <template v-slot:item.expiry_date="{ item }">
            {{ formatDate(item.expiry_date) }}
          </template>
          <template v-slot:item.users.user_login_id="{ item }">
            {{ item.users?.user_login_id }}
          </template>
          <template v-slot:item.actions="{ item }">
            <div class="d-flex ga-2 justify-center">
              <v-icon color="grey" size="small" class="cursor-pointer" @click="openModal(item)" title="View Details">
                mdi-eye
              </v-icon>
              <v-icon color="success" size="small" class="cursor-pointer" @click="openRenewModal(item)" title="Renew">
                mdi-refresh
              </v-icon>
              <v-icon color="primary" size="small" class="cursor-pointer" @click="OpenEditModal(item)" title="Edit">
                mdi-pencil
              </v-icon>
              <v-icon color="error" size="small" class="cursor-pointer" @click="deleteDocument(item.id)" title="Delete">
                mdi-delete
              </v-icon>
            </div>
          </template>
          <template v-slot:no-data>
            <div class="text-center text-grey-darken-1 py-4">
              No reminders found
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- View Modal -->
    <DocModal :show="showModal" @close="hideModal">
      <v-card-title class="text-h5 font-weight-bold text-center">Document Details</v-card-title>
      <v-card-text>
        <v-table density="compact" class="mb-4">
          <tbody>
            <tr>
              <td class="font-weight-bold">Document Name</td>
              <td>{{ selectedDocument?.document_name }}</td>
            </tr>
            <tr>
              <td class="font-weight-bold">Document Number</td>
              <td>{{ selectedDocument?.document_number }}</td>
            </tr>
            <tr>
              <td class="font-weight-bold">Issue Date</td>
              <td>{{ formatDate(selectedDocument?.issue_date) }}</td>
            </tr>
            <tr>
              <td class="font-weight-bold">Expiry Date</td>
              <td>{{ formatDate(selectedDocument?.expiry_date) }}</td>
            </tr>
            <tr>
              <td class="font-weight-bold">Priority</td>
              <td>{{ selectedDocument?.doc_priority }}</td>
            </tr>
            <tr>
              <td class="font-weight-bold">Details</td>
              <td>{{ selectedDocument?.document_detail }}</td>
            </tr>
            <tr>
              <td class="font-weight-bold">Login ID</td>
              <td>
                {{ selectedDocument?.doc_login_id }}
                <v-icon size="small" class="ml-2 cursor-pointer" @click="showPassword = !showPassword">
                  {{ showPassword ? 'mdi-eye-off' : 'mdi-eye' }}
                </v-icon>
              </td>
            </tr>
            <tr v-if="isAdmin()">
              <td class="font-weight-bold">Password</td>
              <td>
                <span v-if="showPassword">{{ selectedDocument?.doc_login_password }}</span>
                <span v-else>••••••</span>
              </td>
            </tr>
            <tr>
              <td class="font-weight-bold">Agent Name</td>
              <td>{{ selectedDocument?.agent_name }}</td>
            </tr>
            <tr>
              <td class="font-weight-bold">Agent Mobile</td>
              <td>{{ selectedDocument?.agent_mob }}</td>
            </tr>
            <tr>
              <td class="font-weight-bold">Entry By</td>
              <td>{{ selectedDocument?.users?.user_login_id }}</td>
            </tr>
            <tr>
              <td class="font-weight-bold">Remarks</td>
              <td>{{ selectedDocument?.remarks }}</td>
            </tr>
          </tbody>
        </v-table>

        <h3 class="text-h6 font-weight-bold text-center mb-2">Renewal History</h3>
        <v-data-table :headers="historyHeaders" :items="renewalHistory" density="compact" hide-default-footer>
          <template v-slot:item.renewal_date="{ item }">
            {{ formatDate(item.renewal_date) }}
          </template>
          <template v-slot:item.expiry_date="{ item }">
            {{ formatDate(item.expiry_date) }}
          </template>
          <template v-slot:no-data>
            <div class="text-center text-grey">No renewal history found</div>
          </template>
        </v-data-table>
      </v-card-text>
    </DocModal>

    <!-- Renew Modal -->
    <DocModal :show="showRenewModal" @close="hideRenewModal">
      <v-card-title class="text-h5 font-weight-bold text-center">Renew Document</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="submitRenewal">
          <v-row dense>
            <v-col cols="12">
              <v-text-field v-model="renewDoc.renewal_date" label="Renewal Date" type="date" variant="outlined"
                density="compact" required></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="renewDoc.expiry_date" label="Expiry Date" type="date" variant="outlined"
                density="compact" required></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model.number="renewDoc.renewal_amount" label="Renewal Amount" type="number"
                variant="outlined" density="compact" required></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="renewDoc.remarks" label="Remarks" rows="3" variant="outlined"
                density="compact"></v-textarea>
            </v-col>
          </v-row>
          <v-btn block color="primary" type="submit" class="mt-4">Renew</v-btn>
        </v-form>
      </v-card-text>
    </DocModal>

    <!-- Edit Modal -->
    <DocModal :show="showEditModal" @close="hideEditModal">
      <v-card-title class="text-h5 font-weight-bold text-center">Edit Document</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="updateDocument">
          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field v-model="editForm.document_name" label="Document Name" variant="outlined" density="compact"
                required @input="editForm.document_name = $event.target.value.toUpperCase()"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="editForm.document_number" label="Document Number" variant="outlined"
                density="compact" required></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="editForm.expiry_date" label="Expiry Date" type="date" variant="outlined"
                density="compact" required></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="editForm.doc_priority" :items="['HIGH', 'MEDIUM', 'LOW']" label="Priority"
                variant="outlined" density="compact"></v-select>
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="editForm.document_detail" label="Details" rows="2" variant="outlined"
                density="compact" @input="editForm.document_detail = $event.target.value.toUpperCase()"></v-textarea>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="editForm.doc_login_id" label="Login ID" variant="outlined"
                density="compact"></v-text-field>
            </v-col>
            <v-col cols="12" md="6" v-if="isAdmin()">
              <v-text-field v-model="editForm.doc_login_password" :type="showPassword ? 'text' : 'password'"
                label="Password" variant="outlined" density="compact"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="togglePassword"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="editForm.agent_name" label="Agent Name" variant="outlined" density="compact"
                @input="editForm.agent_name = $event.target.value.toUpperCase()"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="editForm.agent_address" label="Agent Address" variant="outlined" density="compact"
                @input="editForm.agent_address = $event.target.value.toUpperCase()"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="editForm.agent_mob" label="Agent Mobile" variant="outlined" density="compact"
                maxlength="10"></v-text-field>
            </v-col>
          </v-row>
          <v-row class="mt-4" justify="center">
            <v-col cols="auto">
              <v-btn color="primary" type="submit" class="mr-2">Update</v-btn>
              <v-btn color="grey" variant="outlined" @click="hideEditModal">Cancel</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </DocModal>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import storage from '@/utils/storage'
import { expiryReminderService, firmDetailsService } from '@/services'
import DocModal from './DocModal.vue'
import { useToast } from 'vue-toastification'

const toast = useToast()

const documents = ref([])
const renewalHistory = ref([])
const firm = ref({})
const showModal = ref(false)
const showEditModal = ref(false)
const showRenewModal = ref(false)
const user = ref(storage.getUser() || {})
const selectedDocument = ref(null)
const showPassword = ref(false)

const editForm = reactive({
  id: '',
  document_name: '',
  document_number: '',
  issue_date: '',
  expiry_date: '',
  document_detail: '',
  doc_priority: '',
  doc_login_id: '',
  doc_login_password: '',
  agent_name: '',
  agent_address: '',
  agent_mob: '',
  remarks: ''
})

const renewDoc = reactive({
  reminder_id: '',
  renewal_date: '',
  renewal_amount: '',
  expiry_date: '',
  user_login_id: '',
  remarks: ''
})

const headers = [
  { title: 'S.No.', key: 'sno', align: 'center', sortable: false },
  { title: 'Days', key: 'days', align: 'center' },
  { title: 'Document Name', key: 'document_name', align: 'center' },
  { title: 'Document Number', key: 'document_number', align: 'center' },
  { title: 'Issue Date', key: 'issue_date', align: 'center' },
  { title: 'Last Renewal Date', key: 'renewal_date', align: 'center' },
  { title: 'Expiry Date', key: 'expiry_date', align: 'center' },
  { title: 'Agent Name', key: 'agent_name', align: 'center' },
  { title: 'Agent Mobile', key: 'agent_mob', align: 'center' },
  { title: 'Entry By', key: 'users.user_login_id', align: 'center' },
  { title: 'Action', key: 'actions', align: 'center', sortable: false },
]

const historyHeaders = [
  { title: 'Renewal Date', key: 'renewal_date', align: 'center' },
  { title: 'Expiry Date', key: 'expiry_date', align: 'center' },
  { title: 'Renewal Amount', key: 'renewal_amount', align: 'center' },
  { title: 'Remarks', key: 'remarks', align: 'start' },
]



const isAdmin = () => {
  return user.value && (user.value.role === 'admin' || user.value.role === 'superadmin')
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const calculateDaysRemaining = (expiryDate) => {
  const today = new Date()
  const expiry = new Date(expiryDate)
  today.setHours(0, 0, 0, 0)
  expiry.setHours(0, 0, 0, 0)
  const diffTime = expiry - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays >= 0
    ? `${diffDays} day(s)`
    : `Expired (${Math.abs(diffDays)} day(s) ago)`
}

const getDaysColor = (expiryDate, docPriority) => {
  if (!expiryDate) return 'grey'

  const today = new Date()
  let expiry
  if (typeof expiryDate === 'string' && expiryDate.includes('-')) {
    const parts = expiryDate.split('-')
    if (parts[0].length === 4) {
      expiry = new Date(expiryDate)
    } else {
      expiry = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
    }
  } else {
    expiry = new Date(expiryDate)
  }

  if (isNaN(expiry.getTime())) return 'grey'

  today.setHours(0, 0, 0, 0)
  expiry.setHours(0, 0, 0, 0)
  const diffTime = expiry - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'error'

  const normalizedPriority = docPriority ? docPriority.toLowerCase() : 'null'
  switch (normalizedPriority) {
    case 'high':
      if (diffDays >= 150) return 'success'
      if (diffDays >= 120) return 'warning'
      if (diffDays >= 0) return 'error'
      break
    case 'medium':
      if (diffDays >= 120) return 'success'
      if (diffDays >= 90) return 'warning'
      if (diffDays >= 0) return 'error'
      break
    case 'low':
      if (diffDays >= 120) return 'success'
      if (diffDays >= 60) return 'warning'
      if (diffDays <= 0) return 'error'
      break
    default:
      return 'grey'
  }
  return 'grey'
}

const getTextColor = (expiryDate, docPriority) => {
  // Helper to get text color class based on same logic if needed, 
  // but v-chip handles the main visual indicator.
  // For document name, we can use standard text colors or reuse the logic.
  // Returning standard classes for now or reusing the color logic if we want text colored.
  // The original code colored the Document Name text too.
  const color = getDaysColor(expiryDate, docPriority)
  if (color === 'success') return 'text-green-darken-2'
  if (color === 'warning') return 'text-orange-darken-2'
  if (color === 'error') return 'text-red-darken-2'
  return ''
}

const formatDate = (expiryDate) => {
  if (!expiryDate || isNaN(new Date(expiryDate).getTime())) return '-'
  return new Date(expiryDate).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const openModal = (doc) => {
  selectedDocument.value = doc
  showModal.value = true
  if (doc.id) {
    fetchRenewalHistory(doc.id)
  }
}

const hideModal = () => {
  showModal.value = false
  selectedDocument.value = null
  showPassword.value = false
}

const OpenEditModal = (doc) => {
  if (!isAdmin()) {
    toast.error('Only admins can edit documents.')
    return
  }
  selectedDocument.value = doc
  Object.assign(editForm, {
    id: doc.id,
    user_login_id: doc.user_login_id,
    document_name: doc.document_name,
    document_number: doc.document_number,
    issue_date: doc.issue_date,
    expiry_date: doc.expiry_date,
    doc_priority: doc.doc_priority,
    document_detail: doc.document_detail,
    doc_login_id: doc.doc_login_id,
    doc_login_password: doc.doc_login_password,
    agent_name: doc.agent_name,
    agent_address: doc.agent_address,
    agent_mob: doc.agent_mob,
    remarks: doc.remarks
  })
  showEditModal.value = true
}

const hideEditModal = () => {
  showEditModal.value = false
  selectedDocument.value = null
  // Reset editForm
  Object.keys(editForm).forEach(key => editForm[key] = '')
}

const openRenewModal = (doc) => {
  selectedDocument.value = doc
  showRenewModal.value = true
}

const hideRenewModal = () => {
  showRenewModal.value = false
  selectedDocument.value = null
  renewDoc.reminder_id = ''
  renewDoc.renewal_date = ''
  renewDoc.renewal_amount = ''
  renewDoc.expiry_date = ''
  renewDoc.remarks = ''
}

const submitRenewal = async () => {
  try {
    const payload = {
      ...renewDoc,
      user_login_id: user.value.id,
      reminder_id: selectedDocument.value.id
    }

    await expiryReminderService.renewDocument(payload)

    toast.success("Document renewed successfully!")
    hideRenewModal()
    fetchReminders()
  } catch (error) {
    console.error("Error renewing document:", error)
    toast.error("Failed to renew document. Please try again.")
  }
}

const updateDocument = async () => {
  try {
    await expiryReminderService.updateReminder(editForm.id, editForm)
    toast.success('Document Updated')
    hideEditModal()
    fetchReminders()
  } catch (error) {
    console.error('Error updating document:', error)
    toast.error('Failed to update document. Please try again later.')
  }
}

const deleteDocument = async (id) => {
  if (!isAdmin()) {
    toast.error('Only admins can delete documents.')
    return
  }
  const confirmed = window.confirm("Are you sure you want to delete this document?")
  if (!confirmed) return

  try {
    await expiryReminderService.deleteReminder(id)
    toast.success(`Document deleted successfully`)
    fetchReminders()
  } catch (error) {
    console.error('Error deleting document:', error)
    alert('Failed to delete document. Please try again.')
  }
}

const fetchFirmDetails = async () => {
  try {
    const response = await firmDetailsService.getFirmDetails();
    if (response.status === 200 && response.data) {
      firm.value = {
        firm_name: response.data.firm_name || 'Unknown Firm',
        firm_address: response.data.firm_address || 'Unknown Address',
        page_size: response.data.page_size
      }
    } else {
      firm.value = { firm_name: 'Unavailable', firm_address: 'Unavailable', page_size: 10 }
      toast.error('Failed to fetch firm details: Invalid response')
    }
  } catch (err) {
    console.error('Failed to fetch firm details:', err)
    firm.value = { firm_name: 'Error', firm_address: 'Error', page_size: 10 }
    toast.error('Failed to fetch firm details')
  }
}

const fetchReminders = () => {
  const remindersReq = expiryReminderService.getReminders()
  const renewalsReq = expiryReminderService.getLatestRenewalDates()

  Promise.all([remindersReq, renewalsReq])
    .then(([remindersRes, renewalsRes]) => {
      if (!Array.isArray(remindersRes.data)) {
        documents.value = []
        return
      }

      const renewals = Array.isArray(renewalsRes.data) ? renewalsRes.data : []

      // Build a map of latest renewal_date per doc_id
      const renewalMap = new Map()
      renewals.forEach(r => {
        const current = renewalMap.get(r.doc_id)
        const date = new Date(r.renewal_date)

        if (!current || date > current) {
          renewalMap.set(r.doc_id, date)
        }
      })

      // Merge into reminders
      documents.value = remindersRes.data.map(reminder => {
        const latestRenewal = renewalMap.get(reminder.id)
        return {
          ...reminder,
          renewal_date: latestRenewal
            ? latestRenewal.toISOString().split("T")[0] // format as YYYY-MM-DD
            : null
        }
      })
    })
    .catch((error) => {
      if (error.response?.status === 204) {
        documents.value = []
      } else {
        console.error('Error fetching reminders/renewals:', error)
      }
    })
}

const fetchRenewalHistory = async (reminderId) => {
  try {
    const response = await expiryReminderService.getRenewalHistory(reminderId)
    renewalHistory.value = response.data
  } catch (error) {
    console.error('Error fetching renewal history:', error)
    renewalHistory.value = []
  }
}

onMounted(() => {
  fetchReminders()
  fetchFirmDetails()
})
</script>

<style scoped>
/* Custom text colors for document name if needed */
.text-green-darken-2 {
  color: #388E3C !important;
}

.text-orange-darken-2 {
  color: #F57C00 !important;
}

.text-red-darken-2 {
  color: #D32F2F !important;
}
</style>
