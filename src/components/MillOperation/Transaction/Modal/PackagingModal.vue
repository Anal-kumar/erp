<template>
  <v-dialog :model-value="true" max-width="500" @click:outside="$emit('close')">
    <v-card>
      <v-card-title class="text-h6 font-weight-bold">Add Packaging</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-select v-model="newPackaging.packaging_type" :items="packagings" item-title="packaging_name"
            item-value="packaging_name" label="Packaging Type" variant="outlined" density="compact" required
            :rules="[v => !!v || 'Packaging Type is required']" class="mb-2"></v-select>

          <v-text-field v-model="newPackaging.bag_weight" label="Bag Weight (Grams)" variant="outlined"
            density="compact" readonly bg-color="grey-lighten-4" class="mb-2"></v-text-field>

          <v-text-field v-model.number="newPackaging.bag_nos" label="Bag Nos" type="number" variant="outlined"
            density="compact" min="0" required :rules="[
              v => !!v || 'Bag Nos is required',
              v => v > 0 || 'Bag Nos must be greater than 0'
            ]" @keydown.down.prevent @keydown.up.prevent></v-text-field>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-center pb-4">
        <v-btn color="success" variant="elevated" @click="addPackaging"
          :disabled="!valid || !newPackaging.packaging_type || !newPackaging.bag_nos">
          Add
        </v-btn>
        <v-btn color="warning" variant="elevated" @click="clearPackagingForm">
          Clear
        </v-btn>
        <v-btn color="error" variant="elevated" @click="$emit('close')">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  packagings: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['add', 'close'])

const valid = ref(false)
const newPackaging = ref({
  packaging_type: '',
  bag_weight: '',
  bag_nos: ''
})

const addPackaging = () => {
  if (!valid.value) return

  emit('add', {
    type: newPackaging.value.packaging_type,
    bag_weight: Number(newPackaging.value.bag_weight),
    bag_nos: Number(newPackaging.value.bag_nos)
  })
  clearPackagingForm()
}

const clearPackagingForm = () => {
  newPackaging.value = {
    packaging_type: '',
    bag_weight: '',
    bag_nos: ''
  }
}

watch(
  () => newPackaging.value.packaging_type,
  (newType) => {
    const selected = props.packagings.find((p) => p.packaging_name === newType)
    newPackaging.value.bag_weight = selected ? selected.bag_weight.toString() : ''
    if (!newType) {
      newPackaging.value.bag_nos = ''
      newPackaging.value.bag_weight = ''
    }
  }
)
</script>