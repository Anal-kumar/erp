<template>
    <div>
        <Sidebar />
        <Header />
        <v-main>
            <RouterView />
        </v-main>
    </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

defineOptions({
    name: 'DashboardLayout',
})

const router = useRouter()

// Inactivity tracking
let lastActivity = Date.now()
const INACTIVITY_TIMEOUT = 10 * 60 * 1000 // 10 minutes in milliseconds
let inactivityTimer = null

// Reset activity timestamp
const resetActivity = () => {
    lastActivity = Date.now()
}

// Check for inactivity and logout if needed
const checkInactivity = () => {
    const now = Date.now()
    const timeSinceLastActivity = now - lastActivity

    if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
        // User has been inactive for 10 minutes, logout
        logout()
    }
}

// Logout function
const logout = () => {
    // Clear session storage
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('user_role')

    // Clear cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

    // Redirect to login
    router.push('/login')
}

// Activity event listeners
const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

onMounted(() => {
    // Add event listeners for user activity
    activityEvents.forEach(event => {
        window.addEventListener(event, resetActivity, true)
    })

    // Check for inactivity every 30 seconds
    inactivityTimer = setInterval(checkInactivity, 30000)

    // Initialize activity timestamp
    resetActivity()
})

onBeforeUnmount(() => {
    // Remove event listeners
    activityEvents.forEach(event => {
        window.removeEventListener(event, resetActivity, true)
    })

    // Clear interval
    if (inactivityTimer) {
        clearInterval(inactivityTimer)
    }
})
</script>

<style scoped>
/* Layout styles if needed */
</style>
