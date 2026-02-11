<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useItemsStore } from '@/stores/items'
import { ItemType, Item } from '@/types'
import AppModal from '@/components/common/app-modal/AppModal.vue'
import ItemForm from '@/components/items/ItemForm.vue'
import MediaCard from '@/components/common/MediaCard.vue'
import { exportToCSV } from '@/utils/export'

import AppSelect from '@/components/common/app-select/AppSelect.vue'

const router = useRouter()
const itemsStore = useItemsStore()

const selectedType = ref<ItemType | null>(null)
const sortBy = ref('recent')
const showCreateModal = ref(false)

const sortOptions = [
  { value: 'recent', label: 'Recientes' },
  { value: 'rating', label: 'Puntuación' },
  { value: 'alpha', label: 'Alfabético' }
]

onMounted(() => {
  itemsStore.fetchItems()
})

const filteredItems = computed(() => {
  let items = itemsStore.completedItems

  if (selectedType.value) {
    items = items.filter(item => item.tipo === selectedType.value)
  }

  // Sort logic
  return [...items].sort((a, b) => {
    if (sortBy.value === 'recent') {
      return new Date(b.fechaFin || 0).getTime() - new Date(a.fechaFin || 0).getTime()
    }
    if (sortBy.value === 'rating') {
      return (b.rating || 0) - (a.rating || 0)
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
  exportToCSV(filteredItems.value, 'coleccion-completada.csv')
}

// Pagination
const currentPage = ref(1)
const itemsPerPage = 12

const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage))

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredItems.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  // Always show first
  pages.push(1)

  if (current > 3) {
    pages.push('...')
  }

  // Show neighbors
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push('...')
  }

  // Always show last
  pages.push(total)

  return pages
})

function changePage(page: number | string) {
  if (typeof page === 'string') return
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Reset page when filters change
watch([selectedType, sortBy], () => {
  currentPage.value = 1
})

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
        <h1 class="text-4xl fw-black text-white tracking-tighter">Colección Completada</h1>
        <p class="text-secondary opacity-70">Has archivado {{ filteredItems.length }} items en tu viaje</p>
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

        <div class="sort-wrapper flex items-center gap-4">
          <span class="sort-label">ORDENAR POR</span>
          <div class="sort-select-container">
            <AppSelect v-model="sortBy" :options="sortOptions" pill />
          </div>
        </div>
      </div>
    </section>

    <!-- Content Grid -->
    <section class="app-section content-grid-section">
      <div v-if="itemsStore.loading" class="loading-state flex flex-col items-center py-20 gap-4">
        <i class="fas fa-circle-notch fa-spin text-3xl text-primary"></i>
        <span class="text-secondary">Cargando tu colección...</span>
      </div>

      <div v-else-if="filteredItems.length === 0"
        class="empty-state py-32 flex flex-col items-center text-center gap-4">
        <i class="fas fa-archive text-6xl opacity-20"></i>
        <div class="empty-info">
          <h3 class="text-xl fw-bold text-white">No se han encontrado resultados</h3>
          <p class="text-muted">Prueba a cambiar los filtros o añade algo nuevo</p>
        </div>
      </div>

      <div v-else class="content-wrapper flex flex-col gap-16">
        <div class="items-grid">
          <MediaCard v-for="item in paginatedItems" :key="item.id" :item="item" @click="goToDetail" />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination-controls flex justify-center gap-2">
          <button class="page-btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
            <i class="fas fa-chevron-left"></i>
          </button>

          <button v-for="(page, index) in visiblePages" :key="index" class="page-btn"
            :class="{ active: currentPage === page, 'dots': page === '...' }" @click="changePage(page)"
            :disabled="page === '...'">
            {{ page }}
          </button>

          <button class="page-btn" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
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
  border-radius: var(--radius-full);
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

.sort-select-container {
  width: 180px;
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
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  font-weight: 700;
  transition: all var(--transition-base);

  &:hover:not(:disabled):not(.dots) {
    background: var(--color-bg-card-hover);
    color: white;
  }

  &.active {
    background: var(--color-accent);
    color: var(--color-bg-main);
    border-color: var(--color-accent);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.dots {
    border: none;
    background: transparent;
    cursor: default;
    color: var(--color-text-muted);

    &:hover {
      background: transparent;
    }
  }
}

@media (max-width: 1024px) {
  .filter-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }

  .category-tabs-wrapper {
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    padding-bottom: var(--space-2);
    /* Hide scrollbar for cleaner look but keep functionality */
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .category-tabs {
    flex-wrap: nowrap;
    min-width: min-content;
  }
}
</style>
