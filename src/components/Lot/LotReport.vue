<template>
  <v-container fluid>
    <v-card elevation="2" class="rounded-lg">
      <v-card-title class="text-h4 font-weight-bold text-center py-4">
        Lot Report
      </v-card-title>
      <v-card-text>
        <!-- Filters -->
        <v-row dense class="mb-4 align-center justify-center">
          <v-col cols="12" sm="6" md="2">
            <v-text-field v-model="filters.lot_number" label="Lot Number" placeholder="Search Lot Number"
              variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-text-field v-model="filters.checker_clerk_name" label="Checker Clerk" placeholder="Search Checker Clerk"
              variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-text-field v-model="filters.verifier_clerk_name" label="Verifier Clerk"
              placeholder="Search Verifier Clerk" variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-text-field v-model="filters.from_checking_date" label="From Checking Date" type="date" variant="outlined"
              density="compact" hide-details></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-text-field v-model="filters.to_checking_date" label="To Checking Date" type="date" variant="outlined"
              density="compact" hide-details></v-text-field>
          </v-col>
          <v-col cols="12" sm="auto" class="d-flex align-center">
            <v-btn color="error" @click="clearFilters">
              Clear Filters
            </v-btn>
          </v-col>
        </v-row>

        <!-- Table -->
        <v-data-table :headers="headers" :items="filteredRecords" :items-per-page="10" density="compact"
          class="elevation-1" hover fixed-header height="500px">
          <template v-slot:item.sno="{ index }">
            {{ index + 1 }}
          </template>
          <template v-slot:item.checking_date="{ item }">
            {{ formatDate(item.checking_date) }}
          </template>
          <template v-slot:item.checking_time="{ item }">
            {{ formatTime(item.checking_time) }}
          </template>
          <template v-slot:item.verifying_date="{ item }">
            {{ formatDate(item.verifying_date) }}
          </template>
          <template v-slot:item.verifying_time="{ item }">
            {{ formatTime(item.verifying_time) }}
          </template>

          <!-- Handle nested objects safely -->
          <template v-slot:item.checker_clerk_name="{ item }">
            {{ item.checker_clerk_name || '-' }}
          </template>
          <template v-slot:item.verifier_clerk_name="{ item }">
            {{ item.verifier_clerk_name || '-' }}
          </template>
          <template #no-data>
            <div class="text-center py-4 text-grey">
              No records found.
            </div>
          </template>
        </v-data-table>

        <!-- Download Button -->
        <div class="d-flex justify-center mt-6">
          <v-btn color="primary" size="large" prepend-icon="mdi-download" @click="downloadReport">
            Download Excel Report
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { productionService } from '@/services';
import { useToast } from 'vue-toastification';

const toast = useToast();
const records = ref([]);
const filters = reactive({
  lot_number: '',
  checker_clerk_name: '',
  verifier_clerk_name: '',
  from_checking_date: '',
  to_checking_date: '',
});

const headers = [
  { title: 'SNo', key: 'sno', align: 'center', sortable: false },
  { title: 'Lot Number', key: 'lot_number', align: 'center' },
  { title: 'Moisture %', key: 'lot_moisture_percent', align: 'center' },
  { title: 'Broken %', key: 'lot_broken_percent', align: 'center' },
  { title: 'Discolor %', key: 'lot_discolor_percent', align: 'center' },
  { title: 'Damaged %', key: 'lot_damaged_percent', align: 'center' },
  { title: 'Lower Grain %', key: 'lot_lower_grain_percent', align: 'center' },
  { title: 'Chalky %', key: 'lot_chalky_percent', align: 'center' },
  { title: 'FRK %', key: 'lot_frk_percent', align: 'center' },
  { title: 'Other %', key: 'lot_other_percent', align: 'center' },
  { title: 'Checker Clerk', key: 'checker_clerk_name', align: 'center' },
  { title: 'Checking Date', key: 'checking_date', align: 'center' },
  { title: 'Checking Time', key: 'checking_time', align: 'center' },
  { title: 'Verifier Clerk', key: 'verifier_clerk_name', align: 'center' },
  { title: 'Verifying Date', key: 'verifying_date', align: 'center' },
  { title: 'Verifying Time', key: 'verifying_time', align: 'center' },
  { title: 'Entry By', key: 'user_login', align: 'center' },
];

const filteredRecords = computed(() => {
  return records.value.filter((record) => {
    const lotNeedle = (filters.lot_number ?? '').toString().trim().toLowerCase();
    const checkerNeedle = (filters.checker_clerk_name || '').toLowerCase().trim();
    const verifierNeedle = (filters.verifier_clerk_name || '').toLowerCase().trim();

    const lotStr = (record.lot_number ?? '').toString().toLowerCase();
    const checkerName = (record.checker_clerk_name || '').toString().toLowerCase();
    const verifierName = (record.verifier_clerk_name || '').toString().toLowerCase();

    const matchesLot = lotNeedle ? lotStr.includes(lotNeedle) : true;
    const matchesChecker = checkerNeedle ? checkerName.includes(checkerNeedle) : true;
    const matchesVerifier = verifierNeedle ? verifierName.includes(verifierNeedle) : true;

    const checkingDate = record.checking_date ? new Date(record.checking_date) : null;
    const from = filters.from_checking_date ? new Date(filters.from_checking_date) : null;
    const to = filters.to_checking_date ? new Date(filters.to_checking_date) : null;
    const matchesDate = (!from || !checkingDate || checkingDate >= from) && (!to || !checkingDate || checkingDate <= to);

    return matchesLot && matchesChecker && matchesVerifier && matchesDate;
  });
});

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (timestamp) => {
  if (!timestamp) return '-';
  try {
    let date;
    if (typeof timestamp === 'string') {
      if (timestamp.includes('T')) {
        date = new Date(timestamp);
      } else if (/^\d{2}:\d{2}:\d{2}$/.test(timestamp)) {
        const today = new Date();
        date = new Date(`${today.toISOString().split('T')[0]}T${timestamp}+05:30`);
      } else {
        return '-';
      }
    } else {
      date = new Date(timestamp);
    }
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  } catch (error) {
    console.error('Error formatting time:', timestamp, error);
    return '-';
  }
};

const fetchRecords = async () => {
  try {
    const response = await productionService.getLotDetails();
    if (Array.isArray(response.data)) {
      records.value = response.data.map(record => ({
        ...record,
        lot_moisture_percent: record.lot_moisture_percent ?? 0,
        lot_broken_percent: record.lot_broken_percent ?? 0,
        lot_discolor_percent: record.lot_discolor_percent ?? 0,
        lot_damaged_percent: record.lot_damaged_percent ?? 0,
        lot_lower_grain_percent: record.lot_lower_grain_percent ?? 0,
        lot_chalky_percent: record.lot_chalky_percent ?? 0,
        lot_frk_percent: record.lot_frk_percent ?? 0,
        lot_other_percent: record.lot_other_percent ?? 0,
        checker_clerk_name: record.checker_clerk_name || '',
        verifier_clerk_name: record.verifier_clerk_name || '',
        checking_date: record.checking_date || '',
        checking_time: record.checking_time || '',
        verifying_date: record.verifying_date || '',
        verifying_time: record.verifying_time || '',
        user_login: record.user_login || '',
      }));
    } else {
      records.value = [];
      toast.error('Invalid data format received from server.');
    }
  } catch (error) {
    console.error('Fetch failed:', error);
  }
};

const clearFilters = () => {
  filters.lot_number = '';
  filters.checker_clerk_name = '';
  filters.verifier_clerk_name = '';
  filters.from_checking_date = '';
  filters.to_checking_date = '';
};

const downloadReport = async () => {
  const params = new URLSearchParams();
  if (filters.lot_number) params.append('lot_number', filters.lot_number);
  if (filters.checker_clerk_name) params.append('checker_clerk_name', filters.checker_clerk_name);
  if (filters.verifier_clerk_name) params.append('verifier_clerk_name', filters.verifier_clerk_name);
  if (filters.from_checking_date) params.append('from_checking_date', filters.from_checking_date);
  if (filters.to_checking_date) params.append('to_checking_date', filters.to_checking_date);
  params.append('download', 'true');

  try {
    const response = await productionService.downloadLotReport(params);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'lot_report.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Download failed:', error);
    toast.error('Failed to download lot report.');
  }
};

onMounted(() => {
  fetchRecords();
});
</script>

<style scoped>
/* Vuetify handles styles */
</style>