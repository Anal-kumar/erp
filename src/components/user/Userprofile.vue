<template>
  <v-container fluid class="pa-4">
    <!-- Loading State -->
    <div v-if="loading" class="d-flex flex-column align-center justify-center" style="min-height: 400px;">
      <v-progress-circular indeterminate color="primary" size="64" class="mb-4"></v-progress-circular>
      <p class="text-grey-darken-1">Loading profile...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="d-flex flex-column align-center justify-center text-center"
      style="min-height: 400px;">
      <v-icon icon="mdi-alert-circle" size="64" color="error" class="mb-4"></v-icon>
      <h3 class="text-h5 mb-2">Something went wrong</h3>
      <p class="text-grey-darken-1 mb-4">{{ error }}</p>
      <v-btn color="primary" @click="fetchUser">Try Again</v-btn>
    </div>

    <!-- No Data State -->
    <div v-else-if="!user" class="d-flex flex-column align-center justify-center text-center"
      style="min-height: 400px;">
      <v-icon icon="mdi-account-off" size="64" color="grey" class="mb-4"></v-icon>
      <h3 class="text-h5 mb-2">No profile data available</h3>
      <p class="text-grey-darken-1 mb-4">Please make sure you're logged in</p>
      <v-btn color="primary" @click="fetchUser">Refresh</v-btn>
    </div>

    <!-- Profile Content -->
    <v-row v-else justify="center">
      <v-col cols="12" md="10" lg="8">
        <!-- Profile Header -->
        <v-card class="mb-4">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <v-avatar size="80" color="primary" class="mr-4">
                <v-icon icon="mdi-account" size="50" color="white"></v-icon>
              </v-avatar>
              <div>
                <h2 class="text-h5 mb-1">{{ user.user_first_name }} {{ user.user_second_name }}</h2>
                <p class="text-body-2 text-grey-darken-1 mb-0">{{ user.designation || 'Not specified' }}</p>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Account Information -->
        <v-card class="mb-4">
          <v-card-title class="text-h6">Account Information</v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="12" sm="6">
                <div class="text-caption text-grey-darken-1 mb-1">Login ID</div>
                <div class="text-body-1">{{ user.user_login_id || 'N/A' }}</div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="text-caption text-grey-darken-1 mb-1">Full Name</div>
                <div class="text-body-1">{{ user.user_first_name }} {{ user.user_second_name }}</div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="text-caption text-grey-darken-1 mb-1">Mobile Number</div>
                <div class="text-body-1">{{ user.mobile_number || 'Not provided' }}</div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="text-caption text-grey-darken-1 mb-1">Designation</div>
                <div class="text-body-1">{{ user.designation || 'Not specified' }}</div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="text-caption text-grey-darken-1 mb-1">User Role</div>
                <v-chip color="primary" size="small">{{ user.role }}</v-chip>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- License Information -->
        <v-card>
          <v-card-title class="text-h6">License Information</v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-4">
            <!-- Serial Key -->
            <div class="mb-3">
              <div class="text-caption text-grey-darken-1 mb-2">Serial Key</div>
              <div class="d-flex ga-2">
                <v-text-field v-model="serialKey" :readonly="!updateMode" variant="outlined" density="compact"
                  placeholder="Enter serial key" hide-details class="flex-grow-1"></v-text-field>

                <v-btn v-if="!updateMode" color="primary" @click="handleEditKey">Edit</v-btn>

                <template v-else>
                  <v-btn color="success" :disabled="!serialKey.trim()" @click="handleEditKey">Save</v-btn>
                  <v-btn color="grey" variant="outlined" @click="handleCancel">Cancel</v-btn>
                </template>
              </div>
            </div>

            <!-- License Details -->
            <v-row v-if="key.expires_on">
              <v-col cols="12" sm="6">
                <div class="text-caption text-grey-darken-1 mb-1">Expiry Date</div>
                <div class="text-body-1">{{ formatDate(key.expires_on) || 'Not available' }}</div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="text-caption text-grey-darken-1 mb-1">Days Remaining</div>
                <div class="d-flex align-center ga-2">
                  <span class="text-body-1">{{ daysRemaining }}</span>
                  <v-chip :color="getDaysRemainingColor" size="small">
                    {{ daysRemaining === 1 ? 'Day' : 'Days' }}
                  </v-chip>
                </div>
              </v-col>
            </v-row>

            <v-alert v-else type="warning" variant="tonal" density="compact" class="mt-2">
              No license information available. Please enter a valid serial key.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { authService, adminService } from '@/services'

defineOptions({
  name: 'UserProfile'
})

const router = useRouter()
const toast = useToast()
const loading = ref(true)
const error = ref(null)
const user = ref(null)

const firm = ref({
  firm_name: '',
  firm_short_name: '',
  firm_address: '',
  page_size: '',
  serial_key: '',
})

const key = ref({
  serial_key: '',
  serial_key_status: 'missing',
  expires_on: null,
})

const serialKey = ref('')
const updateMode = ref(false)

const formatDate = (date) => {
  if (!date || isNaN(new Date(date).getTime())) return ''
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const daysRemaining = computed(() => {
  if (!key.value.expires_on || isNaN(new Date(key.value.expires_on).getTime())) {
    return 0
  }
  const today = new Date()
  const expiryDate = new Date(key.value.expires_on)
  const timeDiff = expiryDate.getTime() - today.getTime()
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
  return daysDiff >= 0 ? daysDiff : 0
})

const getKeyStatusColor = computed(() => {
  if (key.value.serial_key_status === 'expired') return 'red-lighten-5'
  if (key.value.serial_key_status === 'pending') return 'yellow-lighten-5'
  return undefined
})

const getDaysRemainingColor = computed(() => {
  if (daysRemaining.value <= 30) return 'error'
  if (daysRemaining.value <= 90) return 'warning'
  return 'success'
})

const fetchUser = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await authService.getUserProfile('me')

    user.value = response.data
    error.value = null
  } catch (err) {
    console.error('Error fetching user profile:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to load profile'

    if (err.response?.status === 401) {
      sessionStorage.removeItem('token')
      router.push('/login')
    }
  } finally {
    loading.value = false
  }
}

const fetchFirmDetails = async () => {
  try {
    const response = await adminService.getFirmDetails()

    if (response.status === 200 && response.data) {
      firm.value = {
        firm_name: response.data.firm_name || 'Unknown Firm',
        firm_short_name: response.data.firm_short_name || 'UF',
        firm_address: response.data.firm_address || 'Unknown Address',
        page_size: response.data.page_size || '',
        serial_key: response.data.serial_key || '',
      }
      serialKey.value = firm.value.serial_key
    } else {
      firm.value = {
        firm_name: 'Unavailable',
        firm_short_name: 'UF',
        firm_address: 'Unavailable',
        page_size: '',
        serial_key: '',
      }
      serialKey.value = ''
      toast.error('Failed to fetch firm details: Invalid response')
    }
  } catch (err) {
    console.error('Failed to fetch firm details:', err)
    firm.value = {
      firm_name: 'Error',
      firm_short_name: 'UF',
      firm_address: 'Error',
      page_size: '',
      serial_key: '',
    }
    serialKey.value = ''
    toast.error(err.response?.data?.message || 'Failed to fetch firm details')
  }
}

const fetchKeyStatus = async () => {
  try {
    const response = await adminService.getSerialKeyStatus()
    if (response.status === 200) {
      key.value = {
        serial_key: response.data.serial_key || '',
        serial_key_status: response.data.status || 'missing',
        expires_on: response.data.expires_on || null,
      }
    }
  } catch (error) {
    console.error('Failed to fetch key status:', error)
  }
}

const handleEditKey = async () => {
  if (!updateMode.value) {
    updateMode.value = true
    return
  }

  try {
    const trimmedKey = serialKey.value.trim()
    if (!trimmedKey) {
      toast.error('Please enter a serial key')
      return
    }

    const response = await adminService.updateSerialKey(trimmedKey)
    if (response.status === 200) {
      toast.success('Serial key updated successfully!')
      firm.value.serial_key = trimmedKey
      updateMode.value = false
      await fetchKeyStatus()
    }
  } catch (error) {
    console.error('Failed to update serial key:', error)
    toast.error(error.response?.data?.detail || 'Failed to update serial key')
  }
}

const handleCancel = () => {
  serialKey.value = firm.value.serial_key || ''
  updateMode.value = false
}

onMounted(() => {
  if (!sessionStorage.getItem('token')) {
    router.push('/login')
    return
  }
  fetchFirmDetails()
  fetchUser()
  fetchKeyStatus()
})
</script>