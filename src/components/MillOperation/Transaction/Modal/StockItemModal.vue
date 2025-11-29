<template>
  <v-dialog :model-value="true" max-width="500" @click:outside="$emit('close')">
    <v-card>
      <v-card-title class="text-h6 font-weight-bold">Stock Details</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <!-- Stock Item Name -->
          <v-select v-model="newStockItem.stock_item" :items="stockItems" item-title="stock_item_name"
            item-value="stock_item_name" label="Stock Item" variant="outlined" density="compact" required
            :rules="[v => !!v || 'Stock Item is required']" class="mb-2"></v-select>

          <!-- Bags (Nos) -->
          <v-text-field v-model.number="newStockItem.bags_nos" label="Bags (Nos)" type="number" variant="outlined"
            density="compact" min="0" required :rules="[
              v => !!v || 'Bags (Nos) is required',
              v => v > 0 || 'Bags (Nos) must be greater than 0'
            ]" @keydown.down.prevent @keydown.up.prevent class="mb-2"></v-text-field>

          <!-- Weight -->
          <v-text-field :model-value="stockItemWeight" label="Weight (Qtl)" variant="outlined" density="compact"
            readonly bg-color="grey-lighten-4" class="mb-2"></v-text-field>

          <!-- Rate -->
          <v-text-field v-model.number="newStockItem.rate" label="Rate (Rs./Qtl)" type="number" variant="outlined"
            density="compact" min="0" step="0.01" required
            :rules="[v => !!v || 'Rate is required', v => v >= 0 || 'Rate must be non-negative']" @keydown.up.prevent
            @keydown.down.prevent class="mb-2">
            <template v-slot:label>
              Rate <span class="text-red-500">*(Rs./Qtl)</span>
            </template>
          </v-text-field>

          <!-- Remarks -->
          <v-textarea v-model="newStockItem.remarks" label="Remarks" variant="outlined" density="compact" rows="3"
            @input="newStockItem.remarks = $event.target.value.toUpperCase()" class="mb-2"></v-textarea>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-center pb-4">
        <v-btn color="primary" variant="elevated" @click="submitDetails" :disabled="!isValid">
          Save
        </v-btn>
        <v-btn color="error" variant="elevated" @click="$emit('close')">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  stockItems: {
    type: Array,
    required: true
  },
  finalWeightQtl: {
    type: Number,
    default: 0
  },
  totalPackagingBags: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['add', 'close'])

const valid = ref(false)
const newStockItem = ref({
  stock_item: '',
  bags_nos: '',
  rate: '',
  remarks: ''
})

//calculate stock item weight for input fields in modal
const stockItemWeight = computed(() => {
  const totalBags = props.totalPackagingBags
  const newBags = Number(newStockItem.value.bags_nos || 0)
  return totalBags > 0 && newBags > 0
    ? ((props.finalWeightQtl / totalBags) * newBags).toFixed(2)
    : '0.00'
})

const isValid = computed(() => {
  return (
    newStockItem.value.stock_item &&
    newStockItem.value.bags_nos &&
    Number(newStockItem.value.bags_nos) > 0 &&
    newStockItem.value.rate &&
    Number(newStockItem.value.rate) >= 0 &&
    newStockItem.value.remarks?.trim()
  )
})

const submitDetails = () => {
  if (!isValid.value) {
    // Alert is handled by disabled button, but just in case
    return
  }

  emit('add', {
    stock_item: newStockItem.value.stock_item,
    bags_nos: Number(newStockItem.value.bags_nos),
    weight: parseFloat(stockItemWeight.value),
    rate: Number(newStockItem.value.rate),
    remarks: newStockItem.value.remarks
  })

  newStockItem.value = {
    stock_item: '',
    bags_nos: '',
    rate: '',
    remarks: ''
  }
}
</script>