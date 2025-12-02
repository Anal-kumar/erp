<template>
  <v-app-bar color="surface" elevation="2" density="comfortable">
    <!-- Left: Logo + Firm Name + DB -->
    <template v-slot:prepend>
      <v-icon size="x-large" class="ml-2">mdi-factory</v-icon>
    </template>

    <v-app-bar-title>
      <div class="d-flex flex-column">
        <span class="text-h6 font-weight-bold">
          {{ firm.firm_short_name || factoryName }}
        </span>
        <span class="text-caption text-success">
          DB: {{ dbName }}
        </span>
      </div>
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <!-- Center: User Info & DateTime (hidden on mobile) -->
    <div class="d-none d-md-flex flex-column align-center mx-4">
      <span class="text-body-2">{{ dateTime }}</span>
      <span class="text-body-2 font-weight-bold d-flex align-center" :class="{
        'text-error': userRole === 'admin' || userRole === 'superadmin',
        'text-success': userRole !== 'admin' && userRole !== 'superadmin'
      }">
        <v-icon size="small" class="mr-1"
          :icon="userRole === 'admin' || userRole === 'superadmin' ? 'mdi-shield' : 'mdi-account'"></v-icon>
        Role: {{ userRole === 'admin' ? 'Admin' : userRole === 'superadmin' ? 'Superadmin' : 'User' }}
      </span>
    </div>

    <div class="d-none d-md-flex flex-column align-center mx-4">
      <span class="text-body-2">User ID: <strong>{{ currentUser }}</strong></span>
      <span class="text-body-2">Name: <strong>{{ currentUsername }}</strong></span>
    </div>

    <!-- Token Expiry & Logout -->
    <div class="d-none d-md-flex flex-column align-center mx-4">
      <span class="text-body-2 font-weight-medium">{{ tokenExpiryTime }}</span>
      <span class="text-caption text-error">Session Expiring</span>
    </div>

    <v-btn icon="mdi-logout" @click="logout" title="Logout" class="mr-2"></v-btn>

    <!-- Mobile Menu -->
    <template v-slot:append>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon="mdi-menu" v-bind="props" class="d-md-none"></v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-title>{{ dateTime }}</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>User: {{ currentUser }}</v-list-item-title>
            <v-list-item-subtitle>{{ currentUsername }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <v-list-item-title :class="{
              'text-error': userRole === 'admin' || userRole === 'superadmin',
              'text-success': userRole !== 'admin' && userRole !== 'superadmin'
            }">
              Role: {{ userRole === 'admin' ? 'Admin' : userRole === 'superadmin' ? 'Superadmin' : 'User' }}
            </v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Session: {{ tokenExpiryTime }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
  </v-app-bar>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import config from '@/config'
import { apiClient } from '@/services'
import storage from '@/utils/storage'
const router = useRouter()

defineOptions({
  name: 'AppHeader',
})

const dateTime = ref('')
const tokenExpiryTime = ref('')
const userRole = ref('')
const interval = ref(null)
const currentUser = ref('')
const currentUsername = ref('')
const factoryName = ref(config.ClientName)
const dbName = ref('...')
const firm = ref({})

function logout() {
  storage.clearAuth()
  router.push('/login')
}

async function refreshToken() {
  try {
    const response = await apiClient.post(
      `/login/refresh_token`,
      {},
      {
        headers: {
          Authorization: `Bearer ${storage.getToken()}`,
        },
      },
    )
    if (response.status === 200 && response.data.access_token) {
      storage.setToken(response.data.access_token)
      updateTime()
    } else {
      logout()
    }
  } catch (error) {
    console.error('auth_token refresh failed:', error)
    logout()
  }
}

function updateTime() {
  const now = new Date()

  const day = String(now.getDate()).padStart(2, '0')
  const month = now.toLocaleString('en-US', { month: 'short' })
  const year = now.getFullYear()

  let hours = now.getHours()
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours || 12
  const strHours = String(hours).padStart(2, '0')

  dateTime.value = `${day} ${month} ${year} | ${strHours}:${minutes} ${ampm}`

  // ---- TOKEN CHECK ----
  const token = storage.getToken()
  if (!token) {
    console.error("Token missing")
    logout()
    return
  }

  const parts = token.split('.')
  if (parts.length !== 3) {
    console.error("Token format invalid, expected 3 parts")
    logout()
    return
  }

  let tokenPayload
  try {
    tokenPayload = JSON.parse(atob(parts[1]))
  } catch (err) {
    console.error("Token decode failed:", err)
    logout()
    return
  }

  // ---- EXPIRATION CHECK ----
  const tokenExp = tokenPayload.exp
  const nowTime = Math.floor(Date.now() / 1000)

  if (!tokenExp || isNaN(tokenExp)) {
    console.error("Token payload does not contain valid exp")
    logout()
    return
  }

  if (tokenExp < nowTime) {
    logout()
    return
  }

  const diff = tokenExp - nowTime
  const min = Math.floor(diff / 60)
  const sec = diff % 60
  tokenExpiryTime.value = `${min}:${String(sec).padStart(2, '0')}`

  // Auto refresh when less than 60 seconds left
  if (diff < 60) {
    refreshToken()
  }
}


async function getDatabaseStatus() {
  try {
    const response = await apiClient.get(
      `/backups/current-database`,
      {
        headers: {
          Authorization: `Bearer ${storage.getToken()}`,
        },
      },
    )
    if (response.status === 200) {
      const fullPath = response.data.current_database || 'Unknown'
      const parts = fullPath.split(/[/\\]/)
      dbName.value = parts[parts.length - 1] || 'Unknown'
    } else {
      dbName.value = 'Unavailable'
    }
  } catch (err) {
    console.error('Failed to fetch DB status:', err)
    dbName.value = 'Error'
  }
}

async function fetchFirmDetails() {
  try {
    const response = await apiClient.get(
      `/firm_details/get_firm_details`,
      {
        headers: {
          Authorization: `Bearer ${storage.getToken()}`,
        },
      },
    )
    if (response.status === 200) {
      firm.value = response.data
    }
  } catch (err) {
    console.error('Failed to fetch firm details:', err)
  }
}

onMounted(() => {
  interval.value = setInterval(updateTime, 1000)

  const user = storage.getUser()

  if (user) {
    currentUser.value = user.id || 'Unknown'
    currentUsername.value = user.user_first_name + ' ' + user.user_second_name || 'Unknown'
    userRole.value = user.role || 'Unknown'
  } else {
    currentUser.value = 'Guest'
    currentUsername.value = 'guest'
    userRole.value = 'Unknown'
  }

  fetchFirmDetails()
  getDatabaseStatus()
  updateTime()
  setInterval(getDatabaseStatus, 30000)
})

onBeforeUnmount(() => {
  clearInterval(interval.value)
})
</script>
