<template>
  <v-container fluid class="fill-height justify-center">
    <v-card class="mx-auto" max-width="500" elevation="3">
      <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
        Reset Password
      </v-card-title>

      <v-card-text class="pt-6">
        <v-form ref="form" v-model="valid" @submit.prevent="submitForm">
          <v-row>
            <!-- Current Password -->
            <v-col cols="12">
              <v-text-field v-model="formData.current_password" label="Current Password"
                placeholder="Enter current password" :type="showCurrentPassword ? 'text' : 'password'"
                variant="outlined" density="comfortable" :rules="[rules.required]" prepend-inner-icon="mdi-lock"
                :append-inner-icon="showCurrentPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showCurrentPassword = !showCurrentPassword"></v-text-field>
            </v-col>

            <!-- New Password -->
            <v-col cols="12">
              <v-text-field v-model="formData.password" label="New Password" placeholder="Enter new password"
                :type="showPassword ? 'text' : 'password'" variant="outlined" density="comfortable"
                :rules="[rules.required, rules.min]" prepend-inner-icon="mdi-lock-plus"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"></v-text-field>
            </v-col>

            <!-- Confirm Password -->
            <v-col cols="12">
              <v-text-field v-model="formData.confirm_password" label="Confirm Password"
                placeholder="Confirm new password" :type="showConfirmPassword ? 'text' : 'password'" variant="outlined"
                density="comfortable" :rules="[rules.required, rules.match]" prepend-inner-icon="mdi-lock-check"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"></v-text-field>
            </v-col>
          </v-row>

          <!-- Submit Button -->
          <v-card-actions class="justify-center pb-6">
            <v-btn type="submit" color="primary" size="large" variant="elevated" :loading="loading" :disabled="!valid"
              block>
              Reset Password
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive } from 'vue'
import authService from '@/services/authService'
import { useToast } from 'vue-toastification'

const toast = useToast()
const valid = ref(false)
const loading = ref(false)
const form = ref(null)

const showCurrentPassword = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const formData = reactive({
  user_id: JSON.parse(sessionStorage.getItem('user')).id,
  user_login_id: JSON.parse(sessionStorage.getItem('user')).user_login_id,
  current_password: '',
  password: '',
  confirm_password: '',
})

const rules = {
  required: v => !!v || 'Field is required',
  min: v => (v && v.length >= 8) || 'Password must be at least 8 characters',
  match: v => v === formData.password || 'Passwords do not match'
}

const submitForm = async () => {
  const { valid: isValid } = await form.value.validate()
  if (!isValid) return

  loading.value = true
  try {
    const res = await authService.resetPassword(formData.user_id, formData)

    if (res.status == 200 || res.status == 202) {
      toast.success(res.data)

      // Reset form
      form.value.reset()
      // Restore user ID and login ID which might be cleared by reset
      formData.user_id = JSON.parse(sessionStorage.getItem('user')).id
      formData.user_login_id = JSON.parse(sessionStorage.getItem('user')).user_login_id

      showPassword.value = false
      showConfirmPassword.value = false
      showCurrentPassword.value = false
    }
  } catch (error) {
    console.error('Error resetting password:', error)
    toast.error(error.response?.data?.detail || 'Failed to reset password')
  } finally {
    loading.value = false
  }
}
</script>
