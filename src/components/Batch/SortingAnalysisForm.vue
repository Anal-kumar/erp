<template>
  <v-container fluid class="d-flex justify-center align-center" style="min-height: 80vh;">
    <v-card elevation="2" class="rounded-lg w-100" max-width="800">
      <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
        Sorting Analysis Form
      </v-card-title>
      <v-card-text class="pa-6">
        <v-form @submit.prevent="submitForm">

          <!-- Sorting Analysis Details -->
          <v-row>
            <v-col cols="12">
              <h3 class="text-h6 font-weight-medium mb-2">Sorting Analysis Details</h3>
              <v-divider class="mb-4"></v-divider>
            </v-col>

            <!-- Batch Name -->
            <v-col cols="12" md="6">
              <v-select v-model="form.batch_name" :items="batches" item-title="batch_name" item-value="batch_name"
                label="Batch Name" placeholder="Select a Batch" variant="outlined" density="compact"
                :error-messages="errors.batch_name" required></v-select>
            </v-col>

            <!-- Analyzer Clerk Name -->
            <v-col cols="12" md="6">
              <v-select v-model="form.analyzer_clerk_name" :items="clerks" item-title="clerk_name"
                item-value="clerk_name" label="Analyzer Employee" placeholder="Select an Employee" variant="outlined"
                density="compact" :error-messages="errors.analyzer_clerk_name" required></v-select>
            </v-col>

            <!-- Sorted Rice Moisture Percent -->
            <v-col cols="12" md="6">
              <v-text-field v-model.number="form.sorted_rice_moisture_percent" label="Sorted Rice Moisture %"
                type="number" step="0.01" min="0" max="100" variant="outlined" density="compact"
                :error-messages="errors.sorted_rice_moisture_percent"
                @blur="formatNumber('sorted_rice_moisture_percent')"></v-text-field>
            </v-col>

            <!-- Sorted Broken Percent -->
            <v-col cols="12" md="6">
              <v-text-field v-model.number="form.sorted_broken_percent" label="Sorted Broken %" type="number"
                step="0.01" min="0" max="100" variant="outlined" density="compact"
                :error-messages="errors.sorted_broken_percent"
                @blur="formatNumber('sorted_broken_percent')"></v-text-field>
            </v-col>

            <!-- Sorted Discolor Percent -->
            <v-col cols="12" md="6">
              <v-text-field v-model.number="form.sorted_discolor_percent" label="Sorted Discolor %" type="number"
                step="0.01" min="0" max="100" variant="outlined" density="compact"
                :error-messages="errors.sorted_discolor_percent"
                @blur="formatNumber('sorted_discolor_percent')"></v-text-field>
            </v-col>

            <!-- Sorted Damaged Percent -->
            <v-col cols="12" md="6">
              <v-text-field v-model.number="form.sorted_damaged_percent" label="Sorted Damaged %" type="number"
                step="0.01" min="0" max="100" variant="outlined" density="compact"
                :error-messages="errors.sorted_damaged_percent"
                @blur="formatNumber('sorted_damaged_percent')"></v-text-field>
            </v-col>

            <!-- Rejection Rice Percent -->
            <v-col cols="12" md="6">
              <v-text-field v-model.number="form.rejection_rice_percent" label="Rejection Rice %" type="number"
                step="0.01" min="0" max="100" variant="outlined" density="compact"
                :error-messages="errors.rejection_rice_percent"
                @blur="formatNumber('rejection_rice_percent')"></v-text-field>
            </v-col>

            <!-- Sorting Output 30sec -->
            <v-col cols="12" md="6">
              <v-text-field v-model.number="form.sorting_output_30sec" label="Sorting Output (30s) %" type="number"
                step="0.01" min="0" max="100" variant="outlined" density="compact"
                :error-messages="errors.sorting_output_30sec"
                @blur="formatNumber('sorting_output_30sec')"></v-text-field>
            </v-col>

            <!-- Rejection Output 30sec -->
            <v-col cols="12" md="6">
              <v-text-field v-model.number="form.rejection_output_30sec" label="Rejection Output (30s) %" type="number"
                step="0.01" min="0" max="100" variant="outlined" density="compact"
                :error-messages="errors.rejection_output_30sec"
                @blur="formatNumber('rejection_output_30sec')"></v-text-field>
            </v-col>
          </v-row>

          <!-- Checker Details -->
          <v-row class="mt-4">
            <v-col cols="12">
              <h3 class="text-h6 font-weight-medium mb-2">Checker Details</h3>
              <v-divider class="mb-4"></v-divider>
            </v-col>

            <!-- Checker Clerk Name -->
            <v-col cols="12" md="6">
              <v-select v-model="form.checker_clerk_name" :items="clerks" item-title="clerk_name"
                item-value="clerk_name" label="Checker Employee" placeholder="Select an Employee" variant="outlined"
                density="compact" :error-messages="errors.checker_clerk_name" required></v-select>
            </v-col>

            <!-- Checking Date -->
            <v-col cols="12" md="6">
              <v-text-field v-model="form.checking_date" label="Checking Date" type="date" variant="outlined"
                density="compact" :error-messages="errors.checking_date" required></v-text-field>
            </v-col>

            <!-- Checking Time -->
            <v-col cols="12" md="6">
              <v-text-field v-model="form.checking_time" label="Checking Time" type="time" variant="outlined"
                density="compact" :error-messages="errors.checking_time" required></v-text-field>
            </v-col>
          </v-row>

          <!-- Verifier Details -->
          <v-row class="mt-4">
            <v-col cols="12">
              <h3 class="text-h6 font-weight-medium mb-2">Verifier Details</h3>
              <v-divider class="mb-4"></v-divider>
            </v-col>

            <!-- Verifier Clerk Name -->
            <v-col cols="12" md="6">
              <v-select v-model="form.verifier_clerk_name" :items="clerks" item-title="clerk_name"
                item-value="clerk_name" label="Verifier Employee" placeholder="Select an Employee" variant="outlined"
                density="compact" :error-messages="errors.verifier_clerk_name" required></v-select>
            </v-col>

            <!-- Verifying Date -->
            <v-col cols="12" md="6">
              <v-text-field v-model="form.verifying_date" label="Verifying Date" type="date" variant="outlined"
                density="compact" :error-messages="errors.verifying_date" required></v-text-field>
            </v-col>

            <!-- Verifying Time -->
            <v-col cols="12" md="6">
              <v-text-field v-model="form.verifying_time" label="Verifying Time" type="time" variant="outlined"
                density="compact" :error-messages="errors.verifying_time" required></v-text-field>
            </v-col>
          </v-row>

          <div class="d-flex justify-center mt-6">
            <v-btn type="submit" color="primary" size="large" :loading="isSubmitting" :disabled="isSubmitting">
              Submit
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import config from '@/config';
import { useToast } from 'vue-toastification';

const toast = useToast();

const form = reactive({
  batch_name: '',
  analyzer_clerk_name: '',
  sorted_rice_moisture_percent: null,
  sorted_broken_percent: null,
  sorted_discolor_percent: null,
  sorted_damaged_percent: null,
  rejection_rice_percent: null,
  sorting_output_30sec: null,
  rejection_output_30sec: null,
  checker_clerk_name: '',
  checking_date: '',
  checking_time: '',
  verifier_clerk_name: '',
  verifying_date: '',
  verifying_time: '',
  user_login_id: '',
});

const errors = reactive({});
const batches = ref([]);
const clerks = ref([]);
const isSubmitting = ref(false);
const isModuleEnabled = ref(false);

const formatNumber = (field) => {
  if (form[field] !== '' && form[field] !== null) {
    form[field] = Number(form[field]).toFixed(2);
  }
};

const fetchClerks = async () => {
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/clerks/clerks/`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      }
    );
    if (response.status === 200) {
      clerks.value = response.data.filter(clerk => clerk.is_active);
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

const fetchBatches = async () => {
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/batches/get_all_batches`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      }
    );
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
    errors.batch_name = 'Batch Name is required.';
    isValid = false;
  }
  if (!form.analyzer_clerk_name) {
    errors.analyzer_clerk_name = 'Analyzer Clerk is required.';
    isValid = false;
  }
  if (form.sorted_rice_moisture_percent == null || form.sorted_rice_moisture_percent < 0 || form.sorted_rice_moisture_percent > 100) {
    errors.sorted_rice_moisture_percent = 'Must be between 0 and 100.';
    isValid = false;
  }
  if (form.sorted_broken_percent == null || form.sorted_broken_percent < 0 || form.sorted_broken_percent > 100) {
    errors.sorted_broken_percent = 'Must be between 0 and 100.';
    isValid = false;
  }
  if (form.sorted_discolor_percent == null || form.sorted_discolor_percent < 0 || form.sorted_discolor_percent > 100) {
    errors.sorted_discolor_percent = 'Must be between 0 and 100.';
    isValid = false;
  }
  if (form.sorted_damaged_percent == null || form.sorted_damaged_percent < 0 || form.sorted_damaged_percent > 100) {
    errors.sorted_damaged_percent = 'Must be between 0 and 100.';
    isValid = false;
  }
  if (form.rejection_rice_percent == null || form.rejection_rice_percent < 0 || form.rejection_rice_percent > 100) {
    errors.rejection_rice_percent = 'Must be between 0 and 100.';
    isValid = false;
  }
  if (form.sorting_output_30sec == null || form.sorting_output_30sec < 0 || form.sorting_output_30sec > 100) {
    errors.sorting_output_30sec = 'Must be between 0 and 100.';
    isValid = false;
  }
  if (form.rejection_output_30sec == null || form.rejection_output_30sec < 0 || form.rejection_output_30sec > 100) {
    errors.rejection_output_30sec = 'Must be between 0 and 100.';
    isValid = false;
  }
  if (!form.checker_clerk_name) {
    errors.checker_clerk_name = 'Checker Clerk is required.';
    isValid = false;
  }
  if (!form.checking_date) {
    errors.checking_date = 'Checking Date is required.';
    isValid = false;
  }
  if (!form.checking_time) {
    errors.checking_time = 'Checking Time is required.';
    isValid = false;
  }
  if (!form.verifier_clerk_name) {
    errors.verifier_clerk_name = 'Verifier Clerk is required.';
    isValid = false;
  }
  if (!form.verifying_date) {
    errors.verifying_date = 'Verifying Date is required.';
    isValid = false;
  }
  if (!form.verifying_time) {
    errors.verifying_time = 'Verifying Time is required.';
    isValid = false;
  }

  if (!isValid) {
    toast.error('Please fix the errors in the form.');
  }

  return isValid;
};

const fetchModuleStatus = async () => {
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/modules/get_modules`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      },
    );
    const modules = response.data;
    const BatchModule = modules.find((m) => m.module_name === 'batch_operations');
    if (!BatchModule) {
      console.warn('batch module not found');
      isModuleEnabled.value = false;
      toast.error('Batch module not found. Contact support.');
      return;
    }
    isModuleEnabled.value = BatchModule.module_enabled;
  } catch (error) {
    console.error('Error fetching module status:', error);
    isModuleEnabled.value = false;
    toast.error('Failed to fetch module status. Please check your network or contact support.');
  }
};

const submitForm = async () => {
  if (!isModuleEnabled.value) {
    toast.info('Please purchase the batch module to fill a sort analysis.');
    return;
  }
  if (!validateForm()) return;

  isSubmitting.value = true;
  try {
    const payload = {
      batch_name: form.batch_name,
      analyzer_clerk_name: form.analyzer_clerk_name,
      sorted_rice_moisture_percent: form.sorted_rice_moisture_percent,
      sorted_broken_percent: form.sorted_broken_percent,
      sorted_discolor_percent: form.sorted_discolor_percent,
      sorted_damaged_percent: form.sorted_damaged_percent,
      rejection_rice_percent: form.rejection_rice_percent,
      sorting_output_30sec: form.sorting_output_30sec,
      rejection_output_30sec: form.rejection_output_30sec,
      checker_clerk_name: form.checker_clerk_name,
      checking_date: form.checking_date,
      checking_time: form.checking_time,
      verifier_clerk_name: form.verifier_clerk_name,
      verifying_date: form.verifying_date,
      verifying_time: form.verifying_time,
      user_login_id: form.user_login_id,
    };

    const response = await axios.post(
      `${config.apiBaseUrl}/api/${config.version}/sorting_analysis/create_sorting_analysis/`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      }
    );
    if (response.status === 200 || response.status === 201) {
      toast.success('Sorting analysis submitted successfully!');
      Object.assign(form, {
        batch_name: '',
        analyzer_clerk_name: '',
        sorted_rice_moisture_percent: null,
        sorted_broken_percent: null,
        sorted_discolor_percent: null,
        sorted_damaged_percent: null,
        rejection_rice_percent: null,
        sorting_output_30sec: null,
        rejection_output_30sec: null,
        checker_clerk_name: '',
        checking_date: '',
        checking_time: '',
        verifier_clerk_name: '',
        verifying_date: '',
        verifying_time: '',
      });
      fetchModuleStatus();
    } else {
      toast.error('Unexpected response while submitting form');
    }
  } catch (error) {
    console.error('Error submitting sorting analysis:', error);
    if (error.response?.status === 401) {
      toast.error('Session expired. Please log in again.');
    } else {
      toast.error(error.response?.data?.detail || 'Failed to submit sorting analysis.');
    }
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  const sessionUser = sessionStorage.getItem('user');
  if (sessionUser) {
    const user = JSON.parse(sessionUser);
    form.user_login_id = user.id;
  } else {
    toast.error('No user session found. Please log in.');
  }
  fetchBatches();
  fetchClerks();
  fetchModuleStatus();
});
</script>

<style scoped>
/* Vuetify handles styles */
</style>