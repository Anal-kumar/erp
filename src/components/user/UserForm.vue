<template>
  <v-container fluid class="fill-height justify-center">
    <v-card class="mx-auto" max-width="600" elevation="3">
      <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
        Add User Form
      </v-card-title>

      <v-card-text class="pt-6">
        <v-form ref="form" v-model="valid" @submit.prevent="submitForm">
          <v-row>
            <!-- Login ID -->
            <v-col cols="12">
              <v-text-field v-model="formData.user_login_id" label="Login ID" placeholder="Enter a Login ID"
                variant="outlined" density="comfortable" :rules="[rules.required]"
                prepend-inner-icon="mdi-account-key"></v-text-field>
            </v-col>

            <!-- First Name -->
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.user_first_name" label="First Name" placeholder="Enter first name"
                variant="outlined" density="comfortable" :rules="[rules.required]"
                @input="formData.user_first_name = $event.target.value.toUpperCase()"
                prepend-inner-icon="mdi-account"></v-text-field>
            </v-col>

            <!-- Second Name -->
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.user_second_name" label="Second Name" placeholder="Enter second name"
                variant="outlined" density="comfortable" :rules="[rules.required]"
                @input="formData.user_second_name = $event.target.value.toUpperCase()"
                prepend-inner-icon="mdi-account"></v-text-field>
            </v-col>

            <!-- Mobile Number -->
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.mobile_number" label="Mobile Number" placeholder="Enter Mobile Number"
                variant="outlined" density="comfortable" :rules="[rules.required, rules.mobile]" maxlength="10"
                prepend-inner-icon="mdi-phone"></v-text-field>
            </v-col>

            <!-- Designation -->
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.designation" label="Designation" placeholder="Enter designation"
                variant="outlined" density="comfortable" :rules="[rules.required]"
                @input="formData.designation = $event.target.value.toUpperCase()"
                prepend-inner-icon="mdi-badge-account"></v-text-field>
            </v-col>

            <!-- Password -->
            <v-col cols="12">
              <v-text-field v-model="formData.password" label="Password (Alphanumeric)" placeholder="Enter a password"
                type="password" variant="outlined" density="comfortable" :rules="[rules.required, rules.password]"
                prepend-inner-icon="mdi-lock"></v-text-field>
            </v-col>

            <!-- Is Admin Checkbox -->
            <v-col cols="12">
              <v-checkbox v-model="formData.user_role" label="Is Admin" color="primary" hide-details></v-checkbox>
            </v-col>
          </v-row>

          <!-- Submit Button -->
          <v-card-actions class="justify-center pb-6">
            <v-btn type="submit" color="primary" size="large" variant="elevated" :loading="loading"
              :disabled="!valid || !isModuleEnabled" width="200">
              Add User
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import adminService from '@/services/adminService'
import moduleService from '@/services/moduleService'
import { useToast } from 'vue-toastification'

const toast = useToast()
const valid = ref(false)
const loading = ref(false)
const form = ref(null)
const isModuleEnabled = ref(true)

// Reactive form data
const formData = reactive({
  user_login_id: '',
  user_first_name: '',
  user_second_name: '',
  mobile_number: '',
  designation: '',
  password: '',
  user_role: false,
})

// Validation rules
const rules = {
  required: v => !!v || 'Field is required',
  mobile: v => /^\d{10}$/.test(v) || 'Mobile number must be 10 digits',
  password: v => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(v) || 'Password must be at least 8 characters, alphanumeric'
}

// Form submission handler
const submitForm = async () => {
  if (!isModuleEnabled.value) {
    toast.info('Please purchase the user module.')
    return
  }

  const { valid: isValid } = await form.value.validate()
  if (!isValid) return

  loading.value = true
  try {
    const payload = {
      user_login_id: formData.user_login_id,
      user_first_name: formData.user_first_name,
      user_second_name: formData.user_second_name,
      mobile_number: formData.mobile_number,
      designation: formData.designation,
      password: formData.password,
      user_role: formData.user_role ? 'admin' : 'user',
      time_stemp: new Date().toISOString(),
    }

    console.log('User created:', payload)
    const response = await adminService.createUser(payload)

    if (!response.data) {
      throw new Error('Failed to create user')
    }

    // Reset form after successful submission
    form.value.reset()
    formData.user_role = false // Reset checkbox manually as form.reset() might not handle it as expected

    console.log('user add successfully')
    toast.success('User added Successfully')
  } catch (error) {
    console.error('Error creating user:', error)
    toast.error('Failed to add user, please try again')
  } finally {
    loading.value = false
  }
}

// Fetch module status
const fetchModuleStatus = async () => {
  try {
    const response = await moduleService.getModules()
    const modules = response.data
    const UserModule = modules.find((m) => m.module_name === 'users')
    if (!UserModule) {
      console.warn('user module not found')
      isModuleEnabled.value = false
      toast.error('User module not found. Contact support.')
      return
    }
    isModuleEnabled.value = UserModule.module_enabled
  } catch (error) {
    console.error('Error fetching module status:', error)
    isModuleEnabled.value = false
    toast.error('Failed to fetch module status. Please check your network or contact support.')
  }
}

onMounted(() => {
  fetchModuleStatus()
})
</script>
