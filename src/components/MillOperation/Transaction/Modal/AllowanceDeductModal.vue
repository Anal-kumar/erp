<template>
  <v-dialog :model-value="true" max-width="950" @click:outside="$emit('close')">
    <v-card>
      <v-card-title class="text-h6 font-weight-bold">Deduction/Allowance Calculator</v-card-title>
      <v-card-text class="pa-4">
        <v-container>
          <v-row>
            <!-- Form Section -->
            <v-col cols="12" md="5">
              <v-card variant="outlined" class="pa-4 h-100">
                <v-card-title class="text-subtitle-1 font-weight-bold mb-3">Entry Details</v-card-title>
                <v-form ref="form" v-model="isFormValid">
                  <v-select v-model="newEntry.is_allowance"
                    :items="[{ title: 'Deduction', value: false }, { title: 'Allowance', value: true }]"
                    item-title="title" item-value="value" label="Type" variant="outlined" density="compact"
                    class="mb-3"></v-select>

                  <v-text-field v-model="newEntry.allowance_deduction_name"
                    :label="`${newEntry.is_allowance ? 'Allowance' : 'Deduction'} Name`" variant="outlined"
                    density="compact" @input="newEntry.allowance_deduction_name = $event.target.value.toUpperCase()"
                    required :rules="[v => !!v || 'Name is required']" class="mb-3"></v-text-field>

                  <v-text-field v-model="newEntry.allowance_deduction_amount"
                    :label="`${newEntry.is_allowance ? 'Allowance' : 'Deduction'} Amount`" variant="outlined"
                    density="compact" readonly bg-color="grey-lighten-4" class="mb-3">
                    <template v-slot:append-inner>
                      <v-btn icon="mdi-close-circle" size="x-small" variant="text" color="error"
                        @click="newEntry.allowance_deduction_amount = ''"
                        v-if="newEntry.allowance_deduction_amount"></v-btn>
                    </template>
                  </v-text-field>

                  <v-textarea v-model="newEntry.remarks" label="Remarks" variant="outlined" density="compact" rows="3"
                    @input="newEntry.remarks = $event.target.value.toUpperCase()" required
                    :rules="[v => !!v || 'Remarks is required']" class="mb-3"></v-textarea>

                  <div class="d-flex justify-center ga-3 mt-4">
                    <v-btn color="success" @click="addEntry"
                      :disabled="!isFormValid || !newEntry.allowance_deduction_name || !newEntry.allowance_deduction_amount">
                      Add Entry
                    </v-btn>
                    <v-btn color="error" @click="$emit('close')">
                      Close
                    </v-btn>
                  </div>
                </v-form>
              </v-card>
            </v-col>

            <!-- Calculator Section -->
            <v-col cols="12" md="7">
              <v-card variant="outlined" class="pa-4 h-100">
                <v-card-title class="text-subtitle-1 font-weight-bold mb-3">Calculator</v-card-title>

                <!-- Quick Reference Info -->
                <v-row dense class="mb-3">
                  <v-col cols="6" sm="3">
                    <v-text-field :model-value="noOfPackagingBags" label="Bags" variant="outlined" density="compact"
                      readonly bg-color="grey-lighten-4" hide-details></v-text-field>
                  </v-col>
                  <v-col cols="6" sm="3">
                    <v-text-field :model-value="finalWeightQtl" label="Weight (Qtl)" variant="outlined"
                      density="compact" readonly bg-color="grey-lighten-4" hide-details></v-text-field>
                  </v-col>
                  <v-col cols="6" sm="3">
                    <v-text-field :model-value="Math.round(grossTotal)" label="Gross (₹)" variant="outlined"
                      density="compact" readonly bg-color="grey-lighten-4" hide-details></v-text-field>
                  </v-col>
                  <v-col cols="6" sm="3">
                    <v-text-field :model-value="brokerage_rate" label="Brokerage" variant="outlined" density="compact"
                      readonly bg-color="grey-lighten-4" hide-details></v-text-field>
                  </v-col>
                </v-row>

                <!-- Quick Presets -->
                <div class="mb-3">
                  <div class="text-caption mb-2">Quick Calculations:</div>
                  <div class="d-flex flex-wrap ga-2">
                    <v-btn size="small" variant="outlined" @click="calculateBrokerage">
                      Brokerage
                    </v-btn>
                    <v-btn size="small" variant="outlined" @click="calculatePerBag">
                      Per Bag
                    </v-btn>
                    <v-btn size="small" variant="outlined" @click="calculatePerQuintal">
                      Per Quintal
                    </v-btn>
                  </div>
                </div>

                <!-- Calculator Operations -->
                <div class="calculator-grid">
                  <!-- Addition -->
                  <div class="calc-row">
                    <v-text-field v-model="add1" @input="selectedOperation = 'add'" type="number" density="compact"
                      variant="outlined" hide-details placeholder="0"></v-text-field>
                    <span class="operator">+</span>
                    <v-text-field v-model="add2" @input="selectedOperation = 'add'" type="number" density="compact"
                      variant="outlined" hide-details placeholder="0"></v-text-field>
                    <span class="operator">=</span>
                    <v-text-field :model-value="addition" readonly density="compact" variant="outlined"
                      bg-color="grey-lighten-4" hide-details></v-text-field>
                    <v-btn icon="mdi-arrow-left" size="small" variant="text" @click="useResult(addition)"
                      :disabled="!addition"></v-btn>
                  </div>

                  <!-- Subtraction -->
                  <div class="calc-row">
                    <v-text-field v-model="sub1" @input="selectedOperation = 'sub'" type="number" density="compact"
                      variant="outlined" hide-details placeholder="0"></v-text-field>
                    <span class="operator">−</span>
                    <v-text-field v-model="sub2" @input="selectedOperation = 'sub'" type="number" density="compact"
                      variant="outlined" hide-details placeholder="0"></v-text-field>
                    <span class="operator">=</span>
                    <v-text-field :model-value="subtraction" readonly density="compact" variant="outlined"
                      bg-color="grey-lighten-4" hide-details></v-text-field>
                    <v-btn icon="mdi-arrow-left" size="small" variant="text" @click="useResult(subtraction)"
                      :disabled="!subtraction"></v-btn>
                  </div>

                  <!-- Multiplication -->
                  <div class="calc-row">
                    <v-text-field v-model="mul1" @input="selectedOperation = 'mul'" type="number" density="compact"
                      variant="outlined" hide-details placeholder="0"></v-text-field>
                    <span class="operator">×</span>
                    <v-text-field v-model="mul2" @input="selectedOperation = 'mul'" type="number" density="compact"
                      variant="outlined" hide-details placeholder="0"></v-text-field>
                    <span class="operator">=</span>
                    <v-text-field :model-value="multiplication.toFixed(2)" readonly density="compact" variant="outlined"
                      bg-color="grey-lighten-4" hide-details></v-text-field>
                    <v-btn icon="mdi-arrow-left" size="small" variant="text"
                      @click="useResult(Math.round(multiplication))" :disabled="!multiplication"></v-btn>
                  </div>

                  <!-- Division -->
                  <div class="calc-row">
                    <v-text-field v-model="div1" @input="selectedOperation = 'div'" type="number" density="compact"
                      variant="outlined" hide-details placeholder="0"></v-text-field>
                    <span class="operator">÷</span>
                    <v-text-field v-model="div2" @input="selectedOperation = 'div'" type="number" density="compact"
                      variant="outlined" hide-details placeholder="0"></v-text-field>
                    <span class="operator">=</span>
                    <v-text-field :model-value="division != null ? division.toFixed(2) : '0.00'" readonly
                      density="compact" variant="outlined" bg-color="grey-lighten-4" hide-details></v-text-field>
                    <v-btn icon="mdi-arrow-left" size="small" variant="text" @click="useResult(Math.round(division))"
                      :disabled="!division"></v-btn>
                  </div>

                  <!-- Percentage -->
                  <div class="calc-row">
                    <v-text-field v-model="percent1" @input="selectedOperation = 'perc'" type="number" density="compact"
                      variant="outlined" hide-details placeholder="0"></v-text-field>
                    <span class="operator">×</span>
                    <v-text-field v-model="percent2" @input="selectedOperation = 'perc'" type="number" density="compact"
                      variant="outlined" hide-details placeholder="0"></v-text-field>
                    <span class="operator">%=</span>
                    <v-text-field :model-value="percentage.toFixed(2)" readonly density="compact" variant="outlined"
                      bg-color="grey-lighten-4" hide-details></v-text-field>
                    <v-btn icon="mdi-arrow-left" size="small" variant="text" @click="useResult(Math.round(percentage))"
                      :disabled="!percentage"></v-btn>
                  </div>
                </div>

                <div class="d-flex justify-center mt-3">
                  <v-btn color="error" variant="text" size="small" @click="clearCalculations">
                    Clear All
                  </v-btn>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useToast } from 'vue-toastification';

const emit = defineEmits(['close', 'add', 'clear']);
const toast = useToast()
const props = defineProps({
  noOfPackagingBags: {
    type: Number,
    required: true
  },
  finalWeightQtl: {
    type: Number,
    required: true
  },
  grossTotal: {
    type: Number,
    required: true
  },
  brokerage_rate: {
    type: [Number, String],
    required: true
  }
})

const newEntry = ref({
  is_allowance: false,
  allowance_deduction_name: '',
  allowance_deduction_amount: '',
  remarks: '',
});

const isFormValid = ref(false)

// Reactive inputs for arithmetic operations
const add1 = ref('')
const add2 = ref('')
const sub1 = ref('')
const sub2 = ref('')
const mul1 = ref('')
const mul2 = ref('')
const div1 = ref('')
const div2 = ref('')
const percent1 = ref('')
const percent2 = ref('')
const selectedOperation = ref('')

// Quick calculation presets
const calculateBrokerage = () => {
  const brokerageAmount = (Number(props.grossTotal) * Number(props.brokerage_rate)) / 100
  mul1.value = props.grossTotal.toString()
  mul2.value = props.brokerage_rate.toString()
  selectedOperation.value = 'mul'
  toast.success(`Brokerage: ₹${Math.round(brokerageAmount)}`)
}

const calculatePerBag = () => {
  if (props.noOfPackagingBags > 0) {
    const perBag = Number(props.grossTotal) / Number(props.noOfPackagingBags)
    div1.value = props.grossTotal.toString()
    div2.value = props.noOfPackagingBags.toString()
    selectedOperation.value = 'div'
    toast.success(`Per Bag: ₹${perBag.toFixed(2)}`)
  } else {
    toast.error('No bags to calculate')
  }
}

const calculatePerQuintal = () => {
  if (props.finalWeightQtl > 0) {
    const perQtl = Number(props.grossTotal) / Number(props.finalWeightQtl)
    div1.value = props.grossTotal.toString()
    div2.value = props.finalWeightQtl.toString()
    selectedOperation.value = 'div'
    toast.success(`Per Quintal: ₹${perQtl.toFixed(2)}`)
  } else {
    toast.error('No weight to calculate')
  }
}

// Use calculated result
const useResult = (value) => {
  if (value && isFinite(value)) {
    newEntry.value.allowance_deduction_amount = Math.round(value).toString()
    toast.success('Result transferred to amount field')
  }
}

const addEntry = () => {
  if (!newEntry.value.allowance_deduction_name || !newEntry.value.allowance_deduction_amount) {
    toast.error('Please fill name and calculate amount!')
    return
  }
  emit('add', { ...newEntry.value });
  newEntry.value = {
    is_allowance: false,
    allowance_deduction_name: '',
    allowance_deduction_amount: '',
    remarks: '',
  };
  clearCalculations()
  toast.success('Entry added successfully!')
};

const clearCalculations = () => {
  add1.value = ''
  add2.value = ''
  sub1.value = ''
  sub2.value = ''
  mul1.value = ''
  mul2.value = ''
  div1.value = ''
  div2.value = ''
  percent1.value = ''
  percent2.value = ''
  selectedOperation.value = ''
}

// Computed outputs
const addition = computed(() => {
  const result = Number(add1.value) + Number(add2.value)
  return isNaN(result) ? 0 : result
})
const subtraction = computed(() => {
  const result = Number(sub1.value) - Number(sub2.value)
  return isNaN(result) ? 0 : result
})
const multiplication = computed(() => {
  const result = Number(mul1.value) * Number(mul2.value)
  return isNaN(result) ? 0 : result
})
const division = computed(() =>
  Number(div2.value) !== 0 ? Number(div1.value) / Number(div2.value) : null,
)
const percentage = computed(() => {
  const result = (Number(percent1.value) * Number(percent2.value)) / 100
  return isNaN(result) ? 0 : result
})

watch(
  [addition, subtraction, multiplication, division, percentage, selectedOperation],
  ([add, sub, mul, div, perc, selected]) => {
    switch (selected) {
      case 'add':
        if (!isNaN(add) && isFinite(add)) newEntry.value.allowance_deduction_amount = Math.round(add).toString()
        break
      case 'sub':
        if (!isNaN(sub) && isFinite(sub)) newEntry.value.allowance_deduction_amount = Math.round(sub).toString()
        break
      case 'mul':
        if (!isNaN(mul) && isFinite(mul))
          newEntry.value.allowance_deduction_amount = Math.round(mul).toString()
        break
      case 'div':
        if (!isNaN(div) && isFinite(div))
          newEntry.value.allowance_deduction_amount = Math.round(div).toString()
        break
      case 'perc':
        if (!isNaN(perc) && isFinite(perc))
          newEntry.value.allowance_deduction_amount = Math.round(perc).toString()
        break
    }
  },
)
</script>

<style scoped>
.calculator-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.calc-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1.2fr auto;
  align-items: center;
  gap: 8px;
}

.operator {
  font-size: 1.2rem;
  font-weight: bold;
  min-width: 24px;
  text-align: center;
}
</style>