<template>
  <v-container fluid>
    <v-card elevation="2" class="rounded-lg">
      <v-card-title class="d-flex align-center justify-space-between py-4 px-6 bg-grey-lighten-4 border-b">
        <span class="text-h6 font-weight-bold text-grey-darken-3">Stock Details</span>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <v-text-field v-model="searchTerm" label="Search by Godown Name or Stock Name"
              prepend-inner-icon="mdi-magnify" variant="outlined" density="compact" hide-details
              clearable></v-text-field>
          </v-col>
        </v-row>

        <v-data-table :headers="headers" :items="displayData" class="elevation-1 border rounded" hover
          density="comfortable">
          <template v-slot:item.weight_quintal="{ item }">
            {{ Number(item.weight_quintal || 0).toFixed(2) }}
          </template>

          <template v-slot:item.bags="{ item }">
            {{ item.bags || 0 }}
          </template>

          <!-- Grand Total Row -->
          <template v-slot:body.append>
            <tr class="bg-grey-lighten-3 font-weight-bold">
              <td colspan="3" class="text-right pa-4">Grand Total</td>
              <td class="text-center pa-4">
                {{displayData.reduce((sum, row) => sum + (Number(row.weight_quintal) || 0), 0).toFixed(2)}}
              </td>
              <td class="text-center pa-4">
                {{displayData.reduce((sum, row) => sum + (Number(row.bags) || 0), 0)}}
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { millService } from '@/services';

const stockDetails = ref([]);
const searchTerm = ref('');

const headers = [
  { title: 'SNO', key: 'sno', align: 'center', sortable: false },
  { title: 'Godown Name', key: 'godown_name', align: 'center' },
  { title: 'Stock Name', key: 'stock_item_name', align: 'center' },
  { title: 'Weight (Quintal)', key: 'weight_quintal', align: 'center' },
  { title: 'Bags', key: 'bags', align: 'center' },
]

const displayData = computed(() => {
  // Flatten the data without SNO initially
  const flatData = [];
  for (const stock of stockDetails.value || []) {
    for (const item of (stock.items || [])) {
      flatData.push({
        godown_name: stock.godown_name || '',
        stock_item_name: item.stock_item_name || '',
        weight_quintal: item.weight_quintal || item.total_weight_quintal || 0,
        bags: item.bags || item.total_bags || 0,
      });
    }
  }

  // Filter based on search term (case-insensitive, with null checks)
  const lowerSearch = searchTerm.value.toLowerCase();
  const filteredData = flatData.filter(row =>
    (row.godown_name || '').toLowerCase().includes(lowerSearch) ||
    (row.stock_item_name || '').toLowerCase().includes(lowerSearch)
  );

  // Assign SNO after filtering
  let sno = 1;
  return filteredData.map(row => ({ ...row, sno: sno++ }));
});

const fetchStockDetails = async () => {
  try {
    const response = await millService.getStockSummary()

    if (response.status === 200) {
      stockDetails.value = response.data.summary || [];
    } else {
      console.error('Failed to fetch stock details:', response);
    }
  } catch (error) {
    console.error('Error fetching stock details:', error);
  }
};

onMounted(() => {
  fetchStockDetails();
});
</script>