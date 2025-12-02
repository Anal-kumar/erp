<template>
  <v-container fluid>
    <v-card elevation="2">
      <v-card-title class="text-h5 font-weight-bold text-center py-4">View Transactions</v-card-title>
      <v-card-text>
        <!-- Filters -->
        <v-row dense class="mb-4">
          <v-col cols="12" md="2">
            <v-text-field v-model="partyFilter" label="Party Name" density="compact" variant="outlined"
              hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field v-model="brokerFilter" label="Broker Name" density="compact" variant="outlined"
              hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field v-model="transporterFilter" label="Transporter Name" density="compact" variant="outlined"
              hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field v-model="stockItemFilter" label="Stock Item Name" density="compact" variant="outlined"
              hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-select v-model="TypeFilter"
              :items="[{ title: 'All Type', value: '' }, { title: 'Purchase', value: true }, { title: 'Sell', value: false }]"
              item-title="title" item-value="value" label="Transaction Type" density="compact" variant="outlined"
              hide-details></v-select>
          </v-col>
          <v-col cols="12" md="2">
            <v-select v-model="PaymentStatusFilter" :items="['All Status', 'Paid', 'Pending', 'Unpaid']"
              label="Payment Status" density="compact" variant="outlined" hide-details></v-select>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field v-model="fromDate" label="From Date" type="date" density="compact" variant="outlined"
              hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field v-model="toDate" label="To Date" type="date" density="compact" variant="outlined"
              hide-details></v-text-field>
          </v-col>
        </v-row>

        <!-- Data Table -->
        <v-data-table :headers="headers" :items="filteredTransactions" :items-per-page="10"
          class="elevation-1 border rounded" density="compact">
          <template v-slot:item.sno="{ index }">
            {{ index + 1 }}
          </template>
          <template v-slot:item.transaction_date="{ item }">
            {{ formatDate(item.transaction_date) }}
          </template>
          <template v-slot:item.transaction_type="{ item }">
            {{ item.transaction_type === true ? 'Purchase' : 'Sell' }}
          </template>
          <template v-slot:item.rst_bill="{ item }">
            <div>RST: {{ item.rst_number || '-' }}</div>
            <div>BILL: {{ item.bill_number || '-' }}</div>
          </template>
          <template v-slot:item.party_broker="{ item }">
            <div><strong>PARTY:</strong> {{ item.party?.party_name || '-' }}</div>
            <div><strong>BROKER:</strong> {{ item.broker?.broker_name || '-' }}</div>
          </template>
          <template v-slot:item.transport_vehicle="{ item }">
            <div>TRANSPORTER: {{ item.transportor?.transportor_name || '-' }}</div>
            <div>VEHICLE: {{ item.vehicle_number || 'N/A' }}</div>
          </template>
          <template v-slot:item.stock_details="{ item }">
            <v-table density="compact" class="text-caption" v-if="item.transaction_stock_items?.length">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Bags</th>
                  <th>Weight</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(stock, idx) in item.transaction_stock_items" :key="idx">
                  <td>{{ stock.stock_items?.stock_item_name || '-' }}</td>
                  <td>{{ stock.number_of_bags || '-' }}</td>
                  <td>{{ isValidNumber(stock.weight) ? parseFloat(stock.weight).toFixed(2) : '-' }}</td>
                  <td>{{ stock.rate || '-' }}</td>
                </tr>
                <tr class="font-weight-bold">
                  <td>Total</td>
                  <td>{{ getTotalStockBags(item) }}</td>
                  <td>{{ getTotalStockWeight(item) }}</td>
                  <td></td>
                </tr>
              </tbody>
            </v-table>
            <span v-else class="text-grey">No stock details</span>
          </template>
          <template v-slot:item.final_weight="{ item }">
            {{ getFinalWeight(item) }}
          </template>
          <template v-slot:item.net_total="{ item }">
            {{ getNetTotal(item) }}
          </template>
          <template v-slot:item.payment_amount="{ item }">
            {{ getTotalPayement(item) }}
          </template>
          <template v-slot:item.due_amount="{ item }">
            {{ getAmountDue(item) }}
          </template>
          <template v-slot:item.payment_status="{ item }">
            <v-chip :color="getPaymentStatus(item).color" size="small" label>
              {{ getPaymentStatus(item).status }}
            </v-chip>
          </template>
          <template v-slot:item.wb_operator="{ item }">
            {{ item.weight_bridge_operator?.operator_name || 'N/A' }}
          </template>
          <template v-slot:item.actions="{ item }">
            <div class="d-flex ga-2">
              <v-btn icon="mdi-eye" size="x-small" variant="text" color="grey" @click="viewDetails(item)"></v-btn>
              <v-btn icon="mdi-pencil" size="x-small" variant="text" color="primary"
                @click="editTransaction(item)"></v-btn>
              <v-btn icon="mdi-package-variant-closed" size="x-small" variant="text" color="error"
                @click="openReturnPackagingModal(item)" title="Return Packaging Bags"></v-btn>
            </div>
          </template>

          <!-- Footer Totals -->
          <template v-slot:tfoot>
            <tr class="bg-grey-lighten-3 font-weight-bold">
              <td colspan="7" class="text-right pa-4">Totals:</td>
              <td class="pa-4">{{ totalQuintalWeight }} Qtl</td>
              <td class="pa-4">₹{{ totalNetAmount }}</td>
              <td class="pa-4">₹{{ totalPaidAmount }}</td>
              <td class="pa-4">₹{{ totalDueAmount }}</td>
              <td colspan="3"></td>
            </tr>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Edit Transaction Modal -->
    <v-dialog v-model="showEditModal" fullscreen transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar color="primary">
          <v-btn icon="mdi-close" @click="showEditModal = false"></v-btn>
          <v-toolbar-title>Edit Transaction</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn variant="text" @click="saveTransaction">Save</v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-form @submit.prevent="saveTransaction">
            <!-- Transaction Information -->
            <v-card variant="outlined" class="mb-4">
              <v-card-title class="text-subtitle-1">Transaction Information</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="4">
                    <v-text-field v-model="editForm.transaction_date" label="Transaction Date" type="date"
                      variant="outlined" density="compact"></v-text-field>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-select v-model="editForm.transaction_type"
                      :items="[{ title: 'Sell', value: false }, { title: 'Purchase', value: true }]" item-title="title"
                      item-value="value" label="Transaction Type" variant="outlined" density="compact"></v-select>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field v-model="editForm.rst_number" label="RST Number" variant="outlined" density="compact"
                      @input="editForm.rst_number = $event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')"></v-text-field>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field v-model="editForm.bill_number" label="Bill Number" variant="outlined"
                      density="compact"
                      @input="editForm.bill_number = $event.target.value.toUpperCase().replace(/[^A-Z0-9\-_/]/g, '')"></v-text-field>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-autocomplete v-model="editForm.party_name" :items="parties" item-title="party_name"
                      item-value="party_name" label="Party Name" variant="outlined" density="compact"></v-autocomplete>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-autocomplete v-model="editForm.broker_name" :items="brokers" item-title="broker_name"
                      item-value="broker_name" label="Broker Name" variant="outlined"
                      density="compact"></v-autocomplete>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-autocomplete v-model="editForm.transportor_name" :items="transportors"
                      item-title="transportor_name" item-value="transportor_name" label="Transporter Name"
                      variant="outlined" density="compact"></v-autocomplete>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field v-model="editForm.vehicle_number" label="Vehicle Number" variant="outlined"
                      density="compact" maxlength="10"
                      @input="editForm.vehicle_number = $event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')"></v-text-field>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Packaging Details -->
            <v-card variant="outlined" class="mb-4">
              <v-card-title class="d-flex justify-space-between align-center">
                <span class="text-subtitle-1">Packaging Details</span>
                <v-btn color="primary" size="small" prepend-icon="mdi-plus" @click="showPackagingModal = true">Add
                  Packaging</v-btn>
              </v-card-title>
              <v-card-text v-if="editForm.packagingDetails.length > 0">
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
                    <tr v-for="(packaging, index) in editForm.packagingDetails" :key="index">
                      <td class="text-center">{{ packaging.type }}</td>
                      <td class="text-center">{{ packaging.bag_weight }} Grams</td>
                      <td class="text-center">{{ packaging.bag_nos }}</td>
                      <td class="text-center">
                        <v-btn icon="mdi-delete" size="x-small" color="error" variant="text"
                          @click="editForm.packagingDetails.splice(index, 1)"></v-btn>
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
                    <v-text-field v-model="editForm.gross_weight" label="Gross Weight (KG)" type="number"
                      variant="outlined" density="compact" min="0" step="0.01"></v-text-field>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field v-model="editForm.tare_weight" label="Tare Weight (KG)" type="number"
                      variant="outlined" density="compact"></v-text-field>
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
                <v-btn color="grey-darken-2" size="small" prepend-icon="mdi-plus"
                  @click="showStockDetailsModal = true">Add
                  Stock Details</v-btn>
              </v-card-title>
              <v-card-text v-if="editForm.stockItemDetails.length > 0">
                <v-table density="compact" class="border">
                  <thead>
                    <tr>
                      <th class="text-center">SNO</th>
                      <th class="text-center">Stock Item</th>
                      <th class="text-center">Bags (Nos)</th>
                      <th class="text-center">Weight (Qtl)</th>
                      <th class="text-center">Rate (Rs./Qtl)</th>
                      <th class="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in editForm.stockItemDetails" :key="index">
                      <td class="text-center">{{ index + 1 }}</td>
                      <td class="text-center">{{ item.stock_item }}</td>
                      <td class="text-center">{{ item.bags_nos }}</td>
                      <td class="text-center">{{ item.weight }}</td>
                      <td class="text-center">{{ item.rate }}</td>
                      <td class="text-center">
                        <v-btn icon="mdi-delete" size="x-small" color="error" variant="text"
                          @click="editForm.stockItemDetails.splice(index, 1)"></v-btn>
                      </td>
                    </tr>
                    <tr class="bg-grey-lighten-4 font-weight-bold">
                      <td class="text-center" colspan="2">Total</td>
                      <td class="text-center">{{ totalStockBags }} Bags</td>
                      <td class="text-center">{{ totalStockWeight }} Qtl</td>
                      <td class="text-center">Avg Rate: ₹ {{ AverageStockRate }}</td>
                      <td></td>
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
                <v-btn color="warning" size="small" prepend-icon="mdi-plus"
                  @click="showAllowanceDeductionModal = true">Add
                  Allowance/Deduction</v-btn>
              </v-card-title>
              <v-card-text v-if="editForm.allowanceDeductions.length > 0">
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
                    <tr v-for="(entry, index) in editForm.allowanceDeductions" :key="index">
                      <td class="text-center">{{ entry.is_allowance === true ? 'Allowance' : 'Deduction' }}</td>
                      <td class="text-center">{{ entry.allowance_deduction_name }}</td>
                      <td class="text-center" :class="entry.is_allowance ? 'text-green' : 'text-red'">₹{{
                        entry.allowance_deduction_amount }}</td>
                      <td class="text-center">{{ entry.remarks }}</td>
                      <td class="text-center">
                        <v-btn icon="mdi-delete" size="x-small" color="error" variant="text"
                          @click="editForm.allowanceDeductions.splice(index, 1)"></v-btn>
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
                <v-btn color="success" size="small" prepend-icon="mdi-plus" @click="showPaymentModal = true">Add
                  Payment</v-btn>
              </v-card-title>
              <v-card-text v-if="editForm.payments.length > 0">
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
                    <tr v-for="(payment, index) in editForm.payments" :key="index">
                      <td class="text-center">{{ new Date(payment.payment_date).toLocaleString('en-GB', {
                        day:
                          '2-digit',
                        month: '2-digit', year: 'numeric'
                      }) }}</td>
                      <td class="text-center">₹ {{ payment.payment_amount }}</td>
                      <td class="text-center">{{ payment.payment_remarks }}</td>
                      <td class="text-center">
                        <v-btn icon="mdi-delete" size="x-small" color="error" variant="text"
                          @click="editForm.payments.splice(index, 1)"></v-btn>
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
                <v-btn color="info" size="small" prepend-icon="mdi-plus" @click="showUnloadingModal = true">Add
                  Unloading</v-btn>
              </v-card-title>
              <v-card-text v-if="editForm.unloadingDetails.length > 0">
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
                    <tr v-for="(unloading, index) in editForm.unloadingDetails" :key="index">
                      <td class="text-center">{{ unloading.godown_name }}</td>
                      <td class="text-center">{{ unloading.bag_nos }}</td>
                      <td class="text-center">{{ unloading.remarks }}</td>
                      <td class="text-center">
                        <v-btn icon="mdi-delete" size="x-small" color="error" variant="text"
                          @click="editForm.unloadingDetails.splice(index, 1)"></v-btn>
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
                <v-autocomplete v-model="editForm.operator_name" :items="wbOperators" item-title="operator_name"
                  item-value="operator_name" label="WB Operator Name" variant="outlined"
                  density="compact"></v-autocomplete>
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="editForm.remarks" label="Remarks" variant="outlined" density="compact" rows="3"
                  @input="editForm.remarks = $event.target.value.toUpperCase()"></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Return Packaging Modal -->
    <v-dialog v-model="showPackagingDetaliModal" max-width="900">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">Returned Packaging Details</v-card-title>
        <v-card-text>
          <div class="bg-blue-lighten-5 pa-4 rounded mb-4 text-body-2">
            <p><strong>RST:</strong> {{ selectedTransactionForReturn?.rst_number || '-' }} | <strong>Bill:</strong> {{
              selectedTransactionForReturn?.bill_number || '-' }}</p>
            <p><strong>Party:</strong> {{ selectedTransactionForReturn?.party?.party_name || '-' }} |
              <strong>Date:</strong>
              {{ formatDate(selectedTransactionForReturn?.transaction_date) }}
            </p>
          </div>

          <v-table density="compact" class="border">
            <thead>
              <tr>
                <th>Packaging Name</th>
                <th>Bag Weight (g)</th>
                <th>Issued Bags</th>
                <th>Returned Bags</th>
                <th>Remaining Bags</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in returnPackagingRows" :key="index">
                <td>
                  <v-select v-model="row.type" :items="packagings" item-title="packaging_name"
                    item-value="packaging_name" density="compact" variant="outlined" hide-details
                    @update:model-value="updateReturnBagWeight(index)"></v-select>
                </td>
                <td class="text-center">{{ row.bag_weight || '-' }}</td>
                <td>
                  <v-text-field v-model.number="row.issued_bags" type="number" density="compact" variant="outlined"
                    hide-details min="0"></v-text-field>
                </td>
                <td>
                  <v-text-field v-model.number="row.returned_bags" type="number" density="compact" variant="outlined"
                    hide-details min="0" :max="row.issued_bags"
                    :error="row.returned_bags > row.issued_bags"></v-text-field>
                </td>
                <td class="text-center">{{ row.remaining_bags || 0 }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="font-weight-bold bg-grey-lighten-4">
                <td colspan="2" class="text-right">Total Returned Bags:</td>
                <td class="text-center">{{ totalIssuedBags }}</td>
                <td class="text-center text-green">{{ totalReturnedBags }}</td>
                <td></td>
              </tr>
            </tfoot>
          </v-table>
        </v-card-text>
        <v-card-actions class="justify-center pb-4">
          <v-btn color="success" variant="elevated" @click="submitReturnedPackaging"
            :disabled="totalReturnedBags === 0">Submit Returned Bags</v-btn>
          <v-btn color="grey" variant="elevated" @click="closeReturnModal">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modals (Reused from TransactionForm logic) -->
    <AllowanceDeductModal v-if="showAllowanceDeductionModal" :noOfPackagingBags="noOfPackagingBags"
      :finalWeightQtl="Number(finalWeightQtl)" :grossTotal="grossTotal" :brokerage_rate="0" @add="addAllowanceEntry"
      @close="showAllowanceDeductionModal = false" />

    <PackagingModal v-if="showPackagingModal" :packagings="packagings" @add="addPackaging"
      @close="showPackagingModal = false" />

    <StockItmeModal v-if="showStockDetailsModal" :stock-items="stockItems" :final-weight-qtl="Number(finalWeightQtl)"
      :totalPackagingBags="noOfPackagingBags" @add="addStockItem" @close="showStockDetailsModal = false" />

    <PaymentModal v-if="showPaymentModal" :payments="editForm.payments" @payment-added="addPayment"
      @close="showPaymentModal = false" />

    <!-- Unloading Modal (Inline converted to v-dialog) -->
    <v-dialog v-model="showUnloadingModal" max-width="500">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          {{ editForm.transaction_type === true ? 'Add Unloading' : 'From Unloading' }}
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

    <TransactionDetails :showDetailsModal="showDetailsModal" :transaction="selectedTransaction" :firm="firm"
      :transactionIndex="transactions.findIndex((t) => t.id === selectedTransaction?.id)" @close="closeDetailsModal" />
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { millService } from '@/services';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';
import storage from '@/utils/storage'
import TransactionDetails from './TransactionDetails.vue';
import PackagingModal from './Modal/PackagingModal.vue'
import StockItmeModal from './Modal/StockItemModal.vue'
import AllowanceDeductModal from './Modal/AllowanceDeductModal.vue'
import PaymentModal from './Modal/PaymentModal.vue'

// Initialize dependencies
const toast = useToast();
const router = useRouter();

// State for transactions and filters
const transactions = ref([]);
const partyFilter = ref('');
const brokerFilter = ref('');
const transporterFilter = ref('');
const stockItemFilter = ref('');
const TypeFilter = ref('')
const PaymentStatusFilter = ref('All Status');
const fromDate = ref('');
const toDate = ref('');
const user = storage.getUser();

//this use for pagination
const firm = ref([])

// State for modals
const showEditModal = ref(false);
const showAllowanceDeductionModal = ref(false);
const showPackagingModal = ref(false);
const showStockDetailsModal = ref(false);
const showPaymentModal = ref(false);
const showUnloadingModal = ref(false);
const showDetailsModal = ref(false);
const selectedTransaction = ref(null);
const showPackagingDetaliModal = ref(false);
// State for editing index in modals
const editIndex = ref(null);

// State for dropdowns
const parties = ref([]);
const brokers = ref([]);
const transportors = ref([]);
const wbOperators = ref([]);
const packagings = ref([]);
const godowns = ref([]);
const stockItems = ref([]);

// Form state for editing transactions
const editForm = ref({
  id: null,
  user_login_id: '',
  rst_number: '',
  bill_number: '',
  transaction_date: '',
  transaction_type: '',
  party_name: '',
  broker_name: '',
  transportor_name: '',
  gross_weight: '',
  tare_weight: '',
  operator_name: '',
  vehicle_number: '',
  remarks: '',
  packagingDetails: [],
  stockItemDetails: [],
  allowanceDeductions: [],
  payments: [],
  unloadingDetails: [],
});

const newUnloading = ref({
  godown_name: '',
  bag_nos: '',
  remarks: '',
});

// Returned Packaging State
const returnPackagingRows = ref([])
const selectedTransactionForReturn = ref(null)

// Headers for v-data-table
const headers = [
  { title: 'Sno', key: 'sno', align: 'center' },
  { title: 'Transaction Date', key: 'transaction_date', align: 'center' },
  { title: 'Transaction Type', key: 'transaction_type', align: 'center' },
  { title: 'RST / Bill', key: 'rst_bill', align: 'start' },
  { title: 'Party / Broker', key: 'party_broker', align: 'start' },
  { title: 'Transporter / Vehicle', key: 'transport_vehicle', align: 'start' },
  { title: 'Stock Details', key: 'stock_details', align: 'start' },
  { title: 'Final Weight (KG)', key: 'final_weight', align: 'center' },
  { title: 'Net Total', key: 'net_total', align: 'center' },
  { title: 'Payment Amount', key: 'payment_amount', align: 'center' },
  { title: 'Due Amount', key: 'due_amount', align: 'center' },
  { title: 'Payment Status', key: 'payment_status', align: 'center' },
  { title: 'WB Operator', key: 'wb_operator', align: 'center' },
  { title: 'Actions', key: 'actions', align: 'center', sortable: false },
]

// Computed for totals
const totalIssuedBags = computed(() =>
  returnPackagingRows.value.reduce((sum, r) => sum + Number(r.issued_bags || 0), 0)
)
const totalReturnedBags = computed(() =>
  returnPackagingRows.value.reduce((sum, r) => sum + Number(r.returned_bags || 0), 0)
)

// Methods
const openReturnPackagingModal = (transaction) => {
  selectedTransactionForReturn.value = transaction
  returnPackagingRows.value = []
  showPackagingDetaliModal.value = true
}

const updateReturnBagWeight = (index) => {
  const selected = packagings.value.find(p => p.packaging_name === returnPackagingRows.value[index].type)
  if (selected) {
    returnPackagingRows.value[index].bag_weight = selected.bag_weight
  }
}

const closeReturnModal = () => {
  showPackagingDetaliModal.value = false
  returnPackagingRows.value = []
  selectedTransactionForReturn.value = null
}

const submitReturnedPackaging = async () => {
  // Implement submission logic here
  toast.info("Submit returned packaging logic to be implemented")
  closeReturnModal()
}


// Computed properties for Edit Form (Reused from TransactionForm)
const noOfPackagingBags = computed(() => {
  return editForm.value.packagingDetails.reduce((sum, p) => sum + Number(p.bag_nos || 0), 0);
});

const bagsWeightKg = computed(() => {
  return editForm.value.packagingDetails.reduce((acc, item) => {
    const weight = Math.round(Number(item.bag_weight || 0) * Number(item.bag_nos || 0) / 1000);
    return acc + (isNaN(weight) ? 0 : (weight));
  }, 0);
});

const netWeight = computed(() => {
  const gross = Number(editForm.value.gross_weight || 0);
  const tare = Number(editForm.value.tare_weight || 0);
  return (gross - tare).toFixed(2);
});

const finalWeightKg = computed(() => {
  return editForm.value.transaction_type === true ? (Number(netWeight.value) - Number(bagsWeightKg.value)).toFixed(2) : netWeight.value;
});

const finalWeightQtl = computed(() => {
  return (Number(finalWeightKg.value) / 100).toFixed(2);
});

const totalStockBags = computed(() => {
  return editForm.value.stockItemDetails.reduce((sum, item) => sum + Number(item.bags_nos || 0), 0);
});

const totalStockWeight = computed(() => {
  return editForm.value.stockItemDetails.reduce((sum, item) => sum + parseFloat(item.weight || 0), 0).toFixed(2);
});

const AverageStockRate = computed(() => {
  const { stockItemDetails } = editForm.value;
  const totalWeight = totalStockWeight.value;

  if (!stockItemDetails || stockItemDetails.length === 0 || totalWeight <= 0) {
    return '0.00';
  }

  const totalValue = stockItemDetails.reduce((sum, item) => {
    const rate = Number(item.rate) || 0;
    const weight = parseFloat(item.weight) || 0;
    return sum + Math.round(rate * weight);
  }, 0);

  const average = (totalValue / totalWeight).toFixed(2);
  return average;
});

const grossTotal = computed(() => {
  return editForm.value.stockItemDetails.reduce((sum, item) => {
    const amount = parseFloat(item.weight || 0) * Number(item.rate || 0);
    return sum + Math.round(isNaN(amount) ? 0 : Math.round(amount));
  }, 0);
});

const totalAllowanceDeduction = computed(() => {
  return editForm.value.allowanceDeductions.reduce((sum, entry) => {
    const amount = Number(entry.allowance_deduction_amount || 0);
    return entry.is_allowance ? sum + amount : sum - amount;
  }, 0);
});

const netTotal = computed(() => {
  let total = Number(grossTotal.value);
  editForm.value.allowanceDeductions.forEach((entry) => {
    const amount = Number(entry.allowance_deduction_amount || 0);
    total += entry.is_allowance ? amount : -amount;
  });
  return Math.round(total);
});

const totalPayments = computed(() => {
  return editForm.value.payments.reduce((sum, payment) => {
    const amount = Number(payment.payment_amount || 0);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);
});

const totalUnloadingBags = computed(() => {
  return editForm.value.unloadingDetails.reduce((sum, unloading) => sum + Number(unloading.bag_nos || 0), 0);
});

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
    const matchStatus = PaymentStatusFilter.value !== 'All Status'
      ? getPaymentStatus(t).status === PaymentStatusFilter.value
      : true;
    return matchParty && matchBroker && matchTransporter && matchStockItem && matchType && matchDate && matchStatus;
  });
});

const totalQuintalWeight = computed(() => {
  return filteredTransactions.value
    .reduce((sum, t) => {
      const weightQtl = Number(getFinalWeight(t) / 100);
      return t.transaction_type === true
        ? sum + weightQtl
        : sum - weightQtl;
    }, 0)
    .toFixed(2);
});

const totalPaidAmount = computed(() => {
  return filteredTransactions.value.reduce((sum, t) => sum + Number(getTotalPayement(t)), 0);
});

const totalNetAmount = computed(() => {
  return filteredTransactions.value.reduce((sum, t) => sum + Number(getNetTotal(t)), 0);
});

const totalDueAmount = computed(() => {
  return filteredTransactions.value.reduce((sum, t) => sum + Number(getAmountDue(t)), 0);
});

const isValidNumber = (val) => {
  return val !== null && val !== undefined && !isNaN(val);
};

const getTotalStockBags = (transaction) => {
  return transaction.transaction_stock_items?.reduce((sum, item) => sum + Number(item.number_of_bags || 0), 0) || 0;
};

const getTotalStockWeight = (transaction) => {
  return transaction.transaction_stock_items?.reduce((sum, item) => sum + parseFloat(item.weight || 0), 0).toFixed(2) || '0.00';
};

const getNetWeight = (transaction) => {
  if (!transaction.gross_weight || !transaction.tare_weight) return '-'
  return (transaction.gross_weight - transaction.tare_weight).toFixed(2)
}

const getFinalWeight = (transaction) => {
  if (!transaction.gross_weight || !transaction.tare_weight) return '-'
  const netWeight = getNetWeight(transaction);
  const totalPackagingWeight =
    transaction.transaction_packaging_details?.reduce(
      (acc, detail) =>
        acc + (Number(detail.bag_nos || 0) * Number(detail.packaging?.bag_weight || 0)) / 1000,
      0,
    ) || 0
  return transaction.transaction_type === true ? (netWeight - totalPackagingWeight).toFixed(2) : netWeight;
}

const getGrossTotal = (transaction) => {
  if (!transaction.transaction_stock_items?.length) return '-'
  const total = transaction.transaction_stock_items.reduce(
    (sum, item) => sum + Number(item.weight || 0) * Number(item.rate || 0),
    0,
  )
  return Math.round(total)
}

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
    return { status: 'Paid', color: 'success' };
  } else if (AmountDue > 0) {
    return { status: 'Pending', color: 'warning' };
  } else if (netTotal === 0 && totalPaid === 0) {
    return { status: 'Unpaid', color: 'error' };
  }
  return { status: 'Unknown', color: 'grey' };
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const fetchTransactions = async () => {
  try {
    const response = await millService.getTransactions()
    transactions.value = response.data
  } catch (error) {
    console.error('Error fetching transactions:', error)
    toast.error('Failed to fetch transactions.')
  }
}

const fetchParties = async () => {
  try {
    const response = await millService.getParties()
    parties.value = response.data
  } catch (error) {
    console.error('Error fetching parties:', error)
  }
}

const fetchBrokers = async () => {
  try {
    const response = await millService.getBrokers()
    brokers.value = response.data
  } catch (error) {
    console.error('Error fetching brokers:', error)
  }
}

const fetchTransportors = async () => {
  try {
    const response = await millService.getTransporters()
    transportors.value = response.data
  } catch (error) {
    console.error('Error fetching transportors:', error)
  }
}

const fetchWbOperators = async () => {
  try {
    const response = await millService.getWeighbridges()
    wbOperators.value = response.data
  } catch (error) {
    console.error('Error fetching WB operators:', error)
  }
}

const fetchPackagings = async () => {
  try {
    const response = await millService.getPackagings()
    packagings.value = response.data
  } catch (error) {
    console.error('Error fetching packagings:', error)
  }
}

const fetchGodowns = async () => {
  try {
    const response = await millService.getGodowns()
    godowns.value = response.data
  } catch (error) {
    console.error('Error fetching godowns:', error)
  }
}

const fetchStockItems = async () => {
  try {
    const response = await millService.getStockItems()
    stockItems.value = response.data
  } catch (error) {
    console.error('Error fetching stock items:', error)
  }
}

const viewDetails = (item) => {
  selectedTransaction.value = item;
  showDetailsModal.value = true;
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedTransaction.value = null;
};

const editTransaction = (item) => {
  if (!user || user.role !== 'admin') {
    toast.error('Only admins can edit transactions.');
    return;
  }
  editForm.value = {
    id: item.id,
    user_login_id: user.id,
    rst_number: item.rst_number,
    bill_number: item.bill_number,
    transaction_date: item.transaction_date,
    transaction_type: item.transaction_type,
    party_name: item.party?.party_name,
    broker_name: item.broker?.broker_name,
    transportor_name: item.transportor?.transportor_name,
    gross_weight: item.gross_weight,
    tare_weight: item.tare_weight,
    operator_name: item.weight_bridge_operator?.operator_name,
    vehicle_number: item.vehicle_number,
    remarks: item.remarks,
    packagingDetails: item.transaction_packaging_details.map(p => ({
      type: p.packaging?.packaging_name,
      bag_weight: p.packaging?.bag_weight,
      bag_nos: p.bag_nos
    })),
    stockItemDetails: item.transaction_stock_items.map(s => ({
      stock_item: s.stock_items?.stock_item_name,
      bags_nos: s.number_of_bags,
      weight: s.weight,
      rate: s.rate,
      remarks: s.remarks
    })),
    allowanceDeductions: item.transaction_allowance_deduction_details.map(a => ({
      is_allowance: a.is_allowance,
      allowance_deduction_name: a.allowance_deduction_name,
      allowance_deduction_amount: a.allowance_deduction_amount,
      remarks: a.remarks
    })),
    payments: item.transaction_payments_mill_operations.map(p => ({
      payment_date: p.payment_date,
      payment_amount: p.payment_amount,
      payment_remarks: p.payment_remarks
    })),
    unloadingDetails: item.transaction_unloading_details.map(u => ({
      godown_name: u.godown?.godown_name,
      bag_nos: u.bag_nos,
      remarks: u.remarks
    }))
  };
  showEditModal.value = true;
};

const saveTransaction = async () => {
  try {
    // Transform unloading details to include godown_id
    const unloadings = editForm.value.unloadingDetails.map(unload => {
      const godown = godowns.value.find(g => g.godown_name === unload.godown_name)
      return {
        godown_name: unload.godown_name,
        number_of_bags: Number(unload.bag_nos),
        remarks: unload.remarks || ''
      }
    })

    // Transform stock item details to match backend schema
    const transaction_stock_items = editForm.value.stockItemDetails.map(item => ({
      stock_item_name: item.stock_item,
      number_of_bags: Number(item.bags_nos),
      weight: Number(item.weight),
      rate: Number(item.rate)
    }))

    // Transform packaging details to match backend schema
    const packagings = editForm.value.packagingDetails.map(pkg => ({
      packaging_name: pkg.type,
      bag_nos: Number(pkg.bag_nos)
    }))

    const payload = {
      rst_number: editForm.value.rst_number,
      bill_number: editForm.value.bill_number,
      transaction_date: editForm.value.transaction_date,
      transaction_type: editForm.value.transaction_type,
      party_name: editForm.value.party_name,
      broker_name: editForm.value.broker_name,
      transportor_name: editForm.value.transportor_name,
      gross_weight: Number(editForm.value.gross_weight),
      tare_weight: Number(editForm.value.tare_weight),
      operator_name: editForm.value.operator_name,
      vehicle_number: editForm.value.vehicle_number,
      remarks: editForm.value.remarks || '',
      transaction_stock_items: transaction_stock_items,
      payments: editForm.value.payments,
      packagings: packagings,
      unloadings: unloadings,
      allowances_deductions: editForm.value.allowanceDeductions
    };

    await millService.updateTransaction(editForm.value.id, payload)
    toast.success('Transaction updated successfully');
    showEditModal.value = false;
    fetchTransactions();
  } catch (error) {
    console.error('Error updating transaction:', error);
    const errorMsg = error.response?.data?.detail || 'Failed to update transaction'
    toast.error(errorMsg);
  }
};

const addPackaging = (packaging) => {
  editForm.value.packagingDetails.push(packaging);
};

const addStockItem = (item) => {
  editForm.value.stockItemDetails.push(item);
};

const addAllowanceEntry = (entry) => {
  editForm.value.allowanceDeductions.push(entry);
};

const addPayment = (payment) => {
  editForm.value.payments.push(payment);
};

const addUnloading = () => {
  if (!newUnloading.value.godown_name || !newUnloading.value.bag_nos) {
    toast.error('Please fill all required fields for unloading.')
    return
  }
  editForm.value.unloadingDetails.push({ ...newUnloading.value })
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

onMounted(() => {
  fetchTransactions();
  fetchParties();
  fetchBrokers();
  fetchTransportors();
  fetchWbOperators();
  fetchPackagings();
  fetchGodowns();
  fetchStockItems();
});
</script>
