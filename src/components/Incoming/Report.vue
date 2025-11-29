<template>
  <v-container fluid>
    <v-card elevation="2" class="rounded-lg h-100">
      <v-card-title class="text-h4 font-weight-bold text-center py-4 bg-primary text-white">
        Incoming Report (आवक रिपोर्ट)
      </v-card-title>
      <v-card-text class="pa-4">
        <!-- Filters -->
        <v-row class="mb-4" justify="center">
          <v-col cols="12" md="2">
            <v-text-field v-model="filters.brought_by" label="Brought By" placeholder="Search Brought By"
              variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field v-model="filters.party_through" label="Party Through" placeholder="Search Party Through"
              variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field v-model="filters.vehicle_no" label="Vehicle No" placeholder="Search Vehicle No"
              variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field v-model="filters.from_date" label="From Date" type="date" variant="outlined" density="compact"
              hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field v-model="filters.to_date" label="To Date" type="date" variant="outlined" density="compact"
              hide-details></v-text-field>
          </v-col>
        </v-row>

        <!-- Table -->
        <v-data-table :headers="headers" :items="filteredRecords" :items-per-page="10" density="compact"
          class="elevation-1" hover>
          <template v-slot:item.sno="{ index }">
            {{ index + 1 }}
          </template>
          <template v-slot:item.io_date="{ item }">
            {{ formatDate(item.io_date) }}
          </template>
          <template v-slot:item.total_amount="{ item }">
            ₹{{ getTotalAmount(item) }}
          </template>
          <template v-slot:item.payment_date="{ item }">
            {{ formatDate(item.incoming_outgoing_payment[0]?.payment_date) }}
          </template>
          <template v-slot:item.payment_amount="{ item }">
            {{ item.incoming_outgoing_payment[0]?.payment_amount || '-' }}
          </template>
          <template v-slot:item.amount_due="{ item }">
            {{ getAmountDue(item) }}
          </template>
          <template v-slot:item.payment_status="{ item }">
            <v-chip :color="getPaymentStatusColor(item)" size="small" class="font-weight-bold">
              {{ getPaymentStatus(item).status }}
            </v-chip>
          </template>
          <template v-slot:item.items="{ item }">
            <v-table density="compact" class="text-caption" v-if="item.incoming_outgoing_items?.length">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Jins</th>
                  <th>Bags/Nos</th>
                  <th>Pkg</th>
                  <th>Qty</th>
                  <th>Wt(Soc)</th>
                  <th>Wt(WB)</th>
                  <th>Amt</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(subItem, idx) in item.incoming_outgoing_items" :key="idx">
                  <td>{{ idx + 1 }}</td>
                  <td>{{ subItem.jins || '-' }}</td>
                  <td>{{ subItem.bags_no ? 'Yes' : 'No' }}</td>
                  <td>{{ subItem.packaging || '-' }}</td>
                  <td>{{ subItem.quantity || '-' }}</td>
                  <td>{{ subItem.weight_society || '-' }}</td>
                  <td>{{ subItem.weight_wb || '-' }}</td>
                  <td>₹ {{ subItem.amount || 0 }}</td>
                </tr>
                <tr class="font-weight-bold bg-grey-lighten-4">
                  <td colspan="4" class="text-center">Total</td>
                  <td>{{item.incoming_outgoing_items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0)}}</td>
                  <td>{{item.incoming_outgoing_items.reduce((sum, i) => sum + (Number(i.weight_society) || 0), 0)}}
                  </td>
                  <td>{{item.incoming_outgoing_items.reduce((sum, i) => sum + (Number(i.weight_wb) || 0), 0)}}</td>
                  <td>₹ {{item.incoming_outgoing_items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0)}}</td>
                </tr>
              </tbody>
            </v-table>
            <span v-else class="text-grey">No items</span>
          </template>
        </v-data-table>

        <!-- Summary -->
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

        <!-- Download Button -->
        <div class="mt-6 text-center">
          <v-btn color="primary" size="large" prepend-icon="mdi-download" @click="downloadReport">
            Download Excel Report
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import axios from 'axios'
import config from '@/config.js'

export default {
  data() {
    return {
      records: [],
      items: [],
      filters: {
        brought_by: '',
        party_through: '',
        vehicle_no: '',
        from_date: '',
        to_date: '',
      },
      headers: [
        { title: 'S.No', key: 'sno', align: 'center', sortable: false },
        { title: 'I/O Date', key: 'io_date', align: 'center' },
        { title: 'RST / Bill No.', key: 'rst_bill', align: 'center' },
        { title: 'Brought By', key: 'brought_by', align: 'center' },
        { title: 'Mobile', key: 'mob_no', align: 'center' },
        { title: 'Vehicle No.', key: 'vehicle_no', align: 'center' },
        { title: 'Origin', key: 'origin', align: 'center' },
        { title: 'Party Through', key: 'party_through', align: 'center' },
        { title: 'Transport Exp. (₹)', key: 'transportation_expense', align: 'center' },
        { title: 'Total Amount (₹)', key: 'total_amount', align: 'center' },
        { title: 'Payment Date', key: 'payment_date', align: 'center' },
        { title: 'Payment (₹)', key: 'payment_amount', align: 'center' },
        { title: 'Amount Due(₹)', key: 'amount_due', align: 'center' },
        { title: 'Payment Status', key: 'payment_status', align: 'center' },
        { title: 'Remarks', key: 'remarks', align: 'center' },
        { title: 'Items', key: 'items', align: 'center', sortable: false, width: '400px' },
      ],
    }
  },
  computed: {
    filteredRecords() {
      return this.records.filter((entry) => {
        const by =
          !this.filters.brought_by ||
          entry.brought_by?.toLowerCase().includes(this.filters.brought_by.toLowerCase())
        const partyThrough =
          !this.filters.party_through ||
          entry.party_through?.toLowerCase().includes(this.filters.party_through.toLowerCase())
        const vehicle =
          !this.filters.vehicle_no ||
          entry.vehicle_no?.toLowerCase().includes(this.filters.vehicle_no.toLowerCase())

        const entryDate = new Date(entry.io_date)
        const from = this.filters.from_date ? new Date(this.filters.from_date) : null
        const to = this.filters.to_date ? new Date(this.filters.to_date) : null
        const matchesDate = (!from || entryDate >= from) && (!to || entryDate <= to)

        return by && partyThrough && vehicle && matchesDate
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
  },
  mounted() {
    this.fetchRecords()
  },
  methods: {
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    },
    fetchRecords() {
      axios
        .get(`${config.apiBaseUrl}/api/${config.version}/incoming_outgoing/get_incoming_outgoing`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        })
        .then((response) => {
          this.records = response.data.filter((entry) => entry.is_incoming === true)
        })
        .catch((error) => {
          console.error('Fetch failed:', error)
        })
    },
    getTotalAmount(entry) {
      if (!entry?.incoming_outgoing_items?.length) return 0
      const Item_amount = entry.incoming_outgoing_items.reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0
      )
      const transport = Number(entry.transportation_expense) || 0;
      return Item_amount + transport
    },
    getAmountDue(entry) {
      if (!entry) return 0
      const total = this.getTotalAmount(entry)
      const paid = Number(entry.incoming_outgoing_payment[0]?.payment_amount) || 0
      return Math.max(0, total - paid)
    },
    getPaymentStatus(entry) {
      const due = parseFloat(this.getAmountDue(entry)) || 0
      const total = this.getTotalAmount(entry) || 0;
      if (due === 0 && total > 0) {
        return { status: 'Paid', color: 'green' }
      } else if (due > 0) {
        return { status: 'Pending', color: 'purple' }
      } else if (total === 0) {
        return { status: 'Unpaid', color: 'error' }
      }
      return { status: 'Unknown', color: 'grey' }
    },
    getPaymentStatusColor(entry) {
      return this.getPaymentStatus(entry).color
    },
    downloadReport() {
      const token = sessionStorage.getItem('token')
      const params = new URLSearchParams()
      if (this.filters.brought_by) params.append('brought_by', this.filters.brought_by)
      if (this.filters.party_through) params.append('party_through', this.filters.party_through)
      if (this.filters.vehicle_no) params.append('vehicle_no', this.filters.vehicle_no)
      if (this.filters.from_date) params.append('from_date', this.filters.from_date)
      if (this.filters.to_date) params.append('to_date', this.filters.to_date)
      params.append('download', 'true')

      axios
        .get(
          `${config.apiBaseUrl}/api/${config.version}/incoming_outgoing/download_incoming_report?${params.toString()}`,
          {
            responseType: 'blob',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'incoming_report_.xlsx')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        })
        .catch((error) => {
          console.error('Download failed:', error)
          alert('Download failed.')
        })
    },
  },
}
</script>

<style scoped>
/* Vuetify handles most styles */
</style>
