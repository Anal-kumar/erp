<template>
  <v-container fluid>
    <v-card elevation="2" class="rounded-lg mx-auto" max-width="1200">
      <v-card-title class="text-h5 font-weight-bold py-4 px-6 border-b">
        Client Information
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- Firm Details -->
        <div class="mb-6">
          <h3 class="text-h6 font-weight-bold mb-4 text-primary">Firm Details</h3>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field v-model="firm.firm_name" label="Firm Name" variant="outlined" density="comfortable"
                :readonly="isReadonly" :bg-color="isReadonly ? 'grey-lighten-4' : 'white'"></v-text-field>
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field v-model="firm.firm_short_name" label="Short Name" variant="outlined" density="comfortable"
                :readonly="isReadonly" :bg-color="isReadonly ? 'grey-lighten-4' : 'white'"></v-text-field>
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field v-model="firm.firm_owner_name" label="Owner Name" variant="outlined" density="comfortable"
                :readonly="isReadonly" :bg-color="isReadonly ? 'grey-lighten-4' : 'white'"></v-text-field>
            </v-col>

            <v-col cols="12" md="8">
              <v-textarea v-model="firm.firm_address" label="Address" variant="outlined" density="comfortable" rows="2"
                auto-grow :readonly="isReadonly" :bg-color="isReadonly ? 'grey-lighten-4' : 'white'"></v-textarea>
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field v-model="firm.firm_mobile_number" label="Mobile" variant="outlined" density="comfortable"
                :readonly="isReadonly" :bg-color="isReadonly ? 'grey-lighten-4' : 'white'"></v-text-field>
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field v-model="firm.firm_email" label="Email" variant="outlined" density="comfortable"
                :readonly="isReadonly" :bg-color="isReadonly ? 'grey-lighten-4' : 'white'"></v-text-field>
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field v-model="firm.firm_pan_number" label="PAN" variant="outlined" density="comfortable"
                :readonly="isReadonly" :bg-color="isReadonly ? 'grey-lighten-4' : 'white'"></v-text-field>
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field v-model="firm.firm_gst_number" label="GST" variant="outlined" density="comfortable"
                :readonly="isReadonly" :bg-color="isReadonly ? 'grey-lighten-4' : 'white'"></v-text-field>
            </v-col>
          </v-row>
        </div>

        <v-divider class="my-6"></v-divider>

        <!-- API Details -->
        <div class="mb-6">
          <h3 class="text-h6 font-weight-bold mb-4 text-primary">API Details</h3>
          <v-row>
            <v-col cols="12" md="6">
              <div v-if="isReadonly">
                <v-text-field :model-value="`${firm.api_url}:${firm.api_port}`" label="API URL" variant="outlined"
                  density="comfortable" readonly bg-color="grey-lighten-4"></v-text-field>
              </div>
              <div v-else class="d-flex align-center ga-2">
                <v-chip label color="grey-darken-1" variant="outlined" class="mr-2" height="48">http://</v-chip>
                <v-text-field v-model="firm.api_host" label="Host IP" placeholder="192.168.1.49" variant="outlined"
                  density="comfortable" hide-details class="grow"></v-text-field>
                <v-text-field v-model.number="firm.api_port" label="Port" type="number" variant="outlined"
                  density="comfortable" hide-details style="max-width: 120px;"></v-text-field>
              </div>
            </v-col>
          </v-row>
        </div>

        <v-divider class="my-6"></v-divider>

        <!-- Page Setup -->
        <div class="mb-6">
          <h3 class="text-h6 font-weight-bold mb-4 text-primary">Page Setup</h3>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field v-model.number="firm.page_size" label="Page Size" type="number" variant="outlined"
                density="comfortable" :readonly="isReadonly"
                :bg-color="isReadonly ? 'grey-lighten-4' : 'white'"></v-text-field>
            </v-col>
          </v-row>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4 justify-end">
        <v-btn v-if="isReadonly" color="primary" variant="elevated" prepend-icon="mdi-pencil" @click="enableEdit">
          Edit Client Info
        </v-btn>
        <v-btn v-else color="success" variant="elevated" prepend-icon="mdi-content-save" @click="saveChanges">
          Save Changes
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminService } from '@/services'
import { useToast } from 'vue-toastification'

const toast = useToast()
const firm = ref({
  firm_name: '',
  firm_short_name: '',
  firm_owner_name: '',
  firm_address: '',
  firm_mobile_number: '',
  firm_email: '',
  firm_pan_number: '',
  firm_gst_number: '',
  api_url: '',
  api_host: '',
  api_port: '',
  page_size: '',
})

const isReadonly = ref(true)

// Load firm details on mount
onMounted(async () => {
  try {
    const res = await adminService.getFirmDetails()

    firm.value = res.data

    // Split http://host:port into host + port
    if (firm.value.api_url?.startsWith('http://')) {
      const withoutPrefix = firm.value.api_url.replace(/^http:\/\//, '')
      const [host, port] = withoutPrefix.split(':')
      firm.value.api_host = host
      firm.value.api_port = firm.value.api_port || port // keep backend's port if exists
    } else {
      firm.value.api_host = firm.value.api_url
    }
  } catch (err) {
    console.error('Failed to load client info', err)
    toast.error('Failed to load client information')
  }
})

// Enable editing
const enableEdit = () => {
  isReadonly.value = false
}

// Save changes
const saveChanges = async () => {
  try {
    const payload = { ...firm.value }
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Authentication token not found. Please login again.');
      return;
    }
    // Build full URL with http://
    payload.api_url = `http://${payload.api_host}`

    const res = await adminService.updateFirmDetails(payload)

    const msg = res.data?.message || 'Firm details updated successfully'
    toast.success(msg)

    // ✅ Update display to full url with port
    firm.value.display_api_url = `${payload.api_url}:${payload.api_port}`

    // Switch back to readonly mode
    isReadonly.value = true
  } catch (err) {
    console.error(err)
    const msg = err.response?.data?.message || 'Failed to save client information'
    toast.error(msg)
  }
}
</script>
