<template>
  <v-container fluid>
    <v-card elevation="2" class="rounded-lg">
      <v-card-title class="text-h5 font-weight-bold text-center py-4">
        Lot Details
      </v-card-title>
      <v-card-text>
        <!-- Filters -->
        <v-row dense class="mb-4 align-center justify-center">
          <v-col cols="12" sm="6" md="3">
            <v-text-field v-model.number="filters.lot_number" label="Lot Number" placeholder="Search Lot Number"
              type="number" variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field v-model="filters.checker_clerk" label="Checker Clerk" placeholder="Search Checker Clerk"
              variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field v-model="filters.verifier_clerk" label="Verifier Clerk" placeholder="Search Verifier Clerk"
              variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
          <v-col cols="12" sm="auto">
            <v-btn color="error" @click="clearFilters">
              Clear
            </v-btn>
          </v-col>
        </v-row>

        <!-- Table -->
        <v-data-table :headers="headers" :items="records" :items-per-page="firm.page_size || 10" :loading="loading"
          density="compact" class="elevation-1" hover>
          <template v-slot:item.sno="{ index }">
            {{ index + 1 }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon color="primary" @click="openEditModal(item)" class="cursor-pointer">
              mdi-pencil
            </v-icon>
          </template>
          <template #no-data>
            <div class="text-center py-4 text-grey">
              No records found.
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Edit Modal -->
    <v-dialog v-model="showEditModal" max-width="800px">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
          Edit Lot Details
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form @submit.prevent="updateRecord">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="editForm.lot_number" label="Lot Number" type="number" variant="outlined"
                  density="compact"
                  @input="editForm.lot_number = editForm.lot_number.toString().slice(0, 6)"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="editForm.lot_moisture_percent" label="Moisture %" type="number"
                  step="0.01" variant="outlined" density="compact"
                  @blur="formatNumber('lot_moisture_percent')"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="editForm.lot_broken_percent" label="Broken %" type="number" step="0.01"
                  variant="outlined" density="compact" @blur="formatNumber('lot_broken_percent')"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="editForm.lot_discolor_percent" label="Discolor %" type="number"
                  step="0.01" variant="outlined" density="compact"
                  @blur="formatNumber('lot_discolor_percent')"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="editForm.lot_damaged_percent" label="Damaged %" type="number" step="0.01"
                  variant="outlined" density="compact" @blur="formatNumber('lot_damaged_percent')"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="editForm.lot_lower_grain_percent" label="Lower Grain %" type="number"
                  step="0.01" variant="outlined" density="compact"
                  @blur="formatNumber('lot_lower_grain_percent')"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="editForm.lot_chalky_percent" label="Chalky %" type="number" step="0.01"
                  variant="outlined" density="compact" @blur="formatNumber('lot_chalky_percent')"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="editForm.lot_frk_percent" label="FRK %" type="number" step="0.01"
                  variant="outlined" density="compact" @blur="formatNumber('lot_frk_percent')"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="editForm.lot_other_percent" label="Other %" type="number" step="0.01"
                  variant="outlined" density="compact" @blur="formatNumber('lot_other_percent')"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="editForm.checker_clerk" :items="clerks" item-title="clerk_name" item-value="id"
                  label="Checker Clerk" variant="outlined" density="compact"></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editForm.checking_date" label="Checking Date" type="date" variant="outlined"
                  density="compact"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editForm.checking_time" label="Checking Time" type="time" variant="outlined"
                  density="compact"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="editForm.verifier_clerk" :items="clerks" item-title="clerk_name" item-value="id"
                  label="Verifier Clerk" variant="outlined" density="compact"></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editForm.verifying_date" label="Verifying Date" type="date" variant="outlined"
                  density="compact"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editForm.verifying_time" label="Verifying Time" type="time" variant="outlined"
                  density="compact"></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-center pb-4">
          <v-btn color="primary" variant="elevated" @click="updateRecord" :loading="loading">Save</v-btn>
          <v-btn color="error" variant="outlined" @click="closeEditModal">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { productionService } from '@/services'
import storage from '@/utils/storage';

const toast = useToast();
const records = ref([]);
const firm = ref({ page_size: 10 });
const clerks = ref([]);
const loading = ref(false);
const showEditModal = ref(false);
const user = storage.getUser() || null;

const filters = reactive({
  lot_number: '',
  checker_clerk: '',
  verifier_clerk: '',
});

const editForm = reactive({
  id: null,
  lot_number: null,
  lot_moisture_percent: null,
  lot_broken_percent: null,
  lot_discolor_percent: null,
  lot_damaged_percent: null,
  lot_lower_grain_percent: null,
  lot_chalky_percent: null,
  lot_frk_percent: null,
  lot_other_percent: null,
  checker_clerk: '',
  checking_date: '',
  checking_time: '',
  verifier_clerk: '',
  verifying_date: '',
  verifying_time: '',
});

const headers = [
  { title: 'S.No.', key: 'sno', align: 'center', sortable: false },
  { title: 'Lot Number', key: 'lot_number', align: 'center' },
  { title: 'Moisture %', key: 'lot_moisture_percent', align: 'center' },
  { title: 'Broken %', key: 'lot_broken_percent', align: 'center' },
  { title: 'Discolor %', key: 'lot_discolor_percent', align: 'center' },
  { title: 'Damaged %', key: 'lot_damaged_percent', align: 'center' },
  { title: 'Lower Grain %', key: 'lot_lower_grain_percent', align: 'center' },
  { title: 'Chalky %', key: 'lot_chalky_percent', align: 'center' },
  { title: 'FRK %', key: 'lot_frk_percent', align: 'center' },
  { title: 'Other %', key: 'lot_other_percent', align: 'center' },
  { title: 'Checker Employee', key: 'checker_clerk_name', align: 'start' },
  { title: 'Verifier Employee', key: 'verifier_clerk_name', align: 'start' },
  { title: 'Entry By', key: 'user_login', align: 'start' },
  { title: 'Actions', key: 'actions', align: 'center', sortable: false },
];

const fetchRecords = async () => {
  loading.value = true;
  try {
    const response = await productionService.getLotDetails()

    if (Array.isArray(response.data)) {
      records.value = response.data;
    } else {
      records.value = [];
      toast.error('Invalid data format received from server.');
    }
  } catch (error) {
    console.error('Error fetching lots:', error);
    toast.error(error.response?.data?.message || 'Error fetching lot records');
  } finally {
    loading.value = false;
  }
};

const clearFilters = () => {
  filters.lot_number = '';
  filters.checker_clerk = '';
  filters.verifier_clerk = '';
};

const openEditModal = (record) => {
  if (!user || user.role !== 'admin') {
    toast.error('Only admins can edit lot records.');
    return;
  }

  const checker = clerks.value.find((c) => c.clerk_name === record.checker_clerk_name);
  const verifier = clerks.value.find((c) => c.clerk_name === record.verifier_clerk_name);

  Object.assign(editForm, {
    id: record.id,
    lot_number: record.lot_number,
    lot_moisture_percent: record.lot_moisture_percent ?? 0,
    lot_broken_percent: record.lot_broken_percent ?? 0,
    lot_discolor_percent: record.lot_discolor_percent ?? 0,
    lot_damaged_percent: record.lot_damaged_percent ?? 0,
    lot_lower_grain_percent: record.lot_lower_grain_percent ?? 0,
    lot_chalky_percent: record.lot_chalky_percent ?? 0,
    lot_frk_percent: record.lot_frk_percent ?? 0,
    lot_other_percent: record.lot_other_percent ?? 0,
    checker_clerk: checker ? checker.id : '',
    checking_date: record.checking_date || '',
    checking_time: record.checking_time ? record.checking_time.slice(0, 5) : '',
    verifier_clerk: verifier ? verifier.id : '',
    verifying_date: record.verifying_date || '',
    verifying_time: record.verifying_time ? record.verifying_time.slice(0, 5) : '',
  });

  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  Object.assign(editForm, {
    id: null,
    lot_number: null,
    lot_moisture_percent: null,
    lot_broken_percent: null,
    lot_discolor_percent: null,
    lot_damaged_percent: null,
    lot_lower_grain_percent: null,
    lot_chalky_percent: null,
    lot_frk_percent: null,
    lot_other_percent: null,
    checker_clerk: '',
    checking_date: '',
    checking_time: '',
    verifier_clerk: '',
    verifying_date: '',
    verifying_time: '',
  });
};

const formatNumber = (field) => {
  if (editForm[field] !== null && editForm[field] !== '') {
    editForm[field] = Number(editForm[field]).toFixed(2);
  }
};

const updateRecord = async () => {
  if (!editForm.lot_number || !editForm.checker_clerk || !editForm.verifier_clerk) {
    toast.error('Please fill in all required fields');
    return;
  }

  loading.value = true;
  try {
    if (!clerks.value.length) {
      await productionService.getClerks();
    }

    const checkerClerk = clerks.value.find((c) => c.id === editForm.checker_clerk);
    const verifierClerk = clerks.value.find((c) => c.id === editForm.verifier_clerk);

    if (!checkerClerk || !verifierClerk) {
      toast.error('Invalid checker or verifier clerk selected');
      return;
    }

    const formatTime = (time) => {
      if (!time) return '00:00:00.000Z';
      const [hours, minutes] = time.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00.000Z`;
    };

    const payload = {
      lot_number: Number(editForm.lot_number),
      lot_moisture_percent: editForm.lot_moisture_percent ? Number(editForm.lot_moisture_percent) : 0,
      lot_broken_percent: editForm.lot_broken_percent ? Number(editForm.lot_broken_percent) : 0,
      lot_discolor_percent: editForm.lot_discolor_percent ? Number(editForm.lot_discolor_percent) : 0,
      lot_damaged_percent: editForm.lot_damaged_percent ? Number(editForm.lot_damaged_percent) : 0,
      lot_lower_grain_percent: editForm.lot_lower_grain_percent ? Number(editForm.lot_lower_grain_percent) : 0,
      lot_chalky_percent: editForm.lot_chalky_percent ? Number(editForm.lot_chalky_percent) : 0,
      lot_frk_percent: editForm.lot_frk_percent ? Number(editForm.lot_frk_percent) : 0,
      lot_other_percent: editForm.lot_other_percent ? Number(editForm.lot_other_percent) : 0,
      checker_clerk_name: checkerClerk.clerk_name,
      checking_date: editForm.checking_date || null,
      checking_time: formatTime(editForm.checking_time),
      verifier_clerk_name: verifierClerk.clerk_name,
      verifying_date: editForm.verifying_date || null,
      verifying_time: formatTime(editForm.verifying_time),
    };

    const numericFields = [
      'lot_moisture_percent',
      'lot_broken_percent',
      'lot_discolor_percent',
      'lot_damaged_percent',
      'lot_lower_grain_percent',
      'lot_chalky_percent',
      'lot_frk_percent',
      'lot_other_percent',
    ];
    for (const field of numericFields) {
      if (payload[field] < 0) {
        toast.error(`${field.replace(/_/g, ' ')} cannot be negative`);
        return;
      }
    }

    if (payload.lot_number <= 0) {
      toast.error('Lot number must be a positive number');
      return;
    }

    const response = await productionService.updateLotDetails(editForm.id, payload);

    if (response.status === 200) {
      await fetchRecords();
      toast.success('Lot updated successfully');
      closeEditModal();
    } else {
      toast.error('Unexpected response from server');
    }
  } catch (error) {
    console.error('Error updating lot:', error);
    toast.error(error.response?.data?.detail?.map((err) => err.msg).join('; ') || 'Error updating lot record');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchRecords();
});
</script>

<style scoped>
/* Vuetify handles styles */
</style>
