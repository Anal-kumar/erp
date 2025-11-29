<template>
  <v-dialog v-model="dialog" max-width="800px" persistent>
    <v-card class="position-relative">
      <v-btn icon="mdi-close" variant="text" size="small" class="position-absolute top-0 right-0 z-10 ma-2"
        @click="$emit('close')"></v-btn>
      <v-card-text class="pa-6">
        <slot></slot>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  document: {
    type: Object,
    default: null,
  },
  mode: {
    type: String,
    default: 'view',
  },
})

const emit = defineEmits(['close', 'save'])

const dialog = computed({
  get: () => props.show,
  set: (value) => {
    if (!value) emit('close')
  },
})
</script>

<style scoped></style>
