<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useItemsStore } from '@/stores/items'
import { useCategoriesStore } from '@/stores/categories'
import { useUIStore } from '@/stores/ui'
import { useDashboardStats } from '@/composables/useDashboardStats'
import { ItemType } from '@/types'

import DashboardSearch from '@/components/dashboard/DashboardSearch.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import DashboardTopRated from '@/components/dashboard/DashboardTopRated.vue'
import DashboardBacklog from '@/components/dashboard/DashboardBacklog.vue'
import AppFab from '@/components/common/AppFab.vue'

const router = useRouter()
const itemsStore = useItemsStore()
const categoriesStore = useCategoriesStore()
const uiStore = useUIStore()
const { selectedType, stats, formatType } = useDashboardStats()

onMounted(() => {
  itemsStore.fetchItems()
  categoriesStore.fetchCategories()
})

const types = [
  { value: 'all', label: 'Todo', icon: 'fa-th-large' },
  { value: ItemType.MOVIE, label: 'Películas', icon: 'fa-film' },
  { value: ItemType.SERIES, label: 'Series', icon: 'fa-tv' },
  { value: ItemType.BOOK, label: 'Libros', icon: 'fa-book' },
  { value: ItemType.VIDEOGAME, label: 'Videojuegos', icon: 'fa-gamepad' },
  { value: ItemType.BOARDGAME, label: 'Juegos de Mesa', icon: 'fa-dice' }
]

function handleSearch(query: string) {
  router.push({ name: 'search', query: { q: query } })
}
</script>

<template>
  <div class="home-view">
    <div class="dashboard-layout">
      <!-- 1️⃣ Search & Filter Section -->
      <section class="top-nav-section">
        <DashboardSearch @search="handleSearch" />

        <div class="filter-tabs-wrapper">
          <div class="filter-tabs">
            <button v-for="type in types" :key="type.value" class="type-tab"
              :class="{ active: selectedType === type.value }" @click="selectedType = type.value as any">
              <i class="fas" :class="type.icon"></i>
              <span>{{ type.label }}</span>
            </button>
          </div>
        </div>
      </section>

      <!-- 2️⃣ Global Summary -->
      <section class="dashboard-section">
        <div class="section-label">RESUMEN {{ selectedType === 'all' ? 'GLOBAL' : formatType(selectedType as
          ItemType).toUpperCase() }}</div>
        <div class="stats-grid">
          <StatCard title="Consumido este año" :value="stats.totalThisYear" label="items terminados" variant="primary"
            icon="fa-calendar-check" />
          <StatCard title="Total Histórico" :value="stats.totalCompleted" label="en tu colección" variant="accent"
            icon="fa-archive" />
          <StatCard title="Valoración Media" :value="stats.avgRating" label="/ 5 puntos" variant="neutral"
            icon="fa-star" />
          <StatCard title="Items en Curso" :value="stats.totalInProgress" label="ahora mismo" variant="neutral"
            icon="fa-play" />
        </div>
      </section>


      <!-- 4️⃣ Top & Backlog -->
      <div class="dashboard-columns">
        <section class="dashboard-section flex-1">
          <DashboardTopRated :items="stats.topRated" />
        </section>

        <section class="dashboard-section flex-1">
          <DashboardBacklog :oldest="stats.backlog.oldestPending" :best="stats.backlog.bestRatedPending"
            :random="stats.backlog.randomPending" />
        </section>
      </div>
    </div>

    <!-- Global App FAB -->
    <AppFab @click="uiStore.toggleQuickAdd(true, { type: selectedType })" />
  </div>
</template>

<style scoped>
.home-view {
  width: 100%;
}

.dashboard-layout {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  padding-bottom: var(--space-12);
}

.top-nav-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  align-items: center;
}

.filter-tabs-wrapper {
  width: 100%;
  overflow-x: auto;
  padding-bottom: var(--space-2);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.filter-tabs-wrapper::-webkit-scrollbar {
  display: none;
}

.filter-tabs {
  display: flex;
  gap: var(--space-2);
  justify-content: center;
  min-width: max-content;
  margin: 0 auto;
}

.type-tab {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-5);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  font-size: var(--fs-xs);
  font-weight: 700;
  transition: all var(--transition-base);
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: white;
  }

  &.active {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
    box-shadow: var(--shadow-purple);
  }
}

.dashboard-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.section-label {
  font-size: 10px;
  font-weight: 800;
  color: var(--color-text-muted);
  letter-spacing: 0.15em;
  padding-left: var(--space-2);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-4);
}

.dashboard-columns {
  display: flex;
  gap: var(--space-8);
  align-items: flex-start;
}

@media (max-width: 1024px) {
  .dashboard-columns {
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
```
