<template>
  <v-container fluid>
    <v-card elevation="2" class="rounded-lg">
      <v-card-title class="text-h5 font-weight-bold text-center py-4">
        View Milling Analysis
      </v-card-title>
      <v-card-text>
        <!-- Filter Inputs -->
        <v-row dense class="mb-4 align-center justify-center">
          <v-col cols="12" sm="6" md="4">
            <v-text-field v-model="filters.batch_name" label="Batch Name" placeholder="Filter by batch name"
              variant="outlined" density="compact" hide-details @input="currentPage = 1"></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-text-field v-model="filters.analyzer_clerk_name" label="Analyzer Employee"
              placeholder="Filter by clerk name" variant="outlined" density="compact" hide-details
              @input="currentPage = 1"></v-text-field>
          </v-col>
          <v-col cols="12" sm="auto">
            <v-btn color="error" @click="clearFilters">
              Clear Filters
            </v-btn>
          </v-col>
        </v-row>

        <!-- Table -->
        <v-data-table :headers="headers" :items="filteredMillings" :items-per-page="firm.page_size || 10"
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
          Edit Milling Analysis
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form @submit.prevent="updateMilling">
            <v-row>
              <!-- Batch name -->
              <v-col cols="12" md="6">
                <v-select v-model="editForm.batch_name" :items="batches" item-title="batch_name" item-value="batch_name"
                  label="Batch Name" placeholder="Select a Batch" variant="outlined" density="compact"
                  :error-messages="errors.batch_name" required></v-select>
              </v-col>

              <!-- Analyzer Clerk -->
              <v-col cols="12" md="6">
                <v-select v-model="editForm.analyzer_clerk_name" :items="clerks" item-title="clerk_name"
                  item-value="clerk_name" label="Analyzer Employee" placeholder="Select a Clerk" variant="outlined"
                  density="compact" :error-messages="errors.analyzer_clerk_name" required></v-select>
              </v-col>

              <!-- Rice moisture -->
              <v-col cols="12" md="6">
                <v-text-field v-model.number="editForm.milling_rice_moisture_percent" label="Rice Moisture %"
                  type="number" step="0.01" min="0" max="100" variant="outlined" density="compact"
                  :error-messages="errors.milling_rice_moisture_percent"
                  @blur="formatNumber('milling_rice_moisture_percent')"></v-text-field>
              </v-col>

              <!-- Broken percent -->
              <v-col cols="12" md="6">
                <v-text-field v-model.number="editForm.milling_broken_percent" label="Broken %" type="number"
                  step="0.01" min="0" max="100" variant="outlined" density="compact"
                  :error-messages="errors.milling_broken_percent"
                  @blur="formatNumber('milling_broken_percent')"></v-text-field>
              </v-col>

              <!-- Discolor percent -->
              <v-col cols="12" md="6">
                <v-text-field v-model.number="editForm.milling_discolor_percent" label="Discolor %" type="number"
                  step="0.01" min="0" max="100" variant="outlined" density="compact"
                  :error-messages="errors.milling_discolor_percent"
                  @blur="formatNumber('milling_discolor_percent')"></v-text-field>
              </v-col>

              <!-- Damaged -->
              <v-col cols="12" md="6">
                <v-text-field v-model.number="editForm.milling_damaged_percent" label="Damaged %" type="number"
                  step="0.01" min="0" max="100" variant="outlined" density="compact"
                  :error-messages="errors.milling_damaged_percent"
                  @blur="formatNumber('milling_damaged_percent')"></v-text-field>
              </v-col>

              <!-- Output Porridge -->
              <v-col cols="12" md="6">
                <v-text-field v-model.number="editForm.milling_output_porridge_30sec" label="Output Porridge (30s) %"
                  type="number" step="0.01" min="0" max="100" variant="outlined" density="compact"
                  :error-messages="errors.milling_output_porridge_30sec"
                  @blur="formatNumber('milling_output_porridge_30sec')"></v-text-field>
              </v-col>

              <!-- Output final polisher -->
              <v-col cols="12" md="6">
                <v-text-field v-model.number="editForm.milling_output_final_polisher_30sec"
                  label="Output Final Polisher (30s) %" type="number" step="0.01" min="0" max="100" variant="outlined"
                  density="compact" :error-messages="errors.milling_output_final_polisher_30sec"
                  @blur="formatNumber('milling_output_final_polisher_30sec')"></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-center pb-4">
          <v-btn color="primary" variant="elevated" @click="updateMilling" :loading="isSubmitting"
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
const selectedMillingId = ref(null);
const showEditModal = ref(false);
const millings = ref([]);
const batches = ref([]);
const clerks = ref([]);
const isSubmitting = ref(false);
const loading = ref(false);
const firm = ref({ page_size: 10 });
const user = JSON.parse(sessionStorage.getItem('user')) || null;

// Filter inputs
const filters = reactive({
  batch_name: '',
  analyzer_clerk_name: '',
});

// Edit form
const editForm = reactive({
  batch_name: '',
  analyzer_clerk_name: '',
  milling_rice_moisture_percent: '',
  milling_broken_percent: '',
  milling_discolor_percent: '',
  milling_damaged_percent: '',
  milling_output_porridge_30sec: '',
  milling_output_final_polisher_30sec: '',
  user_login_id: null,
});

// Errors
const errors = reactive({});

const headers = [
  { title: 'S.No', key: 'sno', align: 'center', sortable: false },
  { title: 'Batch Name', key: 'batch_name', align: 'center' },
  { title: 'Analyzer Employee', key: 'analyzer_clerk_name', align: 'center' },
  { title: 'Rice Moisture %', key: 'milling_rice_moisture_percent', align: 'center' },
  { title: 'Broken %', key: 'milling_broken_percent', align: 'center' },
  { title: 'Discolor %', key: 'milling_discolor_percent', align: 'center' },
  { title: 'Damaged %', key: 'milling_damaged_percent', align: 'center' },
  { title: 'Output Porridge (30s)', key: 'milling_output_porridge_30sec', align: 'center' },
  { title: 'Output Final Polisher (30s)', key: 'milling_output_final_polisher_30sec', align: 'center' },
  { title: 'Entry By', key: 'user_login', align: 'center' },
  { title: 'Actions', key: 'actions', align: 'center', sortable: false },
];

// Filter millings based on multiple criteria
const filteredMillings = computed(() => {
  return millings.value.filter(milling => {
    const matchesBatchName = filters.batch_name
      ? milling.batch?.batch_name?.toLowerCase().includes(filters.batch_name.toLowerCase())
      : true;

    const matchesAnalyzerClerk = filters.analyzer_clerk_name
      ? milling.analyzer_clerk?.clerk_name?.toLowerCase().includes(filters.analyzer_clerk_name.toLowerCase())
      : true;

    return matchesBatchName && matchesAnalyzerClerk;
  });
});

const formatNumber = (field) => {
  if (editForm[field] !== '' && editForm[field] !== null) {
    editForm[field] = Number(editForm[field]).toFixed(2);
  }
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

// Fetch millings
const fetchMillings = async () => {
  loading.value = true;
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/milling_analysis/get_milling_analysis`,
      {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      }
    );
    if (response.status === 200) {
      millings.value = response.data;
    } else {
      toast.error('Unexpected response while fetching milling analysis');
    }
  } catch (error) {
    console.error('Error fetching millings:', error.response?.status, error.response?.data);
    toast.error(error.response?.data?.message || 'Failed to load milling analysis list.');
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
      clerks.value = response.data.filter(clerk => clerk.is_active);
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
const openEditModal = (milling) => {
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    toast.error('Only admins can edit milling analysis.');
    return;
  }
  showEditModal.value = true;
  selectedMillingId.value = milling.id;
  editForm.batch_name = milling.batch?.batch_name || '';
  editForm.analyzer_clerk_name = milling.analyzer_clerk?.clerk_name || '';
  editForm.milling_rice_moisture_percent = milling.milling_rice_moisture_percent ?? '';
  editForm.milling_broken_percent = milling.milling_broken_percent ?? '';
  editForm.milling_discolor_percent = milling.milling_discolor_percent ?? '';
  editForm.milling_damaged_percent = milling.milling_damaged_percent ?? '';
  editForm.milling_output_porridge_30sec = milling.milling_output_porridge_30sec ?? '';
  editForm.milling_output_final_polisher_30sec = milling.milling_output_final_polisher_30sec ?? '';
  setUserLoginId();
};

// Update milling
const updateMilling = async () => {
  isSubmitting.value = true;
  try {
    const payload = {
      id: selectedMillingId.value,
      batch_name: editForm.batch_name,
      analyzer_clerk_name: editForm.analyzer_clerk_name,
      milling_rice_moisture_percent: Number(editForm.milling_rice_moisture_percent) || null,
      milling_broken_percent: Number(editForm.milling_broken_percent) || null,
      milling_discolor_percent: Number(editForm.milling_discolor_percent) || null,
      milling_damaged_percent: Number(editForm.milling_damaged_percent) || null,
      milling_output_porridge_30sec: Number(editForm.milling_output_porridge_30sec) || null,
      milling_output_final_polisher_30sec: Number(editForm.milling_output_final_polisher_30sec) || null,
      user_login_id: editForm.user_login_id,
    };

    const response = await axios.put(
      `${config.apiBaseUrl}/api/${config.version}/milling_analysis/update_milling_analysis/${selectedMillingId.value}`,
      payload,
      {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      }
    );

    if (response.status === 200 || response.status === 201) {
      toast.success('Milling analysis updated successfully!');
      resetForm();
      showEditModal.value = false;
      selectedMillingId.value = null;
      fetchMillings();
    } else {
      toast.error('Unexpected response while updating milling analysis');
    }
  } catch (error) {
    console.error('Error updating milling:', error.response?.status, error.response?.data);
    toast.error(error.response?.data?.message || 'Failed to update milling analysis.');
  } finally {
    isSubmitting.value = false;
  }
};

// Close modal
const closeEditModal = () => {
  showEditModal.value = false;
  selectedMillingId.value = null;
  resetForm();
};

// Reset form
const resetForm = () => {
  editForm.batch_name = '';
  editForm.analyzer_clerk_name = '';
  editForm.milling_rice_moisture_percent = '';
  editForm.milling_broken_percent = '';
  editForm.milling_discolor_percent = '';
  editForm.milling_damaged_percent = '';
  editForm.milling_output_porridge_30sec = '';
  editForm.milling_output_final_polisher_30sec = '';
  editForm.user_login_id = null;
  setUserLoginId();
};

// Clear filters
const clearFilters = () => {
  filters.batch_name = '';
  filters.analyzer_clerk_name = '';
  currentPage.value = 1;
};

onMounted(() => {
  fetchMillings();
  fetchBatches();
  fetchClerks();
  fetchFirmDetails();
  setUserLoginId();
});
</script>

<style scoped>
/* Vuetify handles styles */
</style>