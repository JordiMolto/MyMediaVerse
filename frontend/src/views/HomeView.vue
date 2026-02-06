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
  <div class="home-view">
    <div class="container">
      <header class="hero">
        <h1 class="hero-title">
          <i class="fas fa-film"></i>
          MyMediaVerse
        </h1>
        <p class="hero-subtitle">Tu universo personal de entretenimiento</p>
      </header>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon pending">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.pending }}</div>
            <div class="stat-label">Pendientes</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon in-progress">
            <i class="fas fa-play-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.inProgress }}</div>
            <div class="stat-label">En Progreso</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon completed">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.completed }}</div>
            <div class="stat-label">Completados</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon total">
            <i class="fas fa-database"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">Total</div>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <button class="btn btn-primary btn-large" @click="router.push('/pendiente')">
          <i class="fas fa-list"></i>
          Ver Pendientes
        </button>
        <button class="btn btn-secondary btn-large" @click="router.push('/hecho')">
          <i class="fas fa-check"></i>
          Ver Completados
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
  padding: var(--spacing-xl) 0;
}

.hero {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.hero-title {
  font-size: var(--font-size-4xl);
  font-weight: 800;
  margin-bottom: var(--spacing-sm);
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-title i {
  margin-right: var(--spacing-sm);
}

.hero-subtitle {
  font-size: var(--font-size-xl);
  color: var(--text-secondary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  box-shadow: var(--shadow-md);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-2xl);
}

.stat-icon.pending {
  background: linear-gradient(135deg, hsl(40, 90%, 60%), hsl(40, 90%, 50%));
  color: hsl(40, 90%, 10%);
}

.stat-icon.in-progress {
  background: linear-gradient(135deg, hsl(200, 90%, 60%), hsl(200, 90%, 50%));
  color: hsl(200, 90%, 10%);
}

.stat-icon.completed {
  background: linear-gradient(135deg, hsl(140, 60%, 50%), hsl(140, 60%, 40%));
  color: hsl(140, 60%, 10%);
}

.stat-icon.total {
  background: linear-gradient(135deg, hsl(280, 70%, 60%), hsl(280, 70%, 50%));
  color: hsl(280, 70%, 10%);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  line-height: 1;
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.action-buttons {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.btn-large {
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-lg);
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary), hsl(220, 90%, 48%));
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-secondary {
  background: linear-gradient(135deg, var(--color-secondary), hsl(280, 70%, 52%));
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: var(--font-size-3xl);
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-large {
    width: 100%;
    justify-content: center;
  }
}
</style>
