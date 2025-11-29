<template>
  <v-dialog :model-value="true" max-width="500" @click:outside="$emit('close')">
    <v-card>
      <v-card-title class="text-h6 font-weight-bold">Add Payment</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <!-- Payment Date -->
          <v-text-field v-model="newPayment.payment_date" label="Payment Date" type="date" variant="outlined"
            density="compact" required :rules="[v => !!v || 'Payment Date is required']" class="mb-2"></v-text-field>

          <!-- Payment Amount -->
          <v-text-field v-model.number="newPayment.payment_amount" label="Payment Amount (Rs.)" type="number"
            variant="outlined" density="compact" min="0" step="0.01" required
            :rules="[v => v !== null || 'Payment Amount is required']" class="mb-2"></v-text-field>

          <!-- Remarks -->
          <v-textarea v-model="newPayment.payment_remarks" label="Remarks" variant="outlined" density="compact" rows="3"
            placeholder="Enter remarks (will be converted to uppercase)"
            @input="newPayment.payment_remarks = $event.target.value.toUpperCase()" required
            :rules="[v => !!v || 'Remarks is required']" class="mb-2"></v-textarea>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-center pb-4">
        <v-btn color="success" variant="elevated" @click="addPayment" :disabled="!valid">
          Add Payment
        </v-btn>
        <v-btn color="warning" variant="elevated" @click="clearForm">
          Clear
        </v-btn>
        <v-btn color="error" variant="elevated" @click="$emit('close')">
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useToast } from 'vue-toastification'

const props = defineProps({
  payments: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['payment-added', 'close', 'update:modelValue'])
const toast = useToast()

const valid = ref(false)
const newPayment = ref({
  payment_amount: '',
  payment_date: '',
  payment_remarks: '',
})

const clearForm = () => {
  newPayment.value = {
    payment_amount: '',
    payment_date: '',
    payment_remarks: '',
  }
}

const addPayment = () => {
  if (!valid.value) {
    toast.error('All fields are required!')
    return
  }

  const payment = {
    payment_amount: Number(newPayment.value.payment_amount),
    payment_date: newPayment.value.payment_date,
    payment_remarks: newPayment.value.payment_remarks,
  }

  emit('payment-added', payment)
  toast.success('Payment added successfully!')
  clearForm()
  emit('close')
}
</script>