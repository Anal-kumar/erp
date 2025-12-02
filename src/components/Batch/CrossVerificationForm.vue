<template>
  <v-container fluid class="d-flex justify-center align-center" style="min-height: 80vh;">
    <v-card elevation="2" class="rounded-lg w-100" max-width="800">
      <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
        Cross Verification Form
      </v-card-title>
      <v-card-text class="pa-6">
        <v-form @submit.prevent="submitForm">
          <v-row>
            <v-col cols="12">
              <h3 class="text-h6 font-weight-medium mb-2">Cross Verification Details</h3>
              <v-divider class="mb-4"></v-divider>
            </v-col>

            <!-- Batch name -->
            <v-col cols="12" md="6">
              <v-select v-model="form.batch_name" :items="batches" item-title="batch_name" item-value="batch_name"
                label="Batch Name" placeholder="Select a Batch" variant="outlined" density="compact"
                :error-messages="errors.batch_name" required></v-select>
            </v-col>

            <!-- Checker clerk name -->
            <v-col cols="12" md="6">
              <v-select v-model="form.checker_clerk_name" :items="clerks" item-title="clerk_name"
                item-value="clerk_name" label="Checker Employee" placeholder="Select a Employee" variant="outlined"
                density="compact" :error-messages="errors.checker_clerk_name" required></v-select>
            </v-col>

            <!-- Checking date -->
            <v-col cols="12" md="6">
              <v-text-field v-model="form.checking_date" label="Checking Date" type="date" variant="outlined"
                density="compact" :error-messages="errors.checking_date" required></v-text-field>
            </v-col>

            <!-- Checking time -->
            <v-col cols="12" md="6">
              <v-text-field v-model="form.checking_time" label="Checking Time" type="time" variant="outlined"
                density="compact" :error-messages="errors.checking_time" required></v-text-field>
            </v-col>

            <!-- Verifier clerk name -->
            <v-col cols="12" md="6">
              <v-select v-model="form.verifier_clerk_name" :items="availableVerifiers" item-title="clerk_name"
                item-value="clerk_name" label="Verifier Employee" placeholder="Select a Employee" variant="outlined"
                density="compact" :error-messages="errors.verifier_clerk_name" required></v-select>
            </v-col>

            <!-- Verifying date -->
            <v-col cols="12" md="6">
              <v-text-field v-model="form.verifying_date" label="Verifying Date" type="date" variant="outlined"
                density="compact" :error-messages="errors.verifying_date" required></v-text-field>
            </v-col>

            <!-- Verifying time -->
            <v-col cols="12" md="6">
              <v-text-field v-model="form.verifying_time" label="Verifying Time" type="time" variant="outlined"
                density="compact" :error-messages="errors.verifying_time" required></v-text-field>
            </v-col>

            <!-- Paddy moisture percent -->
            <v-col cols="12" md="6">
              <v-text-field v-model.number="form.paddy_moisture_percent" label="Moisture %" type="number" step="0.01"
                min="0" max="100" variant="outlined" density="compact" :error-messages="errors.paddy_moisture_percent"
                @blur="formatMoisture" required></v-text-field>
            </v-col>

            <!-- Approver clerk -->
            <v-col cols="12" md="6">
              <v-select v-model="form.approver_clerk_name" :items="availableApprovers" item-title="clerk_name"
                item-value="clerk_name" label="Approver Employee" placeholder="Select a Employee" variant="outlined"
                density="compact" :error-messages="errors.approver_clerk_name" required></v-select>
            </v-col>
          </v-row>

          <div class="d-flex justify-center mt-6">
            <v-btn type="submit" color="primary" size="large" :loading="isSubmitting" :disabled="isSubmitting">
              {{ isSubmitting ? 'Submitting...' : 'Submit' }}
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue';
import { productionService, getModuleStatus } from '@/services';
import storage from '@/utils/storage';
import { useToast } from 'vue-toastification';

const form = reactive({
  batch_name: '',
  checker_clerk_name: '',
  checking_date: '',
  checking_time: '',
  verifier_clerk_name: '',
  verifying_date: '',
  verifying_time: '',
  paddy_moisture_percent: '',
  approver_clerk_name: '',
  user_login_id: '',
});

const errors = reactive({});
const batches = ref([]);
const clerks = ref([]);
const isSubmitting = ref(false);
const toast = useToast();
const isModuleEnabled = ref(false);

const availableVerifiers = computed(() => {
  return clerks.value.filter(c => c.clerk_name !== form.checker_clerk_name);
});

const availableApprovers = computed(() => {
  return clerks.value.filter(c => c.clerk_name !== form.checker_clerk_name && c.clerk_name !== form.verifier_clerk_name);
});

const formatMoisture = () => {
  if (form.paddy_moisture_percent) {
    form.paddy_moisture_percent = Number(form.paddy_moisture_percent).toFixed(2);
  }
};

const fetchClerks = async () => {
  try {
    const response = await productionService.getClerks();
    if (response.status === 200) {
      clerks.value = response.data.filter((clerk) => clerk.is_active === true);
    } else {
      toast.error('Unexpected response while fetching clerks');
    }
  } catch (error) {
    console.error('Error fetching clerks:', error);
    if (error.response?.status === 401) {
      toast.error('Session expired. Please log in again.');
    } else {
      toast.error(error.response?.data?.message || 'Failed to load clerk list.');
    }
  }
};

const fetchModuleStatus = async () => {
  try {
    const response = await getModuleStatus();
    const modules = response.data;
    const BatchModule = modules.find((m) => m.module_name === 'batch_operations');
    if (!BatchModule) {
      console.warn('batch module not found');
      isModuleEnabled.value = false;
      toast.error('batch module not found. Contact support.');
      return;
    }
    isModuleEnabled.value = BatchModule.module_enabled;
  } catch (error) {
    console.error('Error fetching module status:', error);
    isModuleEnabled.value = false;
    toast.error('Failed to fetch module status.');
  }
};

const fetchBatches = async () => {
  try {
    const response = await productionService.getBatches();
    if (response.status === 200) {
      batches.value = response.data;
    } else {
      toast.error('Unexpected response while fetching batches');
    }
  } catch (error) {
    console.error('Error fetching batches:', error);
    if (error.response?.status === 401) {
      toast.error('Session expired. Please log in again.');
    } else {
      toast.error(error.response?.data?.message || 'Failed to load batch list');
    }
  }
};

const validateForm = () => {
  let isValid = true;
  Object.keys(errors).forEach(key => delete errors[key]);

  if (!form.batch_name) {
    errors.batch_name = 'Batch name is required!';
    isValid = false;
  }
  if (!form.checker_clerk_name) {
    errors.checker_clerk_name = 'Checker clerk name is required!';
    isValid = false;
  }
  if (!form.checking_date) {
    errors.checking_date = 'Checking date is required!';
    isValid = false;
  }
  if (!form.checking_time) {
    errors.checking_time = 'Checking time is required!';
    isValid = false;
  }
  if (!form.verifier_clerk_name) {
    errors.verifier_clerk_name = 'Verifier Clerk name is required!';
    isValid = false;
  }
  if (!form.verifying_date) {
    errors.verifying_date = 'Verifying date is required!';
    isValid = false;
  }
  if (!form.verifying_time) {
    errors.verifying_time = 'Verifying time is required!';
    isValid = false;
  }
  if (form.paddy_moisture_percent === '' || form.paddy_moisture_percent === null) {
    errors.paddy_moisture_percent = 'Paddy moisture percent is required!';
    isValid = false;
  }
  if (!form.approver_clerk_name) { // Added missing validation for approver
    errors.approver_clerk_name = 'Approver Clerk name is required!';
    isValid = false;
  }

  if (!isValid) {
    toast.error('Please fill all required fields.');
  }
  return isValid;
};

const submitForm = async () => {
  if (!isModuleEnabled.value) {
    toast.info('Please purchase the Batch module to fill a cross verification form.');
    return;
  }
  if (!validateForm()) return;
  isSubmitting.value = true;
  const payload = {
    batch_name: form.batch_name,
    checker_clerk_name: form.checker_clerk_name,
    checking_date: form.checking_date,
    checking_time: form.checking_time,
    verifier_clerk_name: form.verifier_clerk_name,
    verifying_date: form.verifying_date,
    verifying_time: form.verifying_time,
    paddy_moisture_percent: form.paddy_moisture_percent,
    approver_clerk_name: form.approver_clerk_name,
    user_login_id: form.user_login_id
  };

  try {
    const response = await productionService.createCrossVerification(payload);

    if (response.status === 200) {
      toast.success('Form successfully submitted!');
      // Reset form
      Object.keys(form).forEach(key => {
        if (key !== 'user_login_id') form[key] = '';
      });
    } else {
      toast.error('Unexpected response while submitting form');
    }
    fetchModuleStatus();
  } catch (error) {
    console.error('Error submission:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      toast.error('Session expired. Please log in again.');
    } else {
      toast.error(error.response?.data?.message || 'Failed to submit form');
    }
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchBatches();
  fetchClerks();
  fetchModuleStatus();
  const sessionUser = storage.getUser();
  if (sessionUser) {
    const user = sessionUser;
    form.user_login_id = user?.id || '';
  } else {
    toast.error('No user session found. Please log in.');
  }
});
</script>

<style scoped>
/* Vuetify handles most styles */
</style>
