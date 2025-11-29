<template>
    <v-container fluid class="pa-0">
        <!-- Main Stats Row -->
        <v-row>
            <v-col cols="12" sm="6" md="3" v-for="(stat, index) in mainStats" :key="index">
                <v-card class="stat-card h-100" elevation="2" hover>
                    <v-card-text class="d-flex flex-column align-center justify-center py-6">
                        <v-avatar :color="stat.color + '-lighten-5'" size="64" class="mb-4">
                            <v-icon :icon="stat.icon" size="32" :color="stat.color"></v-icon>
                        </v-avatar>
                        <h3 class="text-h4 font-weight-bold mb-1" :class="`text-${stat.color}-darken-3`">{{ stat.value
                        }}</h3>
                        <p class="text-caption text-grey-darken-1 text-uppercase font-weight-medium text-center">
                            {{ stat.label }}
                        </p>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Detailed Stock Information -->
        <v-row class="mt-4">
            <v-col cols="12" md="6">
                <v-card elevation="2">
                    <v-card-title class="bg-brown-lighten-5 text-brown-darken-3">
                        <v-icon icon="mdi-warehouse" class="mr-2"></v-icon>
                        Stock by Godown
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-card-text class="pa-0">
                        <v-list v-if="godownStock.length > 0" density="compact">
                            <v-list-item v-for="(godown, index) in godownStock" :key="index">
                                <template v-slot:prepend>
                                    <v-icon icon="mdi-home-city" color="brown"></v-icon>
                                </template>
                                <v-list-item-title class="font-weight-medium">{{ godown.name }}</v-list-item-title>
                                <v-list-item-subtitle>
                                    {{ godown.bags }} Bags • {{ godown.qtl }} Qtl
                                </v-list-item-subtitle>
                            </v-list-item>
                        </v-list>
                        <div v-else class="pa-4 text-center text-grey">
                            No godown data available
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="12" md="6">
                <v-card elevation="2">
                    <v-card-title class="bg-brown-lighten-5 text-brown-darken-3">
                        <v-icon icon="mdi-package-variant-closed" class="mr-2"></v-icon>
                        Stock by Item
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-card-text class="pa-0">
                        <v-list v-if="itemStock.length > 0" density="compact">
                            <v-list-item v-for="(item, index) in itemStock" :key="index">
                                <template v-slot:prepend>
                                    <v-icon icon="mdi-cube-outline" color="brown"></v-icon>
                                </template>
                                <v-list-item-title class="font-weight-medium">{{ item.name }}</v-list-item-title>
                                <v-list-item-subtitle>
                                    {{ item.bags }} Bags • {{ item.qtl }} Qtl
                                </v-list-item-subtitle>
                            </v-list-item>
                        </v-list>
                        <div v-else class="pa-4 text-center text-grey">
                            No item data available
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Additional Stats -->
        <v-row class="mt-4">
            <v-col cols="12" sm="6" md="4" v-for="(stat, index) in additionalStats" :key="index">
                <v-card elevation="2">
                    <v-card-text class="d-flex align-center">
                        <v-avatar :color="stat.color + '-lighten-5'" size="48" class="mr-4">
                            <v-icon :icon="stat.icon" size="24" :color="stat.color"></v-icon>
                        </v-avatar>
                        <div class="flex-grow-1">
                            <div class="text-caption text-grey-darken-1">{{ stat.label }}</div>
                            <div class="text-h6 font-weight-bold" :class="`text-${stat.color}-darken-3`">{{ stat.value
                            }}</div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import millService from '@/services/millService'

const mainStats = ref([
    {
        icon: 'mdi-package-variant',
        value: 'Loading...',
        label: 'Total Bags',
        color: 'brown'
    },
    {
        icon: 'mdi-weight',
        value: 'Loading...',
        label: 'Total Weight (Qtl)',
        color: 'deep-orange'
    },
    {
        icon: 'mdi-warehouse',
        value: 'Loading...',
        label: 'Total Godowns',
        color: 'blue'
    },
    {
        icon: 'mdi-cube-outline',
        value: 'Loading...',
        label: 'Total Items',
        color: 'green'
    }
])

const additionalStats = ref([
    {
        icon: 'mdi-truck-delivery',
        value: 'Loading...',
        label: 'Total Weight (Qtl)',
        color: 'indigo'
    },
    {
        icon: 'mdi-package',
        value: 'Loading...',
        label: 'Unique Godowns',
        color: 'purple'
    },
    {
        icon: 'mdi-scale-balance',
        value: 'Loading...',
        label: 'Average Weight/Bag (Qtl)',
        color: 'teal'
    }
])

const godownStock = ref([])
const itemStock = ref([])

onMounted(async () => {
    try {
        const response = await millService.getStockSummary()

        if (response.status === 200) {
            console.log('Stock Summary Response:', response.data)
            const data = response.data
            const grandTotal = data.grand_total
            const summary = data.summary || []

            // Main Stats
            const totalBags = grandTotal?.total_bags || 0
            const totalQtl = grandTotal?.total_weight_quintal?.toFixed(2) || 0
            const totalGodowns = summary.length || 0

            // Count unique items across all godowns
            const uniqueItems = new Set()
            summary.forEach(godown => {
                if (godown.items && Array.isArray(godown.items)) {
                    godown.items.forEach(item => {
                        uniqueItems.add(item.stock_item_name)
                    })
                }
            })
            const totalItems = uniqueItems.size

            mainStats.value[0].value = `${totalBags}`
            mainStats.value[1].value = `${totalQtl}`
            mainStats.value[2].value = `${totalGodowns}`
            mainStats.value[3].value = `${totalItems}`

            // Additional Stats - Calculate average weight per bag
            const avgWeight = totalBags > 0 ? (totalQtl / totalBags).toFixed(2) : 0

            additionalStats.value[0].value = `${totalQtl}`
            additionalStats.value[1].value = `${totalGodowns}`
            additionalStats.value[2].value = `${avgWeight}`

            // Godown Stock - Transform summary data
            if (summary && summary.length > 0) {
                godownStock.value = summary.map(g => ({
                    name: g.godown_name || 'Unknown',
                    bags: g.total_bags || 0,
                    qtl: g.total_weight_quintal?.toFixed(2) || 0
                }))
            }

            // Item Stock - Aggregate items across all godowns
            const itemMap = new Map()
            summary.forEach(godown => {
                if (godown.items && Array.isArray(godown.items)) {
                    godown.items.forEach(item => {
                        const itemName = item.stock_item_name
                        if (itemMap.has(itemName)) {
                            const existing = itemMap.get(itemName)
                            existing.bags += item.bags || 0
                            existing.qtl += item.weight_quintal || 0
                        } else {
                            itemMap.set(itemName, {
                                name: itemName,
                                bags: item.bags || 0,
                                qtl: item.weight_quintal || 0
                            })
                        }
                    })
                }
            })

            // Convert map to array and format qtl
            itemStock.value = Array.from(itemMap.values()).map(item => ({
                name: item.name,
                bags: item.bags,
                qtl: item.qtl.toFixed(2)
            }))

        } else {
            mainStats.value.forEach(stat => {
                stat.value = 'N/A'
            })
            additionalStats.value.forEach(stat => {
                stat.value = 'N/A'
            })
        }
    } catch (error) {
        console.error('Error fetching stock summary:', error)
        mainStats.value.forEach(stat => {
            stat.value = 'Error'
        })
        additionalStats.value.forEach(stat => {
            stat.value = 'Error'
        })
    }
})
</script>

<style scoped>
.stat-card {
    border-radius: 16px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #8B4513, #D2691E);
}

.stat-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
}
</style>