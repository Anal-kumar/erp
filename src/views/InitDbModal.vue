<template>
  <v-dialog :model-value="true" persistent max-width="1200px" scrollable>
    <!-- Firm Details Modal (First Step) -->
    <v-card v-if="firmOpen">
      <v-card-title class="d-flex justify-space-between align-center bg-primary text-white">
        <span class="text-h5">Database Initialization</span>
        <v-btn icon variant="text" @click="emit('close')" color="white">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-4">
        <v-form ref="firmForm" @submit.prevent="saveFirm">
          <!-- Firm Details Section -->
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="bg-grey-lighten-4">
              <v-icon class="mr-2">mdi-office-building</v-icon>
              Firm Details
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field v-model="firmData.firm_name" label="Firm Name (Full)"
                    placeholder="Example Solutions Pvt Ltd" :rules="[rules.required]"
                    @update:model-value="firmData.firm_name = firmData.firm_name.toUpperCase()" variant="outlined"
                    density="comfortable" />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field v-model="firmData.firm_short_name" label="Firm Name (Short)" placeholder="EXSOL"
                    :rules="[rules.required, rules.shortName]" maxlength="10"
                    @update:model-value="firmData.firm_short_name = firmData.firm_short_name.toUpperCase()"
                    variant="outlined" density="comfortable" />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field v-model="firmData.firm_owner_name" label="Firm Owner Name" placeholder="John Doe"
                    :rules="[rules.required]"
                    @update:model-value="firmData.firm_owner_name = firmData.firm_owner_name.toUpperCase()"
                    variant="outlined" density="comfortable" />
                </v-col>

                <v-col cols="12" md="8">
                  <v-text-field v-model="firmData.firm_address" label="Firm Address"
                    placeholder="123 Business Street, City, State"
                    @update:model-value="firmData.firm_address = firmData.firm_address.toUpperCase()" variant="outlined"
                    density="comfortable" />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field v-model="firmData.firm_mobile_number" label="Mobile Number" placeholder="9876543210"
                    :rules="[rules.mobile]" maxlength="10" variant="outlined" density="comfortable" />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field v-model="firmData.firm_email" label="Email ID" placeholder="contact@example.com"
                    :rules="[rules.email]" type="email" variant="outlined" density="comfortable" />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field v-model="firmData.firm_pan_number" label="Firm PAN Number" placeholder="ABCDE1234F"
                    :rules="[rules.pan]" maxlength="10"
                    @update:model-value="firmData.firm_pan_number = firmData.firm_pan_number.toUpperCase()"
                    variant="outlined" density="comfortable" />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field v-model="firmData.firm_gst_number" label="Firm GST Number" placeholder="22ABCDE1234F1Z5"
                    :rules="[rules.gst]" maxlength="15"
                    @update:model-value="firmData.firm_gst_number = firmData.firm_gst_number.toUpperCase()"
                    variant="outlined" density="comfortable" />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- API Details Section -->
          <v-card variant="outlined">
            <v-card-title class="bg-grey-lighten-4">
              <v-icon class="mr-2">mdi-api</v-icon>
              API Details
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field v-model="firmData.est_id" label="Establishment ID" placeholder="Enter establishment id"
                    :rules="[rules.required, rules.estId]" variant="outlined" density="comfortable" />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field v-model="firmData.serial_key" label="Serial Key"
                    placeholder="PRODUCT-ESTID-DATE-CHECKSUM" :rules="[rules.required, rules.serialKey]"
                    variant="outlined" density="comfortable" />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field v-model="firmData.api_url" label="API Endpoint URL"
                    placeholder="https://api.example.com" :rules="[rules.required]" type="url" variant="outlined"
                    density="comfortable" />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field v-model.number="firmData.api_port" label="API Port" placeholder="8080"
                    :rules="[rules.required, rules.port]" type="number" variant="outlined" density="comfortable" />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field v-model.number="firmData.page_size" label="Page Size"
                    :rules="[rules.required, rules.pageSize]" type="number" variant="outlined" density="comfortable" />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field v-model="firmData.product_name" label="Product Name" readonly variant="outlined"
                    density="comfortable" />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-form>
      </v-card-text>

      <v-card-actions class="px-6 pb-4">
        <v-spacer />
        <v-btn variant="outlined" @click="emit('close')">
          Cancel
        </v-btn>
        <v-btn color="primary" @click="openAdminModal">
          Add Admin User
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Admin User Modal (Second Step) -->
    <v-card v-if="adminOpen">
      <v-card-title class="d-flex justify-space-between align-center bg-primary text-white">
        <span class="text-h5">Admin User Details</span>
        <v-btn icon variant="text" @click="closeAdminModal" color="white">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-4">
        <v-form ref="adminForm" @submit.prevent="submitInit">
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field v-model="adminData.user_login_id" label="Login ID" placeholder="admin123"
                :rules="[rules.required]" variant="outlined" density="comfortable" />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field v-model="adminData.user_first_name" label="First Name" placeholder="John"
                :rules="[rules.required]"
                @update:model-value="adminData.user_first_name = adminData.user_first_name.toUpperCase()"
                variant="outlined" density="comfortable" />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field v-model="adminData.user_second_name" label="Last Name" placeholder="Doe"
                @update:model-value="adminData.user_second_name = adminData.user_second_name.toUpperCase()"
                variant="outlined" density="comfortable" />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field v-model="adminData.mobile_number" label="Mobile" placeholder="9876543210"
                :rules="[rules.mobile]" maxlength="10" variant="outlined" density="comfortable" />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field v-model="adminData.designation" label="Designation" placeholder="Administrator"
                variant="outlined" density="comfortable" />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field v-model="adminData.user_role" label="User Role" variant="outlined" density="comfortable" />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field v-model="adminData.password" label="Password" placeholder="********"
                :rules="[rules.required, rules.password]" type="password" variant="outlined" density="comfortable" />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="px-6 pb-4">
        <v-spacer />
        <v-btn variant="outlined" @click="closeAdminModal">
          Cancel
        </v-btn>
        <v-btn color="primary" @click="submitInit">
          Save & Initialize
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import config from '@/config'
import { useToast } from 'vue-toastification'

const toast = useToast()
const emit = defineEmits(['close'])

const firmOpen = ref(true)
const adminOpen = ref(false)
const isAdminSaved = ref(false)
const firmForm = ref(null)
const adminForm = ref(null)

// Retrieve productName from localStorage with a fallback
const productName = localStorage.getItem('productName')

const firmData = ref({
  est_id: '',
  serial_key: '',
  api_url: '',
  api_port: '',
  firm_name: '',
  firm_owner_name: '',
  firm_short_name: '',
  firm_address: '',
  firm_mobile_number: '',
  firm_email: '',
  firm_gst_number: '',
  firm_pan_number: '',
  page_size: 10,
  product_name: productName,
})

const adminData = ref({
  user_login_id: '',
  user_first_name: '',
  user_second_name: '',
  mobile_number: '',
  designation: '',
  user_role: 'admin',
  password: '',
})

// Validation rules
const rules = {
  required: (value) => !!value || 'This field is required',
  shortName: (value) => /^[A-Z]{1,10}$/.test(value) || 'Must be 1-10 uppercase letters',
  mobile: (value) => !value || /^[0-9]{10}$/.test(value) || 'Must be 10 digits',
  email: (value) => !value || /.+@.+\..+/.test(value) || 'Must be a valid email',
  pan: (value) => !value || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value) || 'Invalid PAN format',
  gst: (value) =>
    !value || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value) || 'Invalid GST format',
  estId: (value) => (value && value.length >= 4 && value.length <= 10) || 'Must be between 4 and 10 characters',
  serialKey: (value) => {
    const parts = value?.split('-')
    return (parts && parts.length === 4 && parts.every(p => p.length > 0)) || 'Format: PRODUCT-ESTID-DATE-CHECKSUM'
  },
  port: (value) => (value >= 1024 && value <= 65535) || 'Port must be between 1024 and 65535',
  pageSize: (value) => (value >= 10 && value <= 50) || 'Page size must be between 10 and 50',
  password: (value) => (value && value.length >= 8) || 'Password must be at least 8 characters',
}

const openAdminModal = async () => {
  const { valid } = await firmForm.value.validate()
  if (!valid) {
    toast.error('Please fill all required fields correctly')
    return
  }

  if (!firmData.value.api_url || !firmData.value.firm_name) {
    toast.error('API URL and Firm Name are required')
    return
  }

  firmOpen.value = false
  adminOpen.value = true
}

const closeAdminModal = () => {
  adminOpen.value = false
  firmOpen.value = true
}

const saveFirm = async () => {
  try {
    const host = firmData.value.api_url.trim()

    const ipRegex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/
    const hostRegex = /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$/

    if (!ipRegex.test(host) && !hostRegex.test(host)) {
      toast.error('Invalid API host. Enter only IP or hostname (no http://)')
      return
    }

    firmData.value.api_url = `http://${host}`

    const port = parseInt(firmData.value.api_port, 10)
    if (isNaN(port) || port < 1024 || port > 65535) {
      toast.error('API Port must be between 1024 and 65535')
      return
    }

    if (firmData.value.page_size < 10 || firmData.value.page_size > 50) {
      toast.error('Page Size must be between 10 and 50')
      return
    }

    const payload = {
      firm_details: {
        ...firmData.value,
      },
      req: {
        serial_key: firmData.value.serial_key,
      },
    }

    const res = await axios.post(
      `${config.apiBaseUrl}/api/${config.version}/firm_details/create_firm_details`,
      payload,
    )

    if (res.status === 200 || res.status === 201) {
      toast.success('Firm details saved successfully')
    } else {
      toast.error('Failed to save firm details')
    }
  } catch (err) {
    console.error(err)
    if (err.response) {
      toast.error(`Failed: ${err.response.data.message || err.response.statusText}`)
    } else {
      toast.error('Error saving firm details')
    }
  }
}

const submitInit = async () => {
  const { valid } = await adminForm.value.validate()
  if (!valid) {
    toast.error('Please fill all required fields correctly')
    return
  }

  try {
    if (adminData.value.password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    await saveFirm()

    const res = await axios.post(
      `${config.apiBaseUrl}/api/${config.version}/init_db`,
      adminData.value,
      { timeout: 30000 },
    )

    if (res.status === 200 || res.status === 201) {
      toast.success('Database initialized successfully')
      isAdminSaved.value = true
      adminOpen.value = false
      firmOpen.value = false

      // Reset forms
      adminData.value = {
        user_login_id: '',
        user_first_name: '',
        user_second_name: '',
        mobile_number: '',
        designation: '',
        user_role: 'admin',
        password: '',
      }

      firmData.value = {
        serial_key: '',
        api_url: '',
        api_port: '',
        firm_name: '',
        firm_owner_name: '',
        firm_short_name: '',
        firm_address: '',
        firm_mobile_number: '',
        firm_email: '',
        firm_gst_number: '',
        firm_pan_number: '',
        page_size: 10,
      }

      emit('close')
    }
  } catch (err) {
    console.error(err)
    if (err.response) {
      toast.error(`Failed: ${err.response.data.message || err.response.statusText}`)
    } else if (err.request) {
      toast.error('Failed to connect to API. Check IP and port.')
    } else {
      toast.error('Unexpected error occurred')
    }
  }
}
</script>
