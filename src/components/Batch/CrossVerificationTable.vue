<template>
  <v-container fluid>
    <v-card elevation="2" class="rounded-lg h-100">
      <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
        View Cross Verification
      </v-card-title>
      <v-card-text class="pa-4">
        <!-- Filters -->
        <v-row class="mb-4" justify="center">
          <v-col cols="12" md="3">
            <v-text-field v-model="filters.batch_name" label="Batch Name" placeholder="Filter by batch name"
              variant="outlined" density="compact" hide-details @input="debouncedResetPage"></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field v-model="filters.checker_clerk_name" label="Checker Employee"
              placeholder="Filter by checker clerk" variant="outlined" density="compact" hide-details
              @input="debouncedResetPage"></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field v-model="filters.verifier_clerk_name" label="Verifier Employee"
              placeholder="Filter by verifier clerk" variant="outlined" density="compact" hide-details
              @input="debouncedResetPage"></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field v-model="filters.approver_clerk_name" label="Approver Employee"
              placeholder="Filter by approver clerk" variant="outlined" density="compact" hide-details
              @input="debouncedResetPage"></v-text-field>
          </v-col>
          <v-col cols="12" md="2" class="d-flex align-center mt-2">
            <v-btn color="error" @click="clearFilters" block>Clear Filters</v-btn>
          </v-col>
        </v-row>

        <!-- Table -->
        <v-data-table :headers="headers" :items="filteredVerifications" :items-per-page="firm.page_size || 10"
          :loading="isLoading" density="compact" class="elevation-1" hover>
          <template v-slot:item.sno="{ index }">
            {{ index + 1 }}
          </template>
          <template v-slot:item.checking_date="{ item }">
            {{ formatDate(item.checking_date) }}
          </template>
          <template v-slot:item.verifying_date="{ item }">
            {{ formatDate(item.verifying_date) }}
          </template>
          <template v-slot:item.batch_name="{ item }">
            {{ item.batch?.batch_name || '-' }}
          </template>
          <template v-slot:item.checker_clerk_name="{ item }">
            {{ item.checker_clerk?.clerk_name || '-' }}
          </template>
          <template v-slot:item.verifier_clerk_name="{ item }">
            {{ item.verifier_clerk?.clerk_name || '-' }}
          </template>
          <template v-slot:item.approver_clerk_name="{ item }">
            {{ item.approver_clerk?.clerk_name || '-' }}
          </template>
          <template v-slot:item.user_login="{ item }">
            {{ item.user_login || '-' }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon color="primary" @click="openEditModal(item)" class="cursor-pointer">mdi-pencil</v-icon>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Edit Modal -->
    <v-dialog v-model="showEditModal" max-width="800px">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
          Edit Cross Verification
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form @submit.prevent="updateVerification">
            <v-row>
              <!-- Batch Name -->
              <v-col cols="12" md="6">
                <v-select v-model="editForm.batch_name" :items="batches" item-title="batch_name" item-value="batch_name"
                  label="Batch Name" placeholder="Select a Batch" variant="outlined" density="compact"
                  :error-messages="errors.batch_name" required></v-select>
              </v-col>

              <!-- Checker Clerk -->
              <v-col cols="12" md="6">
                <v-select v-model="editForm.checker_clerk_name" :items="clerks" item-title="clerk_name"
                  item-value="clerk_name" label="Checker Clerk" placeholder="Select a Clerk" variant="outlined"
                  density="compact" :error-messages="errors.checker_clerk_name" required></v-select>
              </v-col>

              <!-- Checking Date -->
              <v-col cols="12" md="6">
                <v-text-field v-model="editForm.checking_date" label="Checking Date" type="date" variant="outlined"
                  density="compact" :error-messages="errors.checking_date" required></v-text-field>
              </v-col>

              <!-- Checking Time -->
              <v-col cols="12" md="6">
                <v-text-field v-model="editForm.checking_time" label="Checking Time" type="time" variant="outlined"
                  density="compact" :error-messages="errors.checking_time" required></v-text-field>
              </v-col>

              <!-- Verifier Clerk -->
              <v-col cols="12" md="6">
                <v-select v-model="editForm.verifier_clerk_name" :items="availableVerifiers" item-title="clerk_name"
                  item-value="clerk_name" label="Verifier Clerk" placeholder="Select a Clerk" variant="outlined"
                  density="compact" :error-messages="errors.verifier_clerk_name" required></v-select>
              </v-col>

              <!-- Verifying Date -->
              <v-col cols="12" md="6">
                <v-text-field v-model="editForm.verifying_date" label="Verifying Date" type="date" variant="outlined"
                  density="compact" :error-messages="errors.verifying_date" required></v-text-field>
              </v-col>

              <!-- Verifying Time -->
              <v-col cols="12" md="6">
                <v-text-field v-model="editForm.verifying_time" label="Verifying Time" type="time" variant="outlined"
                  density="compact" :error-messages="errors.verifying_time" required></v-text-field>
              </v-col>

              <!-- Paddy Moisture % -->
              <v-col cols="12" md="6">
                <v-text-field v-model.number="editForm.paddy_moisture_percent" label="Paddy Moisture %" type="number"
                  step="0.01" min="0" max="100" variant="outlined" density="compact"
                  :error-messages="errors.paddy_moisture_percent" @blur="formatMoisture" required></v-text-field>
              </v-col>

              <!-- Approver Clerk -->
              <v-col cols="12" md="6">
                <v-select v-model="editForm.approver_clerk_name" :items="availableApprovers" item-title="clerk_name"
                  item-value="clerk_name" label="Approver Clerk" placeholder="Select a Clerk" variant="outlined"
                  density="compact" :error-messages="errors.approver_clerk_name" required></v-select>
              </v-col>
            </v-row>

            <div class="d-flex justify-center gap-4 mt-4">
              <v-btn type="submit" color="primary" :loading="isSubmitting" :disabled="isSubmitting">
                Update
              </v-btn>
              <v-btn color="error" @click="closeEditModal" :disabled="isSubmitting">
                Cancel
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import axios from 'axios';
import { debounce } from 'lodash';
import { useToast } from 'vue-toastification';
import config from '@/config';

const toast = useToast();

const currentPage = ref(1);
const selectedVerificationId = ref(null);
const showEditModal = ref(false);
const verifications = ref([]);
const batches = ref([]);
const clerks = ref([]);
const isSubmitting = ref(false);
const isLoading = ref(false);
const firm = ref({ page_size: 10 });
const user = JSON.parse(sessionStorage.getItem('user') || '{}');

const filters = reactive({
  batch_name: '',
  checker_clerk_name: '',
  verifier_clerk_name: '',
  approver_clerk_name: '',
});

const editForm = reactive({
  batch_name: '',
  checker_clerk_name: '',
  checking_date: '',
  checking_time: '',
  verifier_clerk_name: '',
  verifying_date: '',
  verifying_time: '',
  paddy_moisture_percent: '',
  approver_clerk_name: '',
  user_login_id: null,
});

const errors = reactive({});

const headers = [
  { title: 'S.No', key: 'sno', align: 'center', sortable: false },
  { title: 'Batch Name', key: 'batch_name', align: 'center' },
  { title: 'Checker Employee', key: 'checker_clerk_name', align: 'center' },
  { title: 'Checking Date', key: 'checking_date', align: 'center' },
  { title: 'Verifier Employee', key: 'verifier_clerk_name', align: 'center' },
  { title: 'Verifying Date', key: 'verifying_date', align: 'center' },
  { title: 'Paddy Moisture %', key: 'paddy_moisture_percent', align: 'center' },
  { title: 'Approver Employee', key: 'approver_clerk_name', align: 'center' },
  { title: 'Entry By', key: 'user_login', align: 'center' },
  { title: 'Actions', key: 'actions', align: 'center', sortable: false },
];

const availableVerifiers = computed(() => {
  return clerks.value.filter(c => c.clerk_name !== editForm.checker_clerk_name);
});

const availableApprovers = computed(() => {
  return clerks.value.filter(c => c.clerk_name !== editForm.checker_clerk_name && c.clerk_name !== editForm.verifier_clerk_name);
});

const debouncedResetPage = debounce(() => {
  currentPage.value = 1;
}, 300);

const filteredVerifications = computed(() => {
  return verifications.value.filter(verification => {
    const matchesBatchName = filters.batch_name
      ? verification.batch?.batch_name?.toLowerCase().includes(filters.batch_name.toLowerCase())
      : true;
    const matchesCheckerClerk = filters.checker_clerk_name
      ? verification.checker_clerk?.clerk_name?.toLowerCase().includes(filters.checker_clerk_name.toLowerCase())
      : true;
    const matchesVerifierClerk = filters.verifier_clerk_name
      ? verification.verifier_clerk?.clerk_name?.toLowerCase().includes(filters.verifier_clerk_name.toLowerCase())
      : true;
    const matchesApproverClerk = filters.approver_clerk_name
      ? verification.approver_clerk?.clerk_name?.toLowerCase().includes(filters.approver_clerk_name.toLowerCase())
      : true;
    return matchesBatchName && matchesCheckerClerk && matchesVerifierClerk && matchesApproverClerk;
  });
});

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatMoisture = () => {
  if (editForm.paddy_moisture_percent) {
    editForm.paddy_moisture_percent = Number(editForm.paddy_moisture_percent).toFixed(2);
  }
};

const fetchFirmDetails = async () => {
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/firm_details/get_firm_details`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      },
    );
    if (response.status === 200 && response.data) {
      firm.value = {
        firm_name: response.data.firm_name || 'Unknown Firm',
        firm_address: response.data.firm_address || 'Unknown Address',
        page_size: response.data.page_size || 10,
      };
    } else {
      toast.error('Invalid firm details received.');
    }
  } catch (error) {
    console.error('Failed to fetch firm details:', error);
    toast.error(error.response?.data?.message || error.message || 'Failed to fetch firm details.');
  }
};

const fetchVerifications = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/cross_verifications/get_cross_verifications`,
      {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      }
    );
    if (response.status === 200) {
      verifications.value = response.data;
    } else {
      toast.error('Unexpected response while fetching cross verifications');
    }
  } catch (error) {
    console.error('Error fetching verifications:', error);
    toast.error(error.response?.data?.message || 'Failed to load cross verification list.');
  } finally {
    isLoading.value = false;
  }
};

const fetchBatches = async () => {
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/batches/get_all_batches`,
      {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      }
    );
    if (response.status === 200) {
      batches.value = response.data;
    } else {
      toast.error('Unexpected response while fetching batches');
    }
  } catch (error) {
    console.error('Error fetching batches:', error);
    toast.error(error.response?.data?.message || 'Failed to load batch list.');
  }
};

const fetchClerks = async () => {
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/clerks/clerks`,
      {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      }
    );
    if (response.status === 200) {
      clerks.value = response.data.filter((clerk) => clerk.is_active === true);
    } else {
      toast.error('Unexpected response while fetching clerks');
    }
  } catch (error) {
    console.error('Error fetching clerks:', error);
    toast.error(error.response?.data?.message || 'Failed to load clerk list.');
  }
};

const setUserLoginId = () => {
  if (user?.id) {
    editForm.user_login_id = parseInt(user.id, 10);
  } else {
    toast.error('User data not found. Please log in.');
  }
};

const validateForm = () => {
  let isValid = true;
  Object.keys(errors).forEach(key => delete errors[key]);

  if (!editForm.batch_name) {
    errors.batch_name = 'Batch name is required';
    isValid = false;
  }
  if (!editForm.checker_clerk_name) {
    errors.checker_clerk_name = 'Checker clerk is required';
    isValid = false;
  }
  if (!editForm.checking_date) {
    errors.checking_date = 'Checking date is required';
    isValid = false;
  }
  if (!editForm.checking_time) {
    errors.checking_time = 'Checking time is required';
    isValid = false;
  }
  if (!editForm.verifier_clerk_name) {
    errors.verifier_clerk_name = 'Verifier clerk is required';
    isValid = false;
  }
  if (!editForm.verifying_date) {
    errors.verifying_date = 'Verifying date is required';
    isValid = false;
  }
  if (!editForm.verifying_time) {
    errors.verifying_time = 'Verifying time is required';
    isValid = false;
  }
  if (editForm.paddy_moisture_percent === '' || editForm.paddy_moisture_percent === null) {
    errors.paddy_moisture_percent = 'Paddy moisture percent is required';
    isValid = false;
  }
  if (!editForm.approver_clerk_name) {
    errors.approver_clerk_name = 'Approver clerk is required';
    isValid = false;
  }

  return isValid;
};

const openEditModal = (verification) => {
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    toast.error('Only admins can edit cross verifications.');
    return;
  }
  showEditModal.value = true;
  selectedVerificationId.value = verification.id;
  editForm.batch_name = verification.batch?.batch_name || '';
  editForm.checker_clerk_name = verification.checker_clerk?.clerk_name || '';
  editForm.checking_date = verification.checking_date || '';
  editForm.checking_time = verification.checking_time || '';
  editForm.verifier_clerk_name = verification.verifier_clerk?.clerk_name || '';
  editForm.verifying_date = verification.verifying_date || '';
  editForm.verifying_time = verification.verifying_time || '';
  editForm.paddy_moisture_percent = verification.paddy_moisture_percent ?? '';
  editForm.approver_clerk_name = verification.approver_clerk?.clerk_name || '';
  setUserLoginId();
};

const updateVerification = async () => {
  if (!validateForm()) {
    toast.error('Please fill all required fields');
    return;
  }
  isSubmitting.value = true;
  try {
    const payload = {
      id: selectedVerificationId.value,
      batch_name: editForm.batch_name,
      checker_clerk_name: editForm.checker_clerk_name,
      checking_date: editForm.checking_date,
      checking_time: editForm.checking_time,
      verifier_clerk_name: editForm.verifier_clerk_name,
      verifying_date: editForm.verifying_date,
      verifying_time: editForm.verifying_time,
      paddy_moisture_percent: Number(editForm.paddy_moisture_percent) || null,
      approver_clerk_name: editForm.approver_clerk_name,
      user_login_id: editForm.user_login_id,
    };

    const response = await axios.put(
      `${config.apiBaseUrl}/api/${config.version}/cross_verifications/update_cross_verification/${selectedVerificationId.value}`,
      payload,
      {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      }
    );

    if (response.status === 200 || response.status === 201) {
      toast.success('Cross verification updated successfully!');
      resetForm();
      showEditModal.value = false;
      selectedVerificationId.value = null;
      fetchVerifications();
    } else {
      toast.error('Unexpected response while updating cross verification');
    }
  } catch (error) {
    console.error('Error updating cross verification:', error);
    toast.error(error.response?.data?.message || 'Failed to update cross verification.');
  } finally {
    isSubmitting.value = false;
  }
};

const closeEditModal = () => {
  showEditModal.value = false;
  selectedVerificationId.value = null;
  resetForm();
};

const resetForm = () => {
  editForm.batch_name = '';
  editForm.checker_clerk_name = '';
  editForm.checking_date = '';
  editForm.checking_time = '';
  editForm.verifier_clerk_name = '';
  editForm.verifying_date = '';
  editForm.verifying_time = '';
  editForm.paddy_moisture_percent = '';
  editForm.approver_clerk_name = '';
  editForm.user_login_id = null;
  Object.keys(errors).forEach(key => delete errors[key]);
  setUserLoginId();
};

const clearFilters = () => {
  filters.batch_name = '';
  filters.checker_clerk_name = '';
  filters.verifier_clerk_name = '';
  filters.approver_clerk_name = '';
  currentPage.value = 1;
};

onMounted(() => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    toast.error('No authentication token found. Please log in.');
    return;
  }
  fetchVerifications();
  fetchBatches();
  fetchClerks();
  fetchFirmDetails();
  setUserLoginId();
});
</script>

<style scoped>
/* Vuetify handles most styles */
</style>
