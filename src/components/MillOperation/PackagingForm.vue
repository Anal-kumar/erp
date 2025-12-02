<template>
  <v-container fluid>
    <v-row>
      <!-- Form Section -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="rounded-lg">
          <v-card-title class="text-h6 font-weight-bold text-center py-4 bg-primary text-white">
            {{ isEditMode ? 'Update Package' : 'Add Package' }}
          </v-card-title>

          <v-card-text class="pt-6">
            <v-form ref="formRef" @submit.prevent="isEditMode ? updatePackaging() : addPackaging()">
              <v-text-field v-model="form.packaging_name" label="Packaging Name" placeholder="Enter a packaging name"
                variant="outlined" density="comfortable" :rules="[v => !!v || 'Packaging name is required']"
                @input="form.packaging_name = $event.target.value.toUpperCase()" class="mb-2"></v-text-field>

              <v-text-field v-model="form.weight_bags" label="Weight Per BAG" placeholder="Enter weight" type="number"
                variant="outlined" density="comfortable" min="0" step="0.01"
                :rules="[v => v >= 0 || 'Weight must be non-negative']" class="mb-2"></v-text-field>

              <v-select v-model="form.packaging_unit"
                :items="[{ title: 'GRAMS', value: 'GRAM' }, { title: 'KG', value: 'KG' }]" label="Units"
                placeholder="Select a unit" variant="outlined" density="comfortable"
                :rules="[v => !!v || 'Unit is required']" class="mb-2"></v-select>

              <v-textarea v-model="form.remarks" label="Remarks" rows="3" variant="outlined" density="comfortable"
                :rules="[v => !!v || 'Remarks is required']" @input="form.remarks = $event.target.value.toUpperCase()"
                class="mb-2"></v-textarea>

              <div class="d-flex justify-center ga-4 mt-4">
                <v-btn type="submit" color="primary" :disabled="!isModuleEnabled" width="120">
                  {{ isEditMode ? 'Update' : 'Add' }}
                </v-btn>
                <v-btn v-if="isEditMode" color="error" variant="outlined" @click="cancelEdit" width="120">
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
          <v-card-title class="d-flex align-center justify-space-between py-4 px-6 bg-grey-lighten-4 border-b">
            <span class="text-h6 font-weight-bold text-grey-darken-3">Packaging List</span>
          </v-card-title>

          <v-card-text class="pa-4">
            <v-data-table :headers="headers" :items="packagingDetails" :items-per-page="firm.page_size || 10"
              class="elevation-1 border rounded" hover>
              <template v-slot:item.sno="{ index }">
                {{ index + 1 }}
              </template>

              <template v-slot:item.weight_bags="{ item }">
                {{ getBagWeights(item) }}
              </template>

              <template v-slot:item.packaging_unit="{ item }">
                {{ item.packaging_unit === 'GRAM' ? 'GRAMS' : 'KG' }}
              </template>

              <template v-slot:item.actions="{ item }">
                <v-btn icon="mdi-pencil" size="small" color="primary" variant="text"
                  @click="editPackaging(item)"></v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { millService, moduleService, adminService } from '@/services';
import { useToast } from 'vue-toastification';

const toast = useToast();
const isEditMode = ref(false);
const selectedPackagingId = ref(null);
const isModuleEnabled = ref(true)
const user = JSON.parse(sessionStorage.getItem('user')) || null;
const formRef = ref(null);

const form = reactive({
  packaging_name: '',
  weight_bags: '',
  packaging_unit: '',
  remarks: '',
  user_login_id: '',
});

const packagingDetails = ref([]);
const firm = ref({ page_size: 10 })

const headers = [
  { title: 'SNO', key: 'sno', align: 'center', sortable: false },
  { title: 'NAME', key: 'packaging_name', align: 'start' },
  { title: 'BAG WEIGHT', key: 'weight_bags', align: 'center' },
  { title: 'UNIT', key: 'packaging_unit', align: 'center' },
  { title: 'REMARKS', key: 'remarks', align: 'start' },
  { title: 'ENTRY BY', key: 'user_login', align: 'center' },
  { title: 'ACTIONS', key: 'actions', align: 'center', sortable: false },
]

// Bags weight 
const bagWeights = computed(() => {
  //  we convert kg to grams for API consistency
  return form.packaging_unit === 'GRAM' ? Number(form.weight_bags) : Number(form.weight_bags) * 1000;
});

const getBagWeights = (pkg) => {
  // Convert back to kg for display if needed
  return pkg.packaging_unit === 'GRAM' ? Number(pkg.weight_bags) : Number(pkg.weight_bags / 1000);
};

// fetch firm details
const fetchFirmDetails = async () => {
  try {
    const response = await adminService.getFirmDetails()

    if (response.status === 200 && response.data) {
      firm.value = {
        page_size: response.data.page_size || 10
      }
    }
  } catch (err) {
    console.error('Failed to fetch firm details:', err)
  }
};

const fetchModuleStatus = async () => {
  try {
    const response = await moduleService.getModules()
    const modules = response.data
    const millOperationsModule = modules.find((m) => m.module_name === 'mill_operations')
    if (!millOperationsModule) {
      isModuleEnabled.value = false
      toast.error('Mill Operations module not found. Contact support.')
      return
    }
    isModuleEnabled.value = millOperationsModule.module_enabled
  } catch (error) {
    console.error('Failed to fetch module status:', error)
    isModuleEnabled.value = false
    toast.error('Failed to fetch module status.')
  }
}

const fetchPackagingDetails = async () => {
  try {
    const response = await millService.getPackagings()
    if (response.status === 200) {
      packagingDetails.value = response.data.map(item => ({
        ...item,
        weight_bags: item.bag_weight, // Map bag_weight to weight_bags
        packaging_unit: item.packaging_unit || 'GRAM', // Default to GRAM if not present
      })) || [];
    }
  } catch (error) {
    console.error('Error fetching packaging details:', error);
  }
};

const addPackaging = async () => {
  if (!isModuleEnabled.value) {
    toast.info('Please purchase the Mill Operations module to add a packaging.')
    return
  }

  const { valid } = await formRef.value.validate()
  if (!valid) return;

  try {
    const payload = {
      user_login_id: form.user_login_id,
      packaging_name: form.packaging_name,
      bag_weight: bagWeights.value, // Use bag_weight for API
      packaging_unit: form.packaging_unit,
      remarks: form.remarks,
    };
    const response = await millService.addPackaging(payload)
    if (response.status === 200 || response.status === 201) {
      toast.success('Packaging Added Successfully!');
      resetForm()
      fetchPackagingDetails();
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    toast.error(error.response?.data?.detail || 'Failed to save entry.');
  }
};

const editPackaging = (packaging) => {
  if (!user || user.role !== 'admin') {
    toast.error('Only admins can edit packaging details.');
    return;
  }
  isEditMode.value = true;
  selectedPackagingId.value = packaging.id;
  form.packaging_name = packaging.packaging_name;
  form.packaging_unit = packaging.packaging_unit;
  form.weight_bags = form.packaging_unit === 'GRAM' ? packaging.weight_bags : (packaging.weight_bags / 1000);
  form.remarks = packaging.remarks;
};

const updatePackaging = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return;

  try {
    const bagWeightInGrams = form.packaging_unit === 'GRAM' ? Number(form.weight_bags) : Number(form.weight_bags) * 1000;
    const payload = {
      id: selectedPackagingId.value,
      user_login_id: form.user_login_id,
      packaging_name: form.packaging_name,
      bag_weight: bagWeightInGrams, // Use bag_weight for API
      packaging_unit: form.packaging_unit,
      remarks: form.remarks,
    };
    const response = await millService.updatePackaging(selectedPackagingId.value, payload)
    if (response.status === 200 || response.status === 201) {
      toast.success('Packaging details updated');
      resetForm()
      isEditMode.value = false;
      selectedPackagingId.value = null;
      fetchPackagingDetails();
    }
  } catch (error) {
    console.error('Error updating:', error);
    toast.error(error.response?.data?.detail || 'Failed to update packaging');
  }
};

const cancelEdit = () => {
  isEditMode.value = false;
  selectedPackagingId.value = null;
  resetForm()
};

const resetForm = () => {
  form.packaging_name = '';
  form.weight_bags = '';
  form.packaging_unit = '';
  form.remarks = '';
  if (formRef.value) formRef.value.resetValidation()
}

onMounted(() => {
  if (user) {
    form.user_login_id = user.id;
  }
  fetchPackagingDetails();
  fetchModuleStatus();
  fetchFirmDetails();
});
</script>