<template>
  <v-container fluid>
    <v-card elevation="2" class="rounded-lg">
      <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
        Report Transactions
      </v-card-title>

      <v-card-text class="pa-4">
        <!-- Filter Input Fields -->
        <v-row class="mb-4">
          <v-col cols="12" md="4" lg="2">
            <v-text-field v-model="partyFilter" label="Party Name" placeholder="Party Name" variant="outlined"
              density="compact" hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="4" lg="2">
            <v-text-field v-model="brokerFilter" label="Broker Name" placeholder="Broker Name" variant="outlined"
              density="compact" hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="4" lg="2">
            <v-text-field v-model="transporterFilter" label="Transporter Name" placeholder="Transporter Name"
              variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="4" lg="2">
            <v-text-field v-model="stockItemFilter" label="Stock Item Name" placeholder="Stock Item Name"
              variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="4" lg="2">
            <v-text-field v-model="fromDate" label="From Date" type="date" variant="outlined" density="compact"
              hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="4" lg="2">
            <v-text-field v-model="toDate" label="To Date" type="date" variant="outlined" density="compact"
              hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="4" lg="2">
            <v-select v-model="TypeFilter" label="Transaction Type" :items="[
              { title: 'All Type', value: '' },
              { title: 'Purchase', value: true },
              { title: 'Sell', value: false }
            ]" variant="outlined" density="compact" hide-details></v-select>
          </v-col>
          <v-col cols="12" md="4" lg="2">
            <v-select v-model="PaymentStatusFilter" label="Payment Status" :items="[
              { title: 'All Status', value: '' },
              { title: 'Paid', value: 'Paid' },
              { title: 'Pending', value: 'Pending' },
              { title: 'Unpaid', value: 'Unpaid' }
            ]" variant="outlined" density="compact" hide-details></v-select>
          </v-col>
        </v-row>

        <!-- Table -->
        <v-table density="compact" class="elevation-1 border rounded mb-4" fixed-header height="500px">
          <thead class="bg-grey-lighten-3">
            <tr>
              <th rowspan="2" class="text-center border font-weight-bold">Sno</th>
              <th rowspan="2" class="text-center border font-weight-bold">Transaction Date</th>
              <th rowspan="2" class="text-center border font-weight-bold">Transaction Type</th>
              <th rowspan="2" class="text-left border font-weight-bold">
                RST Number<br />
                Bill Number
              </th>
              <th rowspan="2" class="text-left border font-weight-bold">
                Party Name <br />
                Broker Name
              </th>
              <th rowspan="2" class="text-left border font-weight-bold">
                Transporter Name <br />
                Vehicle Number
              </th>
              <th rowspan="2" class="text-center border font-weight-bold">Stock Details</th>
              <th rowspan="2" class="text-left border font-weight-bold">
                Final Weight (KG)
              </th>
              <th rowspan="2" class="text-left border font-weight-bold">Net Total</th>
              <th rowspan="2" class="text-left border font-weight-bold">Payment Amount</th>
              <th rowspan="2" class="text-left border font-weight-bold">Due Amount</th>
              <th rowspan="2" class="text-center border font-weight-bold">Payment Status</th>
              <th rowspan="2" class="text-center border font-weight-bold">WB Operator</th>
              <th rowspan="2" class="text-left border font-weight-bold">Remark</th>
              <th rowspan="2" class="text-left border font-weight-bold">Entry By</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(transaction, index) in filteredTransactions" :key="transaction.id"
              class="hover-bg-grey-lighten-5">
              <td class="border text-center">{{transactions.findIndex((t) => t.id === transaction.id) + 1}}</td>
              <td class="border text-center">{{ formatDate(transaction.transaction_date) }}</td>
              <td class="border text-center">{{ transaction.transaction_type ? 'Purchase' : 'Sell' }}</td>
              <td class="border">
                RST: {{ transaction.rst_number || '-' }}
                <br />
                BILL: {{ transaction.bill_number || '-' }}
              </td>
              <td class="border">
                <span class="font-weight-bold">PARTY:</span> {{ transaction.party?.party_name || '-' }}
                <br />
                <span class="font-weight-bold">BROKER:</span> {{ transaction.broker?.broker_name || '-' }}
              </td>
              <td class="border">
                TRANSPORTOR : {{ transaction.transportor?.transportor_name || '-' }}
                <br />
                VEHICLE No: {{ transaction.vehicle_number || 'N/A' }}
              </td>
              <td class="border pa-0">
                <v-table density="compact" v-if="transaction.transaction_stock_items?.length" class="ma-0">
                  <thead class="bg-grey-lighten-4">
                    <tr>
                      <th class="text-left px-2 py-1 font-weight-bold" style="font-size: 0.75rem;">SNo</th>
                      <th class="text-left px-2 py-1 font-weight-bold" style="font-size: 0.75rem;">Stock Item Name</th>
                      <th class="text-left px-2 py-1 font-weight-bold" style="font-size: 0.75rem;">Bags (Nos)</th>
                      <th class="text-left px-2 py-1 font-weight-bold" style="font-size: 0.75rem;">Weight (Qtl)</th>
                      <th class="text-left px-2 py-1 font-weight-bold" style="font-size: 0.75rem;">Rate</th>
                    </tr>
                  </thead>
          <tbody>
            <tr v-for="(item, idx) in transaction.transaction_stock_items" :key="idx">
              <td class="px-2 py-1" style="font-size: 0.75rem;">{{ idx + 1 }}</td>
              <td class="px-2 py-1" style="font-size: 0.75rem;">{{ item.stock_items?.stock_item_name || '-' }}
              </td>
              <td class="px-2 py-1" style="font-size: 0.75rem;">{{ item.number_of_bags || '-' }}</td>
              <td class="px-2 py-1" style="font-size: 0.75rem;">{{ (item.weight || '-').toFixed(2) }}</td>
              <td class="px-2 py-1" style="font-size: 0.75rem;">{{ item.rate || '-' }}</td>
            </tr>
            <tr class="bg-grey-lighten-4 font-weight-bold">
              <td class="px-2 py-1 text-center" colspan="2" style="font-size: 0.75rem;">Total</td>
              <td class="px-2 py-1" style="font-size: 0.75rem;">{{ getTotalStockBags(transaction) }}</td>
              <td class="px-2 py-1" style="font-size: 0.75rem;">{{ getTotalStockWeight(transaction) }}</td>
              <td class="px-2 py-1"></td>
            </tr>
          </tbody>
        </v-table>
        <span v-else class="text-grey text-caption pa-2 d-block">No stock details</span>
        </td>
        <td class="border">{{ getFinalWeight(transaction) }}</td>
        <td class="border">{{ getNetTotal(transaction) }}</td>
        <td class="border">{{ getTotalPayement(transaction) }}</td>
        <td class="border">{{ getAmountDue(transaction) }}</td>
        <td class="border text-center" :class="getPaymentStatus(transaction).color">
          {{ getPaymentStatus(transaction).status }}
        </td>
        <td class="border text-center">
          {{ transaction.weight_bridge_operator?.operator_name || 'N/A' }}
        </td>
        <td class="border">{{ transaction.remarks || 'N/A' }}</td>
        <td class="border">{{ transaction.user_login }}</td>
        </tr>
        <tr v-if="filteredTransactions.length === 0">
          <td colspan="15" class="text-center pa-4">No transactions found</td>
        </tr>
        </tbody>
        </v-table>

        <!-- Summary Footer -->
        <v-sheet class="bg-grey-lighten-4 pa-4 rounded border">
          <v-row align="center" justify="space-between">
            <v-col cols="12" md="3">
              <div class="text-subtitle-1 font-weight-bold">
                Total Transactions: {{ filteredTransactions.length }}
              </div>
            </v-col>
            <v-col cols="12" md="9">
              <div class="d-flex flex-wrap gap-4 justify-end">
                <span class="font-weight-medium">Total Quintals: {{ totalQuintalWeight }} Qtl</span>
                <span class="font-weight-medium">Total Net Amount: ₹{{ totalNetAmount }}</span>
                <span class="font-weight-medium">Total Paid Amount: ₹{{ totalPaidAmount }}</span>
                <span class="font-weight-medium">Total Due Amount: ₹{{ totalDueAmount }}</span>
              </div>
            </v-col>
          </v-row>
        </v-sheet>

        <!-- Download Button -->
        <div class="d-flex justify-center mt-6">
          <v-btn color="primary" size="large" prepend-icon="mdi-microsoft-excel" @click="downloadReport">
            Download Excel Report
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import millService from '@/services/millService'
import adminService from '@/services/adminService'
import { useToast } from 'vue-toastification'

defineOptions({
  name: 'ReportTransactions'
})

const toast = useToast()
const transactions = ref([])
const firm = ref([])
// 🔹 Filter fields
const partyFilter = ref('')
const brokerFilter = ref('')
const transporterFilter = ref('')
const stockItemFilter = ref('')
const fromDate = ref('')
const toDate = ref('')
const TypeFilter = ref('')
const PaymentStatusFilter = ref('')


const filteredTransactions = computed(() => {
  return transactions.value.filter((t) => {
    const matchParty = partyFilter.value
      ? t.party?.party_name?.toLowerCase().includes(partyFilter.value.toLowerCase())
      : true;
    const matchBroker = brokerFilter.value
      ? t.broker?.broker_name?.toLowerCase().includes(brokerFilter.value.toLowerCase())
      : true;
    const matchTransporter = transporterFilter.value
      ? t.transportor?.transportor_name?.toLowerCase().includes(transporterFilter.value.toLowerCase())
      : true;
    const matchStockItem = stockItemFilter.value
      ? t.transaction_stock_items?.some((item) =>
        item.stock_items?.stock_item_name?.toLowerCase().includes(stockItemFilter.value.toLowerCase())
      )
      : true;
    const matchType = TypeFilter.value !== '' ? t.transaction_type === TypeFilter.value : true;
    const matchDate = fromDate.value || toDate.value
      ? (() => {
        const txDate = new Date(t.transaction_date);
        const from = fromDate.value ? new Date(fromDate.value) : null;
        const to = toDate.value ? new Date(toDate.value) : null;
        return (!from || txDate >= from) && (!to || txDate <= to);
      })()
      : true;
    const matchStatus = PaymentStatusFilter.value
      ? getPaymentStatus(t).status === PaymentStatusFilter.value
      : true;
    return matchParty && matchBroker && matchTransporter && matchStockItem && matchType && matchDate && matchStatus;
  });
});

const totalQuintalWeight = computed(() => {
  return filteredTransactions.value
    .reduce((sum, t) => {
      const weightQtl = Number(getFinalWeight(t) / 100);

      // If true → add, if false → subtract
      return t.transaction_type === true
        ? sum + weightQtl
        : sum - weightQtl;
    }, 0)
    .toFixed(2);
});

// Calculate total paid amount
const totalPaidAmount = computed(() => {
  return filteredTransactions.value.reduce((sum, t) => sum + Number(getTotalPayement(t)), 0);
});
// Calculate total net amount and total due amount
const totalNetAmount = computed(() => {
  return filteredTransactions.value.reduce((sum, t) => sum + Number(getNetTotal(t)), 0);
});
const totalDueAmount = computed(() => {
  return filteredTransactions.value.reduce((sum, t) => sum + Number(getAmountDue(t)), 0);
});
const getTotalStockBags = (transaction) => {
  return transaction.transaction_stock_items?.reduce((sum, item) => sum + Number(item.number_of_bags || 0), 0) || 0;
};
const getTotalStockWeight = (transaction) => {
  return transaction.transaction_stock_items?.reduce((sum, item) => sum + parseFloat(item.weight || 0), 0).toFixed(2) || '0.00';
};
// Calculate Net Weight (Gross Weight - Tare Weight)
const getNetWeight = (transaction) => {
  if (!transaction.gross_weight || !transaction.tare_weight) return '-'
  return (transaction.gross_weight - transaction.tare_weight).toFixed(2)
}
// Calculate Final Weight (Net Weight - Total Packaging Weight, converted to Quintals)
const getFinalWeight = (transaction) => {
  if (!transaction.gross_weight || !transaction.tare_weight) return '-'
  const netWeight = getNetWeight(transaction);
  //convert to grams to kg
  const totalPackagingWeight =
    transaction.transaction_packaging_details?.reduce(
      (acc, detail) =>
        acc + (Number(detail.bag_nos || 0) * Number(detail.packaging?.bag_weight || 0)) / 1000,
      0,
    ) || 0
  return transaction.transaction_type === true ? (netWeight - totalPackagingWeight).toFixed(2) : netWeight;
}
// Calculate Gross Total
const getGrossTotal = (transaction) => {
  if (!transaction.transaction_stock_items?.length) return '-'
  const total = transaction.transaction_stock_items.reduce(
    (sum, item) => sum + Number(item.weight || 0) * Number(item.rate || 0),
    0,
  )
  return Math.round(total)
}

// Calculate Net Total (Gross Total - deductions)
const getNetTotal = (transaction) => {
  const gross = Number(getGrossTotal(transaction));
  if (gross === 0) return '0.00';
  const deductions =
    transaction.transaction_allowance_deduction_details?.reduce(
      (sum, deduction) => {
        const amount = Number(deduction.allowance_deduction_amount || 0);
        return sum + (deduction.is_allowance ? amount : -amount);
      },
      0
    ) || 0;
  return Math.round(gross + deductions);
}
const getTotalPayement = (transaction) => {
  const payment = transaction.transaction_payments_mill_operations?.reduce((sum, p) => sum + Number(p.payment_amount || 0), 0) || 0;
  return payment
}
const getAmountDue = (transaction) => {
  const paid = Number(getTotalPayement(transaction));
  const total = Number(getNetTotal(transaction));
  return total - paid;
}
const getPaymentStatus = (transaction) => {
  const netTotal = Number(getNetTotal(transaction));
  const AmountDue = getAmountDue(transaction);
  const totalPaid = transaction.transaction_payments_mill_operations?.reduce((sum, p) => sum + Number(p.payment_amount || 0), 0) || 0;
  if (totalPaid >= netTotal) {
    return { status: 'Paid', color: 'text-success' };
  } else if (AmountDue > 0) {
    return { status: 'Pending', color: 'text-purple' };
  } else if (netTotal === 0 && totalPaid === 0) {
    return { status: 'Unpaid', color: 'text-error' };
  }
  return { status: 'Unknown', color: 'text-grey' };
};
// fetch firm details
const fetchFirmDetails = async () => {
  try {
    const response = await adminService.getFirmDetails()

    if (response.status === 200 && response.data) {
      firm.value = {
        firm_name: response.data.firm_name || 'Unknown Firm',
        firm_address: response.data.firm_address || 'Unknown Address',
        page_size: response.data.page_size
      }
    } else {
      firm.value = {
        firm_name: 'Unavailable',
        firm_address: 'Unavailable',
        page_size: ''
      }
      toast.error('Failed to fetch firm details: Invalid response')
    }
  } catch (err) {
    console.error('Failed to fetch firm details:', err)
    firm.value = {
      firm_name: 'Error',
      firm_address: 'Error',
      page_size: ''
    }
    toast.error('Failed to fetch firm details')
  }
};
// Fetch transactions from the backend
const fetchTransactions = async () => {
  try {
    const response = await millService.getTransactions()
    transactions.value = response.data
  } catch (error) {
    console.error(
      'Error fetching transactions:',
      error.response?.data,
      error.response?.status,
      error.message,
    )
  }
}

const downloadReport = async () => {
  const params = {};

  if (partyFilter.value) params.party_name = partyFilter.value;
  if (brokerFilter.value) params.broker_name = brokerFilter.value;
  if (transporterFilter.value) params.transporter_name = transporterFilter.value;
  if (stockItemFilter.value) params.stock_item_name = stockItemFilter.value;
  if (fromDate.value) params.from_date = fromDate.value;
  if (toDate.value) params.to_date = toDate.value;

  params.download = 'true';

  try {
    const response = await millService.downloadTransactionReport(params);

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'transactions_report.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Download failed:', error);
    toast.error('Failed to download transactions report.');
  }
};

// Format date for display (e.g., convert '2025-08-04' to '04/08/2025')
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// Fetch data on component mount
onMounted(() => {
  fetchTransactions()
  fetchFirmDetails()
})
</script>

<style scoped>
.hover-bg-grey-lighten-5:hover {
  background-color: #f5f5f5 !important;
}

.text-purple {
  color: #9C27B0 !important;
}
</style>
