<template>
  <v-container fluid>
    <v-card elevation="2" class="rounded-lg h-100">
      <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
        Incoming Records (आवक रिकॉर्ड)
      </v-card-title>
      <v-card-text class="pa-4">
        <!-- Filters -->
        <v-row class="mb-4">
          <v-col cols="12" md="2">
            <v-text-field v-model="filters.brought_by" label="Brought By" placeholder="Search Brought By"
              variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field v-model="filters.vehicle_no" label="Vehicle No" placeholder="Search Vehicle No"
              variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field v-model="filters.start_date" label="Start Date" type="date" variant="outlined"
              density="compact" hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field v-model="filters.end_date" label="End Date" type="date" variant="outlined" density="compact"
              hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-select v-model="filters.payment_status" :items="['Paid', 'Pending', 'Unpaid']" label="Payment Status"
              variant="outlined" density="compact" hide-details clearable></v-select>
          </v-col>
          <v-col cols="12" md="2" class="d-flex align-center">
            <v-btn color="error" @click="clearFilters" block>Clear</v-btn>
          </v-col>
        </v-row>

        <!-- Records Table -->
        <v-data-table :headers="headers" :items="filteredRecords" :items-per-page="firm.page_size || 10"
          :loading="loading" density="compact" class="elevation-1" hover>
          <template v-slot:item.sno="{ index }">
            {{ index + 1 }}
          </template>
          <template v-slot:item.io_date="{ item }">
            {{ formatDate(item.io_date) }}
          </template>
          <template v-slot:item.total_amount="{ item }">
            {{ getTotalAmount(item) }}
          </template>
          <template v-slot:item.payment_date="{ item }">
            {{ formatDate(item.incoming_outgoing_payment[0]?.payment_date) }}
          </template>
          <template v-slot:item.payment_amount="{ item }">
            {{ item.incoming_outgoing_payment[0]?.payment_amount || '-' }}
          </template>
          <template v-slot:item.amount_due="{ item }">
            ₹ {{ getAmountDue(item) }}
          </template>
          <template v-slot:item.payment_status="{ item }">
            <v-chip :color="getPaymentStatusColor(item)" size="small" class="font-weight-bold">
              {{ getPaymentStatus(item).status }}
            </v-chip>
          </template>
          <template v-slot:item.actions="{ item }">
            <div class="d-flex ga-2 justify-center">
              <v-icon color="info" @click="viewDetails(item)" class="cursor-pointer">mdi-eye</v-icon>
              <v-icon color="primary" @click="openEditModal(item)" class="cursor-pointer">mdi-pencil</v-icon>
            </div>
          </template>
        </v-data-table>

        <!-- Summary Footer -->
        <div class="mt-4 border-t pt-4">
          <v-row>
            <v-col cols="12" md="3" class="text-subtitle-1 font-weight-bold">
              Total Records: {{ totalRecords }}
            </v-col>
            <v-col cols="12" md="3" class="text-subtitle-1 font-weight-bold">
              Total Amount: ₹{{ totalAmountAllRecords }}
            </v-col>
            <v-col cols="12" md="3" class="text-subtitle-1 font-weight-bold">
              Total Paid: ₹{{ totalPaidAmountAllRecords }}
            </v-col>
            <v-col cols="12" md="3" class="text-subtitle-1 font-weight-bold">
              Total Due: ₹{{ totalDueAmountAllRecords }}
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>

    <!-- Details Modal -->
    <v-dialog v-model="isDetailsModalOpen" max-width="1000px">
      <v-card>
        <v-card-text class="pa-6">
          <div id="printable-area">
            <div class="text-center mb-4">
              <h2 class="text-h5 font-weight-bold">{{ firm.firm_name }}</h2>
              <p>{{ firm.firm_address }}</p>
              <h3 class="text-h6 font-weight-bold mt-2">Incoming Bill Details</h3>
            </div>
            <v-table density="compact" class="border">
              <tbody>
                <tr>
                  <td class="font-weight-bold border">S.NO</td>
                  <td class="border">{{ selectedRecord?.tableIndex || '-' }}</td>
                  <td class="font-weight-bold border">RST / Bill</td>
                  <td class="border">{{ selectedRecord?.rst_bill || '-' }}</td>
                  <td class="font-weight-bold border">I/O Date</td>
                  <td class="border" colspan="3">{{ formatDate(selectedRecord?.io_date) || '-' }}</td>
                </tr>
                <tr>
                  <td class="font-weight-bold border">Brought By</td>
                  <td class="border" colspan="3">{{ selectedRecord?.brought_by || '-' }}</td>
                  <td class="font-weight-bold border">Mobile Number</td>
                  <td class="border" colspan="3">{{ selectedRecord?.mob_no || '-' }}</td>
                </tr>
                <tr>
                  <td class="font-weight-bold border">Vehicle No</td>
                  <td class="border" colspan="3">{{ selectedRecord?.vehicle_no || '-' }}</td>
                  <td class="font-weight-bold border">Origin</td>
                  <td class="border" colspan="3">{{ selectedRecord?.origin || '-' }}</td>
                </tr>
                <tr>
                  <td class="font-weight-bold border">Party Through</td>
                  <td class="border" colspan="3">{{ selectedRecord?.party_through || '-' }}</td>
                  <td class="font-weight-bold border">Transport Expense</td>
                  <td class="border" colspan="3">₹ {{ selectedRecord?.transportation_expense || '0.00' }}</td>
                </tr>
                <tr>
                  <td class="font-weight-bold text-center text-h6 border bg-grey-lighten-3" colspan="8">Incoming Items
                  </td>
                </tr>
                <tr class="bg-grey-lighten-4">
                  <td class="font-weight-bold border text-center">SNo</td>
                  <td class="font-weight-bold border text-center">Jins</td>
                  <td class="font-weight-bold border text-center">Packaging</td>
                  <td class="font-weight-bold border text-center">Bags/Nos</td>
                  <td class="font-weight-bold border text-center">Quantity</td>
                  <td class="font-weight-bold border text-center">Wt (Society)</td>
                  <td class="font-weight-bold border text-center">Wt (WB)</td>
                  <td class="font-weight-bold border text-center">Amount (₹)</td>
                </tr>
                <tr v-for="(item, idx) in selectedRecord?.incoming_outgoing_items" :key="idx">
                  <td class="border text-center">{{ idx + 1 }}</td>
                  <td class="border text-center">{{ item.jins || '-' }}</td>
                  <td class="border text-center">{{ item.packaging || '-' }}</td>
                  <td class="border text-center">{{ item.bags_no ? 'Yes' : 'No' }}</td>
                  <td class="border text-center">{{ item.quantity }}</td>
                  <td class="border text-center">{{ item.weight_society || '-' }}</td>
                  <td class="border text-center">{{ item.weight_wb || '-' }}</td>
                  <td class="border text-center">₹ {{ item.amount || '0.00' }}</td>
                </tr>
                <tr>
                  <td class="font-weight-bold border text-center" colspan="4">Total</td>
                  <td class="font-weight-bold border text-center">{{ totalQuantity }}</td>
                  <td class="font-weight-bold border text-center">{{ totalSocity }}</td>
                  <td class="font-weight-bold border text-center">{{ totalBridge }}</td>
                  <td class="font-weight-bold border text-center">₹ {{ totalAmount }}</td>
                </tr>
                <tr>
                  <td class="font-weight-bold border" colspan="2">Total Amount (Inc. Transport)</td>
                  <td class="font-weight-bold border text-center">{{ totalValue }}</td>
                  <td class="font-weight-bold border text-center">Payment Amount</td>
                  <td class="font-weight-bold border text-center">₹ {{
                    selectedRecord?.incoming_outgoing_payment[0]?.payment_amount }}</td>
                  <td class="font-weight-bold border text-center">Amount Due</td>
                  <td class="font-weight-bold border text-center" colspan="2">{{ AmountDue }}</td>
                </tr>
                <tr>
                  <td class="font-weight-bold border text-center" colspan="2">I/O Time</td>
                  <td class="border text-center">{{ formatTime(selectedRecord?.time_stamp) || '-' }}</td>
                  <td class="font-weight-bold border text-center">Day</td>
                  <td class="border text-center">{{ formatDayFromTimestamp(selectedRecord?.time_stamp) || '-' }}</td>
                  <td class="font-weight-bold border text-center">Payment Status</td>
                  <td class="font-weight-bold border text-center" colspan="2" :class="paymentStatus.color">{{
                    paymentStatus.status }}</td>
                </tr>
              </tbody>
            </v-table>
            <div class="d-flex justify-space-between mt-8 pt-8">
              <div>Signature of buyer</div>
              <div>Signature of seller ({{ selectedRecord?.brought_by || '_________' }})</div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="justify-center pb-4">
          <v-btn color="primary" variant="elevated" @click="printDetails">Print</v-btn>
          <v-btn color="error" variant="elevated" @click="closeDetailsModal">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Modal -->
    <v-dialog v-model="showEditModal" max-width="900px" persistent>
      <v-card>
        <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
          Edit Incoming Record
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form @submit.prevent="updateForm">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="editForm.io_date" label="IO Date" type="date" variant="outlined"
                  density="compact" required></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editForm.rst_bill" label="RST / Bill No." variant="outlined" density="compact"
                  @input="sanitizeInput('rst_bill')"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editForm.brought_by" label="Brought By" variant="outlined" density="compact"
                  required @input="editForm.brought_by = $event.target.value.toUpperCase()"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editForm.mob_no" label="Mobile No" variant="outlined" density="compact"
                  maxlength="10" :error-messages="mobileError ? 'Invalid mobile number' : ''" @input="validateMobile"
                  required></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <div class="d-flex ga-2">
                  <v-text-field v-model="editForm.vehicle_no_prefix" label="Vehicle Prefix" placeholder="CG04QB"
                    variant="outlined" density="compact" maxlength="6" class="w-50"
                    :error-messages="vehicleNoPrefixError ? 'Invalid prefix' : ''" @input="sanitizeVehicleNoPrefix"
                    required></v-text-field>
                  <v-text-field v-model="editForm.vehicle_no_suffix" label="Suffix" placeholder="1234"
                    variant="outlined" density="compact" maxlength="4" class="w-50"
                    :error-messages="vehicleNoSuffixError ? 'Invalid suffix' : ''" @input="sanitizeVehicleNoSuffix"
                    required></v-text-field>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editForm.origin" label="Origin" variant="outlined" density="compact" required
                  @input="editForm.origin = $event.target.value.toUpperCase()"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editForm.party_through" label="Party Through" variant="outlined"
                  density="compact" @input="editForm.party_through = $event.target.value.toUpperCase()"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="editForm.transportation_expense" label="Transportation Expense (₹)"
                  type="number" variant="outlined" density="compact" min="0" step="0.01" required></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="editForm.payment_amount" label="Payment (₹)" type="number"
                  variant="outlined" density="compact" min="0" step="0.01"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editForm.payment_date" label="Payment Date" type="date" variant="outlined"
                  density="compact"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="editForm.remarks" label="Remarks" variant="outlined" density="compact" rows="3"
                  @input="sanitizeInput('remarks')"></v-textarea>
              </v-col>
            </v-row>

            <div class="d-flex justify-space-between align-center my-4">
              <h3 class="text-h6">Items</h3>
              <v-btn color="success" size="small" @click="openItemModal">+ Add Item</v-btn>
            </div>

            <v-table density="compact" class="border">
              <thead>
                <tr>
                  <th>SNO</th>
                  <th>Jins</th>
                  <th>Bags</th>
                  <th>Quantity</th>
                  <th>Packaging</th>
                  <th>Wt (Soc)</th>
                  <th>Wt (WB)</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in editForm.incoming_outgoing_items" :key="index"
                  :class="item.isNew ? 'bg-green-lighten-5' : ''">
                  <td>{{ index + 1 }}</td>
                  <td>{{ item.jins || '-' }}</td>
                  <td>{{ item.bags_no ? 'Yes' : 'No' }}</td>
                  <td>{{ item.quantity || '-' }}</td>
                  <td>{{ item.packaging || '-' }}</td>
                  <td>{{ item.weight_society || '-' }}</td>
                  <td>{{ item.weight_wb || '-' }}</td>
                  <td>{{ item.amount || '-' }}</td>
                  <td>
                    <v-icon color="primary" size="small" @click="editItem(index)"
                      class="mr-2 cursor-pointer">mdi-pencil</v-icon>
                    <v-icon color="error" size="small" @click="deleteItem(index)"
                      class="cursor-pointer">mdi-delete</v-icon>
                  </td>
                </tr>
                <tr v-if="!editForm.incoming_outgoing_items.length">
                  <td colspan="9" class="text-center text-grey">No items added yet.</td>
                </tr>
              </tbody>
            </v-table>

            <div class="d-flex justify-center ga-4 mt-6">
              <v-btn type="submit" color="primary" :loading="isSubmitting" :disabled="isSubmitting || !isEditFormValid">
                Update
              </v-btn>
              <v-btn color="error" @click="closeEditModal" :disabled="isSubmitting">Close</v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Item Edit Modal -->
    <v-dialog v-model="showItemModal" max-width="600px">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
          {{ editIndex !== null ? 'Edit Item' : 'Add Item' }}
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form @submit.prevent="saveItem">
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="modalData.jins" label="Jins" variant="outlined" density="compact" required
                  @input="modalData.jins = $event.target.value.toUpperCase()"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="modalData.bags_no"
                  :items="[{ title: 'Bags', value: true }, { title: 'Nos', value: false }]" label="Bags / Nos"
                  item-title="title" item-value="value" variant="outlined" density="compact" required></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="modalData.quantity" label="Quantity" type="number" variant="outlined"
                  density="compact" required min="0" step="1"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="modalData.packaging" label="Packaging" variant="outlined" density="compact"
                  @input="modalData.packaging = $event.target.value.toUpperCase()"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="modalData.weight_society" label="Weight (Society)" type="number"
                  variant="outlined" density="compact" min="0" step="0.01"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="modalData.weight_wb" label="Weight (Weight Bridge)" type="number"
                  variant="outlined" density="compact" min="0" step="0.01"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="modalData.amount" label="Amount" type="number" variant="outlined"
                  density="compact" min="0" step="0.01"></v-text-field>
              </v-col>
            </v-row>
            <div class="d-flex justify-center ga-4 mt-4">
              <v-btn color="primary" @click="saveItem" :disabled="!isItemModalValid">Save</v-btn>
              <v-btn color="error" @click="closeItemModal">Cancel</v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { incomingService, firmDetailsService, getModuleStatus } from '@/services'
import { useToast } from 'vue-toastification'
import storage from '@/utils/storage'

export default {
  data() {
    return {
      records: [],
      selectedRecord: null,
      isDetailsModalOpen: false,
      loading: false,
      errorMessage: '',
      interval: null,
      user: storage.getUser(),
      filters: {
        brought_by: '',
        vehicle_no: '',
        start_date: '',
        end_date: '',
        payment_status: '',
      },
      editForm: {
        id: '',
        io_date: '',
        is_incoming: true,
        rst_bill: '',
        brought_by: '',
        mob_no: '',
        vehicle_no_prefix: '',
        vehicle_no_suffix: '',
        origin: '',
        party_through: '',
        transportation_expense: '',
        payment_amount: '',
        payment_date: '',
        remarks: '',
        user_login_id: '',
        incoming_outgoing_items: [],
        incoming_outgoing_payment: [],
      },
      modalData: {
        jins: '',
        bags_no: '',
        quantity: '',
        packaging: '',
        weight_society: '',
        weight_wb: '',
        amount: '',
      },
      showItemModal: false,
      editIndex: null,
      mobileError: false,
      vehicleNoPrefixError: false,
      vehicleNoSuffixError: false,
      showEditModal: false,
      isSubmitting: false,
      firm: {},
      headers: [
        { title: 'S.No.', key: 'sno', align: 'center', sortable: false },
        { title: 'I/O Date', key: 'io_date', align: 'center' },
        { title: 'RST / Bill No.', key: 'rst_bill', align: 'center' },
        { title: 'Brought By', key: 'brought_by', align: 'center' },
        { title: 'Mobile Number', key: 'mob_no', align: 'center' },
        { title: 'Vehicle No.', key: 'vehicle_no', align: 'center' },
        { title: 'Origin', key: 'origin', align: 'center' },
        { title: 'Party Through', key: 'party_through', align: 'center' },
        { title: 'Transport Expense (₹)', key: 'transportation_expense', align: 'center' },
        { title: 'Total Amount', key: 'total_amount', align: 'center' },
        { title: 'Payment Date', key: 'payment_date', align: 'center' },
        { title: 'Payment (₹)', key: 'payment_amount', align: 'center' },
        { title: 'Amount Due', key: 'amount_due', align: 'center' },
        { title: 'Payment Status', key: 'payment_status', align: 'center' },
        { title: 'Remarks', key: 'remarks', align: 'center' },
        { title: 'Entry By', key: 'users.user_login_id', align: 'center' },
        { title: 'Action', key: 'actions', align: 'center', sortable: false },
      ],
    }
  },
  mounted() {
    this.toast = useToast()
    this.fetchRecords()
    this.fetchFirmDetails()
    this.interval = setInterval(this.fetchRecords, 5000)
  },
  beforeUnmount() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  },
  computed: {
    filteredRecords() {
      return this.records.filter((record) => {
        const matchesBroughtby = this.filters.brought_by
          ? record.brought_by?.toLowerCase().includes(this.filters.brought_by.toLowerCase())
          : true
        const matchesVehicle = this.filters.vehicle_no
          ? record.vehicle_no?.toLowerCase().includes(this.filters.vehicle_no.toLowerCase())
          : true
        const ioDate = new Date(record.io_date)
        const startDate = this.filters.start_date ? new Date(this.filters.start_date) : null
        const endDate = this.filters.end_date ? new Date(this.filters.end_date) : null
        const matchesDate = (!startDate || ioDate >= startDate) && (!endDate || ioDate <= endDate)
        const matchesPaymentStatus = this.filters.payment_status
          ? this.getPaymentStatus(record).status === this.filters.payment_status
          : true
        return matchesBroughtby && matchesVehicle && matchesDate && matchesPaymentStatus
      })
    },
    totalRecords() {
      return this.filteredRecords.length
    },
    totalAmountAllRecords() {
      return this.filteredRecords.reduce((sum, record) => {
        const recordTotal = record.incoming_outgoing_items.reduce(
          (itemSum, item) => itemSum + (Number(item.amount) || 0),
          0
        )
        const transportationExpense = Number(record.transportation_expense) || 0
        return sum + (recordTotal + transportationExpense)
      }, 0)
    },
    totalDueAmountAllRecords() {
      return this.filteredRecords.reduce((sum, record) => {
        const recordTotal = record.incoming_outgoing_items.reduce(
          (itemSum, item) => itemSum + (Number(item.amount) || 0),
          0
        )
        const transportationExpense = Number(record.transportation_expense) || 0
        const paymentAmount = Number(record.incoming_outgoing_payment[0]?.payment_amount) || 0
        const amountDue = Math.max(0, recordTotal + transportationExpense - paymentAmount)
        return sum + amountDue
      }, 0)
    },
    totalPaidAmountAllRecords() {
      return this.filteredRecords.reduce((sum, record) => {
        const paymentAmount = Number(record.incoming_outgoing_payment[0]?.payment_amount) || 0
        return sum + paymentAmount
      }, 0)
    },
    isEditFormValid() {
      return (
        this.editForm.io_date &&
        this.editForm.brought_by &&
        !this.mobileError &&
        this.editForm.vehicle_no_prefix &&
        /^\d{4}$/.test(this.editForm.vehicle_no_suffix) &&
        this.editForm.origin &&
        this.editForm.transportation_expense >= 0 &&
        (this.editForm.payment_amount === '' || this.editForm.payment_amount >= 0) &&
        this.editForm.incoming_outgoing_items.length > 0 &&
        this.editForm.incoming_outgoing_items.every((item) => item.jins && item.quantity > 0)
      )
    },
    isItemModalValid() {
      return (
        this.modalData.jins && this.modalData.jins.trim() && this.modalData.quantity > 0 && this.modalData.bags_no !== ''
      )
    },
    totalQuantity() {
      if (!this.selectedRecord || !Array.isArray(this.selectedRecord.incoming_outgoing_items)) return 0
      return this.selectedRecord.incoming_outgoing_items.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0
      )
    },
    totalSocity() {
      return this.selectedRecord?.incoming_outgoing_items?.reduce(
        (sum, item) => sum + (Number(item.weight_society) || 0),
        0,
      ) || 0
    },
    totalBridge() {
      return this.selectedRecord?.incoming_outgoing_items?.reduce(
        (sum, item) => sum + (Number(item.weight_wb) || 0),
        0,
      ) || 0
    },
    totalAmount() {
      if (!this.selectedRecord?.incoming_outgoing_items?.length) return 0
      return this.selectedRecord.incoming_outgoing_items.reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0
      )
    },
    totalValue() {
      if (!this.selectedRecord) return 0
      const total = this.totalAmount + Number(this.selectedRecord.transportation_expense)
      return total
    },
    AmountDue() {
      if (!this.selectedRecord) return 0
      const total = this.totalAmount + Number(this.selectedRecord.transportation_expense)
      const paid = Number(this.selectedRecord.incoming_outgoing_payment[0]?.payment_amount) || 0
      return Math.max(0, total - paid)
    },
    paymentStatus() {
      const total = this.totalValue || 0;
      const due = parseFloat(this.AmountDue) || 0
      if (due === 0 && total > 0) {
        return { status: 'Paid', color: 'text-green-600' }
      } else if (due > 0) {
        return { status: 'Pending', color: 'text-purple-accent-3' }
      } else if (total === 0) {
        return { status: 'Unpaid', color: 'text-red-600' }
      }
      return { status: 'Unknown', color: 'text-grey' };
    },
  },
  watch: {
    filters: {
      handler() {
        // Pagination handled by v-data-table automatically
      },
      deep: true,
    },
  },
  methods: {
    async fetchFirmDetails() {
      try {
        const response = await firmDetailsService.getFirmDetails()
          
        if (response.status === 200 && response.data) {
          this.firm = {
            firm_name: response.data.firm_name || 'Unknown Firm',
            firm_address: response.data.firm_address || 'Unknown Address',
            page_size: response.data.page_size
          };
        } else {
          this.firm = {
            firm_name: 'Unavailable',
            firm_address: 'Unavailable',
          };
          this.toast.error('Failed to fetch firm details: Invalid response');
        }
      } catch (err) {
        console.error('Failed to fetch firm details:', err);
        this.firm = {
          firm_name: 'Error',
          firm_address: 'Error',
        };
        this.toast.error('Failed to fetch firm details');
      }
    },
    async fetchRecords() {
      this.errorMessage = ''
      this.loading = true
      try {
        const response = await incomingService.getIncomings()
        if (Array.isArray(response.data)) {
          this.records = response.data.filter((record) => record.is_incoming === true)
        } else {
          this.records = []
          this.errorMessage = 'Invalid data format received from server.'
        }
      } catch (error) {
        if (error.response?.status === 204) {
          this.records = []
        } else {
          this.errorMessage = error.response?.data?.message || 'Error fetching records'
          console.error('Error fetching records:', error)
        }
      } finally {
        this.loading = false
      }
    },
    getTotalAmount(record) {
      if (!record?.incoming_outgoing_items?.length) return 0
      return record.incoming_outgoing_items.reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0
      ) + Number(record.transportation_expense)
    },
    getAmountDue(record) {
      if (!record) return 0
      const total = this.getTotalAmount(record)
      const paid = Number(record.incoming_outgoing_payment[0]?.payment_amount) || 0
      return Math.max(0, total - paid)
    },
    getPaymentStatus(record) {
      const due = parseFloat(this.getAmountDue(record)) || 0
      const totalAmount = this.getTotalAmount(record) || 0
      if (due === 0 && totalAmount > 0) {
        return { status: 'Paid', color: 'green' }
      } else if (due > 0) {
        return { status: 'Pending', color: 'purple' }
      } else if (totalAmount === 0) {
        return { status: 'Unpaid', color: 'error' }
      }
      return { status: 'Unknown', color: 'grey' }
    },
    getPaymentStatusColor(record) {
      return this.getPaymentStatus(record).color
    },
    async openEditModal(record) {
      if (!this.user || this.user.role !== 'admin') {
        this.toast.error('Only admin can edit the record')
        return
      }
      this.loading = true
      this.errorMessage = ''
      try {
        const response = await incomingService.getIncomingById(record.id)
        const data = response.data
        const vehicleMatch = (data.vehicle_no || '').match(/^([A-Z0-9]*?)(\d{0,4})$/) || [
          '',
          '',
          '',
        ]
        this.editForm = {
          id: data.id || '',
          io_date: data.io_date || '',
          is_incoming: data.is_incoming ?? true,
          rst_bill: data.rst_bill || '',
          brought_by: data.brought_by || '',
          mob_no: data.mob_no || '',
          vehicle_no_prefix: vehicleMatch[1] || '',
          vehicle_no_suffix: vehicleMatch[2] || '',
          origin: data.origin || '',
          party_through: data.party_through || '',
          transportation_expense: Number(data.transportation_expense) || 0,
          remarks: data.remarks || '',
          user_login_id: data.user_login_id || '',
          incoming_outgoing_items: (data.incoming_outgoing_items || []).map((item) => ({
            jins: item.jins || '',
            bags_no: item.bags_no ?? true,
            quantity: Number(item.quantity) || 0,
            packaging: item.packaging ?? null,
            weight_society: item.weight_society ?? null,
            weight_wb: item.weight_wb ?? null,
            amount: item.amount ?? null,
            isNew: false,
          })),
          incoming_outgoing_payment: (data.incoming_outgoing_payment || []).map((payment) => ({
            payment_amount: payment.payment_amount || 0,
            payment_date: payment.payment_date || '',
          })),
        }
        this.validateMobile()
        this.validateVehicleNoPrefix()
        this.validateVehicleNoSuffix()
        this.showEditModal = true
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Error fetching record'
        console.error('Fetch error:', error)
      } finally {
        this.loading = false
      }
    },
    closeEditModal() {
      this.showEditModal = false
      this.editForm = {
        id: '',
        io_date: '',
        is_incoming: true,
        rst_bill: '',
        brought_by: '',
        mob_no: '',
        vehicle_no_prefix: '',
        vehicle_no_suffix: '',
        origin: '',
        party_through: '',
        transportation_expense: '',
        payment_amount: '',
        payment_date: '',
        remarks: '',
        user_login_id: '',
        incoming_outgoing_items: [],
        incoming_outgoing_payment: [],
      }
      this.mobileError = false
      this.vehicleNoPrefixError = false
      this.vehicleNoSuffixError = false
    },
    sanitizeInput(field) {
      if (['rst_bill', 'brought_by', 'origin', 'party_through', 'remarks'].includes(field)) {
        this.editForm[field] = this.editForm[field].replace(/[<>]/g, '').trim()
      }
    },
    sanitizeVehicleNoPrefix() {
      this.editForm.vehicle_no_prefix = this.editForm.vehicle_no_prefix
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 6)
      this.validateVehicleNoPrefix()
    },
    validateVehicleNoPrefix() {
      this.vehicleNoPrefixError =
        !this.editForm.vehicle_no_prefix || this.editForm.vehicle_no_prefix.length > 6
    },
    sanitizeVehicleNoSuffix() {
      this.editForm.vehicle_no_suffix = this.editForm.vehicle_no_suffix
        .replace(/\D/g, '')
        .slice(0, 4)
      this.validateVehicleNoSuffix()
    },
    validateVehicleNoSuffix() {
      this.vehicleNoSuffixError = !this.editForm.vehicle_no_suffix.match(/^\d{4}$/)
    },
    validateMobile() {
      const mobileRegex = /^[0-9]{10}$/
      this.mobileError = this.editForm.mob_no && !mobileRegex.test(this.editForm.mob_no)
    },
    openItemModal() {
      this.modalData = {
        jins: '',
        bags_no: true,
        quantity: '',
        packaging: '',
        weight_society: '',
        weight_wb: '',
        amount: '',
      }
      this.editIndex = null
      this.showItemModal = true
    },
    closeItemModal() {
      this.showItemModal = false
      this.editIndex = null
    },
    saveItem() {
      const newItem = {
        jins: this.modalData.jins.trim(),
        bags_no: this.modalData.bags_no,
        quantity: Number(this.modalData.quantity) || 0,
        packaging: this.modalData.packaging !== '' ? this.modalData.packaging : null,
        weight_society:
          this.modalData.weight_society !== '' ? Number(this.modalData.weight_society) : null,
        weight_wb: this.modalData.weight_wb !== '' ? Number(this.modalData.weight_wb) : null,
        amount: this.modalData.amount !== '' ? Number(this.modalData.amount) : null,
        isNew: this.editIndex === null,
      }
      if (this.editIndex !== null) {
        this.editForm.incoming_outgoing_items[this.editIndex] = newItem
      } else {
        this.editForm.incoming_outgoing_items.push(newItem)
      }
      this.closeItemModal()
    },
    editItem(index) {
      this.modalData = { ...this.editForm.incoming_outgoing_items[index] }
      this.editIndex = index
      this.showItemModal = true
    },
    deleteItem(index) {
      this.editForm.incoming_outgoing_items.splice(index, 1)
    },
    async updateForm() {
      this.validateMobile()
      this.validateVehicleNoPrefix()
      this.validateVehicleNoSuffix()
      if (!this.isEditFormValid) {
        this.toast.error('Please fill all required fields correctly and add at least one item.')
        return
      }
      this.isSubmitting = true
      try {
        const payload = {
          io_date: this.editForm.io_date,
          is_incoming: this.editForm.is_incoming,
          rst_bill: this.editForm.rst_bill,
          brought_by: this.editForm.brought_by,
          mob_no: this.editForm.mob_no,
          vehicle_no: `${this.editForm.vehicle_no_prefix}${this.editForm.vehicle_no_suffix}`,
          origin: this.editForm.origin,
          party_through: this.editForm.party_through,
          transportation_expense: Number(this.editForm.transportation_expense) || 0,
          incoming_outgoing_payment: [
            {
              payment_amount: Number(this.editForm.payment_amount) || 0,
              payment_date: this.editForm.payment_date,
            }
          ],
          remarks: this.editForm.remarks,
          user_login_id: this.editForm.user_login_id,
          incoming_outgoing_items: this.editForm.incoming_outgoing_items.map((item) => ({
            jins: item.jins,
            bags_no: item.bags_no,
            quantity: Number(item.quantity),
            packaging: item.packaging !== '' ? item.packaging : null,
            weight_society: item.weight_society !== '' ? Number(item.weight_society) : null,
            weight_wb: item.weight_wb !== '' ? Number(item.weight_wb) : null,
            amount: item.amount !== '' ? Number(item.amount) : null,
          })),
        }
        const response = await incomingService.updateIncoming(this.editForm.id, payload)
        if (response.status === 200 || response.status === 204) {
          this.toast.success('Record updated successfully!')
          this.showEditModal = false
          this.fetchRecords()

        } else {
          throw new Error('Unexpected server response.')
        }
      } catch (error) {
        this.toast.error(error.response?.data?.message || error.message || 'Error updating record')
        console.error('Update error:', error)
      } finally {
        this.isSubmitting = false
      }
    },
    clearFilters() {
      this.filters.brought_by = ''
      this.filters.vehicle_no = ''
      this.filters.start_date = ''
      this.filters.end_date = ''
      this.filters.payment_status = ''
    },
    formatDate(date) {
      if (!date || isNaN(new Date(date).getTime())) return ''
      return new Date(date).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    },
    formatTime(timestamp) {
      if (!timestamp) return '-'
      const date = new Date(timestamp)
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    },
    formatDayFromTimestamp(timestamp) {
      if (!timestamp) return '-'
      const date = new Date(timestamp)
      return date.toLocaleDateString('en-US', { weekday: 'long' })
    },
    viewDetails(record) {
      this.selectedRecord = {
        ...record,
        tableIndex: this.records.findIndex((r) => r.id === record.id) + 1,
      }
      this.isDetailsModalOpen = true
    },
    closeDetailsModal() {
      this.isDetailsModalOpen = false
      this.selectedRecord = null
    },
    printDetails() {
      const printContent = document.getElementById('printable-area').innerHTML
      const originalContent = document.body.innerHTML
      document.body.innerHTML = printContent
      window.print()
      document.body.innerHTML = originalContent
      window.location.reload()
    },
  },
}
</script>

<style scoped>
@media print {
  .print-ignore {
    display: none;
  }
}
</style>
