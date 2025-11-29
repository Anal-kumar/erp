<template>
  <v-dialog :model-value="props.showDetailsModal" @update:model-value="emit('close')" max-width="1200px" scrollable>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center py-3 px-4 bg-primary text-white print-ignore">
        <span class="text-h6">Transaction Details</span>
        <v-btn icon="mdi-close" variant="text" density="comfortable" @click="emit('close')"></v-btn>
      </v-card-title>

      <v-card-text class="pa-4">
        <div v-if="props.transaction">
          <!-- Transaction Information -->
          <v-table density="compact" class="transaction-table border">
            <tbody>
              <tr>
                <td id="modal-title" class="border text-center pa-2 bg-grey-lighten-4" colspan="9">
                  <div class="text-h6 font-weight-bold">{{ props.firm.firm_short_name || 'Unknown Firm' }} Receipt</div>
                </td>
              </tr>
              <tr>
                <td class="border font-weight-bold" style="width: 8%">S No</td>
                <td class="border" style="width: 8%">{{ props.transactionIndex !== null ? props.transactionIndex + 1 :
                  '-' }}</td>
                <td class="border font-weight-bold" style="width: 8%">RST Number</td>
                <td class="border" style="width: 8%">{{ props.transaction.rst_number || '-' }}</td>
                <td class="border font-weight-bold" style="width: 8%">Bill Number</td>
                <td class="border" style="width: 8%">{{ props.transaction.bill_number || '-' }}</td>
                <td class="border font-weight-bold" style="width: 16%">Transaction Date</td>
                <td class="border" style="width: 16%" colspan="2">{{ formatDate(props.transaction.transaction_date) }}
                </td>
              </tr>
              <tr>
                <td class="border font-weight-bold">Transporter Name</td>
                <td class="border" colspan="3">{{ props.transaction.transportor?.transportor_name ||
                  props.transaction.transportor_name || '-' }}</td>
                <td class="border font-weight-bold">Party Name</td>
                <td class="border" colspan="4">{{ props.transaction.party?.party_name || props.transaction.party_name ||
                  '-' }}</td>
              </tr>
              <tr>
                <td class="border font-weight-bold">Party Address</td>
                <td class="border" colspan="3">{{ props.transaction.party?.party_address ||
                  props.transaction.party_address || '-' }}</td>
                <td class="border font-weight-bold">Party Mobile Number</td>
                <td class="border" colspan="4">{{ props.transaction.party?.party_mob_no ||
                  props.transaction.party_mob_no || '-' }}</td>
              </tr>
              <tr>
                <td class="border font-weight-bold">Broker Name</td>
                <td class="border" colspan="3">{{ props.transaction.broker?.broker_name || props.transaction.broker_name
                  || '-' }}</td>
                <td class="border font-weight-bold">Vehicle Number</td>
                <td class="border" colspan="4">{{ props.transaction.vehicle_number || '-' }}</td>
              </tr>
              <tr>
                <td class="border font-weight-bold">Net Weight (KG)</td>
                <td class="border" colspan="3">{{ getNetWeight(props.transaction) }}</td>
                <td class="border font-weight-bold">Packaging Weight</td>
                <td class="border" colspan="2">{{ totalPackagingWeight }} Qtl</td>
                <td class="border font-weight-bold">Final Weight (Qtl)</td>
                <td class="border">{{ getFinalWeightQtl(props.transaction) }}</td>
              </tr>

              <!-- Packaging Details -->
              <tr class="bg-grey-lighten-3">
                <td class="border text-center pa-2" colspan="9">
                  <div class="text-subtitle-1 font-weight-bold">Packaging Details</div>
                </td>
              </tr>
              <tr class="bg-grey-lighten-4 font-weight-bold">
                <td class="border text-center">SNo</td>
                <td class="border text-center" colspan="5">Packaging Type</td>
                <td class="border text-center">Packaging Weight</td>
                <td class="border text-center" colspan="2">Bag Nos</td>
              </tr>
              <tr v-for="(pkg, index) in props.transaction.transaction_packaging_details" :key="'pkg-' + index">
                <td class="border text-center">{{ index + 1 }}</td>
                <td class="border text-center" colspan="5">{{ pkg.packaging?.packaging_name || pkg.packaging_name || '-'
                }}</td>
                <td class="border text-center">
                  {{ isValidNumber(pkg.packaging?.bag_weight) ? Number(pkg.packaging?.bag_weight) :
                    isValidNumber(pkg.bag_weight) ? Number(pkg.bag_weight) : '-' }}
                </td>
                <td class="border text-center" colspan="2">{{ pkg.bag_nos || '-' }}</td>
              </tr>
              <tr class="bg-grey-lighten-4 font-weight-bold">
                <td class="border text-center" colspan="7">Total</td>
                <td class="border text-center" colspan="2">{{ totalPackagingBags }} Bags</td>
              </tr>

              <!-- Stock Items -->
              <tr class="bg-grey-lighten-3">
                <td class="border text-center pa-2" colspan="9">
                  <div class="text-subtitle-1 font-weight-bold">
                    {{ props.transaction.transaction_type === true ? 'Rice / Paddy Purchasing Details' : 'Rice / Paddy Selling Details' }}
                  </div>
                </td>
              </tr>
              <tr class="bg-grey-lighten-4 font-weight-bold">
                <td class="border text-center">SNo</td>
                <td class="border text-center">Stock Item</td>
                <td class="border text-center">Bags (Nos)</td>
                <td class="border text-center">Weight (Qtl)</td>
                <td class="border text-center">Rate (Rs./Qtl)</td>
                <td class="border text-center">=</td>
                <td class="border text-center" colspan="3">Amount (Rs.)</td>
              </tr>
              <tr v-for="(item, index) in props.transaction.transaction_stock_items" :key="'item-' + index">
                <td class="border text-center">{{ index + 1 }}</td>
                <td class="border text-center">{{ item.stock_items?.stock_item_name || item.stock_item_name || '-' }}
                </td>
                <td class="border text-center">{{ item.number_of_bags || '-' }}</td>
                <td class="border text-center">{{ isValidNumber(item.weight) ? Number(item.weight).toFixed(2) : '-' }}
                </td>
                <td class="border text-center">{{ isValidNumber(item.rate) ? Number(item.rate).toFixed(2) : '-' }}</td>
                <td class="border text-center">=</td>
                <td class="border text-center" colspan="3">{{ getAmount(item) }}</td>
              </tr>
              <tr class="bg-grey-lighten-4 font-weight-bold">
                <td class="border text-center" colspan="2">Total</td>
                <td class="border text-center">{{ totalStockBags }} Bags</td>
                <td class="border text-center">{{ totalStockWeight }} Qtl</td>
                <td class="border text-center"></td>
                <td class="border text-center">=</td>
                <td class="border text-center" colspan="3">{{ totalAmount }}</td>
              </tr>

              <!-- Allowance/Deduction -->
              <tr v-for="(entry, index) in props.transaction.transaction_allowance_deduction_details"
                :key="'ad-' + index">
                <td class="border text-center" colspan="3">{{ entry.allowance_deduction_name || '-' }}</td>
                <td class="border text-center" colspan="6">
                  <span :class="entry.is_allowance ? 'text-green' : 'text-red'">
                    ₹ {{ isValidNumber(entry.allowance_deduction_amount) ?
                      Number(entry.allowance_deduction_amount).toFixed(2) : '-' }}
                  </span>
                </td>
              </tr>

              <!-- Totals -->
              <tr class="bg-grey-lighten-4 font-weight-bold">
                <td class="border text-center" colspan="3">Total Amount</td>
                <td class="border text-center" colspan="6">₹ {{ netTotal }}</td>
              </tr>
              <tr class="bg-grey-lighten-4 font-weight-bold">
                <td class="border text-center" colspan="3">Paid Amount</td>
                <td class="border text-center" colspan="6">₹ {{ totalPaymentAmount }}</td>
              </tr>
              <tr class="bg-grey-lighten-4 font-weight-bold">
                <td class="border text-center" colspan="3">Amount Due</td>
                <td class="border text-center" colspan="6">₹ {{ DueAmount }}</td>
              </tr>

              <!-- Footer Info -->
              <tr>
                <td class="border text-center">Time</td>
                <td class="border text-center">{{ formatTime(props.transaction.time_stamp) }}</td>
                <td class="border font-weight-bold">WB Operator</td>
                <td class="border" colspan="3">{{ props.transaction.weight_bridge_operator?.operator_name ||
                  props.transaction.operator_name || '-' }}</td>
                <td class="border font-weight-bold">Payment Status</td>
                <td class="border" colspan="2" :class="paymentStatus.color">{{ paymentStatus.status }}</td>
              </tr>
              <tr>
                <td class="border" colspan="4" style="height: 100px;"></td>
                <td class="border" colspan="5" style="height: 100px;"></td>
              </tr>
              <tr>
                <td class="border text-center" colspan="4">
                  Signature of WB Operator: {{ props.transaction.weight_bridge_operator?.operator_name ||
                    props.transaction.operator_name || '-' }}
                </td>
                <td class="border text-center" colspan="5">
                  Signature {{ props.firm.firm_short_name }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
        <div v-else class="text-center text-error pa-4">No transaction data available.</div>
      </v-card-text>

      <v-card-actions class="justify-center pa-4 print-ignore">
        <v-btn color="primary" variant="elevated" prepend-icon="mdi-printer" @click="printDetails">
          Print
        </v-btn>
        <v-btn color="error" variant="elevated" prepend-icon="mdi-close" @click="emit('close')">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  showDetailsModal: {
    type: Boolean,
    required: true,
  },
  transaction: {
    type: Object,
    default: null,
  },
  firm: {
    type: Object,
    default: () => ({ firm_name: 'Unknown Firm', firm_address: 'Unknown Address', firm_short_name: 'Unknown Firm' }),
  },
  transactionIndex: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(['close']);

// Utility Methods
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? '-'
    : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
};

const formatTime = (timestamp) => {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const isValidNumber = (value) => {
  return value !== null && value !== undefined && !isNaN(Number(value)) && Number(value) >= 0;
};

const getNetWeight = (transaction) => {
  const gross = Number(transaction?.gross_weight || 0);
  const tare = Number(transaction?.tare_weight || 0);
  return (gross - tare).toFixed(2);
};

const getFinalWeight = (transaction) => {
  const net = getNetWeight(transaction);
  if (net === '0.00') return '0.00';
  const totalPackagingWeightKg = transaction?.transaction_packaging_details?.reduce(
    (acc, detail) => acc + (Number(detail.bag_nos || 0) * Number(detail.packaging?.bag_weight || detail.bag_weight || 0)) / 1000,
    0
  ) || 0;
  return transaction.transaction_type === true ? (Number(net) - totalPackagingWeightKg).toFixed(2) : net;
};

const getFinalWeightQtl = (transaction) => {
  const finalWeightKg = getFinalWeight(transaction);
  if (!finalWeightKg || isNaN(finalWeightKg)) {
    return "0.00";
  }
  return (Number(finalWeightKg) / 100).toFixed(2);
};

const getGrossTotal = (transaction) => {
  if (!transaction?.transaction_stock_items?.length) {
    return '0.00';
  }
  const total = transaction.transaction_stock_items.reduce(
    (sum, item) => sum + Number(item.weight || 0) * Number(item.rate || 0),
    0
  );
  return total.toFixed(2);
};

const getNetTotal = (transaction) => {
  const gross = Number(getGrossTotal(transaction)) || 0;
  if (gross === 0) {
    return '0.00';
  }
  const deductions = transaction?.transaction_allowance_deduction_details?.reduce(
    (sum, deduction) => {
      const amount = Number(deduction.allowance_deduction_amount || 0);
      return sum + (deduction.is_allowance ? amount : -amount);
    },
    0
  ) || 0;
  return (gross + deductions).toFixed(2);
};

const totalPackagingBags = computed(() => {
  if (!props.transaction?.transaction_packaging_details) return 0;
  return props.transaction.transaction_packaging_details.reduce(
    (sum, detail) => sum + Number(detail.bag_nos || 0),
    0
  ) || 0;
});

const totalPackagingWeight = computed(() => {
  if (!props.transaction?.transaction_packaging_details) return '0.00';
  const kg = props.transaction.transaction_packaging_details.reduce(
    (acc, detail) => acc + (Number(detail.bag_nos || 0) * Number(detail.packaging?.bag_weight || detail.bag_weight || 0)) / 1000,
    0
  );
  return (kg / 100).toFixed(2) || '0.00';
});

const totalStockBags = computed(() => {
  if (!props.transaction?.transaction_stock_items) return 0;
  return props.transaction.transaction_stock_items.reduce(
    (sum, item) => sum + Number(item.number_of_bags || 0),
    0
  ) || 0;
});

const totalStockWeight = computed(() => {
  if (!props.transaction?.transaction_stock_items) return '0.00';
  return props.transaction.transaction_stock_items.reduce(
    (sum, item) => sum + Number(item.weight || 0),
    0
  ).toFixed(2) || '0.00';
});

const getAmount = (item) => {
  if (isValidNumber(item.weight) && isValidNumber(item.rate)) {
    return Math.round(item.weight * item.rate);
  }
  return '0.00';
};

const totalAmount = computed(() => {
  if (!props.transaction?.transaction_stock_items) return '0.00';
  const total = props.transaction.transaction_stock_items.reduce(
    (sum, item) => {
      const weight = Number(item.weight || 0);
      const rate = Number(item.rate || 0);
      return sum + (isValidNumber(weight) && isValidNumber(rate) ? weight * rate : 0);
    },
    0
  );
  return Math.round(total);
});

const totalPaymentAmount = computed(() => {
  if (!props.transaction?.transaction_payments_mill_operations) return '0.00';
  const total = props.transaction.transaction_payments_mill_operations.reduce(
    (sum, payment) => {
      const amount = Number(payment.payment_amount || 0);
      return sum + (isValidNumber(amount) ? amount : 0);
    },
    0
  );
  return total >= 0 ? total.toFixed(2) : '0.00';
});

const netTotal = computed(() => {
  if (!props.transaction) {
    return '0.00';
  }
  return Math.round(getNetTotal(props.transaction));
});

const DueAmount = computed(() => {
  const total = Number(netTotal.value);
  const payment = Number(totalPaymentAmount.value);
  const due = total - payment;
  return due >= 0 ? due.toFixed(2) : '0.00';
});

const paymentStatus = computed(() => {
  const due = Number(DueAmount.value) || 0;
  const total = Number(netTotal.value) || 0;
  if (due === 0) return { status: 'Paid', color: 'text-green' };
  if (due > 0) return { status: 'Pending', color: 'text-purple' };
  if (total === 0) return { status: 'Unpaid', color: 'text-red' };
  return { status: 'Overpaid', color: 'text-orange' };
});

const printDetails = () => {
  window.print();
};
</script>

<style scoped>
.transaction-table {
  width: 100%;
  border-collapse: collapse;
}

.transaction-table td {
  padding: 8px;
  font-size: 0.875rem;
}

@media print {
  .print-ignore {
    display: none !important;
  }

  .v-dialog {
    box-shadow: none !important;
    position: static !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
  }

  .v-card {
    box-shadow: none !important;
    border: none !important;
  }

  .v-card-text {
    padding: 0 !important;
  }

  /* Force colors for print */
  .text-green {
    color: #4CAF50 !important;
    -webkit-print-color-adjust: exact;
  }

  .text-red {
    color: #F44336 !important;
    -webkit-print-color-adjust: exact;
  }

  .text-purple {
    color: #9C27B0 !important;
    -webkit-print-color-adjust: exact;
  }

  .text-orange {
    color: #FF9800 !important;
    -webkit-print-color-adjust: exact;
  }
}
</style>