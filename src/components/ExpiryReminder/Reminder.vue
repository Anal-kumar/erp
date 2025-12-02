<template>
  <v-container fluid>
    <v-card class="mx-auto" max-width="1000" elevation="2">
      <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
        Expiry Reminder Form
      </v-card-title>
      <v-card-text class="pa-6">
        <v-form @submit.prevent="submitForm" ref="formRef">
          <!-- Document Information Group -->
          <fieldset class="border pa-4 rounded mb-4">
            <legend class="px-2 font-weight-bold">Document Information</legend>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.document_name" label="Document Name" placeholder="Enter Document Name"
                  variant="outlined" density="compact" required :rules="[v => !!v || 'Document Name is required']"
                  @input="form.document_name = $event.target.value.toUpperCase()"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.document_number" label="Document Number" placeholder="Enter Document Number"
                  variant="outlined" density="compact" required
                  :rules="[v => !!v || 'Document Number is required']"></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="issueInput" label="Issue Date" type="date" variant="outlined" density="compact"
                  required :rules="[v => !!v || 'Issue Date is required']"></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="expiryInput" label="Expiry Date" type="date" variant="outlined" density="compact"
                  required :rules="[v => !!v || 'Expiry Date is required']"></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-select v-model="form.doc_priority" :items="['HIGH', 'MEDIUM', 'LOW']" label="Priority"
                  placeholder="Select Priority" variant="outlined" density="compact" required
                  :rules="[v => !!v || 'Priority is required']"></v-select>
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="form.document_detail" label="Document Details" placeholder="Enter Document Details"
                  rows="3" variant="outlined" density="compact"
                  @input="form.document_detail = $event.target.value.toUpperCase()"></v-textarea>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.doc_login_id" label="Document Login ID"
                  placeholder="Enter Document Login ID" variant="outlined" density="compact" required
                  :rules="[v => !!v || 'Login ID is required']"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.doc_login_password" :type="showPassword ? 'text' : 'password'"
                  label="Document Login Password" placeholder="Enter Document Login Password" variant="outlined"
                  density="compact" required :rules="[v => !!v || 'Password is required']"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="togglePassword"></v-text-field>
              </v-col>
            </v-row>
          </fieldset>

          <!-- Agent Information Group -->
          <fieldset class="border pa-4 rounded mb-4">
            <legend class="px-2 font-weight-bold">Agent Information</legend>
            <v-row dense>
              <v-col cols="12" md="4">
                <v-text-field v-model="form.agent_name" label="Agent Name" placeholder="Enter Agent Name"
                  variant="outlined" density="compact"
                  @input="form.agent_name = $event.target.value.toUpperCase()"></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="form.agent_address" label="Agent Address" placeholder="Enter Agent Address"
                  variant="outlined" density="compact"
                  @input="form.agent_address = $event.target.value.toUpperCase()"></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="form.agent_mob" label="Agent Mobile Number" placeholder="Enter Agent Mobile"
                  variant="outlined" density="compact" maxlength="10"
                  :rules="[v => !v || /^[0-9]{10}$/.test(v) || 'Invalid mobile number']"></v-text-field>
              </v-col>
            </v-row>
          </fieldset>

          <!-- Remarks Group -->
          <fieldset class="border pa-4 rounded mb-4">
            <legend class="px-2 font-weight-bold">Remarks</legend>
            <v-row dense>
              <v-col cols="12">
                <v-textarea v-model="form.remarks" label="Remarks" placeholder="Enter Remarks" rows="3"
                  variant="outlined" density="compact"
                  @input="form.remarks = $event.target.value.toUpperCase()"></v-textarea>
              </v-col>
            </v-row>
          </fieldset>

          <!-- Submit Button -->
          <v-row justify="center">
            <v-col cols="auto">
              <v-btn color="primary" type="submit" :disabled="!isModuleEnabled" class="px-6" size="large">
                Add Reminder
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import storage from '@/utils/storage';
import { expiryReminderService, getModuleStatus } from '@/services';
import { useToast } from 'vue-toastification'

// Reactive form data
const issueInput = ref('');
const expiryInput = ref('');
const isModuleEnabled = ref(false);
const form = reactive({
  user_login_id: 1,
  document_name: '',
  document_number: '',
  document_detail: '',
  issue_date: '',
  expiry_date: '',
  doc_priority: '',
  doc_login_id: '',
  doc_login_password: '',
  agent_name: '',
  agent_address: '',
  agent_mob: '',
  has_login: false,
  remarks: '',
  time_stamp: ''
});
const showPassword = ref(false);
const toast = useToast()
const formRef = ref(null)

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// Set user from local storage on mount
onMounted(() => {
  fetchModuleStatus()
  const sessionUser = storage.getUser();
  if (sessionUser) {
    const user = sessionUser;
    form.user_login_id = user.id;
    form.has_login = true;
  }
});

// Fetch module status
const fetchModuleStatus = async () => {
  try {
    const response = await getModuleStatus();
    // Debug API response
    const modules = response.data
    const ReminderModule = modules.find((m) => m.module_name === 'expiry_reminder')
    if (!ReminderModule) {
      console.warn('Reminder module not found')
      isModuleEnabled.value = false
      toast.error('Expiry Reminder module not found. Contact support.')
      return
    }
    isModuleEnabled.value = ReminderModule.module_enabled
    // Debug final value
  } catch (error) {
    console.error('Error fetching module status:', error)
    isModuleEnabled.value = false
    toast.error('Failed to fetch module status. Please check your network or contact support.')
  }
}
// Submit the form to the backend API
const submitForm = async () => {
  if (!isModuleEnabled.value) {
    toast.info('Please purchase the Expiry Reminder module to add a reminder.')
    return
  }

  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    //set timestamp and issue date
    form.time_stamp = new Date().toISOString();
    if (issueInput.value) {
      form.issue_date = new Date(issueInput.value).toISOString();
    }

    // Set timestamp and expiry date
    form.time_stamp = new Date().toISOString();
    if (expiryInput.value) {
      form.expiry_date = new Date(expiryInput.value).toISOString();
    }

    const payload = { ...form };

    const res = await expiryReminderService.createReminder(payload);

    if ([200, 201].includes(res.status)) {

      // Reset the form fields
      Object.assign(form, {
        document_name: '',
        document_number: '',
        document_detail: '',
        issue_date: '',
        expiry_date: '',
        doc_priority: '',
        doc_login_id: '',
        doc_login_password: '',
        agent_name: '',
        agent_address: '',
        agent_mob: '',
        remarks: ''
      });
      issueInput.value = '';
      expiryInput.value = '';
      showPassword.value = false;
      if (formRef.value) formRef.value.resetValidation()
      toast.success('Reminder is added')
      fetchModuleStatus()
    }
  } catch (error) {
    console.error('Error adding reminder:', error);
    toast.error('Failed to add reminder. Please check your inputs or try again later.');
  }
};
</script>

<style scoped>
fieldset {
  border: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
