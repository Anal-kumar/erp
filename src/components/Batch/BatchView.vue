<template>
  <v-container fluid>
    <v-card elevation="2" class="rounded-lg h-100">
      <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
        Batch Details
      </v-card-title>
      <v-card-text class="pa-4">
        <!-- Filters -->
        <v-row class="mb-4" justify="center">
          <v-col cols="12" md="3">
            <v-text-field v-model="filters.batch_name" label="Batch Name" placeholder="Filter by batch name"
              variant="outlined" density="compact" hide-details @input="debouncedResetPage"></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field v-model="filters.batch_date_from" label="From Date" type="date" variant="outlined"
              density="compact" hide-details @input="debouncedResetPage"></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field v-model="filters.batch_date_to" label="To Date" type="date" variant="outlined"
              density="compact" hide-details @input="debouncedResetPage"></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field v-model="filters.pot_number" label="Pot Number" placeholder="Filter by pot number"
              variant="outlined" density="compact" hide-details @input="debouncedResetPage"></v-text-field>
          </v-col>
          <v-col cols="12" md="2" class="d-flex align-center">
            <v-btn color="error" @click="clearFilters" block>Clear Filters</v-btn>
          </v-col>
        </v-row>

        <!-- Table -->
        <v-data-table :headers="headers" :items="filteredBatches" :items-per-page="firm.page_size || 10"
          :loading="isLoading" density="compact" class="elevation-1" hover>
          <template v-slot:item.sno="{ index }">
            {{ index + 1 }}
          </template>
          <template v-slot:item.batch_date="{ item }">
            {{ formatDate(item.batch_date) }}
          </template>
          <template v-slot:item.stock_item_name="{ item }">
            {{ item.stock_item_name || '-' }}
          </template>
          <template v-slot:item.pot_number="{ item }">
            {{ item.pot_number || '-' }}
          </template>
          <template v-slot:item.user_login="{ item }">
            {{ item.user_login || '-' }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon color="primary" @click="OpenEditModal(item)" class="cursor-pointer">mdi-pencil</v-icon>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Edit Modal -->
    <v-dialog v-model="showEditModal" max-width="600px">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
          Edit Batch Details
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form @submit.prevent="updateBatch">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="editForm.batch_name" label="Batch Name" placeholder="Enter batch name"
                  variant="outlined" density="compact" :error-messages="errors.batch_name" required
                  @input="editForm.batch_name = $event.target.value.toUpperCase()"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editForm.batch_date" label="Batch Date" type="date" variant="outlined"
                  density="compact" :error-messages="errors.batch_date" required></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="editForm.stock_item_name" :items="stockItems" item-title="stock_item_name"
                  item-value="stock_item_name" label="Stock Item" placeholder="Select Stock Item" variant="outlined"
                  density="compact" :error-messages="errors.stock_item_name" required></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editForm.pot_number" label="Pot Number" placeholder="Enter pot number"
                  variant="outlined" density="compact" :error-messages="errors.pot_number"></v-text-field>
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
const selectedBatchId = ref(null);
const showEditModal = ref(false);
const batches = ref([]);
const user = JSON.parse(sessionStorage.getItem('user') || '{}');
const isSubmitting = ref(false);
const isLoading = ref(false);
const firm = ref({ page_size: 10 });
const stockItems = ref([]);

const filters = reactive({
  batch_name: '',
  batch_date_from: '',
  batch_date_to: '',
  pot_number: '',
});

const editForm = reactive({
  batch_name: '',
  batch_date: '',
  pot_number: null,
  stock_item_name: '',
  user_login_id: null,
});

const errors = reactive({
  batch_name: '',
  batch_date: '',
  pot_number: '',
  stock_item_name: '',
});

const headers = [
  { title: 'S.No', key: 'sno', align: 'center', sortable: false },
  { title: 'Batch Name', key: 'batch_name', align: 'center' },
  { title: 'Batch Date', key: 'batch_date', align: 'center' },
  { title: 'Pot Number', key: 'pot_number', align: 'center' },
  { title: 'Stock Item', key: 'stock_item_name', align: 'center' },
  { title: 'Entry By', key: 'user_login', align: 'center' },
  { title: 'Actions', key: 'actions', align: 'center', sortable: false },
];

const debouncedResetPage = debounce(() => {
  currentPage.value = 1;
}, 300);

const filteredBatches = computed(() => {
  return batches.value.filter(batch => {
    const matchesBatchName = filters.batch_name
      ? batch.batch_name?.toLowerCase().includes(filters.batch_name.toLowerCase())
      : true;
    const matchesBatchDate = (filters.batch_date_from || filters.batch_date_to)
      ? (!filters.batch_date_from || (batch.batch_date && new Date(batch.batch_date) >= new Date(filters.batch_date_from))) &&
      (!filters.batch_date_to || (batch.batch_date && new Date(batch.batch_date) <= new Date(filters.batch_date_to)))
      : true;
    const matchesPotNumber = filters.pot_number
      ? batch.pot_number?.toString().toLowerCase().includes(filters.pot_number.toLowerCase())
      : true;
    return matchesBatchName && matchesBatchDate && matchesPotNumber;
  });
});

const formatDate = (date) => {
  if (!date || isNaN(new Date(date))) return '-';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const fetchStockItems = async () => {
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/stock_items_details/get_stock_items`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      },
    );
    if (Array.isArray(response.data)) {
      stockItems.value = response.data;
    } else {
      toast.error('Invalid stock items data received.');
    }
  } catch (error) {
    console.error('Error fetching stock items:', error);
    toast.error(error.response?.data?.message || error.message || 'Failed to fetch stock items.');
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

const fetchBatches = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/batches/get_all_batches`,
      {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      },
    );
    if (response.status === 200 && Array.isArray(response.data)) {
      batches.value = response.data;
    } else {
      toast.error('Invalid batch data received.');
    }
  } catch (error) {
    console.error('Error fetching batches:', error);
    toast.error(error.response?.data?.message || error.message || 'Failed to load batch list.');
  } finally {
    isLoading.value = false;
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
  errors.batch_name = !editForm.batch_name ? 'Batch name is required' : '';
  errors.batch_date = !editForm.batch_date ? 'Batch date is required' : '';
  errors.stock_item_name = !editForm.stock_item_name ? 'Stock item is required' : '';
  errors.pot_number = editForm.pot_number && isNaN(editForm.pot_number) ? 'Pot number must be a valid number' : '';
  return !Object.values(errors).some(error => error);
};

const OpenEditModal = (batch) => {
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    toast.error('Only admins can edit entries');
    return;
  }
  showEditModal.value = true;
  selectedBatchId.value = batch.id;
  editForm.batch_name = batch.batch_name || '';
  editForm.batch_date = batch.batch_date ? new Date(batch.batch_date).toISOString().split('T')[0] : '';
  editForm.pot_number = batch.pot_number ?? null;
  editForm.stock_item_name = batch.stock_item_name || '';
  setUserLoginId();
};

const updateBatch = async () => {
  if (!validateForm()) {
    toast.error('Please fill all required fields');
    return;
  }
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    toast.error('Only admins can edit entries');
    showEditModal.value = false;
    return;
  }
  isSubmitting.value = true;
  try {
    const payload = {
      id: selectedBatchId.value,
      batch_name: editForm.batch_name,
      batch_date: editForm.batch_date,
      pot_number: editForm.pot_number ? Number(editForm.pot_number) : null,
      stock_item_name: editForm.stock_item_name,
      user_login_id: editForm.user_login_id,
    };
    const response = await axios.put(
      `${config.apiBaseUrl}/api/${config.version}/batches/update_batch/${selectedBatchId.value}`,
      payload,
      {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      },
    );
    if (response.status === 200 || response.status === 201) {
      toast.success('Batch updated successfully!');
      resetForm();
      showEditModal.value = false;
      selectedBatchId.value = null;
      fetchBatches();
    }
  } catch (error) {
    console.error('Error updating batch:', error);
    toast.error(error.response?.data?.message || error.message || 'Failed to update batch.');
  } finally {
    isSubmitting.value = false;
  }
};

const closeEditModal = () => {
  showEditModal.value = false;
  selectedBatchId.value = null;
  resetForm();
};

const resetForm = () => {
  editForm.batch_name = '';
  editForm.batch_date = '';
  editForm.pot_number = null;
  editForm.stock_item_name = '';
  editForm.user_login_id = null;
  Object.keys(errors).forEach(key => (errors[key] = ''));
  setUserLoginId();
};

const clearFilters = () => {
  filters.batch_name = '';
  filters.batch_date_from = '';
  filters.batch_date_to = '';
  filters.pot_number = '';
  currentPage.value = 1;
};

onMounted(() => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    toast.error('No authentication token found. Please log in.');
    return;
  }
  fetchBatches();
  fetchFirmDetails();
  fetchStockItems();
  setUserLoginId();
});
</script>

<style scoped>
/* Vuetify handles most styles */
</style>