<template>
  <v-card elevation="2" class="rounded-lg pa-4">
    <v-card-title class="text-h5 font-weight-bold text-center mb-4">
      Lot Graph
    </v-card-title>
    <v-card-text>
      <v-row>
        <!-- Chart -->
        <v-col cols="12" md="9">
          <div style="height: 400px; position: relative;">
            <canvas ref="chartRef"></canvas>
          </div>
        </v-col>

        <!-- Toggle Buttons -->
        <v-col cols="12" md="3" sm="6">
          <h3 class="text-subtitle-1 font-weight-bold mb-2">Metrics</h3>
          <div class="d-flex flex-column ga-2">
            <v-btn v-for="m in metrics" :key="m.key" @click="toggleMetric(m.key)"
              :color="activeMetrics.includes(m.key) ? m.color : 'grey-lighten-3'"
              :variant="activeMetrics.includes(m.key) ? 'flat' : 'outlined'"
              :class="{ 'text-white': activeMetrics.includes(m.key) }" size="small" class="justify-start">
              <v-icon start size="small" :color="activeMetrics.includes(m.key) ? 'white' : m.color">mdi-circle</v-icon>
              {{ m.label }}
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { productionService } from "@/services";
import {
  Chart,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  LineController,
} from "chart.js";

Chart.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  LineController
);

const chartRef = ref(null);
let chartInstance = null;

const metrics = [
  { key: "lot_moisture_percent", label: "Moisture", color: "#3b82f6" },
  { key: "lot_broken_percent", label: "Broken", color: "#ef4444" },
  { key: "lot_discolor_percent", label: "Discolor", color: "#f59e0b" },
  { key: "lot_damaged_percent", label: "Damaged", color: "#10b981" },
  { key: "lot_lower_grain_percent", label: "Lower Grain", color: "#6366f1" },
  { key: "lot_chalky_percent", label: "Chalky", color: "#8b5cf6" },
  { key: "lot_frk_percent", label: "FRK", color: "#ec4899" },
  { key: "lot_other_percent", label: "Other", color: "#14b8a6" },
];

const rawData = ref([]);
const activeMetrics = ref(metrics.map(m => m.key));

const fetchLots = async () => {
  try {
    const res = await productionService.getLotDetails();
    rawData.value = res.data;
    renderChart();
  } catch (err) {
    console.error("Failed to fetch lots:", err);
  }
};

const renderChart = () => {
  if (!chartRef.value) return;
  if (chartInstance) chartInstance.destroy();

  // Sort by lot_number so X-axis is clean
  const sorted = [...rawData.value].sort((a, b) => a.lot_number - b.lot_number);

  const labels = sorted.map(lot => `Lot ${lot.lot_number}`);

  const datasets = metrics
    .filter(m => activeMetrics.value.includes(m.key))
    .map(m => ({
      label: m.label,
      data: sorted.map(lot => lot[m.key]),
      borderColor: m.color,
      backgroundColor: m.color,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0.1,
      fill: false,
    }));

  chartInstance = new Chart(chartRef.value, {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#374151" }, grid: { color: "#e5e7eb" } },
        y: { ticks: { color: "#374151" }, grid: { color: "#e5e7eb" } },
      },
    },
  });
};

const toggleMetric = (key) => {
  if (activeMetrics.value.includes(key)) {
    activeMetrics.value = activeMetrics.value.filter(m => m !== key);
  } else {
    activeMetrics.value.push(key);
  }
  renderChart();
};

onMounted(fetchLots);
</script>

<style scoped>
/* Vuetify handles styles */
</style>
