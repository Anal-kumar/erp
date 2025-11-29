<template>
  <v-container fluid class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card elevation="12" class="login-card">
          <v-card-title class="text-center text-h4 py-6">
            Login
          </v-card-title>

          <v-card-text>
            <v-form @submit.prevent="login">
              <v-text-field v-model="username" label="Enter User ID" variant="outlined" density="comfortable"
                prepend-inner-icon="mdi-account" required class="mb-4"></v-text-field>

              <v-text-field v-model="password" :type="showPassword ? 'text' : 'password'" label="Enter Password"
                variant="outlined" density="comfortable" prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="togglePassword"
                required class="mb-4"></v-text-field>

              <v-btn type="submit" color="primary" block size="large" class="mb-4" :loading="isLoading">
                Login
              </v-btn>

              <div class="d-flex justify-end mb-4">
                <v-btn icon="mdi-database" color="grey" size="small" :disabled="isDbInitialized"
                  @click="handleInitDbClick"></v-btn>
              </div>

              <div class="d-flex justify-space-between text-caption text-grey">
                <span><strong>Ver: {{ FrontendVersion }}</strong></span>
                <span><strong>Build: {{ buildVersion }}</strong></span>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <InitDbModal v-if="showInitDbModal" @close="showInitDbModal = false" />
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import authService from '@/services/authService'
import apiClient from '@/services/api' // Direct access for DB status check if needed, or move to service
import InitDbModal from '@/views/InitDbModal.vue'

const router = useRouter()
const toast = useToast()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const showInitDbModal = ref(false)
const isDbInitialized = ref(false)
const isLoading = ref(false)

const FrontendVersion = localStorage.getItem('appVersion') || '1.0.0'
const buildVersion = localStorage.getItem('buildVersion') || '1'

onMounted(() => {
  const token = sessionStorage.getItem('token')
  if (token) {
    router.push('/')
  }
})

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// Move DB status check to a service if possible, or keep using apiClient directly for now
// Ideally, we should have a systemService.js or similar.
// For now, I'll use apiClient directly for the DB check to keep it simple, 
// or I can add checkDbStatus to authService or a new service.
// Let's add it to authService for now as it's part of the login flow/system check.

const handleInitDbClick = async () => {
  try {
    const res = await apiClient.get('/db/status')
    if (!res.data.db_initialized) {
      showInitDbModal.value = true
    } else {
      toast.info('Database already initialized.')
    }
  } catch (err) {
    console.error('Failed to check DB status', err)
    toast.error('Unable to verify database status.')
  }
}

const login = async () => {
  isLoading.value = true
  try {
    // Check DB status first
    const dbRes = await apiClient.get('/db/status')
    if (!dbRes.data.db_initialized) {
      toast.error('Database is not initialized. Please initialize first.')
      return
    }

    const credentials = {
      user_login_id: username.value,
      password: password.value,
    }

    const response = await authService.login(credentials)

    if (response.status === 200) {
      const token = response.data.access_token
      const user = response.data.user
      const role = response.data.user.role

      sessionStorage.setItem('token', token)
      sessionStorage.setItem('user', JSON.stringify(user))
      sessionStorage.setItem('user_role', JSON.stringify(role))

      document.cookie = `token=${token}; path=/;`
      router.push('/home')
      toast.success('Login successfully')
    }
  } catch (err) {
    const errorMsg = err.response?.data?.detail || 'Invalid username or password'
    toast.error(errorMsg)
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-card {
  border-radius: 16px;
}

.fill-height {
  min-height: 100vh;
}
</style>
