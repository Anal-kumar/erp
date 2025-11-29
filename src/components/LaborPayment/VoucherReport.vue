<template>
  <v-container fluid>
    <v-card elevation="2" class="rounded-lg h-100">
      <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
        Voucher List
      </v-card-title>
      <v-card-text class="pa-4">
        <!-- Filter Input Fields -->
        <v-row class="mb-4">
          <v-col cols="12" md="3">
            <v-text-field v-model="gangFilter" label="Gang Name" placeholder="Filter by Gang Name" variant="outlined"
              density="compact" hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field v-model="workItemFilter" label="Work Item" placeholder="Filter by Work Item"
              variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field v-model="fromDateFilter" label="From Date" type="date" variant="outlined" density="compact"
              hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field v-model="toDateFilter" label="To Date" type="date" variant="outlined" density="compact"
              hide-details></v-text-field>
          </v-col>
        </v-row>

        <!-- Table -->
        <v-data-table :headers="headers" :items="filteredVouchers" :items-per-page="firm.page_size || 10"
          density="compact" class="elevation-1" hover>
          <template v-slot:item.sno="{ index }">
            {{ index + 1 }}
          </template>
          <template v-slot:item.vch_date="{ item }">
            {{ formatDate(item.vch_date) }}
          </template>
          <template v-slot:item.voucher_details="{ item }">
            <v-table v-if="item.voucher_gangs?.length" density="compact" class="my-2 border">
              <thead>
                <tr>
                  <th class="text-left">SNo</th>
                  <th class="text-left">Gang Name</th>
                  <th class="text-left">Work Item</th>
                  <th class="text-left">Particular</th>
                  <th class="text-left">Bags Packaging(KG)</th>
                  <th class="text-left">Bags (Nos)</th>
                  <th class="text-left">Rate</th>
                  <th class="text-left">Amount</th>
                  <th class="text-left">Origin</th>
                  <th class="text-left">Destination</th>
                  <th class="text-left">Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(gang, idx) in item.voucher_gangs" :key="idx">
                  <td>{{ idx + 1 }}</td>
                  <td>{{ gang.gang?.gang_name || '-' }}</td>
                  <td>{{ item.voucher_work_items?.[idx]?.work_item?.labour_item_name || '-' }}</td>
                  <td>{{ item.voucher_particulars?.[idx]?.particular?.work_name || '-' }}</td>
                  <td>{{ item.voucher_bag_packagings?.[idx]?.bag_packaging?.bag_weight || '-' }}</td>
                  <td>{{ item.voucher_bag_packagings?.[idx]?.bags_nos || '-' }}</td>
                  <td>{{ gang.work_rate || '-' }}</td>
                  <td>{{ calculateAmount(gang, item, idx) }}</td>
                  <td>{{ item.voucher_locations?.[idx]?.location_origin?.work_locations || '-' }}</td>
                  <td>{{ item.voucher_locations?.[idx]?.location_destination?.work_locations || '-' }}</td>
                  <td>{{ item.remarks || '-' }}</td>
                </tr>
                <tr>
                  <td colspan="7" class="text-right font-weight-bold">Total Amount</td>
                  <td class="font-weight-bold">{{ totalAmountCalculate(item) }}</td>
                  <td colspan="3"></td>
                </tr>
              </tbody>
            </v-table>
            <span v-else class="text-grey">No voucher details</span>
          </template>
          <template v-slot:item.user_login="{ item }">
            {{ item.user_login || '-' }}
          </template>
        </v-data-table>

        <div class="mt-4 text-h6 font-weight-bold">
          Grand Total Amount: ₹ {{ grandTotal }}
        </div>

        <!-- Download Button -->
        <v-row class="mt-4">
          <v-col cols="12" class="d-flex justify-center">
            <v-btn color="primary" size="large" @click="downloadReport">
              Download Excel Report
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import config from '@/config';
import { useToast } from 'vue-toastification'

const toast = useToast();

// Filters
const gangFilter = ref('');
const workItemFilter = ref('');
const fromDateFilter = ref('');
const toDateFilter = ref('');

// Voucher data and pagination
const vouchers = ref([]);
const firm = ref({ page_size: 10 })

const headers = [
  { title: 'Sno', key: 'sno', align: 'center', sortable: false },
  { title: 'Voucher Date', key: 'vch_date', align: 'center' },
  { title: 'Voucher Details', key: 'voucher_details', align: 'center', sortable: false, width: '60%' },
  { title: 'Entry By', key: 'user_login', align: 'center' },
]

// Computed properties
const filteredVouchers = computed(() => {
  let list = vouchers.value || [];

  // Gang filter
  if (gangFilter.value) {
    list = list.filter((v) =>
      v.voucher_gangs?.some((g) =>
        g.gang?.gang_name?.toLowerCase().includes(gangFilter.value.toLowerCase())
      )
    );
  }

  // Work item filter
  if (workItemFilter.value) {
    list = list.filter((v) =>
      v.voucher_work_items?.some((w) =>
        w.work_item?.labour_item_name?.toLowerCase().includes(workItemFilter.value.toLowerCase())
      )
    );
  }

  // Date filters
  if (fromDateFilter.value) {
    const fromDate = new Date(fromDateFilter.value);
    list = list.filter((v) => {
      const voucherDate = new Date(v.vch_date);
      return voucherDate >= fromDate;
    });
  }

  if (toDateFilter.value) {
    const toDate = new Date(toDateFilter.value);
    // Set toDate to end of the day for inclusivity
    toDate.setHours(23, 59, 59, 999);
    list = list.filter((v) => {
      const voucherDate = new Date(v.vch_date);
      return voucherDate <= toDate;
    });
  }

  return list;
});

// Amount calculation for table
const calculateAmount = (gang, voucher, idx) => {
  if (!voucher?.voucher_bag_packagings?.[idx]?.bags_nos || !gang?.work_rate) return '0.00';
  const bagNos = Number(voucher.voucher_bag_packagings[idx]?.bags_nos || 0);
  const rate = Number(gang.work_rate || 0);
  return (bagNos * rate).toFixed(2);
};
const totalAmountCalculate = (voucher) => {
  return voucher.voucher_gangs?.reduce((sum, gang, idx) => {
    const bagNos = Number(voucher.voucher_bag_packagings?.[idx]?.bags_nos || 0);
    const rate = Number(gang.work_rate || 0);
    return sum + bagNos * rate;
  }, 0) || '0.00';
};

const grandTotal = computed(() => {
  return filteredVouchers.value.reduce((sum, voucher) => sum + Number(totalAmountCalculate(voucher)), 0).toFixed(2);
});
// Format date
const formatDate = (date) => {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '-';
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
    } else {
      firm.value = {
        firm_name: 'Unavailable',
        firm_address: 'Unavailable',
        page_size: 10
      }
      toast.error('Failed to fetch firm details: Invalid response')
    }
  } catch (err) {
    console.error('Failed to fetch firm details:', err)
    firm.value = {
      firm_name: 'Error',
      firm_address: 'Error',
      page_size: 10
    }
    toast.error('Failed to fetch firm details')
  }
};
// Fetch vouchers
const fetchVoucher = async () => {
  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Session expired. Please log in again.');
      // this.router.push('/login'); // router is not defined here, handled by auth guard usually
      return;
    }

    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/labour-payment-vouchers/get_vouchers`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status === 200) {
      vouchers.value = response.data.map((v) => ({
        id: v.id,
        vch_date: v.vch_date,
        voucher_gangs: v.voucher_gangs || [],
        voucher_bag_packagings: v.voucher_bag_packagings || [],
        voucher_work_items: v.voucher_work_items || [],
        voucher_particulars: v.voucher_particulars || [],
        voucher_locations: v.voucher_locations || [],
        remarks: v.remarks || '',
        user_login: v.user_login || '',
      }));
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching vouchers:', error.response?.data || error.message);
    const message =
      error.response?.status === 401
        ? 'Unauthorized access. Please log in again.'
        : error.response?.data?.message || 'Failed to fetch vouchers.';
    toast.error(message);
    vouchers.value = [];
  }
};
const downloadReport = async () => {
  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Session expired. Please log in again.');
      return;
    }

    const params = new URLSearchParams();
    if (gangFilter.value) params.append('gang_name', gangFilter.value);
    if (workItemFilter.value) params.append('work_item_name', workItemFilter.value);
    if (fromDateFilter.value) params.append('from_date', fromDateFilter.value);
    if (toDateFilter.value) params.append('to_date', toDateFilter.value);
    params.append('download', 'true');

    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/labour-payment-vouchers/download_labour_payment_vouchers?${params.toString()}`,
      {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Voucher_report.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url); // Clean up

    toast.success('Voucher report downloaded successfully.');
  } catch (error) {
    console.error('Download failed:', error.response?.data || error.message);
    const message =
      error.response?.status === 401
        ? 'Unauthorized access. Please log in again.'
        : error.response?.data?.message || 'Failed to download voucher report.';
    toast.error(message)
  }
};


onMounted(async () => {
  fetchVoucher()
  fetchFirmDetails()
});
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>