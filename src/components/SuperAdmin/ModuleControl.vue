<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="6" lg="4">
        <v-card elevation="2" class="rounded-lg">
          <v-card-title class="d-flex align-center py-4 px-6 bg-white sticky-top z-10 border-b">
            <v-icon icon="mdi-view-grid" class="mr-2 text-grey-darken-2"></v-icon>
            <span class="text-h6 font-weight-bold text-grey-darken-3">Modules</span>
          </v-card-title>

          <v-card-text class="pa-4">
            <div v-if="modules.length === 0" class="text-center py-4 text-grey">
              No modules found.
            </div>

            <v-list v-else lines="two" class="pa-0">
              <v-list-item v-for="(module, index) in modules" :key="module.id"
                class="mb-3 border rounded-lg elevation-1" rounded="lg">
                <template v-slot:prepend>
                  <v-avatar color="primary" variant="tonal" size="32" class="mr-3">
                    <span class="text-subtitle-2 font-weight-bold">{{ index + 1 }}</span>
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-medium text-body-1">
                  {{ module.module_name }}
                </v-list-item-title>

                <template v-slot:append>
                  <v-switch v-model="module.module_enabled" color="success" hide-details density="compact" inset
                    @change="updateModuleStatus(module)" :loading="loading === module.id"></v-switch>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { moduleService } from '@/services'
import { useToast } from 'vue-toastification'

const toast = useToast()
const modules = ref([])
const loading = ref(null)

onMounted(async () => {
  try {
    const response = await moduleService.getModules()
    modules.value = response.data
    modules.value.forEach((module) => {
      const nameMap = {
        'mill_operations': 'Mill Operations',
        'incoming': 'Incoming',
        'outgoing': 'Outgoing',
        'labour_payment': 'Labour Payment',
        'day_book': 'Daybook',
        'batch_operations': 'Batch Details',
        'lot_operations': 'Lot Details',
        'expiry_reminder': 'Reminders',
        'users': 'Users'
      }
      module.module_name = nameMap[module.module_name] || module.module_name
    })
  } catch (error) {
    console.error('Failed to fetch modules:', error)
    toast.error('Failed to load modules')
  }
})

async function updateModuleStatus(module) {
  loading.value = module.id
  try {
    await moduleService.updateModule(module.id, {
      module_enabled: module.module_enabled,
    })
    toast.success(`${module.module_name} ${module.module_enabled ? 'enabled' : 'disabled'}`)
  } catch (error) {
    console.error('Failed to update module status:', error)
    // Rollback UI toggle if API fails
    module.module_enabled = !module.module_enabled
    toast.error('Failed to update module status')
  } finally {
    loading.value = null
  }
}
</script>

<style scoped>
.sticky-top {
  position: sticky;
  top: 0;
}
</style>
