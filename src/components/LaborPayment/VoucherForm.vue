<template>
  <v-container fluid>
    <v-card elevation="2" class="rounded-lg h-100">
      <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
        Voucher Form
      </v-card-title>
      <v-card-text class="pa-4">
        <v-row align="center" class="mb-4">
          <!-- Voucher Date -->
          <v-col cols="12" md="4">
            <v-text-field v-model="voucher.voucher_date" label="Voucher Date" type="date" variant="outlined"
              density="compact" :rules="[v => !!v || 'Voucher date is required']"></v-text-field>
          </v-col>
          <!-- Add Voucher Button -->
          <v-col cols="12" md="8" class="d-flex justify-end">
            <v-btn color="primary" prepend-icon="mdi-plus" @click="showVoucherModal = true">
              Add Voucher
            </v-btn>
          </v-col>
        </v-row>

        <!-- Voucher Table -->
        <v-data-table v-if="vouchers.length" :headers="headers" :items="vouchers" density="compact" class="elevation-1"
          hover>
          <template v-slot:item.amount="{ item }">
            {{ (Number(item.bag_nos) || 0) * (Number(item.rate) || 0) }}
          </template>
          <template v-slot:item.actions="{ index }">
            <v-icon color="error" @click="deleteVoucher(index)" class="cursor-pointer">mdi-delete</v-icon>
          </template>
          <template v-slot:bottom>
            <div class="d-flex justify-end pa-4 bg-grey-lighten-4 font-weight-bold">
              <span class="mr-4">Total Bags: {{ totalBags }}</span>
              <span>Total Amount: ₹ {{ totalAmount }}</span>
            </div>
          </template>
        </v-data-table>

        <!-- Remarks -->
        <v-row class="mt-4">
          <v-col cols="12">
            <v-textarea v-model="voucher.remarks" label="Remarks" placeholder="Enter remarks" variant="outlined"
              density="compact" rows="3" @input="voucher.remarks = $event.target.value.toUpperCase()"
              :rules="[v => !!v || 'Remarks is required']"></v-textarea>
          </v-col>
        </v-row>

        <!-- Submit Button -->
        <v-row>
          <v-col cols="12" class="d-flex justify-center">
            <v-btn color="primary" size="large" @click="handleSubmit">
              Submit
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Voucher Modal -->
    <v-dialog v-model="showVoucherModal" max-width="500px">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold text-center py-4 bg-primary text-white">
          Add Voucher
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="voucherForm">
            <!-- Gang -->
            <v-select v-model="newVoucher.gang" :items="gangs" item-title="gang_name" item-value="gang_name"
              label="Gang" variant="outlined" density="compact" class="mb-2"
              :rules="[v => !!v || 'Gang is required']"></v-select>

            <!-- Work Item -->
            <v-select v-model="newVoucher.workItem" :items="workItems" item-title="labour_item_name"
              item-value="labour_item_name" label="Work Item" variant="outlined" density="compact" class="mb-2"
              :rules="[v => !!v || 'Work Item is required']"></v-select>

            <!-- Particular -->
            <v-select v-model="newVoucher.particular" :items="particulars" item-title="work_name" item-value="work_name"
              label="Particular" variant="outlined" density="compact" class="mb-2"
              :rules="[v => !!v || 'Particular is required']"></v-select>

            <!-- Weight -->
            <v-select v-model="newVoucher.weight" :items="packagings" item-title="bag_weight" item-value="bag_weight"
              label="Bags Packaging (KG)" variant="outlined" density="compact" class="mb-2"
              :rules="[v => !!v || 'Weight is required']"></v-select>

            <!-- Bag nos -->
            <v-text-field v-model.number="newVoucher.bag_nos" label="Bag (nos)" type="number" variant="outlined"
              density="compact" class="mb-2" :rules="[v => (!!v && v > 0) || 'Valid Bag Nos is required']"
              @keydown.down.prevent @keydown.up.prevent></v-text-field>

            <!-- Rate -->
            <v-text-field v-model.number="newVoucher.rate" label="Rate" type="number" variant="outlined"
              density="compact" class="mb-2" :rules="[v => (!!v && v > 0) || 'Valid Rate is required']"
              @keydown.down.prevent @keydown.up.prevent></v-text-field>

            <!-- Amount -->
            <v-text-field :model-value="AmountCalculate" label="Amount" variant="outlined" density="compact"
              class="mb-2" disabled></v-text-field>

            <!-- Origin -->
            <v-select v-model="newVoucher.origin" :items="locations" item-title="work_locations"
              item-value="work_locations" label="Origin" variant="outlined" density="compact" class="mb-2"
              :rules="[v => !!v || 'Origin is required']"></v-select>

            <!-- Destination -->
            <v-select v-model="newVoucher.destination" :items="locations" item-title="work_locations"
              item-value="work_locations" label="Destination" variant="outlined" density="compact" class="mb-2"
              :rules="[v => !!v || 'Destination is required']"></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-center pb-4">
          <v-btn color="primary" variant="elevated" @click="addVoucher">Add</v-btn>
          <v-btn color="warning" variant="elevated" @click="clearVoucherForm">Clear</v-btn>
          <v-btn color="error" variant="elevated" @click="showVoucherModal = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import config from '@/config'

const toast = useToast()
const showVoucherModal = ref(false)
const voucher = ref({
  user_login_id: '',
  voucher_date: '',
  remarks: '',
})
const newVoucher = ref({
  gang: '',
  workItem: '',
  particular: '',
  weight: '',
  bag_nos: '',
  rate: '',
  origin: '',
  destination: '',
})
const vouchers = ref([])
const gangs = ref([])
const workItems = ref([])
const particulars = ref([])
const locations = ref([])
const packagings = ref([])
const isModuleEnabled = ref(false)

const headers = [
  { title: 'Gang Name', key: 'gang', align: 'center' },
  { title: 'Work Item', key: 'workItem', align: 'center' },
  { title: 'Particular', key: 'particular', align: 'center' },
  { title: 'Bags packaging (KG)', key: 'weight', align: 'center' },
  { title: 'Bags(Nos)', key: 'bag_nos', align: 'center' },
  { title: 'Rate', key: 'rate', align: 'center' },
  { title: 'Amount', key: 'amount', align: 'center' },
  { title: 'Origin', key: 'origin', align: 'center' },
  { title: 'Destination', key: 'destination', align: 'center' },
  { title: 'Actions', key: 'actions', align: 'center', sortable: false },
]

// Computed properties
const totalBags = computed(() => {
  return vouchers.value.reduce((sum, voucher) => sum + Number(voucher.bag_nos || 0), 0)
})

const totalAmount = computed(() => {
  return vouchers.value.reduce((sum, voucher) => {
    const amount = (Number(voucher.bag_nos) || 0) * (Number(voucher.rate) || 0)
    return sum + amount
  }, 0)
})

const AmountCalculate = computed(() => {
  const bagNos = Number(newVoucher.value.bag_nos) || 0
  const rate = Number(newVoucher.value.rate) || 0
  return (bagNos * rate).toFixed(2)
})

watch(
  () => newVoucher.value.gang,
  (newGang) => {
    const selectedGang = gangs.value.find((gang) => gang.gang_name === newGang)
    newVoucher.value.rate =
      selectedGang && selectedGang.work_rate ? Number(selectedGang.work_rate).toFixed(2) : ''
  },
)

// Fetch dropdown options
const fetchGangs = async () => {
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/labour-gang/get_labour_gang`,
      {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      },
    )
    gangs.value = response.data
  } catch (error) {
    console.error('Error fetching gangs:', error)
    toast.error('Failed to fetch gangs.')
  }
}

const fetchWorkItems = async () => {
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/work-items/get_labour_work_item`,
      {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      },
    )
    workItems.value = response.data
  } catch (error) {
    console.error('Error fetching work items:', error)
    toast.error('Failed to fetch work items.')
  }
}

const fetchParticulars = async () => {
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/work-particular/get_labour_work_particulars_details`,
      {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      },
    )
    particulars.value = response.data
  } catch (error) {
    console.error('Error fetching particulars:', error)
    toast.error('Failed to fetch particulars.')
  }
}

const fetchPackagings = async () => {
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/bag-packaging/get_labour_bag_packaging_details`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      },
    )
    if (response.status === 200) {
      packagings.value = response.data
    }
  } catch (error) {
    console.error('Error fetching packaging details:', error)
    toast.error('Failed to fetch packaging details.')
  }
}

const fetchLocations = async () => {
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/work-location/get_labour_work_location_details`,
      {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      },
    )
    locations.value = response.data
  } catch (error) {
    console.error('Error fetching locations:', error)
    toast.error('Failed to fetch locations.')
  }
}

// Add voucher to table
const addVoucher = () => {
  if (!newVoucher.value.gang) {
    toast.error('Please select a Gang')
    return
  }
  if (!newVoucher.value.workItem) {
    toast.error('Please select a Work Item')
    return
  }
  if (!newVoucher.value.particular) {
    toast.error('Please select a Particular')
    return
  }
  if (!newVoucher.value.weight) {
    toast.error('Please select a Bag Packaging weight')
    return
  }
  if (!newVoucher.value.bag_nos || newVoucher.value.bag_nos <= 0) {
    toast.error('Please enter a valid Bag Nos')
    return
  }
  if (!newVoucher.value.rate || newVoucher.value.rate <= 0) {
    toast.error('Please enter a valid Rate')
    return
  }
  if (!newVoucher.value.origin) {
    toast.error('Please select an Origin')
    return
  }
  if (!newVoucher.value.destination) {
    toast.error('Please select a Destination')
    return
  }
  vouchers.value.push({
    ...newVoucher.value,
  })
  clearVoucherForm()
  showVoucherModal.value = false
  toast.success('Voucher added successfully.')
}

// Clear modal form
const clearVoucherForm = () => {
  newVoucher.value = {
    gang: '',
    workItem: '',
    particular: '',
    weight: '',
    rate: '',
    origin: '',
    destination: '',
  }
}

// Delete voucher from table
const deleteVoucher = (index) => {
  vouchers.value.splice(index, 1)
  toast.success('Voucher deleted successfully.')
}

// Validate form before submission
const validateVoucherForm = () => {
  if (!voucher.value.voucher_date) {
    toast.error('Voucher date is required.')
    return false
  }
  if (vouchers.value.length === 0) {
    toast.error('Please add at least one voucher.')
    return false
  }
  if (!voucher.value.remarks) {
    toast.error('Remarks is required')
    return false
  }
  return true
}

// Fetch module status
const fetchModuleStatus = async () => {
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
    const labourPaymentModule = modules.find((m) => m.module_name === 'labour_payment')
    if (!labourPaymentModule) {
      console.warn('Labour Payment module not found')
      isModuleEnabled.value = false
      toast.error('Labour payment module not found. Contact support.')
      return
    }
    isModuleEnabled.value = labourPaymentModule.module_enabled
  } catch (error) {
    console.error('Error fetching module status:', error)
    isModuleEnabled.value = false
    toast.error('Failed to fetch module status. Please check your network or contact support.')
  }
}

// Submit form to API
const handleSubmit = async () => {
  if (!isModuleEnabled.value) {
    toast.info('Please purchase the Laybor payment module to add a voucher.')
    return
  }
  if (!validateVoucherForm()) return;

  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Authentication token not found. Please login again.');
      return;
    }

    const payload = {
      user_login_id: voucher.value.user_login_id,
      vch_date: voucher.value.voucher_date,
      remarks: voucher.value.remarks,

      labour_gang: vouchers.value.map(v => ({
        gang_name: v.gang,
        gang_mob_no: "",
        work_rate: Number(v.rate),
        is_active: true,
        remarks: v.remarks || "",
      })),
      labour_work_item: vouchers.value.map(v => ({
        work_item_name: v.workItem,
        remarks: v.remarks || "",
      })),
      labour_work_particulars: vouchers.value.map(v => ({
        particular_name: v.particular,
        remarks: v.remarks || "",
      })),
      labour_bag_packaging_weight: vouchers.value.map(v => ({
        bag_weight: Number(v.weight),
        bags_nos: Number(v.bag_nos),
        gang_name: v.gang,
        remarks: v.remarks || "",
      })),
      labour_work_location_id_origin: vouchers.value.map(v => ({
        work_locations: v.origin,
        remarks: v.remarks || "",
      })),
      labour_work_location_id_destination: vouchers.value.map(v => ({
        work_locations: v.destination,
        remarks: v.remarks || "",
      })),
    };

    const response = await axios.post(
      `${config.apiBaseUrl}/api/${config.version}/labour-payment-vouchers/create_voucher`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 200 || response.status === 201) {
      toast.success('Voucher form submitted successfully!');
      voucher.value = { voucher_date: '', remarks: '', user_login_id: voucher.value.user_login_id, };
      vouchers.value = [];
    }
  } catch (error) {
    console.error('Voucher submission failed:', error.response?.data || error.message);
    toast.error(`Failed to submit voucher: ${error.response?.data?.message || error.message}`);
  }
};

// Initialize user data and fetch dropdown options
onMounted(() => {
  const user = JSON.parse(sessionStorage.getItem('user'))
  if (user && user.id) {
    voucher.value.user_login_id = user.id
  }
  fetchGangs()
  fetchWorkItems()
  fetchParticulars()
  fetchPackagings()
  fetchLocations()
  fetchModuleStatus()
})
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>
