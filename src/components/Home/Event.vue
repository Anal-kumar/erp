<template>
  <v-card class="event-calendar-card h-100" elevation="2">
    <v-card-text class="pa-3 d-flex flex-column h-100">
      <!-- v-calendar Component -->
      <div class="calendar-wrapper mb-4">
        <VCalendar :attributes="attributes" @dayclick="onDayClick" :available-dates="availableDates" expanded
          class="vcalendar-custom w-100" />
      </div>

      <!-- Events Header -->
      <div class="d-flex justify-space-between align-center mb-2">
        <h2 class="text-h6 font-weight-bold text-brown-darken-3">Events</h2>
        <v-btn icon="mdi-plus" color="primary" size="small" variant="tonal" @click="openModal"></v-btn>
      </div>

      <v-divider class="mb-2"></v-divider>

      <!-- Event List -->
      <v-list density="compact" class="event-list grow">
        <v-list-item v-if="selectedDate && filteredEvents.length === 0" class="text-grey text-center pa-4">
          <v-icon icon="mdi-calendar-blank" size="large" class="mb-2"></v-icon>
          <v-list-item-title class="text-body-2 text-wrap">
            No events for {{ formatDate(selectedDate) }}
          </v-list-item-title>
          <v-btn variant="text" color="primary" size="small" class="mt-1" @click="openModal">
            Add Event
          </v-btn>
        </v-list-item>

        <v-list-item v-for="(event, index) in filteredEvents" :key="event.id" class="event-item mb-2 rounded border-s-4"
          elevation="3" :class="getEventColorClass(event)">
          <template v-slot:default>
            <div class="d-flex flex-column w-100 py-1">
              <div class="d-flex justify-space-between align-start">
                <div>
                  <v-list-item-title class="font-weight-bold text-subtitle-2">{{ event.title }}</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">{{ formatDate(event.date) }}</v-list-item-subtitle>
                </div>
                <div class="d-flex ga-1 pa-1">
                  <v-btn icon="mdi-pencil" size="x-small" variant="text" color="grey-darken-1" elevation="5"
                    @click.stop="editEvent(event)"></v-btn>
                  <v-btn icon="mdi-delete" size="x-small" variant="text" color="error" elevation="5"
                    @click.stop="deleteEvent(event.id)"></v-btn>
                </div>
              </div>
              <p class="text-caption mt-1 text-grey-darken-2" v-if="event.description">
                {{ event.description }}
              </p>
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>

  <!-- Add/Edit Event Dialog -->
  <v-dialog v-model="showModal" max-width="500">
    <v-card class="rounded-lg">
      <v-card-title class="bg-primary text-white py-3 px-4">
        {{ isEditMode ? 'Edit Event' : 'Add New Event' }}
      </v-card-title>
      <v-card-text class="pa-4 pt-6">
        <v-form @submit.prevent="isEditMode ? updateEvent() : addEvent()">
          <v-text-field v-model="newEvent.title" label="Event Title" variant="outlined" density="comfortable" required
            prepend-inner-icon="mdi-format-title" class="mb-3"></v-text-field>

          <v-textarea v-model="newEvent.description" label="Description" variant="outlined" density="comfortable"
            rows="3" prepend-inner-icon="mdi-text" class="mb-3"></v-textarea>

          <v-text-field v-model="newEvent.date" label="Date" type="date" variant="outlined" density="comfortable"
            prepend-inner-icon="mdi-calendar" class="mb-3"></v-text-field>

          <div class="d-flex justify-end ga-2 mt-4">
            <v-btn color="grey-darken-1" variant="text" @click="closeModal">
              Cancel
            </v-btn>
            <v-btn type="submit" color="primary" variant="elevated" :loading="loading">
              {{ isEditMode ? 'Update' : 'Add' }}
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { DatePicker } from 'v-calendar'
import 'v-calendar/style.css'
import { dashboardService, expiryReminderService } from '@/services'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'
import storage from '@/utils/storage'

// Use PascalCase for component to match template usage
const VCalendar = DatePicker

const toast = useToast()
const router = useRouter()
const loading = ref(false)

const newEvent = ref({
  id: null,
  title: '',
  description: '',
  date: null,
})
const showModal = ref(false)
const isEditMode = ref(false)
const selectedDate = ref(null)
const events = ref([])
const reminders = ref([])

const openModal = () => {
  isEditMode.value = false
  newEvent.value = {
    id: null,
    title: '',
    description: '',
    date: selectedDate.value || new Date().toLocaleDateString('en-CA'),
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  isEditMode.value = false
  newEvent.value = {
    id: null,
    title: '',
    description: '',
    date: selectedDate.value,
  }
}

const attributes = ref([
  {
    key: 'today',
    highlight: {
      color: 'blue',
      fillMode: 'outline',
    },
    dates: new Date(),
  },
  {
    key: 'past-events',
    dot: 'gray',
    dates: [],
  },
  {
    key: 'upcoming-events',
    dot: 'red',
    dates: [],
  },
  {
    key: 'reminders',
    dot: 'orange',
    dates: [],
  },
  {
    key: 'selected-date',
    highlight: {
      color: 'brown',
      fillMode: 'light',
    },
    dates: [],
  },
])

const availableDates = ref({ start: new Date(new Date().getFullYear() - 1, 0, 1), end: null })

const allItems = computed(() => {
  return [...events.value, ...reminders.value]
})

const filteredEvents = computed(() => {
  if (!selectedDate.value) return []
  return allItems.value.filter((item) => {
    const itemDate = item.date.split('T')[0]
    return itemDate === selectedDate.value
  })
})

const onDayClick = (day) => {
  const localDate = new Date(day.date.getTime() - day.date.getTimezoneOffset() * 60000)
  selectedDate.value = localDate.toISOString().split('T')[0]
  attributes.value[4].dates = [day.date]
  newEvent.value.date = selectedDate.value
}

const fetchData = async () => {
  try {
    const [eventsRes, remindersRes] = await Promise.all([
      dashboardService.getEvents(),
      expiryReminderService.getReminders()
    ])

    const today = new Date().toLocaleDateString('en-CA')

    // Process Events
    events.value = eventsRes.data.map((event) => ({
      ...event,
      type: 'event',
      date: new Date(event.date).toISOString().split('T')[0],
    }))

    // Process Reminders
    reminders.value = remindersRes.data.map((reminder) => ({
      id: `reminder-${reminder.id}`,
      title: `Expiry: ${reminder.document_name}`,
      description: `Expires on this day. ${reminder.document_detail || ''}`,
      date: new Date(reminder.expiry_date).toISOString().split('T')[0],
      type: 'reminder',
      originalId: reminder.id
    }))

    updateCalendarAttributes()

    if (!selectedDate.value) {
      selectedDate.value = today
      attributes.value[4].dates = [new Date(today)]
    }
  } catch (error) {
    handleError(error, 'Error fetching data')
  }
}

const updateCalendarAttributes = () => {
  const today = new Date().toLocaleDateString('en-CA')

  const pastEvents = events.value.filter((event) => event.date < today)
  const upcomingEvents = events.value.filter((event) => event.date >= today)
  const reminderDates = reminders.value.map((r) => new Date(r.date))

  attributes.value[1].dates = pastEvents.map((event) => new Date(event.date))
  attributes.value[2].dates = upcomingEvents.map((event) => new Date(event.date))
  attributes.value[3].dates = reminderDates
}

const addEvent = async () => {
  if (newEvent.value.title && newEvent.value.date) {
    loading.value = true
    try {
      const response = await dashboardService.addEvent({
        title: newEvent.value.title,
        description: newEvent.value.description,
        date: newEvent.value.date,
      })

      events.value.push({
        ...response.data,
        type: 'event',
        date: new Date(response.data.date).toISOString().split('T')[0],
      })

      updateCalendarAttributes()
      closeModal()
      toast.success('Event added successfully')
    } catch (error) {
      handleError(error, 'Error adding event')
    } finally {
      loading.value = false
    }
  }
}

const editEvent = (item) => {
  if (item.type === 'reminder') {
    toast.info('Cannot edit reminders from here. Please go to Expiry Reminder.')
    return
  }
  isEditMode.value = true
  newEvent.value = {
    id: item.id,
    title: item.title,
    description: item.description,
    date: item.date,
  }
  showModal.value = true
}

const updateEvent = async () => {
  if (newEvent.value.title && newEvent.value.date && newEvent.value.id) {
    loading.value = true
    try {
      const response = await dashboardService.updateEvent(newEvent.value.id, {
        title: newEvent.value.title,
        description: newEvent.value.description,
        date: newEvent.value.date,
      })

      const index = events.value.findIndex((event) => event.id === newEvent.value.id)
      if (index !== -1) {
        events.value[index] = {
          ...response.data,
          type: 'event',
          date: new Date(response.data.date).toISOString().split('T')[0],
        }
        updateCalendarAttributes()
      }

      closeModal()
      toast.success('Event updated successfully')
    } catch (error) {
      handleError(error, 'Error updating event')
    } finally {
      loading.value = false
    }
  }
}

const deleteEvent = async (id) => {
  // Check if it's a reminder (string id starting with 'reminder-')
  if (typeof id === 'string' && id.startsWith('reminder-')) {
    toast.info('Cannot delete reminders from here.')
    return
  }

  if (!confirm('Are you sure you want to delete this event?')) return;

  try {
    await dashboardService.deleteEvent(id)
    const removeIndex = events.value.findIndex((event) => event.id === id)
    if (removeIndex !== -1) {
      events.value.splice(removeIndex, 1)
      updateCalendarAttributes()
    }
    toast.success('Event deleted successfully')
  } catch (error) {
    handleError(error, 'Error deleting event')
  }
}

const handleError = (error, defaultMessage) => {
  if (error.response && error.response.status === 401) {
    toast.error('Session expired. Please log in again.')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('user_role')
    router.push('/login')
  } else {
    // toast.error(error.response?.data?.message || defaultMessage)
    console.error(defaultMessage, error)
  }
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getEventColorClass = (item) => {
  if (item.type === 'reminder') return 'border-orange'
  const today = new Date().toLocaleDateString('en-CA')
  return item.date < today ? 'border-grey' : 'border-primary'
}

onMounted(() => {
  const token = storage.getToken()
  if (!token) {
    toast.error('Please log in to view events')
    router.push('/login')
  } else {
    fetchData()
  }
})
</script>

<style scoped>
.event-calendar-card {
  /* height: 100%; */
  min-height: 500px;
}

.event-list {
  overflow-y: auto;
  max-height: 300px;
}

.event-item {
  transition: all 0.2s;
  border-left-width: 4px !important;
}

.event-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.border-grey {
  border-left-color: #9e9e9e !important;
}

.border-primary {
  border-left-color: rgb(var(--v-theme-primary)) !important;
}

.border-orange {
  border-left-color: #FF9800 !important;
  background-color: #FFF3E0;
}

/* Custom v-calendar styling to match Vuetify theme */
.vcalendar-custom {
  --vc-accent-50: rgb(var(--v-theme-primary));
  --vc-accent-100: rgb(var(--v-theme-primary));
  --vc-accent-200: rgb(var(--v-theme-primary));
  --vc-accent-300: rgb(var(--v-theme-primary));
  --vc-accent-400: rgb(var(--v-theme-primary));
  --vc-accent-500: rgb(var(--v-theme-primary));
  --vc-accent-600: rgb(var(--v-theme-primary));
  font-family: Roboto, sans-serif;
  border: none;
}
</style>
