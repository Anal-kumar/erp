<template>
  <v-container fluid>
    <v-card elevation="2" class="rounded-lg">
      <v-card-title class="text-h5 font-weight-bold text-center py-4">
        View Sorting Analysis
      </v-card-title>
      <v-card-text>
        <!-- Filter Inputs -->
        <v-row dense class="mb-4 align-center justify-center">
          <v-col cols="12" sm="6" md="3">
            <v-text-field v-model="filters.batch_name" label="Batch Name" placeholder="Filter by batch name"
              variant="outlined" density="compact" hide-details @input="currentPage = 1"></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field v-model="filters.analyzer_clerk_name" label="Analyzer Employee"
              placeholder="Filter by analyzer clerk" variant="outlined" density="compact" hide-details
              @input="currentPage = 1"></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field v-model="filters.checker_clerk_name" label="Checker Employee"
              placeholder="Filter by checker clerk" variant="outlined" density="compact" hide-details
              @input="currentPage = 1"></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field v-model="filters.verifier_clerk_name" label="Verifier Employee"
              placeholder="Filter by verifier clerk" variant="outlined" density="compact" hide-details
              @input="currentPage = 1"></v-text-field>
          </v-col>
          <v-col cols="12" sm="auto">
            <v-btn color="error" @click="clearFilters">
              Clear Filters
            </v-btn>
          </v-col>
        </v-row>

        <!-- Table -->
        <v-data-table :headers="headers" :items="filteredSorts" :items-per-page="firm.page_size || 10"
          :loading="loading" density="compact" class="elevation-1" hover>
          <template v-slot:item.sno="{ index }">
            {{ index + 1 }}
          </template>
          <template v-slot:item.batch_name="{ item }">
            {{ item.batch?.batch_name || '-' }}
          </template>
          <template v-slot:item.analyzer_clerk_name="{ item }">
            {{ item.analyzer_clerk?.clerk_name || '-' }}
          </template>
          <template v-slot:item.checker_clerk_name="{ item }">
            {{ item.checker_clerk?.clerk_name || '-' }}
          </template>
          <template v-slot:item.checking_date="{ item }">
            {{ formatDate(item.checking_date) }}
          </template>
          <template v-slot:item.verifier_clerk_name="{ item }">
            {{ item.verifier_clerk?.clerk_name || '-' }}
          </template>
          <template v-slot:item.verifying_date="{ item }">
            {{ formatDate(item.verifying_date) }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon color="primary" @click="openEditModal(item)" class="cursor-pointer">
              mdi-pencil
            </v-icon>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Edit Modal -->
    <v-dialog v-model="showEditModal" max-width="800px">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
          Edit Sort Analysis
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form @submit.prevent="updateSort">
            <v-row>
              <!-- Batch Name -->
              <v-col cols="12" md="6">
                <v-select v-model="editForm.batch_name" :items="batches" item-title="batch_name" item-value="batch_name"
                  label="Batch Name" placeholder="Select a Batch" variant="outlined" density="compact"
                  :error-messages="errors.batch_name" required></v-select>
              </v-col>

              <!-- Analyzer Clerk -->
              <v-col cols="12" md="6">
                <v-select v-model="editForm.analyzer_clerk_name" :items="clerks" item-title="clerk_name"
                  item-value="clerk_name" label="Analyzer Clerk" placeholder="Select a Clerk" variant="outlined"
                  density="compact" :error-messages="errors.analyzer_clerk_name" required></v-select>
              </v-col>

              <!-- Sorted Rice Moisture % -->
              <v-col cols="12" md="6">
                <v-text-field v-model.number="editForm.sorted_rice_moisture_percent" label="Sorted Rice Moisture %"
                  type="number" step="0.01" min="0" max="100" variant="outlined" density="compact"
                  :error-messages="errors.sorted_rice_moisture_percent"
                  @blur="formatNumber('sorted_rice_moisture_percent')"></v-text-field>
              </v-col>

              <!-- Sorted Broken % -->
              <v-col cols="12" md="6">
                <v-text-field v-model.number="editForm.sorted_broken_percent" label="Sorted Broken %" type="number"
                  step="0.01" min="0" max="100" variant="outlined" density="compact"
                  :error-messages="errors.sorted_broken_percent"
                  @blur="formatNumber('sorted_broken_percent')"></v-text-field>
              </v-col>

              <!-- Sorted Discolor % -->
              <v-col cols="12" md="6">
                <v-text-field v-model.number="editForm.sorted_discolor_percent" label="Sorted Discolor %" type="number"
                  step="0.01" min="0" max="100" variant="outlined" density="compact"
                  :error-messages="errors.sorted_discolor_percent"
                  @blur="formatNumber('sorted_discolor_percent')"></v-text-field>
              </v-col>

              <!-- Sorted Damaged % -->
              <v-col cols="12" md="6">
                <v-text-field v-model.number="editForm.sorted_damaged_percent" label="Sorted Damaged %" type="number"
                  step="0.01" min="0" max="100" variant="outlined" density="compact"
                  :error-messages="errors.sorted_damaged_percent"
                  @blur="formatNumber('sorted_damaged_percent')"></v-text-field>
              </v-col>

              <!-- Rejection Rice % -->
              <v-col cols="12" md="6">
                <v-text-field v-model.number="editForm.rejection_rice_percent" label="Rejection Rice %" type="number"
                  step="0.01" min="0" max="100" variant="outlined" density="compact"
                  :error-messages="errors.rejection_rice_percent"
                  @blur="formatNumber('rejection_rice_percent')"></v-text-field>
              </v-col>

              <!-- Sorting Output (30s) % -->
              <v-col cols="12" md="6">
                <v-text-field v-model.number="editForm.sorting_output_30sec" label="Sorting Output (30s) %"
                  type="number" step="0.01" min="0" max="100" variant="outlined" density="compact"
                  :error-messages="errors.sorting_output_30sec"
                  @blur="formatNumber('sorting_output_30sec')"></v-text-field>
              </v-col>

              <!-- Rejection Output (30s) % -->
              <v-col cols="12" md="6">
                <v-text-field v-model.number="editForm.rejection_output_30sec" label="Rejection Output (30s) %"
                  type="number" step="0.01" min="0" max="100" variant="outlined" density="compact"
                  :error-messages="errors.rejection_output_30sec"
                  @blur="formatNumber('rejection_output_30sec')"></v-text-field>
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
                <v-select v-model="editForm.verifier_clerk_name" :items="clerks" item-title="clerk_name"
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
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-center pb-4">
          <v-btn color="primary" variant="elevated" @click="updateSort" :loading="isSubmitting"
            :disabled="isSubmitting">
            Update
          </v-btn>
          <v-btn color="error" variant="outlined" @click="closeEditModal">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import axios from 'axios';
import config from '@/config';
import { useToast } from 'vue-toastification';

const toast = useToast();

const currentPage = ref(1);
const selectedSortId = ref(null);
const showEditModal = ref(false);
const sorts = ref([]);
const batches = ref([]);
const clerks = ref([]);
const firm = ref({ page_size: 10 });
const user = JSON.parse(sessionStorage.getItem('user')) || null;
const isSubmitting = ref(false);
const loading = ref(false);

// Filter inputs
const filters = reactive({
  batch_name: '',
  analyzer_clerk_name: '',
  checker_clerk_name: '',
  verifier_clerk_name: '',
});

// Edit form
const editForm = reactive({
  batch_name: '',
  analyzer_clerk_name: '',
  sorted_rice_moisture_percent: '',
  sorted_broken_percent: '',
  sorted_discolor_percent: '',
  sorted_damaged_percent: '',
  rejection_rice_percent: '',
  sorting_output_30sec: '',
  rejection_output_30sec: '',
  checker_clerk_name: '',
  checking_date: '',
  checking_time: '',
  verifier_clerk_name: '',
  verifying_date: '',
  verifying_time: '',
  user_login_id: null,
});

// Errors
const errors = reactive({});

const headers = [
  { title: 'S.No', key: 'sno', align: 'center', sortable: false },
  { title: 'Batch Name', key: 'batch_name', align: 'center' },
  { title: 'Analyzer Employee', key: 'analyzer_clerk_name', align: 'center' },
  { title: 'Sorted Rice Moisture %', key: 'sorted_rice_moisture_percent', align: 'center' },
  { title: 'Sorted Broken %', key: 'sorted_broken_percent', align: 'center' },
  { title: 'Sorted Discolor %', key: 'sorted_discolor_percent', align: 'center' },
  { title: 'Sorted Damaged %', key: 'sorted_damaged_percent', align: 'center' },
  { title: 'Rejection Rice %', key: 'rejection_rice_percent', align: 'center' },
  { title: 'Sorting Output (30s)', key: 'sorting_output_30sec', align: 'center' },
  { title: 'Rejection Output (30s)', key: 'rejection_output_30sec', align: 'center' },
  { title: 'Checker Employee', key: 'checker_clerk_name', align: 'center' },
  { title: 'Checking Date', key: 'checking_date', align: 'center' },
  { title: 'Verifier Employee', key: 'verifier_clerk_name', align: 'center' },
  { title: 'Verifying Date', key: 'verifying_date', align: 'center' },
  { title: 'Entry By', key: 'user_login', align: 'center' },
  { title: 'Actions', key: 'actions', align: 'center', sortable: false },
];

// Filter sorts based on multiple criteria
const filteredSorts = computed(() => {
  return sorts.value.filter(sort => {
    const matchesBatchName = filters.batch_name
      ? sort.batch?.batch_name?.toLowerCase().includes(filters.batch_name.toLowerCase())
      : true;
    const matchesAnalyzerClerk = filters.analyzer_clerk_name
      ? sort.analyzer_clerk?.clerk_name?.toLowerCase().includes(filters.analyzer_clerk_name.toLowerCase())
      : true;
    const matchesCheckerClerk = filters.checker_clerk_name
      ? sort.checker_clerk?.clerk_name?.toLowerCase().includes(filters.checker_clerk_name.toLowerCase())
      : true;
    const matchesVerifierClerk = filters.verifier_clerk_name
      ? sort.verifier_clerk?.clerk_name?.toLowerCase().includes(filters.verifier_clerk_name.toLowerCase())
      : true;

    return matchesBatchName && matchesAnalyzerClerk && matchesCheckerClerk && matchesVerifierClerk;
  });
});

const formatNumber = (field) => {
  if (editForm[field] !== '' && editForm[field] !== null) {
    editForm[field] = Number(editForm[field]).toFixed(2);
  }
};

// Format date
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// fetch firm details
const fetchFirmDetails = async () => {
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/firm_details/get_firm_details`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      }
    )

    if (response.status === 200 && response.data) {
      firm.value = {
        firm_name: response.data.firm_name || 'Unknown Firm',
        firm_address: response.data.firm_address || 'Unknown Address',
        page_size: response.data.page_size || 10
      }
    }
  } catch (err) {
    console.error('Failed to fetch firm details:', err)
    toast.error('Failed to fetch firm details')
  }
};

// Fetch sort analysis data
const fetchSorts = async () => {
  loading.value = true;
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/sorting_analysis/get_sorting_analysis`,
      {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      }
    );
    if (response.status === 200) {
      sorts.value = response.data;
    } else {
      toast.error('Unexpected response while fetching sort analysis');
    }
  } catch (error) {
    console.error('Error fetching sorts:', error.response?.status, error.response?.data);
    toast.error(error.response?.data?.message || 'Failed to load sort analysis list.');
  } finally {
    loading.value = false;
  }
};

// Fetch batches
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
    console.error('Error fetching batches:', error.response?.status, error.response?.data);
    toast.error(error.response?.data?.message || 'Failed to load batch list.');
  }
};

// Fetch clerks
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
    console.error('Error fetching clerks:', error.response?.status, error.response?.data);
    toast.error(error.response?.data?.message || 'Failed to load clerk list.');
  }
};

// Set logged-in user ID
const setUserLoginId = () => {
  const sessionUser = sessionStorage.getItem('user');
  if (sessionUser) {
    const user = JSON.parse(sessionUser);
    editForm.user_login_id = user.id;
  } else {
    toast.error('No user session found. Please log in.');
  }
};

// Open modal and load data
const openEditModal = (sort) => {
  if (!user || (user.role !== 'admin')) {
    toast.error('Only admin can edit sort analysis');
    return;
  }
  showEditModal.value = true;
  selectedSortId.value = sort.id;
  editForm.batch_name = sort.batch?.batch_name || '';
  editForm.analyzer_clerk_name = sort.analyzer_clerk?.clerk_name || '';
  editForm.sorted_rice_moisture_percent = sort.sorted_rice_moisture_percent ?? '';
  editForm.sorted_broken_percent = sort.sorted_broken_percent ?? '';
  editForm.sorted_discolor_percent = sort.sorted_discolor_percent ?? '';
  editForm.sorted_damaged_percent = sort.sorted_damaged_percent ?? '';
  editForm.rejection_rice_percent = sort.rejection_rice_percent ?? '';
  editForm.sorting_output_30sec = sort.sorting_output_30sec ?? '';
  editForm.rejection_output_30sec = sort.rejection_output_30sec ?? '';
  editForm.checker_clerk_name = sort.checker_clerk?.clerk_name || '';
  editForm.checking_date = sort.checking_date || '';
  editForm.checking_time = sort.checking_time || '';
  editForm.verifier_clerk_name = sort.verifier_clerk?.clerk_name || '';
  editForm.verifying_date = sort.verifying_date || '';
  editForm.verifying_time = sort.verifying_time || '';
  setUserLoginId();
};

// Update sort analysis
const updateSort = async () => {
  isSubmitting.value = true;
  try {
    const payload = {
      id: selectedSortId.value,
      batch_name: editForm.batch_name,
      analyzer_clerk_name: editForm.analyzer_clerk_name,
      sorted_rice_moisture_percent: Number(editForm.sorted_rice_moisture_percent) || null,
      sorted_broken_percent: Number(editForm.sorted_broken_percent) || null,
      sorted_discolor_percent: Number(editForm.sorted_discolor_percent) || null,
      sorted_damaged_percent: Number(editForm.sorted_damaged_percent) || null,
      rejection_rice_percent: Number(editForm.rejection_rice_percent) || null,
      sorting_output_30sec: Number(editForm.sorting_output_30sec) || null,
      rejection_output_30sec: Number(editForm.rejection_output_30sec) || null,
      checker_clerk_name: editForm.checker_clerk_name,
      checking_date: editForm.checking_date,
      checking_time: editForm.checking_time,
      verifier_clerk_name: editForm.verifier_clerk_name,
      verifying_date: editForm.verifying_date,
      verifying_time: editForm.verifying_time,
      user_login_id: editForm.user_login_id,
    };

    const response = await axios.put(
      `${config.apiBaseUrl}/api/${config.version}/sorting_analysis/update_sorting_analysis/${selectedSortId.value}`,
      payload,
      {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      }
    );

    if (response.status === 200 || response.status === 201) {
      toast.success('Sort analysis updated successfully!');
      resetForm();
      showEditModal.value = false;
      selectedSortId.value = null;
      fetchSorts();
    } else {
      toast.error('Unexpected response while updating sort analysis');
    }
  } catch (error) {
    console.error('Error updating sort analysis:', error.response?.status, error.response?.data);
    toast.error(error.response?.data?.message || 'Failed to update sort analysis.');
  } finally {
    isSubmitting.value = false;
  }
};

// Close modal
const closeEditModal = () => {
  showEditModal.value = false;
  selectedSortId.value = null;
  resetForm();
};

// Reset form
const resetForm = () => {
  editForm.batch_name = '';
  editForm.analyzer_clerk_name = '';
  editForm.sorted_rice_moisture_percent = '';
  editForm.sorted_broken_percent = '';
  editForm.sorted_discolor_percent = '';
  editForm.sorted_damaged_percent = '';
  editForm.rejection_rice_percent = '';
  editForm.sorting_output_30sec = '';
  editForm.rejection_output_30sec = '';
  editForm.checker_clerk_name = '';
  editForm.checking_date = '';
  editForm.checking_time = '';
  editForm.verifier_clerk_name = '';
  editForm.verifying_date = '';
  editForm.verifying_time = '';
  editForm.user_login_id = null;
  setUserLoginId();
};

// Clear filters
const clearFilters = () => {
  filters.batch_name = '';
  filters.analyzer_clerk_name = '';
  filters.checker_clerk_name = '';
  filters.verifier_clerk_name = '';
  currentPage.value = 1;
};

onMounted(() => {
  fetchSorts();
  fetchBatches();
  fetchClerks();
  fetchFirmDetails();
  setUserLoginId();
});
</script>

<style scoped>
/* Vuetify handles styles */
</style>
