<template>
  <v-container fluid>
    <v-row>
      <!-- Form Section -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="rounded-lg">
          <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
            {{ isEditMode ? 'Update Batch Operator' : 'Add Batch Operator' }}
          </v-card-title>
          <v-card-text class="pa-4">
            <v-form @submit.prevent="isEditMode ? updateOperator() : addOperator()">
              <v-text-field v-model="form.operator_name" label="Name" placeholder="Enter operator name" variant="outlined"
                density="compact" class="mb-2" @input="form.operator_name = $event.target.value.toUpperCase()"
                required></v-text-field>

              <v-text-field v-model="form.operator_mob_no" label="Mobile" placeholder="Enter mobile number"
                variant="outlined" density="compact" class="mb-2" maxlength="10"
                @input="form.operator_mob_no = $event.target.value.replace(/\D/g, '')" required></v-text-field>

              <v-checkbox v-model="form.is_active" label="Active" color="primary" density="compact"
                hide-details></v-checkbox>

              <div class="d-flex justify-center gap-2 mt-4">
                <v-btn type="submit" color="primary">
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
            Batch Operator List
          </v-card-title>
          <v-card-text>
            <v-data-table :headers="headers" :items="operators" :items-per-page="firm.page_size || 10" density="compact"
              class="elevation-1" hover>
              <template v-slot:item.sno="{ index }">
                {{ index + 1 }}
              </template>
              <template v-slot:item.is_active="{ item }">
                <v-chip :color="item.is_active ? 'success' : 'error'" size="small">
                  {{ item.is_active ? 'Yes' : 'No' }}
                </v-chip>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-icon color="primary" @click="editOperator(item)" class="cursor-pointer">mdi-pencil</v-icon>
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
const selectedOperatorId = ref(null);
const isModuleEnabled = ref(false);
const operators = ref([]);
const firm = ref({ page_size: 10 });
const user = JSON.parse(sessionStorage.getItem('user')) || null;

const form = reactive({
  operator_name: '',
  operator_mob_no: '',
  is_active: false,
  user_login_id: '',
});

const headers = [
  { title: 'SNO', key: 'sno', align: 'center', sortable: false },
  { title: 'NAME', key: 'operator_name', align: 'center' },
  { title: 'MOBILE', key: 'operator_mob_no', align: 'center' },
  { title: 'ACTIVE', key: 'is_active', align: 'center' },
  { title: 'ENTRY BY', key: 'user_login', align: 'center' },
  { title: 'ACTIONS', key: 'actions', align: 'center', sortable: false },
];

const validateForm = () => {
  if (!form.operator_name.trim()) {
    toast.error('Operator name is required.');
    return false;
  }
  if (!/^\d{10}$/.test(form.operator_mob_no)) {
    toast.error('Mobile number must be 10 digits.');
    return false;
  }
  return true;
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
      toast.error('Failed to fetch firm details: Invalid response');
    }
  } catch (err) {
    console.error('Failed to fetch firm details:', err);
    toast.error('Failed to fetch firm details');
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

const fetchOperators = async () => {
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/batch_operators/get_operators`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      },
    );
    if (response.status === 200) {
      operators.value = response.data;
    }
  } catch (error) {
    console.error('Error fetching operators:', error);
    toast.error('Failed to load operator list.');
  }
};

const addOperator = async () => {
  if (!isModuleEnabled.value) {
    toast.info('Please purchase the Batch module to add a batch operator.');
    return;
  }
  if (!validateForm()) return;
  try {
    const payload = {
      user_login_id: form.user_login_id,
      operator_name: form.operator_name,
      operator_mob_no: form.operator_mob_no,
      is_active: form.is_active,
    };
    const response = await axios.post(
      `${config.apiBaseUrl}/api/${config.version}/batch_operators/create_operator`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      },
    );
    if (response.status === 200 || response.status === 201) {
      toast.success('Operator added successfully!');
      form.operator_name = '';
      form.operator_mob_no = '';
      form.is_active = false;
    }
    fetchOperators();
    fetchModuleStatus();
  } catch (error) {
    console.error('Error adding operator:', error);
    toast.error(error.response?.data?.detail || 'Failed to save operator.');
  }
};

const editOperator = (operator) => {
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    toast.error('Only admins can edit batch operators.');
    return;
  }
  isEditMode.value = true;
  selectedOperatorId.value = operator.id;
  form.operator_name = operator.operator_name;
  form.operator_mob_no = operator.operator_mob_no;
  form.is_active = operator.is_active;
};

const updateOperator = async () => {
  if (!validateForm()) return;
  try {
    const payload = {
      id: selectedOperatorId.value,
      user_login_id: form.user_login_id,
      operator_name: form.operator_name,
      operator_mob_no: form.operator_mob_no,
      is_active: form.is_active,
    };
    const response = await axios.put(
      `${config.apiBaseUrl}/api/${config.version}/batch_operators/update_operator/${selectedOperatorId.value}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      },
    );
    if (response.status === 200 || response.status === 201) {
      toast.success('Operator updated successfully!');
      form.operator_name = '';
      form.operator_mob_no = '';
      form.is_active = false;
      isEditMode.value = false;
      selectedOperatorId.value = null;
      fetchOperators();
    }
  } catch (error) {
    console.error('Error updating operator:', error);
    toast.error(error.response?.data?.detail || 'Failed to update operator.');
  }
};

const cancelEdit = () => {
  isEditMode.value = false;
  selectedOperatorId.value = null;
  form.operator_name = '';
  form.operator_mob_no = '';
  form.is_active = false; // Reset to default
};

onMounted(() => {
  const sessionUser = sessionStorage.getItem('user');
  if (sessionUser) {
    const userData = JSON.parse(sessionUser);
    form.user_login_id = userData.id;
  }
  fetchOperators();
  fetchModuleStatus();
  fetchFirmDetails();
});
</script>

<style scoped>
/* Vuetify handles most styles */
</style>
