<template>
  <v-container fluid class="d-flex justify-center align-center" style="min-height: 80vh;">
    <v-card elevation="2" class="rounded-lg w-100" max-width="800">
      <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
        Milling Analysis Form
      </v-card-title>
      <v-card-text class="pa-6">
        <v-form @submit.prevent="submitForm">
          <v-row>
            <v-col cols="12">
              <h3 class="text-h6 font-weight-medium mb-2">Milling Analysis Details</h3>
              <v-divider class="mb-4"></v-divider>
            </v-col>

            <!-- Batch name -->
            <v-col cols="12" md="6">
              <v-select v-model="form.batch_name" :items="batches" item-title="batch_name" item-value="batch_name"
                label="Batch Name" placeholder="Select a Batch" variant="outlined" density="compact"
                :error-messages="errors.batch_name" required></v-select>
            </v-col>

            <!-- Analyzer clerk -->
            <v-col cols="12" md="6">
              <v-select v-model="form.analyzer_clerk_name" :items="clerks" item-title="clerk_name"
                item-value="clerk_name" label="Analyzer Employee" placeholder="Select a Employee" variant="outlined"
                density="compact" :error-messages="errors.analyzer_clerk_name" required></v-select>
            </v-col>

            <!-- Milling rice moisture percent -->
            <v-col cols="12" md="6">
              <v-text-field v-model.number="form.milling_rice_moisture_percent" label="Rice Moisture %" type="number"
                step="0.01" min="0" max="100" variant="outlined" density="compact"
                :error-messages="errors.milling_rice_moisture_percent"
                @blur="formatNumber('milling_rice_moisture_percent')"></v-text-field>
            </v-col>

            <!-- Milling broken percent -->
            <v-col cols="12" md="6">
              <v-text-field v-model.number="form.milling_broken_percent" label="Broken %" type="number" step="0.01"
                min="0" max="100" variant="outlined" density="compact" :error-messages="errors.milling_broken_percent"
                @blur="formatNumber('milling_broken_percent')"></v-text-field>
            </v-col>

            <!-- Milling discolor percent -->
            <v-col cols="12" md="6">
              <v-text-field v-model.number="form.milling_discolor_percent" label="Discolor %" type="number" step="0.01"
                min="0" max="100" variant="outlined" density="compact" :error-messages="errors.milling_discolor_percent"
                @blur="formatNumber('milling_discolor_percent')"></v-text-field>
            </v-col>

            <!-- Milling damage percent -->
            <v-col cols="12" md="6">
              <v-text-field v-model.number="form.milling_damaged_percent" label="Damage %" type="number" step="0.01"
                min="0" max="100" variant="outlined" density="compact" :error-messages="errors.milling_damaged_percent"
                @blur="formatNumber('milling_damaged_percent')"></v-text-field>
            </v-col>

            <!-- Milling output porridge 30sec -->
            <v-col cols="12" md="6">
              <v-text-field v-model.number="form.milling_output_porridge_30sec" label="Output Porridge (30s)"
                type="number" step="0.01" min="0" max="100" variant="outlined" density="compact"
                :error-messages="errors.milling_output_porridge_30sec"
                @blur="formatNumber('milling_output_porridge_30sec')"></v-text-field>
            </v-col>

            <!-- Milling output final polisher 30sec -->
            <v-col cols="12" md="6">
              <v-text-field v-model.number="form.milling_output_final_polisher_30sec"
                label="Output Final Polisher (30s)" type="number" step="0.01" min="0" max="100" variant="outlined"
                density="compact" :error-messages="errors.milling_output_final_polisher_30sec"
                @blur="formatNumber('milling_output_final_polisher_30sec')"></v-text-field>
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
import { onMounted, reactive, ref } from 'vue';
import { productionService, getModuleStatus } from '@/services';
import { useToast } from 'vue-toastification';
import storage from '@/utils/storage';

const form = reactive({
  batch_name: '',
  analyzer_clerk_name: '',
  milling_rice_moisture_percent: '',
  milling_broken_percent: '',
  milling_discolor_percent: '',
  milling_damaged_percent: '',
  milling_output_porridge_30sec: '',
  milling_output_final_polisher_30sec: '',
  user_login_id: '',
});

const errors = reactive({});
const batches = ref([]);
const clerks = ref([]);
const isSubmitting = ref(false);
const toast = useToast();
const isModuleEnabled = ref(false);

const formatNumber = (field) => {
  if (form[field] !== '' && form[field] !== null) {
    form[field] = Number(form[field]).toFixed(2);
  }
};

// Fetch Clerks
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

// Fetch Batches
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

// Validate Form
const validateForm = () => {
  let isValid = true;
  Object.keys(errors).forEach(key => delete errors[key]);

  if (!form.batch_name) {
    errors.batch_name = 'Batch name is required!';
    isValid = false;
  }
  if (!form.analyzer_clerk_name) {
    errors.analyzer_clerk_name = 'Analyzer clerk is required!';
    isValid = false;
  }
  if (form.milling_rice_moisture_percent === '' || form.milling_rice_moisture_percent < 0 || form.milling_rice_moisture_percent > 100) {
    errors.milling_rice_moisture_percent = 'Must be between 0 and 100!';
    isValid = false;
  }
  if (form.milling_broken_percent === '' || form.milling_broken_percent < 0 || form.milling_broken_percent > 100) {
    errors.milling_broken_percent = 'Must be between 0 and 100!';
    isValid = false;
  }
  if (form.milling_discolor_percent === '' || form.milling_discolor_percent < 0 || form.milling_discolor_percent > 100) {
    errors.milling_discolor_percent = 'Must be between 0 and 100!';
    isValid = false;
  }
  if (form.milling_damaged_percent === '' || form.milling_damaged_percent < 0 || form.milling_damaged_percent > 100) {
    errors.milling_damaged_percent = 'Must be between 0 and 100!';
    isValid = false;
  }
  if (form.milling_output_porridge_30sec === '' || form.milling_output_porridge_30sec < 0 || form.milling_output_porridge_30sec > 100) {
    errors.milling_output_porridge_30sec = 'Must be between 0 and 100!';
    isValid = false;
  }
  if (form.milling_output_final_polisher_30sec === '' || form.milling_output_final_polisher_30sec < 0 || form.milling_output_final_polisher_30sec > 100) {
    errors.milling_output_final_polisher_30sec = 'Must be between 0 and 100!';
    isValid = false;
  }

  if (!isValid) {
    toast.error('Please fix the errors in the form.');
  }

  return isValid;
};

const fetchModuleStatus = async () => {
  try {
    const response = await getModuleStatus();
    const modules = response.data;
    const BatchModule = modules.find((m) => m.module_name === 'batch_operations');
    if (!BatchModule) {
      console.warn('Batch module not found');
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

// Submit Form
const submitForm = async () => {
  if (!isModuleEnabled.value) {
    toast.info('Please purchase the batch module to fill a mill analysis form.');
    return;
  }
  if (!validateForm()) return;

  isSubmitting.value = true;
  const payload = {
    batch_name: form.batch_name,
    analyzer_clerk_name: form.analyzer_clerk_name,
    milling_rice_moisture_percent: form.milling_rice_moisture_percent,
    milling_broken_percent: form.milling_broken_percent,
    milling_discolor_percent: form.milling_discolor_percent,
    milling_damaged_percent: form.milling_damaged_percent,
    milling_output_porridge_30sec: form.milling_output_porridge_30sec,
    milling_output_final_polisher_30sec: form.milling_output_final_polisher_30sec,
    user_login_id: form.user_login_id,
  };
  try {
    const response = await productionService.createMillingAnalysis(payload);

    if (response.status === 200) {
      toast.success('Form successfully submitted!');
      // Reset form
      Object.assign(form, {
        batch_name: '',
        analyzer_clerk_name: '',
        milling_rice_moisture_percent: '',
        milling_broken_percent: '',
        milling_discolor_percent: '',
        milling_damaged_percent: '',
        milling_output_porridge_30sec: '',
        milling_output_final_polisher_30sec: '',
      });
      fetchModuleStatus();
    } else {
      toast.error('Unexpected response while submitting form');
    }
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
/* Vuetify handles styles */
</style>
