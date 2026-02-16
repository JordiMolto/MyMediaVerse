<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useItemsStore } from '@/stores/items'
import { useCategoriesStore } from '@/stores/categories'
import MediaCard from '@/components/common/MediaCard.vue'
import { exportToCSV } from '@/utils/export'
import AppSelect from '@/components/common/app-select/AppSelect.vue'
import AppFab from '@/components/common/AppFab.vue'
import BulkActionsBar from '@/components/common/BulkActionsBar.vue'
import { useBulkSelection } from '@/composables/useBulkSelection'
import { useTMDBEnrichment } from '@/composables/useTMDBEnrichment'
import { useUIStore } from '@/stores/ui'
import { ItemStatus, ItemType } from '@/types'
import AppModal from '@/components/common/app-modal/AppModal.vue'

const router = useRouter()
const itemsStore = useItemsStore()
const categoriesStore = useCategoriesStore()
const uiStore = useUIStore()

const selectedType = ref<string | null>(null)
const sortBy = ref('recent')
const showEnrichmentModal = ref(false)
const enrichmentResult = ref<{ total: number; success: number; failed: number; errors: string[] } | null>(null)

// Bulk selection
const {
  selectedCount,
  isSelectionMode,
  toggleSelection,
  isSelected,
  selectAll,
  clearSelection,
  getSelectedItems
} = useBulkSelection()

// TMDB Enrichment
const {
  isEnriching,
  enrichmentProgress,
  enrichmentTotal,
  enrichMultipleItems
} = useTMDBEnrichment()

const sortOptions = [
  { value: 'recent', label: 'Recientes' },
  { value: 'alpha', label: 'Alfabético' }
]

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && selectedCount.value > 0) {
    clearSelection()
  }
}

onMounted(() => {
  itemsStore.fetchItems()
  categoriesStore.fetchCategories()
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

const filteredItems = computed(() => {
  let items = itemsStore.inProgressItems

  if (selectedType.value) {
    items = items.filter(item => item.tipo === selectedType.value)
  }

  // Sort logic
  return [...items].sort((a, b) => {
    if (sortBy.value === 'recent') {
      return new Date(b.fechaInicio || 0).getTime() - new Date(a.fechaInicio || 0).getTime()
    }
    if (sortBy.value === 'alpha') {
      return a.titulo.localeCompare(b.titulo)
    }
    return 0
  })
})

const types = computed(() => {
  return categoriesStore.categories
    .filter(cat => !cat.oculto)
    .map(cat => ({
      value: cat.nombre,
      label: cat.nombre,
      icon: cat.icono
    }))
})

function handleExport() {
  exportToCSV(filteredItems.value, 'items-en-progreso.csv')
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

// Clear selection when exiting selection mode
watch(isSelectionMode, (newValue) => {
  if (!newValue) {
    clearSelection()
  }
})

function goToDetail(id: string) {
  router.push(`/item/${id}`)
}

// Bulk actions
async function handleBulkChangeStatus(status: ItemStatus) {
  const items = getSelectedItems(filteredItems.value)
  try {
    await Promise.all(items.map(item => itemsStore.changeStatus(item.id, status)))
    clearSelection()
  } catch (error) {
    console.error('Error changing status:', error)
    alert('Error al cambiar el estado de los items')
  }
}

async function handleBulkDelete() {
  const items = getSelectedItems(filteredItems.value)
  if (!confirm(`¿Estás seguro de que quieres eliminar ${items.length} items?`)) return

  try {
    await Promise.all(items.map(item => itemsStore.deleteItem(item.id)))
    clearSelection()
  } catch (error) {
    console.error('Error deleting items:', error)
    alert('Error al eliminar los items')
  }
}

function handleSelectAll() {
  selectAll(filteredItems.value)
}

async function handleEnrichWithTMDB() {
  console.log('handleEnrichWithTMDB called in InProgressView')
  const items = getSelectedItems(filteredItems.value)
  console.log('Selected items:', items)

  // Filter only movies, series, and anime (robust check)
  const enrichableItems = items.filter(item => {
    const t = (item.tipo || '').toLowerCase()
    const enrichable = [ItemType.MOVIE, ItemType.SERIES, ItemType.ANIME, 'película', 'pelicula', 'serie', 'anime']
      .some(v => t.includes(v.toLowerCase()))
    console.log(`Checking item "${item.titulo}" type "${item.tipo}": enrichable=${enrichable}`)
    return enrichable
  })

  if (enrichableItems.length === 0) {
    console.warn('No enrichable items selected')
    alert('Selecciona al menos una película, serie o anime para enriquecer con TMDB')
    return
  }

  console.log('Enrichable items total:', enrichableItems.length)
  if (!confirm(`¿Quieres enriquecer ${enrichableItems.length} items con datos de TMDB? Esto puede tardar unos minutos.`)) {
    console.log('Enrichment cancelled by user')
    return
  }

  console.log('Opening enrichment modal')
  showEnrichmentModal.value = true
  const result = await enrichMultipleItems(enrichableItems)
  console.log('Enrichment finished result:', result)
  enrichmentResult.value = result

  // Refresh items to show updated data
  await itemsStore.fetchItems()
  clearSelection()
}
</script>

<template>
  <div class="collection-view">
    <!-- Header Section -->
    <header class="app-section collection-header flex justify-between items-start">
      <div class="header-info">
        <h1 class="text-4xl fw-black text-white tracking-tighter">En Progreso</h1>
        <p class="text-secondary opacity-70">Tienes {{ filteredItems.length }} historias abiertas ahora mismo</p>
      </div>
      <div class="header-actions flex gap-3">
        <button class="btn btn-glass btn-small" :class="{ 'active': isSelectionMode }"
          @click="isSelectionMode = !isSelectionMode">
          <i class="fas" :class="isSelectionMode ? 'fa-times' : 'fa-check-square'"></i>
          {{ isSelectionMode ? 'Cancelar' : 'Seleccionar' }}
        </button>
        <button class="btn btn-glass btn-small" @click="handleExport">
          <i class="fas fa-download"></i>
          Exportar CSV
        </button>
      </div>
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
        <span class="text-secondary">Abriendo el baúl...</span>
      </div>

      <div v-else-if="filteredItems.length === 0"
        class="empty-state py-32 flex flex-col items-center text-center gap-4">
        <i class="fas fa-play text-6xl opacity-20"></i>
        <div class="empty-info">
          <h3 class="text-xl fw-bold text-white">No hay nada "en curso"</h3>
          <p class="text-muted">Empieza un nuevo item para verlo aquí</p>
        </div>
      </div>

      <div v-else class="content-wrapper flex flex-col gap-16">
        <div class="items-grid">
          <MediaCard v-for="item in paginatedItems" :key="item.id" :item="item" :selectable="isSelectionMode"
            :selected="isSelected(item.id)" @click="goToDetail" @toggle-select="toggleSelection" />
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
    <AppFab
      @click="uiStore.toggleQuickAdd(true, { type: selectedType || undefined, status: ItemStatus.IN_PROGRESS })" />

    <!-- Bulk Actions Bar -->
    <BulkActionsBar :selected-count="selectedCount" :total-count="filteredItems.length" @select-all="handleSelectAll"
      @clear-selection="clearSelection" @change-status="handleBulkChangeStatus" @delete-selected="handleBulkDelete"
      @enrich-with-tmdb="handleEnrichWithTMDB" />

    <!-- TMDB Enrichment Progress Modal -->
    <AppModal :is-open="showEnrichmentModal" title="Enriqueciendo con TMDB" size="medium"
      @close="!isEnriching && (showEnrichmentModal = false)">
      <div class="enrichment-modal">
        <div v-if="isEnriching" class="enrichment-progress">
          <div class="progress-info">
            <i class="fas fa-film fa-spin"></i>
            <p>Enriqueciendo items con datos de TMDB...</p>
            <p class="progress-text">{{ enrichmentProgress }} / {{ enrichmentTotal }}</p>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${(enrichmentProgress / enrichmentTotal) * 100}%` }"></div>
          </div>
        </div>

        <div v-else-if="enrichmentResult" class="enrichment-result">
          <div class="result-icon success">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3>Enriquecimiento Completado</h3>
          <div class="result-stats">
            <div class="stat">
              <span class="stat-value">{{ enrichmentResult.total }}</span>
              <span class="stat-label">Total</span>
            </div>
            <div class="stat success">
              <span class="stat-value">{{ enrichmentResult.success }}</span>
              <span class="stat-label">Exitosos</span>
            </div>
            <div class="stat error">
              <span class="stat-value">{{ enrichmentResult.failed }}</span>
              <span class="stat-label">Fallidos</span>
            </div>
          </div>

          <div v-if="enrichmentResult.errors.length > 0" class="errors-list">
            <h4>Errores:</h4>
            <ul>
              <li v-for="(error, index) in enrichmentResult.errors" :key="index">{{ error }}</li>
            </ul>
          </div>

          <button class="btn btn-primary" @click="showEnrichmentModal = false">Cerrar</button>
        </div>
      </div>
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
    /* Hide scrollbar for cleaner look */
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

/* TMDB Enrichment Modal Styles */
.enrichment-modal {
  padding: var(--space-6);
}

.enrichment-progress {
  text-align: center;
}

.progress-info {
  margin-bottom: var(--space-6);

  i {
    font-size: 3rem;
    color: var(--color-accent);
    margin-bottom: var(--space-4);
  }

  p {
    color: var(--color-text-secondary);
    margin-bottom: var(--space-2);
  }

  .progress-text {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
  }
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--color-bg-surface);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-primary));
  transition: width 0.3s ease;
}

.enrichment-result {
  text-align: center;

  .result-icon {
    font-size: 4rem;
    margin-bottom: var(--space-4);

    &.success {
      color: var(--color-success);
    }
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin-bottom: var(--space-6);
  }
}

.result-stats {
  display: flex;
  justify-content: center;
  gap: var(--space-6);
  margin-bottom: var(--space-6);

  .stat {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-4);
    background: var(--color-bg-surface);
    border-radius: var(--radius-lg);
    min-width: 100px;

    &.success .stat-value {
      color: var(--color-success);
    }

    &.error .stat-value {
      color: var(--color-danger);
    }
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 900;
    color: var(--color-accent);
  }

  .stat-label {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}

.errors-list {
  text-align: left;
  margin-bottom: var(--space-6);
  padding: var(--space-4);
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: var(--radius-md);

  h4 {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--color-danger);
    margin-bottom: var(--space-3);
    text-transform: uppercase;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    padding: var(--space-2) 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);

    &:last-child {
      border-bottom: none;
    }
  }
}
</style>
