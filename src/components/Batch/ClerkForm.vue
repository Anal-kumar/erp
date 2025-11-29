<template>
  <v-container fluid>
    <v-row>
      <!-- Form Section -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="rounded-lg">
          <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
            {{ isEditMode ? 'Update Clerk' : 'Add Clerk' }}
          </v-card-title>
          <v-card-text class="pa-4">
            <v-form @submit.prevent="isEditMode ? updateClerk() : addClerk()">
              <v-text-field v-model="form.clerk_name" label="Name" placeholder="Enter clerk name" variant="outlined"
                density="compact" class="mb-2" @input="form.clerk_name = $event.target.value.toUpperCase()" maxlength="30"
                required></v-text-field>

              <v-text-field v-model="form.clerk_mob_no" label="Mobile" placeholder="Enter mobile number"
                variant="outlined" density="compact" class="mb-2" maxlength="10"
                @input="form.clerk_mob_no = $event.target.value.replace(/\D/g, '')" required></v-text-field>

              <v-checkbox v-model="form.is_active" label="Active" color="primary" density="compact"
                hide-details></v-checkbox>

              <div class="d-flex justify-center gap-2 mt-4">
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
            Clerk List
          </v-card-title>
          <v-card-text>
            <v-data-table :headers="headers" :items="clerks" :items-per-page="firm.page_size || 10" density="compact"
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
                <v-icon color="primary" @click="editClerk(item)" class="cursor-pointer">mdi-pencil</v-icon>
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
const selectedClerkId = ref(null);
const isModuleEnabled = ref(false);
const isSubmitting = ref(false);

const form = reactive({
  clerk_name: '',
  clerk_mob_no: '',
  is_active: false,
  user_login_id: '',
});

const clerks = ref([]);
const firm = ref({ page_size: 10 });
const user = JSON.parse(sessionStorage.getItem('user')) || null;

const headers = [
  { title: 'SNO', key: 'sno', align: 'center', sortable: false },
  { title: 'NAME', key: 'clerk_name', align: 'center' },
  { title: 'MOBILE', key: 'clerk_mob_no', align: 'center' },
  { title: 'ACTIVE', key: 'is_active', align: 'center' },
  { title: 'ENTRY BY', key: 'user_login', align: 'center' },
  { title: 'ACTIONS', key: 'actions', align: 'center', sortable: false },
];

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

const validateForm = () => {
  if (!form.clerk_name.trim()) {
    toast.error('Clerk name is required.');
    return false;
  }
  if (!/^\d{10}$/.test(form.clerk_mob_no)) {
    toast.error('Mobile number must be 10 digits.');
    return false;
  }
  return true;
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

const fetchClerks = async () => {
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/clerks/clerks/`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      },
    );
    if (response.status === 200) {
      clerks.value = response.data;
    }
  } catch (error) {
    console.error('Error fetching clerks:', error);
    toast.error('Failed to load clerk list.');
  }
};

const addClerk = async () => {
  if (!isModuleEnabled.value) {
    toast.info('Please purchase the Batch module to add a clerk.');
    return;
  }
  if (!validateForm()) return;
  isSubmitting.value = true;
  try {
    const payload = {
      user_login_id: form.user_login_id,
      clerk_name: form.clerk_name,
      clerk_mob_no: form.clerk_mob_no,
      is_active: form.is_active,
    };
    const response = await axios.post(
      `${config.apiBaseUrl}/api/${config.version}/clerks/clerk/`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      },
    );
    if (response.status === 200 || response.status === 201) {
      toast.success('Clerk added successfully!');
      form.clerk_name = '';
      form.clerk_mob_no = '';
      form.is_active = false;
    }
    fetchClerks();
    fetchModuleStatus();
  } catch (error) {
    console.error('Error adding clerk:', error);
    toast.error(error.response?.data?.detail || 'Failed to save clerk.');
  } finally {
    isSubmitting.value = false;
  }
};

const editClerk = (clerk) => {
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    toast.error('Only admins can edit clerks.');
    return;
  }
  isEditMode.value = true;
  selectedClerkId.value = clerk.id;
  form.clerk_name = clerk.clerk_name;
  form.clerk_mob_no = clerk.clerk_mob_no;
  form.is_active = clerk.is_active;
};

const updateClerk = async () => {
  if (!validateForm()) return;
  isSubmitting.value = true;
  try {
    const payload = {
      id: selectedClerkId.value,
      user_login_id: form.user_login_id,
      clerk_name: form.clerk_name,
      clerk_mob_no: form.clerk_mob_no,
      is_active: form.is_active,
    };
    const response = await axios.put(
      `${config.apiBaseUrl}/api/${config.version}/clerks/clerk/${selectedClerkId.value}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      },
    );
    if (response.status === 200 || response.status === 201) {
      toast.success('Clerk updated successfully!');
      form.clerk_name = '';
      form.clerk_mob_no = '';
      form.is_active = false;
      isEditMode.value = false;
      selectedClerkId.value = null;
      fetchClerks();
    }
  } catch (error) {
    console.error('Error updating clerk:', error);
    toast.error(error.response?.data?.detail || 'Failed to update clerk.');
  } finally {
    isSubmitting.value = false;
  }
};

const cancelEdit = () => {
  isEditMode.value = false;
  selectedClerkId.value = null;
  form.clerk_name = '';
  form.clerk_mob_no = '';
  form.is_active = false;
};

onMounted(() => {
  const sessionUser = sessionStorage.getItem('user');
  if (sessionUser) {
    const userData = JSON.parse(sessionUser);
    form.user_login_id = userData.id;
  }
  fetchClerks();
  fetchModuleStatus();
  fetchFirmDetails();
});
</script>

<style scoped>
/* Vuetify handles most styles */
</style>
