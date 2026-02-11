<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useItemsStore } from '@/stores/items'
import { ItemType, Item, Priority } from '@/types'
import AppModal from '@/components/common/app-modal/AppModal.vue'
import ItemForm from '@/components/items/ItemForm.vue'
import MediaCard from '@/components/common/MediaCard.vue'
import { exportToCSV } from '@/utils/export'

const router = useRouter()
const itemsStore = useItemsStore()

const selectedType = ref<ItemType | null>(null)
const sortBy = ref('priority')
const showCreateModal = ref(false)

onMounted(() => {
  itemsStore.fetchItems()
})

const filteredItems = computed(() => {
  let items = itemsStore.pendingItems

  if (selectedType.value) {
    items = items.filter(item => item.tipo === selectedType.value)
  }

  // Sort logic
  return [...items].sort((a, b) => {
    if (sortBy.value === 'priority') {
      const priorityScore = { [Priority.HIGH]: 3, [Priority.MEDIUM]: 2, [Priority.LOW]: 1 }
      return (priorityScore[b.prioridad || Priority.LOW]) - (priorityScore[a.prioridad || Priority.LOW])
    }
    if (sortBy.value === 'recent') {
      return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
    }
    if (sortBy.value === 'alpha') {
      return a.titulo.localeCompare(b.titulo)
    }
    return 0
  })
})

const types = [
  { value: ItemType.MOVIE, label: 'Películas', icon: 'fa-film' },
  { value: ItemType.SERIES, label: 'Series', icon: 'fa-tv' },
  { value: ItemType.ANIME, label: 'Anime', icon: 'fa-dragon' },
  { value: ItemType.BOOK, label: 'Libros', icon: 'fa-book' },
  { value: ItemType.VIDEOGAME, label: 'Juegos', icon: 'fa-gamepad' },
  { value: ItemType.BOARDGAME, label: 'Juegos de Mesa', icon: 'fa-dice' }
]

function handleExport() {
  exportToCSV(filteredItems.value, 'lista-pendiente.csv')
}

function goToDetail(id: string) {
  router.push(`/item/${id}`)
}

async function handleCreateItem(itemData: Partial<Item>) {
  try {
    const newItem = await itemsStore.createItem(itemData as Omit<Item, 'id' | 'fechaCreacion'>)
    showCreateModal.value = false
    router.push(`/item/${newItem.id}`)
  } catch (error) {
    console.error('Error creating item:', error)
  }
}
</script>

<template>
  <div class="collection-view">
    <!-- Header Section -->
    <header class="app-section collection-header flex justify-between items-start">
      <div class="header-info">
        <h1 class="text-4xl fw-black text-white tracking-tighter">Lista Pendiente</h1>
        <p class="text-secondary opacity-70">Tienes {{ filteredItems.length }} aventuras esperándote</p>
      </div>
      <button class="btn btn-glass btn-small" @click="handleExport">
        <i class="fas fa-download"></i>
        Exportar CSV
      </button>
    </header>

    <!-- Filter & Sort Bar -->
    <section class="app-section filter-bar-section">
      <div class="filter-bar flex justify-between items-center gap-6">
        <div class="category-tabs-wrapper">
          <div class="category-tabs flex gap-2">
            <button class="tab-btn" :class="{ active: selectedType === null }" @click="selectedType = null">
              <i class="fas fa-th-large"></i>
              Todo
            </button>
            <button v-for="type in types" :key="type.value" class="tab-btn"
              :class="{ active: selectedType === type.value }" @click="selectedType = type.value">
              <i class="fas" :class="type.icon"></i>
              {{ type.label }}
            </button>
          </div>
        </div>

        <div class="sort-wrapper flex items-center gap-3">
          <span class="sort-label">ORDENAR POR</span>
          <select v-model="sortBy" class="sort-select">
            <option value="priority">Prioridad</option>
            <option value="recent">Nuevos primero</option>
            <option value="alpha">Alfabético</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Content Grid -->
    <section class="app-section content-grid-section">
      <div v-if="itemsStore.loading" class="loading-state flex flex-col items-center py-20 gap-4">
        <i class="fas fa-circle-notch fa-spin text-3xl text-primary"></i>
        <span class="text-secondary">Abriendo el baúl...</span>
      </div>

      <div v-else-if="filteredItems.length === 0"
        class="empty-state py-32 flex flex-col items-center text-center gap-4">
        <i class="fas fa-ghost text-6xl opacity-20"></i>
        <div class="empty-info">
          <h3 class="text-xl fw-bold text-white">¡No tienes nada pendiente!</h3>
          <p class="text-muted">Añade algo nuevo a tu lista para empezar</p>
        </div>
      </div>

      <div v-else class="items-grid">
        <MediaCard v-for="item in filteredItems" :key="item.id" :item="item" @click="goToDetail" />
      </div>

      <!-- Pagination Placeholder -->
      <div v-if="filteredItems.length > 0" class="pagination-mock mt-20 flex justify-center gap-2">
        <button class="page-btn active">1</button>
        <button class="page-btn">2</button>
        <span class="page-dots">...</span>
      </div>
    </section>

    <!-- Global App FAB -->
    <AppFab @click="showCreateModal = true" />

    <!-- Create Item Modal -->
    <AppModal :is-open="showCreateModal" title="Crear Nuevo Item" size="large" @close="showCreateModal = false">
      <ItemForm mode="create" @save="handleCreateItem" @cancel="showCreateModal = false" />
    </AppModal>
  </div>
</template>

<style scoped>
.collection-view {
  width: 100%;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-5);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--fs-sm);
  font-weight: 700;
  transition: all var(--transition-base);
  white-space: nowrap;

  i {
    font-size: 0.9rem;
    opacity: 0.7;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: white;
  }

  &.active {
    background: var(--color-accent);
    color: var(--color-bg-main);
    border-color: var(--color-accent);
    box-shadow: 0 0 20px rgba(0, 245, 255, 0.3);

    i {
      opacity: 1;
    }
  }
}

.sort-label {
  font-size: 10px;
  font-weight: 800;
  color: var(--color-text-muted);
  letter-spacing: 0.1em;
}

.sort-select {
  background: transparent;
  border: none;
  color: white;
  font-weight: 800;
  font-size: var(--fs-sm);
  cursor: pointer;
  outline: none;

  option {
    background: var(--color-bg-surface);
    color: white;
  }
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-6);
  width: 100%;
}

.page-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-weight: 700;
  transition: all var(--transition-base);

  &:hover {
    background: var(--color-bg-card-hover);
    color: white;
  }

  &.active {
    background: var(--color-accent);
    color: var(--color-bg-main);
    border-color: var(--color-accent);
  }
}

.page-dots {
  display: flex;
  align-items: flex-end;
  padding-bottom: var(--space-2);
  color: var(--color-text-muted);
}

@media (max-width: 1024px) {
  .filter-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .category-tabs-wrapper {
    width: 100%;
    overflow-x: auto;
    padding-bottom: var(--space-2);
  }
}
</style>
