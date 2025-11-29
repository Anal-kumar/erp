<template>
    <v-card class="announcement-card mt-4" elevation="2">
        <v-card-title class="d-flex justify-space-between align-center bg-brown-lighten-5 py-3 px-4">
            <div class="d-flex align-center">
                <v-icon icon="mdi-bullhorn" color="brown-darken-3" class="mr-2"></v-icon>
                <span class="text-subtitle-1 font-weight-bold text-brown-darken-3">Announcements</span>
            </div>
            <v-btn icon="mdi-plus" size="x-small" color="brown-darken-3" variant="text" @click="openModal"></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-0 announcement-list-container">
            <v-list density="compact" class="py-0">
                <v-list-item v-if="announcements.length === 0" class="text-center pa-4">
                    <v-list-item-title class="text-caption text-grey">
                        No announcements yet.
                    </v-list-item-title>
                </v-list-item>

                <template v-for="(item, index) in announcements" :key="item.id">
                    <v-list-item class="announcement-item py-2 px-4">
                        <template v-slot:default>
                            <div class="d-flex flex-column w-100">
                                <div class="d-flex justify-space-between align-start mb-1">
                                    <span class="text-subtitle-2 font-weight-bold text-truncate pr-2">{{ item.title
                                        }}</span>
                                    <div class="d-flex flex-shrink-0">
                                        <v-btn icon="mdi-pencil" size="x-small" variant="text" color="grey-darken-1"
                                            density="compact" @click.stop="editAnnouncement(item)"></v-btn>
                                        <v-btn icon="mdi-delete" size="x-small" variant="text" color="error"
                                            density="compact" @click.stop="deleteAnnouncement(item.id)"></v-btn>
                                    </div>
                                </div>
                                <p class="text-caption text-grey-darken-2 mb-1 text-wrap">{{ item.content }}</p>
                                <div class="d-flex justify-end">
                                    <span class="text-caption text-grey-lighten-1"
                                        style="font-size: 0.7rem !important;">
                                        {{ formatDate(item.created_at) }}
                                    </span>
                                </div>
                            </div>
                        </template>
                    </v-list-item>
                    <v-divider v-if="index < announcements.length - 1"></v-divider>
                </template>
            </v-list>
        </v-card-text>
    </v-card>

    <!-- Add/Edit Modal -->
    <v-dialog v-model="showModal" max-width="500">
        <v-card class="rounded-lg">
            <v-card-title class="bg-brown-darken-3 text-white py-3 px-4">
                {{ isEditMode ? 'Edit Announcement' : 'New Announcement' }}
            </v-card-title>
            <v-card-text class="pa-4 pt-6">
                <v-form @submit.prevent="isEditMode ? updateAnnouncement() : addAnnouncement()">
                    <v-text-field v-model="form.title" label="Title" variant="outlined" density="comfortable" required
                        class="mb-3"></v-text-field>
                    <v-textarea v-model="form.content" label="Content" variant="outlined" density="comfortable" rows="3"
                        required class="mb-3"></v-textarea>
                    <v-text-field v-model="form.date" label="Date" type="date" variant="outlined" density="comfortable"
                        required class="mb-3"></v-text-field>

                    <div class="d-flex justify-end gap-2 mt-2">
                        <v-btn color="grey-darken-1" variant="text" @click="closeModal">Cancel</v-btn>
                        <v-btn type="submit" color="brown-darken-3" variant="elevated" :loading="loading">
                            {{ isEditMode ? 'Update' : 'Post' }}
                        </v-btn>
                    </div>
                </v-form>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dashboardService from '@/services/dashboardService'
import { useToast } from 'vue-toastification'

const toast = useToast()
const announcements = ref([])
const showModal = ref(false)
const isEditMode = ref(false)
const loading = ref(false)
const form = ref({
    id: null,
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0]
})

const fetchAnnouncements = async () => {
    try {
        const response = await dashboardService.getAnnouncements()
        // Assuming API returns array of announcements
        // If API structure is different, adjust here.
        // Mocking for now if API fails or returns empty to show structure
        if (response.data) {
            announcements.value = response.data
        }
    } catch (error) {
        console.error('Error fetching announcements:', error)
        // toast.error('Failed to load announcements')
    }
}

const openModal = () => {
    isEditMode.value = false
    form.value = { id: null, title: '', content: '', date: new Date().toISOString().split('T')[0] }
    showModal.value = true
}

const editAnnouncement = (item) => {
    isEditMode.value = true
    form.value = { ...item }
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    form.value = { id: null, title: '', content: '', date: new Date().toISOString().split('T')[0] }
}

const addAnnouncement = async () => {
    if (!form.value.title || !form.value.content || !form.value.date) return

    loading.value = true
    try {
        const response = await dashboardService.addAnnouncement({
            title: form.value.title,
            content: form.value.content,
            date: form.value.date
        })
        announcements.value.unshift(response.data)
        closeModal()
        toast.success('Announcement posted')
    } catch (error) {
        console.error('Error adding announcement:', error)
        toast.error('Failed to post announcement')
    } finally {
        loading.value = false
    }
}

const updateAnnouncement = async () => {
    if (!form.value.id || !form.value.title || !form.value.content) return

    loading.value = true
    try {
        const response = await dashboardService.updateAnnouncement(form.value.id, {
            title: form.value.title,
            content: form.value.content
        })
        const index = announcements.value.findIndex(a => a.id === form.value.id)
        if (index !== -1) {
            announcements.value[index] = response.data
        }
        closeModal()
        toast.success('Announcement updated')
    } catch (error) {
        console.error('Error updating announcement:', error)
        toast.error('Failed to update announcement')
    } finally {
        loading.value = false
    }
}

const deleteAnnouncement = async (id) => {
    if (!confirm('Delete this announcement?')) return

    try {
        await dashboardService.deleteAnnouncement(id)
        announcements.value = announcements.value.filter(a => a.id !== id)
        toast.success('Announcement deleted')
    } catch (error) {
        console.error('Error deleting announcement:', error)
        toast.error('Failed to delete announcement')
    }
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
}

onMounted(() => {
    fetchAnnouncements()
})
</script>

<style scoped>
.announcement-card {
    max-height: 400px;
    display: flex;
    flex-direction: column;
}

.announcement-list-container {
    overflow-y: auto;
    flex-grow: 1;
}

.announcement-item:hover {
    background-color: rgba(0, 0, 0, 0.02);
}
</style>
