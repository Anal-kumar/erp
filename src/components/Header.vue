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
import axios from 'axios'

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
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('user')
  sessionStorage.removeItem('user_role')
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  router.push('/login')
}

async function refreshToken() {
  try {
    const response = await axios.post(
      `${config.apiBaseUrl}/api/${config.version}/login/refresh_token`,
      {},
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      },
    )
    if (response.status === 200 && response.data.access_token) {
      sessionStorage.setItem('token', response.data.access_token)
    } else {
      logout()
    }
  } catch (error) {
    console.error('Token refresh failed:', error)
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

  const token = sessionStorage.getItem('token')
  if (token) {
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]))
      const tokenExp = tokenPayload.exp
      const nowTime = Math.floor(Date.now() / 1000)

      if (tokenExp < nowTime) {
        logout()
      } else {
        const diff = tokenExp - nowTime
        const min = Math.floor(diff / 60)
        const sec = diff % 60
        tokenExpiryTime.value = `${min}:${String(sec).padStart(2, '0')}`

        // Refresh token if less than 60 seconds remaining
        if (diff < 60) {
          refreshToken()
        }
      }
    } catch (error) {
      console.error('Failed to parse token:', error)
      logout()
    }
  }
}

async function getDatabaseStatus() {
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/backups/current-database`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
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
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/firm_details/get_firm_details`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
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

  const user = sessionStorage.getItem('user')

  if (user) {
    try {
      const parsed = JSON.parse(user)
      currentUser.value = parsed.user_login_id || 'Guest'
      currentUsername.value =
        `${parsed.user_first_name || ''} ${parsed.user_second_name || ''}`.trim() || 'guest'
      const rawRole = parsed?.role
      userRole.value =
        rawRole === 'admin' ? 'admin' : rawRole === 'superadmin' ? 'superadmin' : 'user'
    } catch (e) {
      console.error('Failed to parse user:', e)
      currentUser.value = 'Guest'
      currentUsername.value = 'guest'
      userRole.value = 'Unknown'
    }
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