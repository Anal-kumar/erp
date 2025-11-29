<template>
  <v-navigation-drawer v-model="drawer" :rail="!isSidebarVisible" permanent class="sidebar-drawer">
    <!-- Sidebar Header with Toggle -->
    <v-list-item class="px-2">
      <template v-slot:prepend>
        <v-btn icon variant="text" @click="toggleSidebar">
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </template>

      <v-list-item-title v-if="isSidebarVisible" class="text-caption">
        <strong>Ver: {{ FrontendVersion }}</strong>
      </v-list-item-title>
      <v-list-item-subtitle v-if="isSidebarVisible" class="text-caption">
        <strong>Build: {{ buildVersion }}</strong>
      </v-list-item-subtitle>
    </v-list-item>

    <v-divider></v-divider>

    <!-- Navigation Menu -->
    <v-list density="compact" nav>
      <!-- Home Link -->
      <v-list-item prepend-icon="mdi-home" title="Home" to="/home" value="home"></v-list-item>

      <!-- Dropdown Menus -->
      <template v-for="(menu, index) in menus.slice(0, menus.length - 1)" :key="index">
        <v-list-group :value="menu.title" :disabled="menu.disabled">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" :prepend-icon="getIconName(menu.icon)" :title="menu.title"></v-list-item>
          </template>

          <v-list-item v-for="(item, idx) in menu.items" :key="idx" :title="item.label" :to="item.to" :value="item.to"
            :disabled="menu.disabled"></v-list-item>
        </v-list-group>
      </template>
    </v-list>

    <!-- Bottom Data Menu -->
    <template v-slot:append v-if="menus.length > 0">
      <v-divider></v-divider>
      <v-list density="compact">
        <v-list-item :prepend-icon="getIconName(menus[menus.length - 1].icon)" :title="menus[menus.length - 1].title"
          :disabled="!isSidebarVisible || menus[menus.length - 1].disabled" @click="openDataModal"></v-list-item>
      </v-list>
    </template>
  </v-navigation-drawer>

  <!-- Data Options Dialog -->
  <v-dialog v-model="showDataModal" max-width="600">
    <v-card>
      <v-card-title>Data Options</v-card-title>
      <v-card-text>
        <v-row class="text-center">
          <v-col cols="6" sm="3">
            <v-btn variant="text" class="flex-column" @click="openDbModal">
              <v-icon size="large" color="primary">mdi-database-check</v-icon>
              <span class="text-caption mt-1">Select Database</span>
            </v-btn>
          </v-col>
          <v-col cols="6" sm="3">
            <v-btn variant="text" class="flex-column" @click="backupData">
              <v-icon size="large" color="primary">mdi-download</v-icon>
              <span class="text-caption mt-1">Backup Database</span>
            </v-btn>
          </v-col>
          <v-col cols="6" sm="3">
            <v-btn variant="text" class="flex-column" @click="openRestoreModal">
              <v-icon size="large" color="success">mdi-restore</v-icon>
              <span class="text-caption mt-1">Restore Database</span>
            </v-btn>
          </v-col>
          <v-col cols="6" sm="3">
            <v-btn variant="text" class="flex-column" @click="deleteData">
              <v-icon size="large" color="error">mdi-delete</v-icon>
              <span class="text-caption mt-1">Delete Database</span>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="closeDataModal">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Database Selection Dialog -->
  <v-dialog v-model="showDbModal" max-width="500">
    <v-card>
      <v-card-title>Select Database</v-card-title>
      <v-card-text>
        <v-select v-model="selectedDb" :items="databases" label="Database" variant="outlined"
          density="comfortable"></v-select>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="showDbModal = false">Cancel</v-btn>
        <v-btn color="primary" variant="elevated" :disabled="!selectedDb" @click="confirmSelection">
          Select
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Restore Data Dialog -->
  <v-dialog v-model="showRestoreModal" max-width="600">
    <v-card>
      <v-card-title>Upload Database File</v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pt-4">
        <v-file-input v-model="selectedFile" label="Select .db file" accept=".db" variant="outlined"
          prepend-icon="mdi-database" show-size></v-file-input>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="closeRestoreModal">Cancel</v-btn>
        <v-btn color="primary" variant="elevated" :disabled="!selectedFile" @click="confirmRestore">
          Upload
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'
import config from '@/config'
import { useToast } from 'vue-toastification'

defineOptions({ name: 'SidebarPage' })

const FrontendVersion = localStorage.getItem('appVersion') || '1.0.0'
const buildVersion = localStorage.getItem('buildVersion') || '1'

const drawer = ref(true)
const isSidebarVisible = ref(true)
const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value
}

const isAdmin = ref(false)
const isSuperAdmin = ref(false)
const toast = useToast()

// Modal-related state
const showDataModal = ref(false)
const showDbModal = ref(false)
const showRestoreModal = ref(false)
const selectedDb = ref(null)
const selectedFile = ref(null)
const databases = ref([])

// Icon mapping from boxicons to MDI
const getIconName = (bxIcon) => {
  const iconMap = {
    'bx-leaf': 'mdi-leaf',
    'bx-arrow-to-left': 'mdi-arrow-left-bold',
    'bx-arrow-to-right': 'mdi-arrow-right-bold',
    'bx-money': 'mdi-cash',
    'bx-book': 'mdi-book-open-page-variant',
    'bx-box': 'mdi-package-variant',
    'bx bx-briefcase': 'mdi-briefcase',
    'bx-bell': 'mdi-bell',
    'bx-user-circle': 'mdi-account-circle',
    'bx-data': 'mdi-database',
    'bx-user': 'mdi-account-multiple',
    'bx-shield-quarter': 'mdi-shield-account',
  }
  return iconMap[bxIcon] || 'mdi-folder'
}

const openDataModal = () => {
  showDataModal.value = true
}

const closeDataModal = () => {
  showDataModal.value = false
}

const openDbModal = async () => {
  showDataModal.value = false
  showDbModal.value = true

  try {
    const [dbsRes, currentRes] = await Promise.all([
      axios.get(`${config.apiBaseUrl}/api/${config.version}/backups/databases`),
      axios.get(`${config.apiBaseUrl}/api/${config.version}/backups/current-database`),
    ])

    databases.value = dbsRes.data.databases || []

    let current = currentRes.data.current_database
    if (current?.includes('/')) {
      current = current.split('/').pop()
    }

    selectedDb.value = current || databases.value[0] || ''
  } catch (err) {
    console.error('Failed to load databases', err)
    databases.value = []
    selectedDb.value = ''
  }
}

const openRestoreModal = () => {
  showDataModal.value = false
  showRestoreModal.value = true
}

const closeRestoreModal = () => {
  showRestoreModal.value = false
  selectedFile.value = null
}

const confirmRestore = async () => {
  if (!selectedFile.value) return

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value[0])

    const response = await axios.post(
      `${config.apiBaseUrl}/api/${config.version}/backups/restore`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      },
    )

    if (response.status === 200) {
      toast.success('Data restored successfully')
      closeRestoreModal()
    } else {
      toast.error('Failed to restore data')
    }
  } catch (error) {
    console.error('Failed to restore data:', error)
    toast.error('Failed to restore data. Please try again.')
  }
}

const backupData = async () => {
  const res = await axios.get(`${config.apiBaseUrl}/api/${config.version}/backups/backup_data`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('token')}`,
    },
    responseType: 'blob',
  })

  if (res.status === 200) {
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'mill_db_2025.zip')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } else {
    toast.error('Failed to backup data')
  }
}

const deleteData = async () => {
  try {
    const firstConfirm = confirm(
      'This will permanently delete all database data. Are you sure you want to proceed?',
    )
    if (!firstConfirm) return

    const secondConfirm = prompt('Type DELETE to confirm:')
    if (secondConfirm !== 'DELETE') {
      toast.info('Data deletion cancelled')
      return
    }

    const res = await axios.delete(
      `${config.apiBaseUrl}/api/${config.version}/backups/delete_database`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      },
    )

    if (res.status == 200 || res.status == 204) {
      toast.success(res.data.message)
    }
  } catch (error) {
    console.error('Failed to delete data:', error)
    toast.error('Failed to delete data. Please try again later.')
  }
}

const confirmSelection = async () => {
  if (!selectedDb.value) return
  try {
    await axios.post(`${config.apiBaseUrl}/api/${config.version}/backups/set-database`, {
      database: `${selectedDb.value}`,
    })
    toast.success(`Database switched to: ${selectedDb.value}`)
    showDbModal.value = false
  } catch (error) {
    console.error('Failed to switch database:', error)
    toast.error('Failed to switch database. Please try again.')
  }
}

const baseMenus = ref([
  {
    module_key: 'mill_operations',
    title: 'Mill Operations',
    icon: 'bx-leaf',
    open: false,
    items: [
      { label: 'Add Transaction', to: '/Mill_operation/add_transaction' },
      { label: 'View Transaction', to: '/Mill_operation/view_transaction' },
      { label: 'Report Transaction', to: '/Mill_operation/report_transaction' },
      { label: 'View Stock Details', to: '/Mill_operation/view_stock_detail' },
      { label: 'Add Party', to: '/Mill_operation/add_party' },
      { label: 'Add Broker', to: '/Mill_operation/add_broker' },
      { label: 'Add Transportor', to: '/Mill_operation/add_transportor' },
      { label: 'Add Godown', to: '/Mill_operation/add_godown' },
      { label: 'Add Stock Item', to: '/Mill_operation/add_stock_item' },
      { label: 'Add Packaging', to: '/Mill_operation/add_packaging_details' },
      { label: 'Add WB Operator', to: '/Mill_operation/add_wb_operator' },
    ],
  },
  {
    module_key: 'incoming',
    title: 'Incoming',
    icon: 'bx-arrow-to-left',
    open: false,
    items: [
      { label: 'Add', to: '/incoming/Add' },
      { label: 'View', to: '/incoming/View' },
      { label: 'Report', to: '/incoming/report' },
    ],
  },
  {
    module_key: 'outgoing',
    title: 'Outgoing',
    icon: 'bx-arrow-to-right',
    open: false,
    items: [
      { label: 'Add', to: '/outgoing/Add' },
      { label: 'View', to: '/outgoing/View' },
      { label: 'Report', to: '/outgoing/report' },
    ],
  },
  {
    module_key: 'labour_payment',
    title: 'Labour Payment',
    icon: 'bx-money',
    open: false,
    items: [
      { label: 'Add Voucher', to: '/labour/add_voucher' },
      { label: 'View Voucher', to: '/labour/view_voucher' },
      { label: 'Report Voucher', to: '/labour/report_voucher' },
      { label: 'Add Gang', to: '/labor/add_gang' },
      { label: 'Add Items', to: '/labor/add_items' },
      { label: 'Add Particulars', to: '/labor/add_particulars' },
      { label: 'Add Packaging', to: '/labor/add_packaging' },
      { label: 'Add Locations', to: '/labor/add_locations' },
    ],
  },
  {
    module_key: 'day_book',
    title: 'Day Book',
    icon: 'bx-book',
    open: false,
    items: [
      { label: 'Add', to: '/daybook/day-form' },
      { label: 'View', to: '/daybook/day-view' },
      { label: 'Report', to: '/daybook/report' },
    ],
  },
  {
    module_key: 'batch_operations',
    title: 'Batch Details',
    icon: 'bx-box',
    open: false,
    items: [
      { label: 'Add Batch', to: '/batch_detail/add_batch' },
      { label: 'View Batch', to: '/batch_detail/view_batch' },
      { label: 'Add Immerse', to: '/batch_detail/add_immerse' },
      { label: 'Add Drainage', to: '/batch_detail/add_drainage' },
      { label: 'Add Steam On', to: '/batch_detail/add_steam_on' },
      { label: 'Add Steam Off', to: '/batch_detail/add_steam_off' },
      { label: 'Add Cross Verification', to: '/batch_detail/add_cross_verification' },
      { label: 'Add Milling Analysis', to: '/batch_detail/add_milling_analysis' },
      { label: 'Add Sorting Analysis', to: '/batch_details/add_sorting_analysis' },
      { label: 'View Cross Verification', to: '/batch_detail/view_cross_Verification' },
      { label: 'View Milling Analysis', to: '/batch_detail/view_milling_anyalysis' },
      { label: 'View Sorting Analysis', to: '/batch_details/view_sorting_analysis' },
      { label: 'Add Batch Operator', to: '/batch_detail/add_operator' },
      { label: 'Add Clerk', to: '/batch_detail/add_clerk' },
    ],
  },
  {
    module_key: 'lot_operations',
    title: 'Lot Details',
    icon: 'bx bx-briefcase',
    open: false,
    items: [
      { label: 'Add', to: '/lot/add' },
      { label: 'View', to: '/lot/view' },
      { label: 'Report', to: '/lot/report' },
      { label: 'Graph', to: '/lot/graph' },
    ],
  },
  {
    module_key: 'expiry_reminder',
    title: 'Expiry Reminder',
    icon: 'bx-bell',
    open: false,
    items: [
      { label: 'Add Document', to: '/expiry-reminder/add_document' },
      { label: 'View Document', to: '/expiry-reminder/view_doc' },
    ],
  },
  {
    module_key: null,
    title: 'Profile',
    icon: 'bx-user-circle',
    open: false,
    items: [
      { label: 'My Profile', to: '/profile/my-profile' },
      { label: 'Change Password', to: '/profile/change-password' },
    ],
  },
  {
    module_key: null,
    title: 'Data',
    icon: 'bx-data',
    open: false,
    items: [],
  },
])

const modules = ref([])
const menus = ref([])

const updateMenus = () => {
  const enabledModuleKeys = modules.value.filter((m) => m.module_enabled).map((m) => m.module_name)

  let newMenus = baseMenus.value.map((menu) => ({
    ...menu,
    disabled: menu.module_key ? !enabledModuleKeys.includes(menu.module_key) : false,
  }))

  const user = JSON.parse(sessionStorage.getItem('user') || '{}')

  if (user?.role === 'admin' || user?.role === 'superadmin') {
    isAdmin.value = true
    newMenus.splice(newMenus.length - 1, 0, {
      title: 'Users',
      icon: 'bx-user',
      open: false,
      disabled: false,
      module_key: 'users',
      items: [
        { label: 'Add User', to: '/users/add' },
        { label: 'View User', to: '/users/view' },
      ],
    })
  }

  if (user?.role === 'superadmin') {
    isSuperAdmin.value = true
    newMenus.splice(newMenus.length - 1, 0, {
      title: 'Super Admin',
      icon: 'bx-shield-quarter',
      open: false,
      disabled: false,
      items: [
        { label: 'Modules', to: '/superadmin/modules' },
        { label: 'Client-Info', to: '/superadmin/client-info' },
      ],
    })
  }

  menus.value = newMenus
}

const fetchModules = async () => {
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}/api/${config.version}/modules/get_modules`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      },
    )
    modules.value = response.data
    updateMenus()
  } catch (error) {
    console.error('Failed to fetch modules:', error)
    updateMenus()
  }
}

onMounted(() => {
  updateMenus()
  fetchModules()
})

watch(
  [modules, () => JSON.parse(sessionStorage.getItem('user') || '{}').role],
  () => {
    updateMenus()
  },
)
</script>

<style scoped>
.sidebar-drawer {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
