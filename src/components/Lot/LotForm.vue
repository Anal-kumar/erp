<template>
  <v-container fluid class="fill-height d-flex justify-center align-center bg-grey-lighten-4">
    <v-card elevation="2" class="rounded-lg w-100" max-width="800">
      <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
        Lot Information Form
      </v-card-title>
      <v-card-text class="pa-4">
        <v-form @submit.prevent="submitForm">

          <!-- Lot Details -->
          <h3 class="text-subtitle-1 font-weight-bold mb-2">Lot Details</h3>
          <v-divider class="mb-4"></v-divider>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model.number="form.lot_number" label="Lot Number" type="number" variant="outlined"
                density="compact" :rules="[v => v >= 0 || 'Must be non-negative']"
                @input="form.lot_number = form.lot_number.toString().slice(0, 6)"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model.number="form.lot_moisture_percent" label="Moisture %" type="number" step="0.01"
                variant="outlined" density="compact" :rules="[rules.percent]"
                @blur="formatNumber('lot_moisture_percent')"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model.number="form.lot_broken_percent" label="Broken %" type="number" step="0.01"
                variant="outlined" density="compact" :rules="[rules.percent]"
                @blur="formatNumber('lot_broken_percent')"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model.number="form.lot_discolor_percent" label="Discolor %" type="number" step="0.01"
                variant="outlined" density="compact" :rules="[rules.percent]"
                @blur="formatNumber('lot_discolor_percent')"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model.number="form.lot_damaged_percent" label="Damaged %" type="number" step="0.01"
                variant="outlined" density="compact" :rules="[rules.percent]"
                @blur="formatNumber('lot_damaged_percent')"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model.number="form.lot_lower_grain_percent" label="Lower Grain %" type="number"
                step="0.01" variant="outlined" density="compact" :rules="[rules.percent]"
                @blur="formatNumber('lot_lower_grain_percent')"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model.number="form.lot_chalky_percent" label="Chalky %" type="number" step="0.01"
                variant="outlined" density="compact" :rules="[rules.percent]"
                @blur="formatNumber('lot_chalky_percent')"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model.number="form.lot_frk_percent" label="FRK %" type="number" step="0.01"
                variant="outlined" density="compact" :rules="[rules.percent]"
                @blur="formatNumber('lot_frk_percent')"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model.number="form.lot_other_percent" label="Other %" type="number" step="0.01"
                variant="outlined" density="compact" :rules="[rules.percent]"
                @blur="formatNumber('lot_other_percent')"></v-text-field>
            </v-col>
          </v-row>

          <!-- Checker Details -->
          <h3 class="text-subtitle-1 font-weight-bold mb-2 mt-4">Checker Details</h3>
          <v-divider class="mb-4"></v-divider>
          <v-row>
            <v-col cols="12" md="6">
              <v-select v-model="form.checker_clerk" :items="clerks" item-title="clerk_name" item-value="clerk_name"
                label="Checker Employee" placeholder="Select a Employee" variant="outlined" density="compact"
                :rules="[rules.required]"></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.checking_date" label="Checking Date" type="date" variant="outlined"
                density="compact" :rules="[rules.required]"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.checking_time" label="Checking Time" type="time" variant="outlined"
                density="compact" :rules="[rules.required]"></v-text-field>
            </v-col>
          </v-row>

          <!-- Verifier Details -->
          <h3 class="text-subtitle-1 font-weight-bold mb-2 mt-4">Verifier Details</h3>
          <v-divider class="mb-4"></v-divider>
          <v-row>
            <v-col cols="12" md="6">
              <v-select v-model="form.verifier_clerk" :items="clerks" item-title="clerk_name" item-value="clerk_name"
                label="Verifier Employee" placeholder="Select a Employee" variant="outlined" density="compact"
                :rules="[rules.required]"></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.verifying_date" label="Verifying Date" type="date" variant="outlined"
                density="compact" :rules="[rules.required]"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.verifying_time" label="Verifying Time" type="time" variant="outlined"
                density="compact" :rules="[rules.required]"></v-text-field>
            </v-col>
          </v-row>

          <div class="text-center mt-6">
            <v-btn type="submit" color="primary" :loading="isSubmitting" :disabled="isSubmitting">
              Submit
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import axios from 'axios';
import config from '@/config';
import { useToast } from 'vue-toastification';
import storage from '@/utils/storage';
import apiClient from '@/services/api';

const toast = useToast();
const isModuleEnabled = ref(false);
const isSubmitting = ref(false);
const clerks = ref([]);

const form = reactive({
  lot_number: 0,
  lot_moisture_percent: null,
  lot_broken_percent: null,
  lot_discolor_percent: null,
  lot_damaged_percent: null,
  lot_lower_grain_percent: null,
  lot_chalky_percent: null,
  lot_frk_percent: null,
  lot_other_percent: null,
  checker_clerk: '',
  checking_date: '',
  checking_time: '',
  verifier_clerk: '',
  verifying_date: '',
  verifying_time: '',
  remarks: '',
  user_login_id: 0,
});

const rules = {
  required: value => !!value || 'Required.',
  percent: value => {
    if (value === null || value === '') return 'Required.';
    if (value < 0 || value > 100) return 'Must be between 0 and 100.';
    return true;
  },
};

const FullCheckingTime = computed(() => {
  return form.checking_time ? `${form.checking_time}:00.000Z` : '00:00:00.000Z';
});

const FullVerifyingTime = computed(() => {
  return form.verifying_time ? `${form.verifying_time}:00.000Z` : '00:00:00.000Z';
});

const formatNumber = (field) => {
  if (form[field] !== null && form[field] !== '') {
    form[field] = Number(form[field]).toFixed(2);
  }
};

const fetchModuleStatus = async () => {
  try {
    const response = await apiClient.get(
      `/modules/get_modules`,
      {
        headers: {
          Authorization: `Bearer ${storage.getToken()}`,
        },
      },
    );
    const modules = response.data;
    const LotModule = modules.find((m) => m.module_name === 'lot_operations');
    if (!LotModule) {
      console.warn('Lot module not found');
      isModuleEnabled.value = false;
      toast.error('Lot module not found. Contact support.');
      return;
    }
    isModuleEnabled.value = LotModule.module_enabled;
  } catch (error) {
    console.error('Error fetching module status:', error);
    isModuleEnabled.value = false;
    toast.error('Failed to fetch module status.');
  }
};

const fetchClerks = async () => {
  try {
    const response = await apiClient.get(
      `/clerks/clerks/`,
      {
        headers: {
          Authorization: `Bearer ${storage.getToken()}`,
        },
      },
    );
    if (response.status === 200) {
      clerks.value = response.data.filter((clerk) => clerk.is_active === true);
    }
  } catch (error) {
    console.error('Error fetching clerks:', error);
    toast.error('Failed to load clerk list.');
  }
};

const validateForm = () => {
  if (form.lot_number < 0) {
    toast.error('Lot number must be a non-negative number.');
    return false;
  }
  // Basic validation is handled by Vuetify rules, but we can keep logic checks if needed
  if (form.remarks.length > 100) {
    toast.error('Remarks cannot exceed 100 characters.');
    return false;
  }
  return true;
};

const submitForm = async () => {
  if (!isModuleEnabled.value) {
    toast.info('Please purchase the Lot details module to add a lot.');
    return;
  }
  // Trigger Vuetify validation here if using v-form ref, but for now relying on basic checks + HTML5 validation
  // Ideally we should use a ref to the form and call validate()
  if (!validateForm()) return;

  isSubmitting.value = true;
  try {
    const payload = {
      user_login_id: form.user_login_id,
      lot_number: form.lot_number,
      lot_moisture_percent: form.lot_moisture_percent,
      lot_broken_percent: form.lot_broken_percent,
      lot_discolor_percent: form.lot_discolor_percent,
      lot_damaged_percent: form.lot_damaged_percent,
      lot_lower_grain_percent: form.lot_lower_grain_percent,
      lot_chalky_percent: form.lot_chalky_percent,
      lot_frk_percent: form.lot_frk_percent,
      lot_other_percent: form.lot_other_percent,
      checker_clerk: form.checker_clerk,
      checking_date: form.checking_date,
      checking_time: FullCheckingTime.value,
      verifier_clerk: form.verifier_clerk,
      verifying_date: form.verifying_date,
      verifying_time: FullVerifyingTime.value,
      remarks: form.remarks,
    };
    const response = await axios.post(
      `${config.apiBaseUrl}/api/${config.version}/lots/create_lot/`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${storage.getToken()}`,
        },
      },
    );
    if (response.status === 200 || response.status === 201) {
      toast.success('Lot information submitted successfully!');
      Object.assign(form, {
        lot_number: 0,
        lot_moisture_percent: null,
        lot_broken_percent: null,
        lot_discolor_percent: null,
        lot_damaged_percent: null,
        lot_lower_grain_percent: null,
        lot_chalky_percent: null,
        lot_frk_percent: null,
        lot_other_percent: null,
        checker_clerk: '',
        checking_date: '',
        checking_time: '',
        verifier_clerk: '',
        verifying_date: '',
        verifying_time: '',
        remarks: '',
        user_login_id: form.user_login_id,
      });
      fetchModuleStatus();
    }
  } catch (error) {
    console.error('Error submitting lot information:', error);
    toast.error(error.response?.data?.detail || 'Failed to submit lot information.');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  const sessionUser = storage.getUser();
  if (sessionUser) {
    const user = sessionUser;
    form.user_login_id = user.id;
  }
  fetchClerks();
  fetchModuleStatus();
});
</script>

<style scoped>
/* Vuetify handles styles */
</style>
