<template>
  <v-container fluid>
    <v-row>
      <!-- Form Section -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="rounded-lg">
          <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
            {{ isEditMode ? 'Update Batch' : 'Add Batch' }}
          </v-card-title>
          <v-card-text class="pa-4">
            <v-form @submit.prevent="isEditMode ? updateBatch() : addBatch()">
              <v-text-field v-model="form.batch_date" label="Batch Date" type="date" variant="outlined"
                density="compact" class="mb-2" required></v-text-field>

              <v-text-field v-model="form.batch_name" label="Batch Name" placeholder="Enter batch name"
                variant="outlined" density="compact" class="mb-2" maxlength="30"
                @input="form.batch_name = $event.target.value.toUpperCase()" required></v-text-field>

              <v-select v-model="form.stock_item_name" :items="stockItems" item-title="stock_item_name"
                item-value="stock_item_name" label="Stock Item" placeholder="Select Stock Item" variant="outlined"
                density="compact" class="mb-2" required></v-select>

              <v-radio-group v-model="selectedInputType" class="mb-2" inline>
                <v-radio label="Stock Quantity (Bags)" value="stock_quantity"></v-radio>
                <v-radio label="Stock Weight (Kg)" value="stock_weight"></v-radio>
              </v-radio-group>

              <v-text-field v-model.number="form.stock_quantity" label="Stock Quantity (Bags)"
                placeholder="Enter stock quantity (in bags)" type="number" variant="outlined" density="compact"
                class="mb-2" min="0" step="0.01" :disabled="selectedInputType !== 'stock_quantity'"
                :required="selectedInputType === 'stock_quantity'"></v-text-field>

              <v-text-field v-model.number="form.stock_weight" label="Stock Weight (Kg)"
                placeholder="Enter stock weight" type="number" variant="outlined" density="compact" class="mb-4" min="0"
                step="0.01" :disabled="selectedInputType !== 'stock_weight'"
                :required="selectedInputType === 'stock_weight'"></v-text-field>

              <v-text-field v-model.number="form.pot_number" label="Pot Number (Nos)" placeholder="Enter pot number"
                type="number" variant="outlined" density="compact" class="mb-4" min="0" max="10" step="1"
                @input="limitPotNumber" required></v-text-field>

              <div class="d-flex justify-center ga-2">
                <v-btn type="submit" color="primary" :loading="isSubmitting" :disabled="isSubmitting">
                  {{ isEditMode ? 'Update' : 'Add' }}
                </v-btn>
                <v-btn v-if="isEditMode" color="error" @click="cancelEdit">
                  Cancel
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Table Section -->
      <v-col cols="12" md="8">
        <v-card elevation="2" class="rounded-lg h-100">
          <v-card-title class="text-h5 font-weight-bold text-center py-4">
            Last Batch List
          </v-card-title>
          <v-card-text>
            <v-data-table :headers="headers" :items="batches" density="compact" class="elevation-1" hover>
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
                <v-btn icon size="small" color="primary" @click="editBatch(item)" :disabled="!isModuleEnabled">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { productionService, millService, getModuleStatus } from '@/services'
import storage from '@/utils/storage';

const toast = useToast();
const isEditMode = ref(false);
const selectedBatchId = ref(null);
const isSubmitting = ref(false);
const isModuleEnabled = ref(false);
const selectedInputType = ref('stock_quantity'); // Default to stock quantity

const form = reactive({
  batch_name: '',
  batch_date: '',
  pot_number: null,
  stock_item_name: '',
  stock_quantity: null, // Added for radio button functionality
  stock_weight: null,    // Added for radio button functionality
  user_login_id: null,
});

const batches = ref([]);
const stockItems = ref([]);

const headers = [
  { title: 'S.No', key: 'sno', align: 'center' },
  { title: 'Batch Name', key: 'batch_name', align: 'center' },
  { title: 'Batch Date', key: 'batch_date', align: 'center' },
  { title: 'Stock Item', key: 'stock_item_name', align: 'center' },
  { title: 'Pot Number', key: 'pot_number', align: 'center' },
  { title: 'Entry By', key: 'user_login', align: 'center' },
  { title: 'Actions', key: 'actions', align: 'center' }
];

const setUserLoginId = () => {
  const sessionUser = storage.getUser();
  if (sessionUser) {
    const user = sessionUser;
    form.user_login_id = user.id;
  }
};

const validateForm = () => {
  if (!form.batch_name.trim()) {
    toast.error('Batch name is required.');
    return false;
  }
  if (form.batch_name.length > 30) {
    toast.error('Batch name must not exceed 30 characters.');
    return false;
  }
  if (!form.batch_date) {
    toast.error('Batch date is required.');
    return false;
  }
  if (!form.stock_item_name) {
    toast.error('Stock item is required.');
    return false;
  }

  // Validate stock quantity/weight based on selected input type
  if (selectedInputType.value === 'stock_quantity') {
    if (form.stock_quantity === null || isNaN(form.stock_quantity) || form.stock_quantity <= 0) {
      toast.error('Stock Quantity (Bags) must be a positive number.');
      return false;
    }
  } else if (selectedInputType.value === 'stock_weight') {
    if (form.stock_weight === null || isNaN(form.stock_weight) || form.stock_weight <= 0) {
      toast.error('Stock Weight (Kg) must be a positive number.');
      return false;
    }
  }

  if (form.pot_number === null || isNaN(form.pot_number) || form.pot_number < 0) {
    toast.error('Pot number must be a valid positive integer.');
    return false;
  }
  if (!form.user_login_id) {
    toast.error('User ID is missing.');
    return false;
  }
  return true;
};

const limitPotNumber = (event) => {
  const value = event.target.value;
  if (value.length > 2) {
    form.pot_number = parseInt(value.slice(0, 2));
  }
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const fetchStockItems = async () => {
  try {
    const response = await millService.getStockItems();
    stockItems.value = response.data;
  } catch (error) {
    console.error('Error fetching stock items:', error);
    toast.error('Failed to fetch stock items.');
  }
};

const fetchBatches = async () => {
  try {
    const response = await productionService.getBatches();
    if (response.status === 200) {
      batches.value = response.data.slice(-10);
    }
  } catch (error) {
    console.error('Error fetching batches:', error.response?.status, error.response?.data);
    toast.error(error.response?.data?.message || 'Failed to load batch list.');
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

const addBatch = async () => {
  if (!isModuleEnabled.value) {
    toast.info('Please purchase the Batch module to add a batch.');
    return;
  }
  if (!validateForm()) return;
  isSubmitting.value = true;
  try {
    const payload = {
      batch_name: form.batch_name,
      batch_date: form.batch_date,
      stock_item_name: form.stock_item_name,
      pot_number: Number(form.pot_number),
      user_login_id: form.user_login_id,
      // Conditionally add stock_quantity or stock_weight
      ...(selectedInputType.value === 'stock_quantity' && { stock_quantity: Number(form.stock_quantity) }),
      ...(selectedInputType.value === 'stock_weight' && { stock_weight: Number(form.stock_weight) }),
    };
    const response = await productionService.createBatch(payload);
    if (response.status === 200 || response.status === 201) {
      toast.success('Batch added successfully!');
      resetForm();
    }
    fetchBatches();
  } catch (error) {
    console.error('Error adding batch:', error.response?.status, error.response?.data);
    toast.error(error.response?.data?.message || 'Failed to save batch.');
  } finally {
    isSubmitting.value = false;
  }
};

const editBatch = (item) => {
  if (!item || (!item.id && !item.batch_id)) {
    toast.error('Unable to edit: Invalid batch data');
    return;
  }

  isEditMode.value = true;
  selectedBatchId.value = item.id || item.batch_id;

  form.batch_name = item.batch_name;
  form.batch_date = item.batch_date ? new Date(item.batch_date).toISOString().split('T')[0] : '';
  form.stock_item_name = item.stock_item_name;
  form.pot_number = item.pot_number;
  form.stock_quantity = item.stock_quantity;
  form.stock_weight = item.stock_weight;

  // Set input type based on data
  if (item.stock_weight && item.stock_weight > 0) {
    selectedInputType.value = 'stock_weight';
  } else {
    selectedInputType.value = 'stock_quantity';
  }

  setUserLoginId();
};

const updateBatch = async () => {
  if (!validateForm()) return;
  isSubmitting.value = true;
  try {
    const payload = {
      id: selectedBatchId.value,
      batch_name: form.batch_name,
      batch_date: form.batch_date,
      stock_item_name: form.stock_item_name,
      pot_number: Number(form.pot_number),
      user_login_id: form.user_login_id,
      // Conditionally add stock_quantity or stock_weight
      ...(selectedInputType.value === 'stock_quantity' && { stock_quantity: Number(form.stock_quantity) }),
      ...(selectedInputType.value === 'stock_weight' && { stock_weight: Number(form.stock_weight) }),
    };
    const response = await productionService.updateBatch(selectedBatchId.value, payload);
    if (response.status === 200 || response.status === 201) {
      toast.success('Batch updated successfully!');
      resetForm();
      isEditMode.value = false;
      selectedBatchId.value = null;
      fetchBatches();
    }
  } catch (error) {
    console.error('Error updating batch:', error.response?.status, error.response?.data);
    toast.error(error.response?.data?.message || 'Failed to update batch.');
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  form.batch_name = '';
  form.batch_date = '';
  form.stock_item_name = '';
  form.pot_number = null;
  form.stock_quantity = null;
  form.stock_weight = null;
  form.user_login_id = null;
};

const cancelEdit = () => {
  isEditMode.value = false;
  selectedBatchId.value = null;
  resetForm();
};

onMounted(() => {
  setUserLoginId();
  fetchStockItems();
  fetchBatches();
  fetchModuleStatus();
});

</script>
