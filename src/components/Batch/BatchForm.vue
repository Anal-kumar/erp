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

              <v-text-field v-model.number="form.pot_number" label="Pot Number (Nos)" placeholder="Enter pot number"
                type="number" variant="outlined" density="compact" class="mb-4" min="0" max="10" step="1"
                @input="limitPotNumber" required></v-text-field>

              <div class="d-flex justify-center gap-2">
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
              <template v-slot:item.sno="{ item }">
                {{ item.id }}
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
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import config from '@/config';
import { useToast } from 'vue-toastification';

const toast = useToast();
const isEditMode = ref(false);
const selectedBatchId = ref(null);
const isSubmitting = ref(false);
const isModuleEnabled = ref(false);

const form = reactive({
  batch_name: '',
  batch_date: '',
  pot_number: null,
  stock_item_name: '',
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
];

const setUserLoginId = () => {
  const sessionUser = sessionStorage.getItem('user');
  if (sessionUser) {
    const user = JSON.parse(sessionUser);
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
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/stock_items_details/get_stock_items`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      },
    );
    stockItems.value = response.data;
  } catch (error) {
    console.error('Error fetching stock items:', error);
    toast.error('Failed to fetch stock items.');
  }
};

const fetchBatches = async () => {
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/batches/get_all_batches`,
      {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      },
    );
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
    };
    const response = await axios.post(
      `${config.apiBaseUrl}/api/${config.version}/batches/create_batch`,
      payload,
      {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      },
    );
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

const updateBatch = async () => {
  if (!validateForm()) return;
  isSubmitting.value = true;
  try {
    const payload = {
      id: selectedBatchId.value,
      batch_name: form.batch_name,
      batch_date: form.batch_date,
      stock_item: form.stock_item_name, // Note: API might expect 'stock_item' or 'stock_item_name', checking original code it used 'stock_item' in update but 'stock_item_name' in add. Original code line 279: stock_item: form.stock_item. Wait, form has stock_item_name. Original code had a bug or inconsistency? Line 279 says form.stock_item but form definition has stock_item_name. Let's use stock_item_name and map it if needed.
      // Original code update payload: stock_item: form.stock_item. But form was reactive({ ... stock_item_name: '' }). So form.stock_item would be undefined unless set elsewhere.
      // Ah, editBatch function in original code (commented out) set form.stock_item.
      // But addBatch used stock_item_name.
      // I will assume the backend expects 'stock_item_name' or I should check if I can see the backend. I can't.
      // However, looking at the addBatch payload in original code: stock_item_name: form.stock_item_name.
      // Looking at updateBatch in original code: stock_item: form.stock_item.
      // This looks like a potential bug in the original code or a difference in API.
      // I'll stick to stock_item_name for now as it seems more consistent with the form model.
      // Actually, let's check the original code again.
      // Line 105: stock_item_name: '',
      // Line 235: stock_item_name: form.stock_item_name, (in addBatch)
      // Line 279: stock_item: form.stock_item, (in updateBatch)
      // And the editBatch function was commented out! So update might not have been working or fully implemented?
      // "const editBatch = (batch) => { ... }" is commented out.
      // So maybe update functionality wasn't fully active in this component?
      // But there is an updateBatch function.
      // I will use stock_item_name as it is what I have in the form.
      stock_item_name: form.stock_item_name,
      pot_number: Number(form.pot_number),
      user_login_id: form.user_login_id,
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

const cancelEdit = () => {
  isEditMode.value = false;
  selectedBatchId.value = null;
  resetForm();
};

const resetForm = () => {
  form.batch_name = '';
  form.batch_date = '';
  form.pot_number = null;
  form.stock_item_name = '';
  form.user_login_id = null;
  setUserLoginId();
};

onMounted(() => {
  setUserLoginId();
  fetchBatches();
  fetchModuleStatus();
  fetchStockItems();
});
</script>

<style scoped>
/* Vuetify handles most styles */
</style>
