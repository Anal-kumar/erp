<template>
  <v-container fluid>
    <v-card elevation="2" class="rounded-lg">
      <v-card-title class="d-flex align-center justify-space-between py-4 px-6 bg-primary text-white">
        <span class="text-h5 font-weight-bold">Users Information</span>
        <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search" single-line hide-details
          variant="solo-filled" density="compact" class="max-w-xs" bg-color="white" color="primary"></v-text-field>
      </v-card-title>

      <v-data-table :headers="headers" :items="filteredUsers" :search="search" :loading="loading" hover
        class="elevation-1">
        <template v-slot:item.sno="{ index }">
          {{ index + 1 }}
        </template>

        <template v-slot:item.user_role="{ item }">
          <v-chip :color="getRoleColor(item.user_role)" size="small" class="font-weight-bold">
            {{ formatRole(item.user_role) }}
          </v-chip>
        </template>

        <template v-slot:item.time_stamp="{ item }">
          {{ formatDate(item.time_stamp) }}
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon="mdi-pencil" size="small" color="blue" variant="text" @click="EditUser(item)"
            class="mr-2"></v-btn>
          <v-btn icon="mdi-delete" size="small" color="red" variant="text" @click="deleteUser(item.id)"></v-btn>
        </template>

        <template v-slot:no-data>
          <div class="text-center pa-4 text-grey">No users found</div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Edit Dialog -->
    <v-dialog v-model="showEditModal" max-width="500px">
      <v-card>
        <v-card-title class="bg-primary text-white">
          <span class="text-h5">Edit User</span>
        </v-card-title>

        <v-card-text class="pt-4">
          <v-form ref="editFormRef" @submit.prevent="updateUser">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field v-model="editForm.user_login_id" label="Login ID" variant="outlined"
                    density="comfortable" required></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="editForm.user_first_name" label="First Name" variant="outlined"
                    density="comfortable" required
                    @input="editForm.user_first_name = $event.target.value.toUpperCase()"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="editForm.user_second_name" label="Second Name" variant="outlined"
                    density="comfortable"
                    @input="editForm.user_second_name = $event.target.value.toUpperCase()"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="editForm.mobile_number" label="Mobile Number" variant="outlined"
                    density="comfortable" required maxlength="10"
                    :rules="[v => /^\d{10}$/.test(v) || 'Mobile number must be 10 digits']"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="editForm.designation" label="Designation" variant="outlined"
                    density="comfortable"
                    @input="editForm.designation = $event.target.value.toUpperCase()"></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>

        <v-card-actions class="pb-4 px-4">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="hideEditModal">Cancel</v-btn>
          <v-btn color="blue-darken-1" variant="elevated" @click="updateUser">Update</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import adminService from '@/services/adminService'
import { useToast } from 'vue-toastification'

const toast = useToast()
const users = ref([])
const loading = ref(false)
const search = ref('')
const showEditModal = ref(false)
const editForm = ref({
  user_login_id: '',
  user_first_name: '',
  user_second_name: '',
  mobile_number: '',
  designation: '',
})

const headers = [
  { title: 'S.No.', key: 'sno', align: 'start', sortable: false },
  { title: 'Login ID', key: 'user_login_id', align: 'start' },
  { title: 'User Name', key: 'username', align: 'start' },
  { title: 'Mobile Number', key: 'mobile_number', align: 'start' },
  { title: 'Designation', key: 'designation', align: 'start' },
  { title: 'Role', key: 'user_role', align: 'start' },
  { title: 'Created On', key: 'time_stamp', align: 'start' },
  { title: 'Actions', key: 'actions', align: 'center', sortable: false },
]

const filteredUsers = computed(() => {
  return users.value.filter((user) => user.user_role === 'admin' || user.user_role === 'user')
})

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await adminService.getAllUsers()
    users.value = response.data.map((user) => ({
      ...user,
      username: `${user.user_first_name} ${user.user_second_name}`,
    }))
    console.log('users:', users.value)
  } catch (error) {
    console.error('Error fetching users:', error)
    users.value = []
    toast.error('Failed to fetch users')
  } finally {
    loading.value = false
  }
}

const EditUser = (user) => {
  editForm.value = { ...user }
  showEditModal.value = true
}

const hideEditModal = () => {
  showEditModal.value = false
}

const updateUser = async () => {
  try {
    // Assuming update endpoint exists and is handled by adminService
    await adminService.updateUser(editForm.value.id, editForm.value)

    showEditModal.value = false
    toast.success('User updated successfully')
    fetchUsers()
  } catch (error) {
    console.error('error updating user:', error)
    toast.error('Failed to update user')
  }
}

const deleteUser = async (id) => {
  const confirmed = confirm('Are you sure you want to delete this user?')
  if (!confirmed) return

  try {
    await adminService.deleteUser(id)
    toast.success('User deleted successfully')
    fetchUsers()
  } catch (error) {
    console.error('Error deleting user:', error)
    toast.error('Failed to delete user')
  }
}

// Helper functions
const getRoleColor = (role) => {
  if (role === 'admin') return 'purple'
  if (role === 'superadmin') return 'red'
  return 'grey'
}

const formatRole = (role) => {
  if (role === 'admin') return 'Admin'
  if (role === 'superadmin') return 'Super-Admin'
  return 'Non-Admin'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

onMounted(() => {
  fetchUsers()
})
</script>
