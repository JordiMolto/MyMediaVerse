<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useItemsStore } from '@/stores/items'
import { ItemStatus } from '@/types'

const router = useRouter()
const itemsStore = useItemsStore()

onMounted(() => {
  itemsStore.fetchItems()
})

const stats = computed(() => ({
  pending: itemsStore.pendingItems.length,
  inProgress: itemsStore.inProgressItems.length,
  completed: itemsStore.completedItems.length,
  total: itemsStore.items.length
}))
</script>

<template>
  <div class="home-view py-12">
    <div class="container animate-fade">
      <header class="hero text-center mb-10">
        <h1 class="hero-title text-gradient mb-2">
          <i class="fas fa-film"></i>
          MyMediaVerse
        </h1>
        <p class="hero-subtitle text-secondary text-xl">Tu universo personal de entretenimiento</p>
      </header>

      <div class="grid grid-cols-4 gap-6 mb-10">
        <div class="stat-card glass-card p-6 flex items-center gap-4 hover-lift">
          <div class="stat-icon pending bg-warning">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value text-3xl fw-bold">{{ stats.pending }}</div>
            <div class="stat-label text-xs text-muted">Pendientes</div>
          </div>
        </div>

        <div class="stat-card glass-card p-6 flex items-center gap-4 hover-lift">
          <div class="stat-icon in-progress bg-info">
            <i class="fas fa-play-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value text-3xl fw-bold">{{ stats.inProgress }}</div>
            <div class="stat-label text-xs text-muted">En Progreso</div>
          </div>
        </div>

        <div class="stat-card glass-card p-6 flex items-center gap-4 hover-lift">
          <div class="stat-icon completed bg-success">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value text-3xl fw-bold">{{ stats.completed }}</div>
            <div class="stat-label text-xs text-muted">Completados</div>
          </div>
        </div>

        <div class="stat-card glass-card p-6 flex items-center gap-4 hover-lift">
          <div class="stat-icon total bg-primary">
            <i class="fas fa-database"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value text-3xl fw-bold">{{ stats.total }}</div>
            <div class="stat-label text-xs text-muted">Total</div>
          </div>
        </div>
      </div>

      <div class="action-buttons flex justify-center gap-6">
        <button class="btn btn-primary btn-large px-8 py-4 text-lg" @click="router.push('/pendiente')">
          <i class="fas fa-list"></i>
          Ver Pendientes
        </button>
        <button class="btn btn-glass btn-large px-8 py-4 text-lg" @click="router.push('/hecho')">
          <i class="fas fa-check"></i>
          Ver Completados
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  min-height: calc(100vh - var(--header-height));
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 4.5rem);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }
}
</style>
