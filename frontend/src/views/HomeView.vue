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

async function handleSaveItem(item: any) {
  try {
    await itemsStore.createItem(item)
    showCreateModal.value = false
  } catch (error) {
    console.error('Error creating item:', error)
    alert('Error al crear el item. Por favor, verifica la consola.')
  }
}
</script>

<template>
  <div class="home-view">
    <div class="dashboard-layout">
      <!-- Search Section -->
      <section class="search-section">
        <DashboardSearch @search="handleSearch" />
      </section>

      <!-- Stats Section -->
      <section class="stats-grid">
        <StatCard title="Lista de Tareas" :value="stats.pending" label="esperando por ti" variant="primary"
          :progress="stats.pendingProgress" icon="fa-hourglass-start" />
        <StatCard title="Completado" :value="stats.completed" label="conquistado" variant="accent"
          :progress="stats.completedProgress" icon="fa-check-double" />
      </section>

      <!-- Latest Items Section -->
      <section class="latest-section">
        <div class="section-header">
          <h2 class="section-title">Últimas Adiciones</h2>
          <button class="view-all-btn" @click="router.push('/buscar')">Ver Todo</button>
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

.dashboard-layout {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.search-section {
  display: flex;
  justify-content: center;
}

.stats-grid {
  display: flex;
  gap: 24px;
  width: 100%;

  &>* {
    flex: 1;
  }

  @media (max-width: 900px) {
    flex-direction: column;
    gap: 16px;
  }
}

.latest-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: white;
  letter-spacing: -0.02em;
}

.view-all-btn {
  background: transparent;
  border: none;
  color: var(--color-accent);
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  transition: opacity 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.15em;

  &:hover {
    opacity: 0.6;
  }
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 640px) {
  .dashboard-layout {
    gap: 24px;
  }
}
</style>
```
