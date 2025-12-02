<template>
  <v-container fluid>
    <v-row>
      <!-- Form Section -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="rounded-lg">
          <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
            {{ isEditMode ? 'Update Drainage Form' : 'Drainage Form' }}
          </v-card-title>
          <v-card-text class="pa-4">
            <v-form @submit.prevent="isEditMode ? UpdateForm() : submitForm()">
              <h3 class="text-subtitle-1 font-weight-bold mb-2">Drainage Details</h3>
              <v-divider class="mb-4"></v-divider>

              <v-select v-model="form.batch_name" :items="batches" item-title="batch_name" item-value="batch_name"
                label="Batch Name" placeholder="Select a Batch" variant="outlined" density="compact"
                :error-messages="errors.batch_name" required></v-select>

              <v-text-field v-model="form.drainage_date" label="Drainage Date" type="date" variant="outlined"
                density="compact" :error-messages="errors.drainage_date" required></v-text-field>

              <v-text-field v-model="form.drainage_time" label="Drainage Time" type="time" variant="outlined"
                density="compact" :error-messages="errors.drainage_time" required></v-text-field>

              <v-select v-model="form.first_batch_operator" :items="operators" item-title="operator_name"
                item-value="operator_name" label="First Batch Operator" placeholder="Select an Operator"
                variant="outlined" density="compact" :error-messages="errors.first_batch_operator" required></v-select>

              <v-select v-model="form.second_batch_operator" :items="operators" item-title="operator_name"
                item-value="operator_name" label="Second Batch Operator" placeholder="Select an Operator"
                variant="outlined" density="compact" :error-messages="errors.second_batch_operator" required></v-select>

              <div class="d-flex justify-center ga-2 mt-4">
                <v-btn type="submit" color="primary" :loading="isSubmitting" :disabled="isSubmitting">
                  {{ isEditMode ? 'Update' : 'Submit' }}
                </v-btn>
                <v-btn v-if="isEditMode" color="error" @click="cancelEdit" :disabled="isSubmitting">
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
            Drainage Records
          </v-card-title>
          <v-card-text>
            <v-data-table :headers="headers" :items="drainages" :items-per-page="firm.page_size || 10" density="compact"
              class="elevation-1" hover>
              <template v-slot:item.sno="{ index }">
                {{ index + 1 }}
              </template>
              <template v-slot:item.drainage_date="{ item }">
                {{ formatDate(item.drainage_date) }}
              </template>
              <template v-slot:item.drainage_time="{ item }">
                {{ formatTime(item.drainage_time) }}
              </template>
              <template v-slot:item.first_batch_operator="{ item }">
                {{ item.first_batch_operator?.operator_name || '-' }}
              </template>
              <template v-slot:item.second_batch_operator="{ item }">
                {{ item.second_batch_operator?.operator_name || '-' }}
              </template>
              <template v-slot:item.batch_name="{ item }">
                {{ item.batch?.batch_name || '-' }}
              </template>
              <template v-slot:item.user_login="{ item }">
                {{ item.user_login || '-' }}
              </template>
              <template v-slot:item.actions="{ item }">
                <v-icon color="primary" @click="editDrainage(item)" class="cursor-pointer">mdi-pencil</v-icon>
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
import { productionService, firmDetailsService, getModuleStatus } from '@/services';
import { useToast } from 'vue-toastification';
import storage from '@/utils/storage';

const toast = useToast();
const isEditMode = ref(false);
const selectedDrainageId = ref(null);
const isModuleEnabled = ref(false);
const isSubmitting = ref(false);

const form = reactive({
  batch_name: '',
  drainage_date: '',
  drainage_time: '',
  first_batch_operator: '',
  second_batch_operator: '',
  user_login_id: '',
});

const errors = reactive({});
const batches = ref([]);
const operators = ref([]);
const drainages = ref([]);
const firm = ref({ page_size: 10 });
const user = storage.getUser() || null;

const headers = [
  { title: 'SNO', key: 'sno', align: 'center', sortable: false },
  { title: 'Batch Name', key: 'batch_name', align: 'center' },
  { title: 'Drainage Date', key: 'drainage_date', align: 'center' },
  { title: 'Drainage Time', key: 'drainage_time', align: 'center' },
  { title: 'First Operator', key: 'first_batch_operator', align: 'center' },
  { title: 'Second Operator', key: 'second_batch_operator', align: 'center' },
  { title: 'Entry By', key: 'user_login', align: 'center' },
  { title: 'Actions', key: 'actions', align: 'center', sortable: false },
];

const formatDate = (date) => {
  if (!date || isNaN(new Date(date).getTime())) return '';
  return new Date(date).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const formatTime = (time) => {
  if (!time) return '';
  try {
    const date = new Date(`2025-01-01T${time}`);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return time;
  }
};

const fetchFirmDetails = async () => {
  try {
    const response = await firmDetailsService.getFirmDetails();

    if (response.status === 200 && response.data) {
      firm.value = {
        firm_name: response.data.firm_name || 'Unknown Firm',
        firm_address: response.data.firm_address || 'Unknown Address',
        page_size: response.data.page_size || 10,
      };
    } else {
      toast.error('Failed to fetch firm details: Invalid response');
    }
  } catch (err) {
    console.error('Failed to fetch firm details:', err);
    toast.error('Failed to fetch firm details');
  }
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
    toast.error('Failed to fetch module status.');
  }
};

const fetchOperators = async () => {
  try {
    const response = await productionService.getBatchOperators();
    if (response.status === 200) {
      operators.value = response.data.filter((operator) => operator.is_active === true);
    } else {
      toast.error('Unexpected response while fetching operators.');
    }
  } catch (error) {
    console.error('Error fetching operators:', error);
    toast.error('Failed to load operator list.');
  }
};

const fetchBatches = async () => {
  try {
    const response = await productionService.getBatches();
    if (response.status === 200) {
      batches.value = response.data;
    } else {
      toast.error('Unexpected response while fetching batches.');
    }
  } catch (error) {
    console.error('Error fetching batches:', error);
    toast.error('Failed to load batch list.');
  }
};

const fetchDrainages = async () => {
  try {
    const response = await productionService.getDrainageDetails();
    if (response.status === 200) {
      drainages.value = response.data;
    } else {
      toast.error('Unexpected response while fetching drainages.');
    }
  } catch (error) {
    console.error('Error fetching drainages:', error);
    toast.error('Failed to load drainage list.');
  }
};

const validateForm = () => {
  let isValid = true;
  Object.keys(errors).forEach((key) => delete errors[key]);

  if (!form.batch_name) {
    errors.batch_name = 'Select a batch';
    isValid = false;
  }
  if (!form.drainage_date) {
    errors.drainage_date = 'Drainage date is required.';
    isValid = false;
  }
  if (!form.drainage_time) {
    errors.drainage_time = 'Drainage time is required.';
    isValid = false;
  }
  if (!form.first_batch_operator) {
    errors.first_batch_operator = 'First Batch Operator is required';
    isValid = false;
  }
  if (!form.second_batch_operator) {
    errors.second_batch_operator = 'Second Batch Operator is required.';
    isValid = false;
  }
  return isValid;
};

const submitForm = async () => {
  if (!isModuleEnabled.value) {
    toast.info('Please purchase the batch module to add a drainage.');
    return;
  }
  if (!validateForm()) return;
  isSubmitting.value = true;
  try {
    const payload = {
      batch_name: form.batch_name,
      drainage_date: form.drainage_date,
      drainage_time: form.drainage_time,
      first_batch_operator: form.first_batch_operator,
      second_batch_operator: form.second_batch_operator,
      user_login_id: form.user_login_id,
    };
    const response = await productionService.createDrainage(payload);
    if (response.status === 200) {
      toast.success('Form submitted successfully!');
      Object.assign(form, {
        batch_name: '',
        drainage_date: '',
        drainage_time: '',
        first_batch_operator: '',
        second_batch_operator: '',
      });
      fetchDrainages();
      fetchModuleStatus();
    } else {
      toast.error('Unexpected response while submitting form.');
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    toast.error(error.response?.data?.message || 'Failed to submit form.');
  } finally {
    isSubmitting.value = false;
  }
};

const editDrainage = (drainage) => {
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    toast.error('Only admins can edit drainage records.');
    return;
  }
  isEditMode.value = true;
  selectedDrainageId.value = drainage.id;
  form.batch_name = drainage.batch.batch_name;
  form.drainage_date = drainage.drainage_date;
  form.drainage_time = drainage.drainage_time;
  form.first_batch_operator = drainage.first_batch_operator.operator_name;
  form.second_batch_operator = drainage.second_batch_operator.operator_name;
  form.user_login_id = drainage.user_login_id || form.user_login_id;
};

const UpdateForm = async () => {
  if (!validateForm()) return;
  isSubmitting.value = true;
  try {
    const payload = {
      id: selectedDrainageId.value,
      batch_name: form.batch_name,
      drainage_date: form.drainage_date,
      drainage_time: form.drainage_time,
      first_batch_operator: form.first_batch_operator,
      second_batch_operator: form.second_batch_operator,
      user_login_id: form.user_login_id,
    };
    const response = await productionService.updateDrainage(selectedDrainageId.value, payload);
    if (response.status === 200) {
      toast.success('Drainage updated successfully!');
      fetchDrainages();
      cancelEdit();
    } else {
      toast.error('Unexpected response while updating drainage.');
    }
  } catch (error) {
    console.error('Error updating drainage:', error);
    toast.error(error.response?.data?.message || 'Failed to update drainage.');
  } finally {
    isSubmitting.value = false;
  }
};

const cancelEdit = () => {
  isEditMode.value = false;
  selectedDrainageId.value = null;
  Object.assign(form, {
    batch_name: '',
    drainage_date: '',
    drainage_time: '',
    first_batch_operator: '',
    second_batch_operator: '',
  });
};

onMounted(() => {
  fetchOperators();
  fetchBatches();
  fetchDrainages();
  fetchModuleStatus();
  fetchFirmDetails();
  if (user) {
    form.user_login_id = user.id;
  } else {
    toast.error('No user session found. Please log in.');
  }
});
</script>

<style scoped>
/* Vuetify handles styles */
</style>
