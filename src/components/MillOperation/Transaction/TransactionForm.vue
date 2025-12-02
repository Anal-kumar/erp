<template>
  <v-container fluid>
    <v-card class="mx-auto" elevation="2">
      <v-card-title class="text-h5 font-weight-bold text-center py-4">Transaction Form</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleSubmit">
          <!-- Transaction Information -->
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="text-subtitle-1">Transaction Information</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field v-model="transaction.transaction_date" label="Transaction Date" type="date"
                    variant="outlined" density="compact"></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-select v-model="transaction.transaction_type"
                    :items="[{ title: 'Sell', value: false }, { title: 'Purchase', value: true }]" item-title="title"
                    item-value="value" label="Transaction Type" variant="outlined" density="compact"></v-select>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field v-model="transaction.rst_number" label="RST Number" placeholder="Enter RST Number"
                    variant="outlined" density="compact"
                    @input="transaction.rst_number = $event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')"></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field v-model="transaction.bill_number" label="Bill Number" placeholder="Enter Bill Number"
                    variant="outlined" density="compact"
                    @input="transaction.bill_number = $event.target.value.toUpperCase().replace(/[^A-Z0-9\-_/]/g, '')"></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-autocomplete v-model="transaction.party_name" :items="parties" item-title="party_name"
                    item-value="party_name" label="Party Name" variant="outlined" density="compact"></v-autocomplete>
                </v-col>
                <v-col cols="12" md="4">
                  <v-autocomplete v-model="transaction.broker_name" :items="brokers" item-title="broker_name"
                    item-value="broker_name" label="Broker Name" variant="outlined" density="compact"></v-autocomplete>
                </v-col>
                <v-col cols="12" md="4">
                  <v-autocomplete v-model="transaction.transportor_name" :items="transportors"
                    item-title="transportor_name" item-value="transportor_name" label="Transportor Name"
                    variant="outlined" density="compact"></v-autocomplete>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field v-model="transaction.vehicle_number" label="Vehicle Number"
                    placeholder="Enter Vehicle Number" variant="outlined" density="compact" maxlength="10"
                    @input="transaction.vehicle_number = $event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')"></v-text-field>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Packaging Details -->
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="d-flex justify-space-between align-center">
              <span class="text-subtitle-1">Packaging Details</span>
              <v-btn color="primary" size="small" prepend-icon="mdi-plus" @click="showPackagingModal = true">
                Add Packaging
              </v-btn>
            </v-card-title>
            <v-card-text v-if="packagingDetails.length > 0">
              <v-table density="compact" class="border">
                <thead>
                  <tr>
                    <th class="text-center">Packaging Type</th>
                    <th class="text-center">Bag Weight</th>
                    <th class="text-center">Bag Nos</th>
                    <th class="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(packaging, index) in packagingDetails" :key="index">
                    <td class="text-center">{{ packaging.type }}</td>
                    <td class="text-center">{{ packaging.bag_weight }} Grams</td>
                    <td class="text-center">{{ packaging.bag_nos }}</td>
                    <td class="text-center">
                      <v-btn icon="mdi-delete" size="x-small" color="error" variant="text"
                        @click="packagingDetails.splice(index, 1)"></v-btn>
                    </td>
                  </tr>
                  <tr class="bg-grey-lighten-4 font-weight-bold">
                    <td class="text-center">Total</td>
                    <td class="text-center">{{ bagsWeightKg }} KG</td>
                    <td class="text-center">{{ noOfPackagingBags }} Bags</td>
                    <td></td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>

          <!-- Weight Details -->
          <v-card variant="outlined" class="mb-4">
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field v-model="transaction.gross_weight" label="Gross Weight (KG)" type="number"
                    variant="outlined" density="compact" min="0" step="0.01" @keydown.up.prevent
                    @keydown.down.prevent></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field v-model="transaction.tare_weight" label="Tare Weight (KG)" type="number"
                    variant="outlined" density="compact" @keydown.up.prevent @keydown.down.prevent></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field :model-value="netWeight" label="Net Weight (KG)" variant="outlined" density="compact"
                    readonly bg-color="grey-lighten-4"></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field :model-value="bagsWeightKg" label="Bags Weight (kg)" variant="outlined"
                    density="compact" readonly bg-color="grey-lighten-4"></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field :model-value="finalWeightKg" label="Final Weight (KG)" variant="outlined"
                    density="compact" readonly bg-color="grey-lighten-4"></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field :model-value="finalWeightQtl" label="Final Weight (Qtl)" variant="outlined"
                    density="compact" readonly bg-color="grey-lighten-4"></v-text-field>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Stock Items -->
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="d-flex justify-space-between align-center">
              <span class="text-subtitle-1">Stock Items</span>
              <v-btn color="grey-darken-2" size="small" prepend-icon="mdi-plus" @click="showStockDetailsModal = true">
                Add Stock Details
              </v-btn>
            </v-card-title>
            <v-card-text v-if="stockItemDetails.length > 0">
              <v-table density="compact" class="border">
                <thead>
                  <tr>
                    <th class="text-center">SNO</th>
                    <th class="text-center">Stock Item</th>
                    <th class="text-center">Bags (Nos)</th>
                    <th class="text-center">Weight (Qtl)</th>
                    <th class="text-center">Rate (Rs./Qtl)</th>
                    <th class="text-center">Remarks</th>
                    <th class="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in stockItemDetails" :key="index">
                    <td class="text-center">{{ index + 1 }}</td>
                    <td class="text-center">{{ item.stock_item }}</td>
                    <td class="text-center">{{ item.bags_nos }}</td>
                    <td class="text-center">{{ item.weight }}</td>
                    <td class="text-center">{{ item.rate }}</td>
                    <td class="text-center">{{ item.remarks }}</td>
                    <td class="text-center">
                      <v-btn icon="mdi-delete" size="x-small" color="error" variant="text"
                        @click="stockItemDetails.splice(index, 1)"></v-btn>
                    </td>
                  </tr>
                  <tr class="bg-grey-lighten-4 font-weight-bold">
                    <td class="text-center" colspan="2">Total</td>
                    <td class="text-center">{{ totalStockBags }} Bags</td>
                    <td class="text-center">{{ totalStockWeight }} Qtl</td>
                    <td class="text-center">Avg Rate: ₹ {{ AverageStockRate }}</td>
                    <td colspan="2"></td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>

          <!-- Gross Total -->
          <v-row class="mb-4">
            <v-col cols="12" md="4">
              <v-text-field :model-value="grossTotal" label="Gross Total (Rs.)" variant="outlined" density="compact"
                readonly bg-color="grey-lighten-4"></v-text-field>
            </v-col>
          </v-row>

          <!-- Allowances and Deductions -->
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="d-flex justify-space-between align-center">
              <span class="text-subtitle-1">Allowances and Deductions</span>
              <v-btn color="warning" size="small" prepend-icon="mdi-plus" @click="showAllowanceDeductionModal = true">
                Add Allowance/Deduction
              </v-btn>
            </v-card-title>
            <v-card-text v-if="allowanceDeductions.length > 0">
              <v-table density="compact" class="border">
                <thead>
                  <tr>
                    <th class="text-center">Type</th>
                    <th class="text-center">Name</th>
                    <th class="text-center">Amount</th>
                    <th class="text-center">Remarks</th>
                    <th class="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(entry, index) in allowanceDeductions" :key="index">
                    <td class="text-center">{{ entry.is_allowance === true ? 'Allowance' : 'Deduction' }}</td>
                    <td class="text-center">{{ entry.allowance_deduction_name }}</td>
                    <td class="text-center" :class="entry.is_allowance ? 'text-green' : 'text-red'">
                      ₹{{ entry.allowance_deduction_amount }}
                    </td>
                    <td class="text-center">{{ entry.remarks }}</td>
                    <td class="text-center">
                      <v-btn icon="mdi-delete" size="x-small" color="error" variant="text"
                        @click="allowanceDeductions.splice(index, 1)"></v-btn>
                    </td>
                  </tr>
                  <tr class="bg-grey-lighten-4 font-weight-bold">
                    <td class="text-center" colspan="2">Total</td>
                    <td class="text-center">₹ {{ totalAllowanceDeduction }}</td>
                    <td colspan="2"></td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>

          <!-- Net Total -->
          <v-row class="mb-4">
            <v-col cols="12" md="4">
              <v-text-field :model-value="netTotal" label="Net Total (Rs.)" variant="outlined" density="compact"
                readonly bg-color="grey-lighten-4"></v-text-field>
            </v-col>
          </v-row>

          <!-- Payments -->
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="d-flex justify-space-between align-center">
              <span class="text-subtitle-1">Payments Information</span>
              <v-btn color="success" size="small" prepend-icon="mdi-plus" @click="showPaymentModal = true">
                Add Payment
              </v-btn>
            </v-card-title>
            <v-card-text v-if="payments.length > 0">
              <v-table density="compact" class="border">
                <thead>
                  <tr>
                    <th class="text-center">Date</th>
                    <th class="text-center">Amount (Rs.)</th>
                    <th class="text-center">Remarks</th>
                    <th class="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(payment, index) in payments" :key="index">
                    <td class="text-center">
                      {{ new Date(payment.payment_date).toLocaleString('en-GB', {
                        day: '2-digit', month: '2-digit',
                        year: 'numeric'
                      }) }}
                    </td>
                    <td class="text-center">₹ {{ payment.payment_amount }}</td>
                    <td class="text-center">{{ payment.payment_remarks }}</td>
                    <td class="text-center">
                      <v-btn icon="mdi-delete" size="x-small" color="error" variant="text"
                        @click="payments.splice(index, 1)"></v-btn>
                    </td>
                  </tr>
                  <tr class="bg-grey-lighten-4 font-weight-bold">
                    <td class="text-center">Total</td>
                    <td class="text-center">₹ {{ totalPayments }}</td>
                    <td colspan="2"></td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>

          <!-- Unloading -->
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="d-flex justify-space-between align-center">
              <span class="text-subtitle-1">Unloading Details</span>
              <v-btn color="info" size="small" prepend-icon="mdi-plus" @click="showUnloadingModal = true">
                Add Unloading
              </v-btn>
            </v-card-title>
            <v-card-text v-if="unloadingDetails.length > 0">
              <v-table density="compact" class="border">
                <thead>
                  <tr>
                    <th class="text-center">Godown Name</th>
                    <th class="text-center">Bag (Nos)</th>
                    <th class="text-center">Remarks</th>
                    <th class="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(unloading, index) in unloadingDetails" :key="index">
                    <td class="text-center">{{ unloading.godown_name }}</td>
                    <td class="text-center">{{ unloading.bag_nos }}</td>
                    <td class="text-center">{{ unloading.remarks }}</td>
                    <td class="text-center">
                      <v-btn icon="mdi-delete" size="x-small" color="error" variant="text"
                        @click="unloadingDetails.splice(index, 1)"></v-btn>
                    </td>
                  </tr>
                  <tr class="bg-grey-lighten-4 font-weight-bold">
                    <td class="text-center">Total</td>
                    <td class="text-center">{{ totalUnloadingBags }} Bags</td>
                    <td colspan="2"></td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>

          <!-- WB Operator & Remarks -->
          <v-row>
            <v-col cols="12" md="4">
              <v-autocomplete v-model="transaction.operator_name" :items="wbOperators" item-title="operator_name"
                item-value="operator_name" label="WB Operator Name" variant="outlined"
                density="compact"></v-autocomplete>
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="transaction.remarks" label="Remarks" variant="outlined" density="compact" rows="3"
                @input="transaction.remarks = $event.target.value.toUpperCase()"></v-textarea>
            </v-col>
          </v-row>

          <!-- Submit Button -->
          <v-row class="mt-4">
            <v-col cols="12" class="text-center">
              <v-btn type="submit" color="primary" size="large" :loading="isSubmitting">
                Submit
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Modals -->
    <AllowanceDeductModal v-if="showAllowanceDeductionModal" :noOfPackagingBags="noOfPackagingBags"
      :finalWeightQtl="Number(finalWeightQtl)" :grossTotal="grossTotal" :brokerage_rate="selectedBrokerRate"
      @add="addAllowanceEntry" @close="showAllowanceDeductionModal = false" />

    <PackagingModal v-if="showPackagingModal" :packagings="packagings" @add="addPackaging"
      @close="showPackagingModal = false" />

    <StockItmeModal v-if="showStockDetailsModal" :stock-items="stockItems" :final-weight-qtl="Number(finalWeightQtl)"
      :totalPackagingBags="noOfPackagingBags" @add="addStockItem" @close="showStockDetailsModal = false" />

    <PaymentModal v-if="showPaymentModal" :payments="payments" @payment-added="addPayment"
      @close="showPaymentModal = false" />

    <!-- Unloading Modal (Inline converted to v-dialog) -->
    <v-dialog v-model="showUnloadingModal" max-width="500">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          {{ transaction.transaction_type === true ? 'Add Unloading' : 'From Unloading' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="unloadingForm">
            <v-select v-model="newUnloading.godown_name" :items="godowns" item-title="godown_name"
              item-value="godown_name" label="Godown Name" variant="outlined" density="compact" required
              class="mb-2"></v-select>

            <v-text-field v-model.number="newUnloading.bag_nos" label="Bag (Nos)" type="number" variant="outlined"
              density="compact" min="0" required @keydown.down.prevent @keydown.up.prevent class="mb-2"></v-text-field>

            <v-textarea v-model="newUnloading.remarks" label="Remarks" variant="outlined" density="compact" rows="3"
              @input="newUnloading.remarks = $event.target.value.toUpperCase()" class="mb-2"></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-center pb-4">
          <v-btn color="success" variant="elevated" @click="addUnloading">Add</v-btn>
          <v-btn color="warning" variant="elevated" @click="clearUnloadingForm">Clear</v-btn>
          <v-btn color="error" variant="elevated" @click="showUnloadingModal = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { millService } from '@/services'
import { useToast } from 'vue-toastification'
import PackagingModal from './Modal/PackagingModal.vue'
import StockItmeModal from './Modal/StockItemModal.vue'
import AllowanceDeductModal from './Modal/AllowanceDeductModal.vue'
import PaymentModal from './Modal/PaymentModal.vue'

const showAllowanceDeductionModal = ref(false)
const showPackagingModal = ref(false)
const showStockDetailsModal = ref(false)
const showPaymentModal = ref(false)
const showUnloadingModal = ref(false)
const isModuleEnabled = ref(true)
const toast = useToast()
const isSubmitting = ref(false)

const transaction = ref({
  transaction_date: new Date().toISOString().substr(0, 10),
  transaction_type: '',
  rst_number: '',
  bill_number: '',
  party_name: '',
  broker_name: '',
  transportor_name: '',
  vehicle_number: '',
  gross_weight: '',
  tare_weight: '',
  operator_name: '',
  remarks: ''
})

const newUnloading = ref({
  godown_name: '',
  bag_nos: '',
  remarks: '',
})

const parties = ref([])
const brokers = ref([])
const transportors = ref([])
const wbOperators = ref([])
const packagings = ref([])
const godowns = ref([])
const stockItems = ref([])
const stockItemDetails = ref([])
const packagingDetails = ref([])
const allowanceDeductions = ref([])
const payments = ref([])
const unloadingDetails = ref([])

// Computed property to get brokerage_rate for the selected broker
const selectedBrokerRate = computed(() => {
  if (!transaction.value.broker_name) return ''
  const selectedBroker = brokers.value.find(broker => broker.broker_name === transaction.value.broker_name)
  return selectedBroker ? selectedBroker.brokerage_rate || '' : ''
})

// calculate in packaging number of bags
const noOfPackagingBags = computed(() => {
  return packagingDetails.value.reduce((sum, p) => sum + (p.bag_nos || 0), 0)
})

//total packaging bags weight calculate
const bagsWeightKg = computed(() => {
  return packagingDetails.value.reduce((acc, item) => {
    return acc + Math.round((Number(item.bag_weight || 0) * Number(item.bag_nos || 0)) / 1000)
  }, 0)
})

// bags match
const bagsMismatch = computed(() => {
  const packagingTotal = noOfPackagingBags.value
  const stockTotal = totalStockBags.value
  const unloadingTotal = totalUnloadingBags.value
  return packagingTotal !== stockTotal || stockTotal !== unloadingTotal || packagingTotal === 0
})

//total stock bags
const totalStockBags = computed(() => {
  return stockItemDetails.value.reduce((sum, item) => sum + Math.round(Number(item.bags_nos || 0)), 0)
})

const totalStockWeight = computed(() => {
  return stockItemDetails.value.reduce((sum, item) => sum + parseFloat(item.weight), 0).toFixed(2)
})

const AverageStockRate = computed(() => {
  const items = stockItemDetails.value || [];  // Safe array fallback
  const totalWeight = totalStockWeight.value || 0;

  if (totalWeight <= 0 || items.length === 0) {
    return '0.00';
  }

  const totalValue = items.reduce((sum, item) => {
    const rate = Number(item.rate) || 0;
    const weight = item.weight || 0;
    return sum + Math.round(rate * weight);  // Exact sum—no per-item round
  }, 0);

  const average = (totalValue / totalWeight).toFixed(2);
  return average;
});

const totalPayments = computed(() => {
  return payments.value.reduce((sum, payment) => {
    const amount = Number(payment.payment_amount)
    return sum + (isNaN(amount) ? 0 : Math.round(amount))
  }, 0)
});

const totalUnloadingBags = computed(() => {
  return unloadingDetails.value.reduce((sum, unloading) => sum + Number(unloading.bag_nos), 0)
})

const totalAllowanceDeduction = computed(() => {
  return allowanceDeductions.value.reduce((sum, entry) => {
    const amount = Math.round(Number(entry.allowance_deduction_amount)) || 0
    return entry.is_allowance === true ? sum + amount : sum - amount
  }, 0)
})


const netWeight = computed(() => {
  return (
    (Number(transaction.value.gross_weight) || 0) - (Number(transaction.value.tare_weight) || 0)
  )
})


const finalWeightKg = computed(() => {
  return transaction.value.transaction_type === true ? (netWeight.value - bagsWeightKg.value).toFixed(2) : netWeight.value
})

//conver to Quintals( 1 qutial= 100 kg)
const finalWeightQtl = computed(() => {
  return (finalWeightKg.value / 100).toFixed(2)
})

const grossTotal = computed(() => {
  const total = stockItemDetails.value.reduce((sum, item) => {
    return sum + (item.weight || 0) * Number(item.rate || 0)
  }, 0)
  return Math.round(total)
})

const netTotal = computed(() => {
  let total = grossTotal.value
  allowanceDeductions.value.forEach((entry) => {
    const amount = Math.round(Number(entry.allowance_deduction_amount))
    total += entry.is_allowance === true ? amount : -amount
  })
  return Math.round(total)
})

const fetchParties = async () => {
  try {
    const response = await millService.getParties()
    parties.value = response.data
  } catch (error) {
    console.error('Error fetching parties:', error)
    toast.error('Failed to fetch parties.')
  }
}

const fetchBrokers = async () => {
  try {
    const response = await millService.getBrokers()
    brokers.value = response.data
  } catch (error) {
    console.error('Error fetching brokers:', error)
    toast.error('Failed to fetch brokers.')
  }
}

const fetchTransportors = async () => {
  try {
    const response = await millService.getTransporters()
    transportors.value = response.data
  } catch (error) {
    console.error('Error fetching transportors:', error)
    toast.error('Failed to fetch transportors.')
  }
}

const fetchWbOperators = async () => {
  try {
    const response = await millService.getWeighbridges()
    wbOperators.value = response.data
  } catch (error) {
    console.error('Error fetching WB operators:', error)
    toast.error('Failed to fetch WB operators.')
  }
}

const fetchPackagings = async () => {
  try {
    const response = await millService.getPackagings()
    packagings.value = response.data
  } catch (error) {
    console.error('Error fetching packagings:', error)
    toast.error('Failed to fetch packagings.')
  }
}

const fetchGodowns = async () => {
  try {
    const response = await millService.getGodowns()
    godowns.value = response.data
  } catch (error) {
    console.error('Error fetching godowns:', error)
    toast.error('Failed to fetch godowns.')
  }
}

const fetchStockItems = async () => {
  try {
    const response = await millService.getStockItems()
    stockItems.value = response.data
  } catch (error) {
    console.error('Error fetching stock items:', error)
    toast.error('Failed to fetch stock items.')
  }
}

const addPackaging = (packaging) => {
  packagingDetails.value.push(packaging)
}

const addStockItem = (item) => {
  stockItemDetails.value.push(item)
}

const addAllowanceEntry = (entry) => {
  allowanceDeductions.value.push(entry)
}

const addPayment = (payment) => {
  payments.value.push(payment)
}

const addUnloading = () => {
  if (!newUnloading.value.godown_name || !newUnloading.value.bag_nos) {
    toast.error('Please fill all required fields for unloading.')
    return
  }
  unloadingDetails.value.push({ ...newUnloading.value })
  clearUnloadingForm()
  toast.success('Unloading details added.')
}

const clearUnloadingForm = () => {
  newUnloading.value = {
    godown_name: '',
    bag_nos: '',
    remarks: '',
  }
}

const handleSubmit = async () => {
  if (bagsMismatch.value) {
    toast.error('Total bags in Packaging, Stock Items, and Unloading must match!')
    return
  }

  isSubmitting.value = true
  try {
    // Get user_login_id from session storage
    const user = JSON.parse(sessionStorage.getItem('user') || '{}')
    const user_login_id = user.id

    if (!user_login_id) {
      toast.error('User session not found. Please login again.')
      isSubmitting.value = false
      return
    }

    // Transform unloading details to include godown_id
    const unloadings = unloadingDetails.value.map(unload => {
      const godown = godowns.value.find(g => g.godown_name === unload.godown_name)
      return {
        godown_id: godown?.id,
        number_of_bags: Number(unload.bag_nos),
        remarks: unload.remarks || ''
      }
    })

    // Transform stock item details to match backend schema
    const transaction_stock_items = stockItemDetails.value.map(item => ({
      stock_item_name: item.stock_item,
      number_of_bags: Number(item.bags_nos),
      weight: Number(item.weight),
      rate: Number(item.rate)
    }))

    // Transform packaging details to match backend schema
    const packagings = packagingDetails.value.map(pkg => ({
      packaging_name: pkg.type,
      bag_nos: Number(pkg.bag_nos)
    }))

    const payload = {
      user_login_id: user_login_id,
      rst_number: transaction.value.rst_number,
      bill_number: transaction.value.bill_number,
      transaction_date: transaction.value.transaction_date,
      transaction_type: transaction.value.transaction_type,
      party_name: transaction.value.party_name,
      broker_name: transaction.value.broker_name,
      transportor_name: transaction.value.transportor_name,
      gross_weight: Number(transaction.value.gross_weight),
      tare_weight: Number(transaction.value.tare_weight),
      operator_name: transaction.value.operator_name,
      vehicle_number: transaction.value.vehicle_number,
      remarks: transaction.value.remarks || '',
      transaction_stock_items: transaction_stock_items,
      payments: payments.value,
      packagings: packagings,
      unloadings: unloadings,
      allowances_deductions: allowanceDeductions.value
    }

    await millService.addTransaction(payload)
    toast.success('Transaction created successfully!')
    // Reset form
    transaction.value = {
      transaction_date: new Date().toISOString().substr(0, 10),
      transaction_type: '',
      rst_number: '',
      bill_number: '',
      party_name: '',
      broker_name: '',
      transportor_name: '',
      vehicle_number: '',
      gross_weight: '',
      tare_weight: '',
      operator_name: '',
      remarks: ''
    }
    packagingDetails.value = []
    stockItemDetails.value = []
    allowanceDeductions.value = []
    payments.value = []
    unloadingDetails.value = []

  } catch (error) {
    console.error('Error creating transaction:', error)
    const errorMsg = error.response?.data?.detail || 'Failed to create transaction.'
    toast.error(errorMsg)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchParties()
  fetchBrokers()
  fetchTransportors()
  fetchWbOperators()
  fetchPackagings()
  fetchGodowns()
  fetchStockItems()
})
</script>
