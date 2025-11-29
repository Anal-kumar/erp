<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
    <div class="bg-white p-5 rounded-lg w-[400px]">
      <h2 class="text-xl font-bold mb-4">Configure Server Connection</h2>
      <form @submit.prevent="saveConfig" class="flex flex-col gap-4">
        <div>
          <label for="ipAddress" class="block text-sm font-medium text-gray-700">IP Address</label>
          <input id="ipAddress" v-model="ipAddress" type="text" class="mt-1 w-full p-2 border border-gray-300 rounded"
            placeholder="Enter IP Address (e.g., 192.168.1.1)" required
            pattern="^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$" />
        </div>
        <div>
          <label for="port" class="block text-sm font-medium text-gray-700">Port Number</label>
          <input id="port" v-model="port" type="number" class="mt-1 w-full p-2 border border-gray-300 rounded"
            placeholder="Enter Port (e.g., 8080)" required min="1" max="65535" />
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" @click="$emit('close')"
            class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
            Cancel
          </button>
          <button type="submit" class="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600">
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IPConfigModal',
  data() {
    return {
      ipAddress: localStorage.getItem('serverIP') || '',
      port: localStorage.getItem('serverPort') || ''
    }
  },
  methods: {
    saveConfig() {
      if (this.ipAddress && this.port) {
        this.$emit('save', { ip: this.ipAddress, port: this.port })
      }
    }
  }
}
</script>