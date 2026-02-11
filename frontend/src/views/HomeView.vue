<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useItemsStore } from '@/stores/items'
import DashboardSearch from '@/components/dashboard/DashboardSearch.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import DashboardListItem from '@/components/dashboard/DashboardListItem.vue'
import AppFab from '@/components/common/AppFab.vue'
import AppModal from '@/components/common/app-modal/AppModal.vue'
import ItemForm from '@/components/items/ItemForm.vue'

const router = useRouter()
const itemsStore = useItemsStore()
const showCreateModal = ref(false)

onMounted(() => {
  itemsStore.fetchItems()
})

const stats = computed(() => ({
  pending: itemsStore.pendingItems.length,
  completed: itemsStore.completedItems.length,
  // Approximate progress for demo
  pendingProgress: Math.min(65, (itemsStore.pendingItems.length / (itemsStore.items.length || 1)) * 100),
  completedProgress: Math.min(85, (itemsStore.completedItems.length / (itemsStore.items.length || 1)) * 100)
}))

const latestItems = computed(() => {
  return [...itemsStore.items]
    .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
    .slice(0, 3)
})

function handleSearch(query: string) {
  router.push({ name: 'search', query: { q: query } })
}

function handleSaveItem(item: any) {
  itemsStore.createItem(item)
  showCreateModal.value = false
}
</script>

<template>
  <div class="home-view">
    <div class="dashboard-container">
      <!-- Search Section -->
      <section class="app-section search-section">
        <DashboardSearch @search="handleSearch" />
      </section>

      <!-- Stats Section -->
      <section class="app-section stats-section">
        <StatCard class="flex-1" title="Lista de Tareas" :value="stats.pending" label="esperando por ti"
          variant="primary" :progress="stats.pendingProgress" icon="fa-hourglass-start" />
        <StatCard class="flex-1" title="Completado" :value="stats.completed" label="conquistado" variant="accent"
          :progress="stats.completedProgress" icon="fa-check-double" />
      </section>

      <!-- Latest Additions Section -->
      <section class="app-section latest-section">
        <div class="section-header">
          <h2 class="text-2xl fw-bold text-white tracking-tight">Últimas Adiciones</h2>
          <button class="view-all-link" @click="router.push('/buscar')">Ver Todo</button>
        </div>

        <div class="items-list">
          <DashboardListItem v-for="item in latestItems" :key="item.id" :item="item"
            @click="router.push(`/item/${item.id}`)" />
        </div>
      </section>
    </div>

    <!-- Global App FAB -->
    <AppFab @click="showCreateModal = true" />

    <!-- Create Item Modal -->
    <AppModal :is-open="showCreateModal" title="Nuevo Item" size="large" @close="showCreateModal = false">
      <ItemForm mode="create" @save="handleSaveItem" @cancel="showCreateModal = false" />
    </AppModal>
  </div>
</template>

<style scoped>
.home-view {
  width: 100%;
}

.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  /* 48px gap instead of 192px/256px */
}

.search-section {
  display: flex;
  justify-content: center;
  width: 100%;
}

.stats-section {
  display: flex;
  flex-direction: row;
  gap: var(--space-12);
  width: 100%;

  @media (max-width: 900px) {
    flex-direction: column;
    gap: var(--space-8);
  }
}

.latest-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-all-link {
  background: transparent;
  border: none;
  color: var(--color-accent);
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  transition: opacity var(--transition-base);
  text-transform: uppercase;
  letter-spacing: 0.15em;

  &:hover {
    opacity: 0.5;
  }
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
}

@media (max-width: 640px) {
  .dashboard-container {
    gap: var(--space-6);
  }

  .stats-section {
    flex-direction: column;
    gap: var(--space-6);
  }
}
</style>
```
