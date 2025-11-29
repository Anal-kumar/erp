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
                  <th class="text-left">Item Name</th>
                  <th class="text-left">Particular</th>
                  <th class="text-left">Bags Packaging(KG)</th>
                  <th class="text-left">Bags (Nos)</th>
                  <th class="text-left">Rate</th>
                  <th class="text-left">Amount</th>
                  <th class="text-left">Origin</th>
                  <th class="text-left">Destination</th>
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
                </tr>
                <tr>
                  <td colspan="7" class="text-right font-weight-bold">Total</td>
                  <td class="font-weight-bold">{{ totalAmountCalculate(item) }}</td>
                  <td colspan="2"></td>
                </tr>
              </tbody>
            </v-table>
            <span v-else class="text-grey">No voucher details</span>
          </template>
          <template v-slot:item.remarks="{ item }">
            {{ item.remarks || '-' }}
          </template>
          <template v-slot:item.user_login="{ item }">
            {{ item.user_login || '-' }}
          </template>
          <template v-slot:item.actions="{ item }">
            <div class="d-flex gap-2 justify-center">
              <v-icon color="info" @click="viewVoucher(item.id)" class="cursor-pointer">mdi-eye</v-icon>
              <v-icon color="primary" @click="editVoucherData(item)" class="cursor-pointer">mdi-pencil</v-icon>
            </div>
          </template>
        </v-data-table>

        <div class="mt-4 text-h6 font-weight-bold">
          Grand Total Amount: ₹ {{ grandTotal }}
        </div>
      </v-card-text>
    </v-card>

    <!-- Details Modal -->
    <v-dialog v-model="showDetailsModal" max-width="1000px">
      <v-card>
        <v-card-text class="pa-6">
          <div id="printable-area">
            <table class="w-100 text-sm text-black border-collapse">
              <thead>
                <tr>
                  <th colspan="10" class="border text-center pa-4">
                    <h1 class="text-h4 text-decoration-underline mb-2">VOUCHER BILL</h1>
                    <h2 class="text-h5 mb-1">{{ firm.firm_name }}</h2>
                    <h3 class="text-h6 font-weight-regular">{{ firm.firm_address }}</h3>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="border text-center font-weight-bold pa-2" colspan="3"><span
                      class="text-decoration-underline">BILL NO</span></td>
                  <td class="border text-center pa-2">{{selectedVoucher ? vouchers.findIndex((r) => r.id ===
                    selectedVoucher.id) + 1 || '-' : '-' }}</td>
                  <td class="border text-center font-weight-bold pa-2" colspan="3"><span
                      class="text-decoration-underline">DATE</span></td>
                  <td class="border text-center pa-2">{{ formatDate(selectedVoucher.vch_date) || '-' }}</td>
                </tr>
                <tr>
                  <td class="border text-center font-weight-bold pa-2" colspan="8"><span
                      class="text-decoration-underline">VOUCHER DETAILS</span></td>
                </tr>
                <tr>
                  <th class="border text-center font-weight-bold pa-2"><span
                      class="text-decoration-underline">SNO</span>
                  </th>
                  <th class="border text-center font-weight-bold pa-2"><span class="text-decoration-underline">GANG
                      NAME</span></th>
                  <th class="border text-center font-weight-bold pa-2"><span class="text-decoration-underline">ITEM
                      NAME</span></th>
                  <th class="border text-center font-weight-bold pa-2"><span
                      class="text-decoration-underline">PARTICULAR</span></th>
                  <th class="border text-center font-weight-bold pa-2"><span class="text-decoration-underline">BAGS
                      PACKAGING (KG)</span></th>
                  <th class="border text-center font-weight-bold pa-2"><span class="text-decoration-underline">BAGS
                      (NOS)</span></th>
                  <th class="border text-center font-weight-bold pa-2"><span
                      class="text-decoration-underline">RATE</span>
                  </th>
                  <th class="border text-center font-weight-bold pa-2"><span
                      class="text-decoration-underline">AMOUNT</span>
                  </th>
                </tr>
                <tr v-for="(gang, idx) in selectedVoucher.voucher_gangs" :key="idx">
                  <td class="border text-center pa-2">{{ idx + 1 }}</td>
                  <td class="border text-center pa-2">{{ gang.gang?.gang_name || '-' }}</td>
                  <td class="border text-center pa-2">{{
                    selectedVoucher.voucher_work_items?.[idx]?.work_item?.labour_item_name || '-' }}</td>
                  <td class="border text-center pa-2">{{
                    selectedVoucher.voucher_particulars?.[idx]?.particular?.work_name
                    || '-' }}</td>
                  <td class="border text-center pa-2">{{
                    selectedVoucher.voucher_bag_packagings?.[idx]?.bag_packaging?.bag_weight || '-' }}</td>
                  <td class="border text-center pa-2">{{ selectedVoucher.voucher_bag_packagings?.[idx]?.bags_nos || '-'
                    }}
                  </td>
                  <td class="border text-center pa-2">{{ gang.work_rate || '-' }}</td>
                  <td class="border text-center pa-2">{{ calculateAmount(gang, selectedVoucher, idx) }}</td>
                </tr>
                <tr v-if="!selectedVoucher.voucher_gangs?.length">
                  <td colspan="10" class="border text-center pa-4 text-grey">No voucher details</td>
                </tr>
                <tr>
                  <td class="border text-right font-weight-bold pa-2" colspan="7"><span
                      class="text-decoration-underline">TOTAL AMOUNT</span></td>
                  <td class="border text-center font-weight-bold pa-2">{{ totalVoucherAmount }}</td>
                </tr>
                <tr>
                  <td class="border text-center font-weight-bold pa-2"><span class="text-decoration-underline">IN
                      WORDS</span></td>
                  <td class="border text-left font-weight-bold pa-2" colspan="8">{{ amountInWords }}</td>
                </tr>
                <tr>
                  <td class="border text-center font-weight-bold pa-2"><span
                      class="text-decoration-underline">REMARKS</span></td>
                  <td class="border text-left pa-2" colspan="8">{{ selectedVoucher.remarks || '-' }}</td>
                </tr>
                <tr>
                  <td class="border pa-2" style="height: 80px;" colspan="10"></td>
                </tr>
                <tr class="text-center border">
                  <td class="border-b text-left font-weight-bold text-sm pa-2">PREPARED BY</td>
                  <td class="border-b text-center font-weight-bold text-sm pa-2" colspan="3">VERIFIED BY</td>
                  <td class="border-b text-left font-weight-bold text-sm pa-2" colspan="3">For, {{ firm.firm_name }}
                  </td>
                  <td class="border-b text-left font-weight-bold text-sm pa-2" colspan="3">RECEIVER SIGN</td>
                </tr>
              </tbody>
            </table>
          </div>
        </v-card-text>
        <v-card-actions class="justify-center pb-4">
          <v-btn color="primary" variant="elevated" @click="printDetails">Print</v-btn>
          <v-btn color="error" variant="elevated" @click="closeDetailsModal">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Update Voucher Modal -->
    <v-dialog v-model="showEditModal" max-width="1200px" persistent>
      <v-card>
        <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
          Update Voucher
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row align="center" class="mb-4">
            <v-col cols="12" md="4">
              <v-text-field v-model="editVoucher.vch_date" label="Voucher Date" type="date" variant="outlined"
                density="compact" hide-details></v-text-field>
            </v-col>
            <v-col cols="12" md="8" class="d-flex justify-end">
              <v-btn color="primary" prepend-icon="mdi-plus" @click="showVoucherModal = true">
                Add Row
              </v-btn>
            </v-col>
          </v-row>

          <!-- Voucher Table -->
          <v-table v-if="editVoucher.vouchers.length" density="compact" class="border mb-4">
            <thead>
              <tr>
                <th class="text-center">Gang Name</th>
                <th class="text-center">Work Item</th>
                <th class="text-center">Particular</th>
                <th class="text-center">Bags Packaging (KG)</th>
                <th class="text-center">Bags (Nos)</th>
                <th class="text-center">Rate</th>
                <th class="text-center">Amount</th>
                <th class="text-center">Origin</th>
                <th class="text-center">Destination</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(voucher, index) in editVoucher.vouchers" :key="index">
                <td class="pa-1">
                  <v-select v-model="voucher.gang_id" :items="gangs" item-title="gang_name" item-value="id"
                    variant="outlined" density="compact" hide-details></v-select>
                </td>
                <td class="pa-1">
                  <v-select v-model="voucher.work_item_id" :items="workItems" item-title="labour_item_name"
                    item-value="id" variant="outlined" density="compact" hide-details></v-select>
                </td>
                <td class="pa-1">
                  <v-select v-model="voucher.particulars_id" :items="particulars" item-title="work_name" item-value="id"
                    variant="outlined" density="compact" hide-details></v-select>
                </td>
                <td class="pa-1">
                  <v-select v-model="voucher.bag_packaging_id" :items="packagings" item-title="bag_weight"
                    item-value="id" variant="outlined" density="compact" hide-details></v-select>
                </td>
                <td class="pa-1">
                  <v-text-field v-model.number="voucher.bag_nos" type="number" variant="outlined" density="compact"
                    hide-details min="0"></v-text-field>
                </td>
                <td class="pa-1">
                  <v-text-field v-model.number="voucher.rate" type="number" variant="outlined" density="compact"
                    hide-details min="0" step="0.01"></v-text-field>
                </td>
                <td class="text-center">
                  {{ (Number(voucher.bag_nos) || 0) * (Number(voucher.rate) || 0) }}
                </td>
                <td class="pa-1">
                  <v-select v-model="voucher.labour_work_location_id_origin" :items="locations"
                    item-title="work_locations" item-value="id" variant="outlined" density="compact"
                    hide-details></v-select>
                </td>
                <td class="pa-1">
                  <v-select v-model="voucher.labour_work_location_id_destination" :items="locations"
                    item-title="work_locations" item-value="id" variant="outlined" density="compact"
                    hide-details></v-select>
                </td>
                <td class="text-center">
                  <v-icon color="error" @click="deleteVoucher(index)" class="cursor-pointer">mdi-delete</v-icon>
                </td>
              </tr>
              <tr class="bg-grey-lighten-4 font-weight-bold">
                <td colspan="4" class="text-center">Total</td>
                <td class="text-center">{{ totalBags }} Bags</td>
                <td></td>
                <td class="text-center">₹ {{ totalAmount }}</td>
                <td colspan="3"></td>
              </tr>
            </tbody>
          </v-table>
          <div v-else class="text-center text-grey py-4">No voucher rows added.</div>

          <!-- Remarks -->
          <v-textarea v-model="editVoucher.remarks" label="Remarks" placeholder="Enter remarks" variant="outlined"
            density="compact" rows="3" @input="editVoucher.remarks = $event.target.value.toUpperCase()"></v-textarea>
        </v-card-text>
        <v-card-actions class="justify-center pb-4">
          <v-btn color="primary" variant="elevated" @click="handleSubmit"
            :disabled="!editVoucher.vouchers.length || !editVoucher.vch_date || isSubmitting">
            {{ isEditing ? 'Update' : 'Submit' }}
          </v-btn>
          <v-btn color="error" variant="elevated" @click="closeEditModal">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Voucher Row Modal -->
    <v-dialog v-model="showVoucherModal" max-width="500px">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
          Add Voucher Row
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form>
            <v-select v-model="newVoucher.gang_id" :items="gangs" item-title="gang_name" item-value="id" label="Gang"
              variant="outlined" density="compact" class="mb-2"></v-select>
            <v-select v-model="newVoucher.work_item_id" :items="workItems" item-title="labour_item_name" item-value="id"
              label="Work Item" variant="outlined" density="compact" class="mb-2"></v-select>
            <v-select v-model="newVoucher.particulars_id" :items="particulars" item-title="work_name" item-value="id"
              label="Particular" variant="outlined" density="compact" class="mb-2"></v-select>
            <v-select v-model="newVoucher.bag_packaging_id" :items="packagings" item-title="bag_weight" item-value="id"
              label="Bags Packaging (KG)" variant="outlined" density="compact" class="mb-2"></v-select>
            <v-text-field v-model.number="newVoucher.bag_nos" label="Bags (Nos)" type="number" variant="outlined"
              density="compact" class="mb-2" min="0"></v-text-field>
            <v-text-field v-model.number="newVoucher.rate" label="Rate" type="number" variant="outlined"
              density="compact" class="mb-2" min="0" step="0.01"></v-text-field>
            <v-text-field :model-value="AmountCalculate" label="Amount" variant="outlined" density="compact"
              class="mb-2" disabled></v-text-field>
            <v-select v-model="newVoucher.labour_work_location_id_origin" :items="locations" item-title="work_locations"
              item-value="id" label="Origin" variant="outlined" density="compact" class="mb-2"></v-select>
            <v-select v-model="newVoucher.labour_work_location_id_destination" :items="locations"
              item-title="work_locations" item-value="id" label="Destination" variant="outlined" density="compact"
              class="mb-2"></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-center pb-4">
          <v-btn color="primary" variant="elevated" @click="addVoucher">Add</v-btn>
          <v-btn color="warning" variant="elevated" @click="clearVoucherForm">Clear</v-btn>
          <v-btn color="error" variant="elevated" @click="showVoucherModal = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add New Voucher Modal (VoucherForm.vue) -->
    <v-dialog v-model="showAddVoucherModal" max-width="900px">
      <v-card>
        <VoucherForm :gangs="gangs" :workItems="workItems" :particulars="particulars" :packagings="packagings"
          :locations="locations" @submit="handleFormSubmit" @close="showAddVoucherModal = false" />
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import config from '@/config';
import { useRouter } from 'vue-router';
// Adjust path as needed
// Assuming VoucherForm is a component you might want to use, but here we are focusing on the table and edit functionality.
// If VoucherForm is needed, import it. For now, I'll comment it out as it wasn't explicitly asked to be refactored here, but the template uses it.
import VoucherForm from './VoucherForm.vue';

const toast = useToast();
const router = useRouter();

// Filters
const gangFilter = ref('');
const workItemFilter = ref('');
const fromDateFilter = ref('');
const toDateFilter = ref('');
const user = JSON.parse(sessionStorage.getItem('user')) || null;

// Voucher data and pagination
const vouchers = ref([]);
const firm = ref({ page_size: 10 })
const selectedVoucher = ref({});
const isSubmitting = ref(false);

// Modal and form state
const showEditModal = ref(false);
const showVoucherModal = ref(false);
const showAddVoucherModal = ref(false);
const showDetailsModal = ref(false);
const isEditing = ref(false);
const editVoucher = ref({
  id: null,
  vch_date: new Date().toISOString().split('T')[0],
  user_login_id: '',
  remarks: '',
  vouchers: [],
});
const newVoucher = ref({
  gang_id: '',
  work_item_id: '',
  particulars_id: '',
  bag_packaging_id: '',
  bag_nos: 0,
  rate: 0,
  labour_work_location_id_origin: '',
  labour_work_location_id_destination: '',
  remarks: '',
});

const gangs = ref([]);
const workItems = ref([]);
const particulars = ref([]);
const packagings = ref([]);
const locations = ref([]);

const headers = [
  { title: 'Sno', key: 'sno', align: 'center', sortable: false },
  { title: 'Voucher Date', key: 'vch_date', align: 'center' },
  { title: 'Voucher Details', key: 'voucher_details', align: 'center', sortable: false, width: '50%' },
  { title: 'Remarks', key: 'remarks', align: 'center' },
  { title: 'Entry By', key: 'user_login', align: 'center' },
  { title: 'Actions', key: 'actions', align: 'center', sortable: false },
]

const viewVoucher = (voucherId) => {
  selectedVoucher.value = vouchers.value.find((v) => v.id === voucherId) || {};
  showDetailsModal.value = true;
};
const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedVoucher.value = {};
};

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

const totalBags = computed(() => {
  return editVoucher.value.vouchers.reduce((sum, voucher) => sum + (Number(voucher.bag_nos) || 0), 0);
});

const totalAmount = computed(() => {
  return editVoucher.value.vouchers.reduce(
    (sum, voucher) => sum + (Number(voucher.bag_nos) || 0) * (Number(voucher.rate) || 0),
    0
  );
});

const AmountCalculate = computed(() => {
  return ((Number(newVoucher.value.bag_nos) || 0) * (Number(newVoucher.value.rate) || 0)).toFixed(2);
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
const totalVoucherAmount = computed(() => {
  return selectedVoucher.value.voucher_gangs?.reduce((sum, gang, idx) => {
    const bagNos = Number(selectedVoucher.value.voucher_bag_packagings?.[idx]?.bags_nos || 0);
    const rate = Number(gang.work_rate || 0);
    return sum + bagNos * rate;
  }, 0).toFixed(2) || '0.00';
});

const amountInWords = computed(() => {
  return numberToWords(Number(totalVoucherAmount.value) || 0);
});

// Convert number to words (Indian numbering system)
const numberToWords = (num) => {
  if (num === 0) return 'Zero';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const thousands = ['', 'Thousand', 'Lakh', 'Crore'];

  const convertLessThanThousand = (num) => {
    let str = '';
    if (num >= 100) {
      str += ones[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    if (num >= 20) {
      str += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    }
    if (num > 0 && num < 20) {
      str += ones[num] + ' ';
    }
    return str.trim();
  };

  let whole = Math.floor(num);
  let words = '';
  let unit = 0;

  while (whole > 0) {
    let part = whole % 1000;
    if (part > 0) {
      words = convertLessThanThousand(part) + ' ' + thousands[unit] + ' ' + words;
    }
    whole = Math.floor(whole / 1000);
    unit++;
  }

  let decimal = Math.round((num - Math.floor(num)) * 100);
  let decimalWords = '';
  if (decimal > 0) {
    decimalWords = 'and ' + convertLessThanThousand(decimal) + ' Paise';
  }

  return (words.trim() + ' ' + decimalWords).trim() + ' Only';
};


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

watch(
  () => newVoucher.value.gang_id,
  (newGangId) => {
    const selectedGang = gangs.value.find((gang) => gang.id === newGangId);
    if (selectedGang && selectedGang.work_rate != null) {
      newVoucher.value.rate = Number(selectedGang.work_rate).toFixed(2);
    } else {
      newVoucher.value.rate = 0;
    }
  },
  { immediate: true }
);

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
      router.push('/login');
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

// Fetch dropdown options
const fetchDropdowns = async () => {
  try {
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const [gangsRes, itemsRes, particularsRes, packagingsRes, locationsRes] = await Promise.all([
      axios.get(`${config.apiBaseUrl}/api/${config.version}/labour-gang/get_labour_gang`, { headers }),
      axios.get(`${config.apiBaseUrl}/api/${config.version}/work-items/get_labour_work_item`, { headers }),
      axios.get(`${config.apiBaseUrl}/api/${config.version}/work-particular/get_labour_work_particulars_details`, { headers }),
      axios.get(`${config.apiBaseUrl}/api/${config.version}/bag-packaging/get_labour_bag_packaging_details`, { headers }),
      axios.get(`${config.apiBaseUrl}/api/${config.version}/work-location/get_labour_work_location_details`, { headers }),
    ]);

    gangs.value = gangsRes.data;
    workItems.value = itemsRes.data;
    particulars.value = particularsRes.data;
    packagings.value = packagingsRes.data;
    locations.value = locationsRes.data;
  } catch (error) {
    console.error('Error fetching dropdowns:', error);
    toast.error('Failed to fetch form data.');
  }
};

// Edit Voucher
const editVoucherData = (voucher) => {
  if (!user || user.role !== 'admin') {
    toast.error('Only admin can edit vouchers');
    return;
  }
  isEditing.value = true;
  editVoucher.value = {
    id: voucher.id,
    vch_date: voucher.vch_date.split('T')[0],
    user_login_id: voucher.user_login_id,
    remarks: voucher.remarks,
    vouchers: voucher.voucher_gangs.map((gang, idx) => ({
      gang_id: gang.gang?.id,
      work_item_id: voucher.voucher_work_items[idx]?.work_item?.id,
      particulars_id: voucher.voucher_particulars[idx]?.particular?.id,
      bag_packaging_id: voucher.voucher_bag_packagings[idx]?.bag_packaging?.id,
      bag_nos: voucher.voucher_bag_packagings[idx]?.bags_nos,
      rate: gang.work_rate,
      labour_work_location_id_origin: voucher.voucher_locations[idx]?.location_origin?.id,
      labour_work_location_id_destination: voucher.voucher_locations[idx]?.location_destination?.id,
    })),
  };
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  isEditing.value = false;
  editVoucher.value = { id: null, vch_date: '', remarks: '', vouchers: [] };
};

const addVoucher = () => {
  if (!newVoucher.value.gang_id || !newVoucher.value.work_item_id || !newVoucher.value.particulars_id || !newVoucher.value.bag_packaging_id || !newVoucher.value.bag_nos || !newVoucher.value.rate || !newVoucher.value.labour_work_location_id_origin || !newVoucher.value.labour_work_location_id_destination) {
    toast.error('Please fill all fields');
    return;
  }
  editVoucher.value.vouchers.push({ ...newVoucher.value });
  clearVoucherForm();
  showVoucherModal.value = false;
};

const clearVoucherForm = () => {
  newVoucher.value = {
    gang_id: '',
    work_item_id: '',
    particulars_id: '',
    bag_packaging_id: '',
    bag_nos: 0,
    rate: 0,
    labour_work_location_id_origin: '',
    labour_work_location_id_destination: '',
    remarks: '',
  };
};

const deleteVoucher = (index) => {
  editVoucher.value.vouchers.splice(index, 1);
};

const handleSubmit = async () => {
  if (!editVoucher.value.vouchers.length) {
    toast.error('Please add at least one voucher row');
    return;
  }
  isSubmitting.value = true;
  try {
    const token = sessionStorage.getItem('token');
    const payload = {
      vch_date: editVoucher.value.vch_date,
      remarks: editVoucher.value.remarks,
      labour_gang: editVoucher.value.vouchers.map(v => ({
        gang_name: gangs.value.find(g => g.id === v.gang_id)?.gang_name,
        work_rate: Number(v.rate),
        remarks: editVoucher.value.remarks
      })),
      labour_work_item: editVoucher.value.vouchers.map(v => ({
        work_item_name: workItems.value.find(i => i.id === v.work_item_id)?.labour_item_name,
        remarks: editVoucher.value.remarks
      })),
      labour_work_particulars: editVoucher.value.vouchers.map(v => ({
        particular_name: particulars.value.find(p => p.id === v.particulars_id)?.work_name,
        remarks: editVoucher.value.remarks
      })),
      labour_bag_packaging_weight: editVoucher.value.vouchers.map(v => ({
        bag_weight: Number(packagings.value.find(p => p.id === v.bag_packaging_id)?.bag_weight),
        bags_nos: Number(v.bag_nos),
        gang_name: gangs.value.find(g => g.id === v.gang_id)?.gang_name,
        remarks: editVoucher.value.remarks
      })),
      labour_work_location_id_origin: editVoucher.value.vouchers.map(v => ({
        work_locations: locations.value.find(l => l.id === v.labour_work_location_id_origin)?.work_locations,
        remarks: editVoucher.value.remarks
      })),
      labour_work_location_id_destination: editVoucher.value.vouchers.map(v => ({
        work_locations: locations.value.find(l => l.id === v.labour_work_location_id_destination)?.work_locations,
        remarks: editVoucher.value.remarks
      })),
    };

    if (isEditing.value) {
      await axios.put(
        `${config.apiBaseUrl}/api/${config.version}/labour-payment-vouchers/update_voucher/${editVoucher.value.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Voucher updated successfully');
    }
    closeEditModal();
    fetchVoucher();
  } catch (error) {
    console.error('Error submitting voucher:', error);
    toast.error('Failed to submit voucher');
  } finally {
    isSubmitting.value = false;
  }
};

const printDetails = () => {
  const printContent = document.getElementById('printable-area').innerHTML;
  const originalContent = document.body.innerHTML;
  document.body.innerHTML = printContent;
  window.print();
  document.body.innerHTML = originalContent;
  window.location.reload(); // Reload to restore event listeners
};

const handleFormSubmit = () => {
  showAddVoucherModal.value = false;
  fetchVoucher();
};

onMounted(() => {
  fetchVoucher();
  fetchFirmDetails();
  fetchDropdowns();
});
</script>

<style scoped>
@media print {
  .print-ignore {
    display: none;
  }
}
</style>