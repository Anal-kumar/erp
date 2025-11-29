<template>
  <v-container fluid>
    <v-row>
      <!-- Left Side: Main Form -->
      <v-col cols="12" md="6">
        <v-card elevation="2" class="rounded-lg">
          <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
            Incoming Form ( आवक )
          </v-card-title>
          <v-card-text class="pa-4">
            <v-form @submit.prevent="submitForm" ref="formRef">
              <v-row>
                <!-- I/O Date -->
                <v-col cols="12" md="6">
                  <v-text-field v-model="form.io_date" label="I/O Date" type="date" variant="outlined" density="compact"
                    required></v-text-field>
                </v-col>

                <!-- Type -->
                <v-col cols="12" md="6">
                  <v-select v-model="form.is_incoming"
                    :items="[{ title: 'Incoming', value: true }, { title: 'Outgoing', value: false }]" label="Type"
                    item-title="title" item-value="value" variant="outlined" density="compact" disabled></v-select>
                </v-col>

                <!-- RST Bill -->
                <v-col cols="12" md="6">
                  <v-text-field v-model="form.rst_bill" label="RST / Bill No." placeholder="Enter RST/ Bill"
                    variant="outlined" density="compact"
                    @input="form.rst_bill = $event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')"></v-text-field>
                </v-col>

                <!-- Brought By -->
                <v-col cols="12" md="6">
                  <v-text-field v-model="form.brought_by" label="Brought By" placeholder="Enter Brought by"
                    variant="outlined" density="compact"
                    @input="form.brought_by = $event.target.value.toUpperCase()"></v-text-field>
                </v-col>

                <!-- Mobile Number -->
                <v-col cols="12" md="6">
                  <v-text-field v-model="form.mob_no" label="Mobile Number" placeholder="Enter mobile number"
                    variant="outlined" density="compact" maxlength="10"
                    :error-messages="mobileError ? 'Please enter a valid 10-digit mobile number' : ''"
                    @input="validateMobile"></v-text-field>
                </v-col>

                <!-- Vehicle Number -->
                <v-col cols="12" md="6">
                  <div class="d-flex ga-2">
                    <v-text-field v-model="form.vehicle_no_prefix" label="Vehicle No Prefix" placeholder="CG04QB"
                      variant="outlined" density="compact" maxlength="6" class="w-50"
                      @input="form.vehicle_no_prefix = $event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')"></v-text-field>
                    <v-text-field v-model="form.vehicle_no_suffix" label="Suffix" placeholder="1234" variant="outlined"
                      density="compact" maxlength="4" class="w-50"
                      @input="form.vehicle_no_suffix = $event.target.value.replace(/\D/g, '').slice(0, 4)"></v-text-field>
                  </div>
                </v-col>

                <!-- Origin -->
                <v-col cols="12" md="6">
                  <v-text-field v-model="form.origin" label="Origin" placeholder="Enter origin" variant="outlined"
                    density="compact" maxlength="100"
                    @input="form.origin = $event.target.value.toUpperCase()"></v-text-field>
                </v-col>

                <!-- Party Through -->
                <v-col cols="12" md="6">
                  <v-text-field v-model="form.party_through" label="Party Through" placeholder="Enter party through"
                    variant="outlined" density="compact" maxlength="100"
                    @input="form.party_through = $event.target.value.toUpperCase()"></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-btn color="success" prepend-icon="mdi-plus" @click="openModal" :disabled="isSubmitting" block>
                    Add Item
                  </v-btn>
                </v-col>

                <!-- Transportation Expense -->
                <v-col cols="12" md="6">
                  <v-text-field v-model.number="form.transportation_expense" label="Transportation Expense (₹)"
                    type="number" variant="outlined" density="compact" min="0" step="0.01" required></v-text-field>
                </v-col>

                <!-- Payment -->
                <v-col cols="12" md="6">
                  <v-text-field v-model.number="form.payment_amount" label="Payment (₹)" type="number"
                    variant="outlined" density="compact" min="0" step="0.01"></v-text-field>
                </v-col>

                <!-- Payment Date -->
                <v-col cols="12" md="6">
                  <v-text-field v-model="form.payment_date" label="Payment Date" type="date" variant="outlined"
                    density="compact"></v-text-field>
                </v-col>

                <!-- Remarks -->
                <v-col cols="12">
                  <v-textarea v-model="form.remarks" label="Remarks" placeholder="Enter remarks" variant="outlined"
                    density="compact" rows="3" maxlength="500"
                    @input="form.remarks = $event.target.value.toUpperCase()"></v-textarea>
                </v-col>

                <!-- Submit Button -->
                <v-col cols="12" class="text-center">
                  <v-btn type="submit" color="primary" size="large" :loading="isSubmitting"
                    :disabled="isSubmitting || !isFormValid">
                    Submit
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right Side: Added Items -->
      <v-col cols="12" md="6">
        <v-card elevation="2" class="rounded-lg h-100">
          <v-card-title class="text-h6 font-weight-bold">Added Items</v-card-title>
          <v-card-text>
            <v-data-table :headers="headers" :items="form.incoming_outgoing_items" density="compact"
              class="elevation-1">
              <template v-slot:item.sno="{ index }">
                {{ index + 1 }}
              </template>
              <template v-slot:item.bags_no="{ item }">
                {{ item.bags_no ? 'Yes' : 'No' }}
              </template>
              <template v-slot:item.actions="{ index }">
                <div class="d-flex ga-2 justify-center">
                  <v-icon color="primary" size="small" @click="editItem(index)"
                    class="cursor-pointer">mdi-pencil</v-icon>
                  <v-icon color="error" size="small" @click="deleteItem(index)"
                    class="cursor-pointer">mdi-delete</v-icon>
                </div>
              </template>
              <template v-slot:no-data>
                <div class="text-center text-grey pa-4">No items added yet.</div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal -->
    <v-dialog v-model="isModalOpen" max-width="600px">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
          {{ editIndex !== null ? 'Update Item' : 'Add Item' }}
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form @submit.prevent="addItem">
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="modalData.jins" label="Jins" placeholder="Enter Jins" variant="outlined"
                  density="compact" required maxlength="50"
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
                <v-text-field v-model="modalData.packaging" label="Packaging" placeholder="Enter Packaging"
                  variant="outlined" density="compact"
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
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-center pb-4">
          <v-btn color="primary" variant="elevated" @click="addItem" :disabled="!isModalFormValid">
            {{ editIndex !== null ? 'Update' : 'Add' }}
          </v-btn>
          <v-btn color="error" variant="elevated" @click="closeModal">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from 'axios'
import config from '@/config'
import { useToast } from 'vue-toastification'

export default {
  data() {
    return {
      form: {
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
      },
      modalData: {
        jins: '',
        bags_no: true, // Default to true (Bags) based on original code select option
        quantity: '',
        packaging: '',
        weight_society: '',
        weight_wb: '',
        amount: '',
      },
      isModalOpen: false,
      editIndex: null,
      isSubmitting: false,
      mobileError: false,
      isModuleEnabled: true,
      headers: [
        { title: 'SNO', key: 'sno', align: 'center', sortable: false },
        { title: 'Jins', key: 'jins', align: 'center' },
        { title: 'Bags', key: 'bags_no', align: 'center' },
        { title: 'Quantity', key: 'quantity', align: 'center' },
        { title: 'Packaging', key: 'packaging', align: 'center' },
        { title: 'Weight (Society)', key: 'weight_society', align: 'center' },
        { title: 'Weight (WB)', key: 'weight_wb', align: 'center' },
        { title: 'Amount(₹)', key: 'amount', align: 'center' },
        { title: 'Action', key: 'actions', align: 'center', sortable: false },
      ],
    }
  },
  computed: {
    isModalFormValid() {
      return this.modalData.jins && this.modalData.jins.trim() && this.modalData.quantity > 0
    },
    fullVehicleNumber() {
      const prefix = (this.form.vehicle_no_prefix || '').toUpperCase()
      const suffix = (this.form.vehicle_no_suffix || '').toUpperCase()
      return `${prefix}${suffix}`
    },
    isFormValid() {
      return (
        this.form.io_date &&
        this.form.transportation_expense >= 0 &&
        !this.mobileError &&
        this.form.incoming_outgoing_items.length > 0
      )
    },
  },
  mounted() {
    this.toast = useToast()
    this.fetchModuleStatus()
    const sessionUser = sessionStorage.getItem('user')
    if (sessionUser) {
      const user = JSON.parse(sessionUser)
      this.form.user_login_id = user?.id
    }
  },
  methods: {
    validateMobile() {
      const mobileRegex = /^[0-9]{10}$/
      this.mobileError = this.form.mob_no && !mobileRegex.test(this.form.mob_no)
    },
    sanitizeInput(input) {
      if (typeof input === 'string') {
        return input.replace(/[<>]/g, '').trim()
      }
      return input
    },
    openModal() {
      this.editIndex = null
      this.isModalOpen = true
      this.modalData = {
        jins: '',
        bags_no: true,
        quantity: '',
        packaging: '',
        weight_society: '',
        weight_wb: '',
        amount: '',
      }
    },
    closeModal() {
      this.isModalOpen = false
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
    },
    addItem() {
      const sanitizedItem = {
        jins: this.sanitizeInput(this.modalData.jins),
        bags_no: this.modalData.bags_no,
        quantity: Number(this.modalData.quantity) || 0,
        packaging: this.modalData.packaging || null,
        weight_society: Number(this.modalData.weight_society) || 0,
        weight_wb: Number(this.modalData.weight_wb) || 0,
        amount: Number(this.modalData.amount) || 0,
      }

      if (this.editIndex !== null) {
        this.form.incoming_outgoing_items[this.editIndex] = { ...sanitizedItem }
      } else {
        this.form.incoming_outgoing_items.push({ ...sanitizedItem })
      }
      this.closeModal()
    },
    deleteItem(index) {
      this.form.incoming_outgoing_items.splice(index, 1)
    },
    editItem(index) {
      this.modalData = { ...this.form.incoming_outgoing_items[index] }
      this.editIndex = index
      this.isModalOpen = true
    },
    async fetchModuleStatus() {
      try {
        const response = await axios.get(
          `${config.apiBaseUrl}/api/${config.version}/modules/get_modules`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            },
          },
        )
        const modules = response.data
        const incomingModule = modules.find((m) => m.module_name === 'incoming')
        if (!incomingModule) {
          this.isModuleEnabled = false
          this.toast.error('Incoming module not found. Contact support.')
          return
        }
        this.isModuleEnabled = incomingModule.module_enabled
      } catch (error) {
        console.error('Error fetching module status:', error)
        this.isModuleEnabled = false
        this.toast.error('Failed to fetch module status. Please check your network or contact support.')
      }
    },
    async submitForm() {
      if (!this.isModuleEnabled) {
        this.toast.info('Please purchase the Incoming module to add a incoming.')
        return
      }
      if (!this.isFormValid) {
        this.toast.error('Please fill all required fields correctly and add at least one item')
        return
      }

      this.isSubmitting = true

      try {
        if (!config.apiBaseUrl) {
          throw new Error('API base URL is not defined in config')
        }

        const payload = {
          io_date: this.form.io_date,
          is_incoming: this.form.is_incoming,
          rst_bill: this.sanitizeInput(this.form.rst_bill) || '',
          brought_by: this.sanitizeInput(this.form.brought_by) || null,
          mob_no: this.sanitizeInput(this.form.mob_no) || '',
          vehicle_no: this.fullVehicleNumber || null,
          origin: this.sanitizeInput(this.form.origin) || null,
          party_through: this.sanitizeInput(this.form.party_through) || null,
          transportation_expense: Number(this.form.transportation_expense) || 0,
          remarks: this.sanitizeInput(this.form.remarks) || null,
          user_login_id: this.form.user_login_id,
          incoming_outgoing_payment: [
            {
              payment_amount: Number(this.form.payment_amount) || 0,
              payment_date: this.form.payment_date || null,
            }
          ],
          incoming_outgoing_items: this.form.incoming_outgoing_items.map((item) => ({
            jins: this.sanitizeInput(item.jins),
            bags_no: item.bags_no,
            quantity: Number(item.quantity),
            packaging: item.packaging || null,
            weight_society: Number(item.weight_society) || 0,
            weight_wb: Number(item.weight_wb) || 0,
            amount: Number(item.amount) || 0,
          })),
        }

        await axios.post(
          `${config.apiBaseUrl}/api/${config.version}/incoming_outgoing/`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            },
          },
        )

        this.toast.success('Form submitted successfully!')

        // Reset form
        this.form = {
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
          user_login_id: this.form.user_login_id,
          incoming_outgoing_items: [],
        }
        this.mobileError = false
        this.fetchModuleStatus()
      } catch (error) {
        console.error('Submission Error:', error)
        if (error.response) {
          this.toast.error(error.response.data?.message || 'Server error occurred.')
        } else {
          this.toast.error('Network error: ' + error.message)
        }
      } finally {
        this.isSubmitting = false
      }
    },
  },
}
</script>

<style scoped>
/* Vuetify handles most styles, but we can add custom ones if needed */
</style>
