<script setup>
import Event from '../components/Home/Event.vue'
import Announcement from '../components/Home/Announcement.vue'
import Dashboard from '../components/Home/Dashboard.vue'
</script>

<template>
  <v-container fluid class="pa-2">
    <v-row>
      <v-col cols="12" lg="9" md="8">
        <Dashboard />
      </v-col>
      <v-col cols="12" lg="3" md="4">
        <Event />
        <Announcement />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
/* Optional: Additional custom styles */
</style>
