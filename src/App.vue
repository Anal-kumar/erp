<script setup>
const appVersion = '1.0.0'
const buildVersion = '8'
const productName = 'ERPRM'

localStorage.setItem('appVersion', appVersion)
localStorage.setItem('buildVersion', buildVersion)
localStorage.setItem('productName', productName)
</script>

<template>
  <v-app>
    <RouterView />
  </v-app>
</template>

<style scoped>
#app {
  max-width: 100%;
  margin: 0 auto;
  font-weight: normal;
}
</style>
