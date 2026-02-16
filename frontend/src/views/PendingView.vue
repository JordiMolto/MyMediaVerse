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
import { ItemStatus, ItemType, Priority } from '@/types'
import AppModal from '@/components/common/app-modal/AppModal.vue'
import { useUIStore } from '@/stores/ui'

const router = useRouter()
const itemsStore = useItemsStore()
const categoriesStore = useCategoriesStore()
const uiStore = useUIStore()

const selectedType = ref<string | null>(null)
const sortBy = ref('priority')
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
  { value: 'priority', label: 'Prioridad' },
  { value: 'recent', label: 'Nuevos primero' },
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
  exportToCSV(filteredItems.value, 'lista-pendiente.csv')
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
  console.log('handleEnrichWithTMDB called')
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
  <div class="pending-view">
    <header class="pending-header">
      <div class="header-content">
        <h1 class="header-title">Lista Pendiente</h1>
        <p class="header-subtitle">Tienes {{ filteredItems.length }} aventuras esperándote</p>
      </div>
      <div class="header-actions">
        <button class="action-btn-small" :class="{ 'active': isSelectionMode }"
          @click="isSelectionMode = !isSelectionMode">
          <i class="fas" :class="isSelectionMode ? 'fa-times' : 'fa-check-square'"></i>
          {{ isSelectionMode ? 'Cancelar' : 'Seleccionar' }}
        </button>
        <button class="action-btn-small" @click="handleExport">
          <i class="fas fa-download"></i>
          Exportar CSV
        </button>
      </div>
    </header>

    <!-- Filter & Sort Bar -->
    <section class="filter-section">
      <div class="filter-bar">
        <div class="category-filters-scroll">
          <div class="category-tabs">
            <button class="type-tab-btn" :class="{ active: selectedType === null }" @click="selectedType = null">
              <i class="fas fa-th-large"></i> Todo
            </button>
            <button v-for="type in types" :key="type.value" class="type-tab-btn"
              :class="{ active: selectedType === type.value }" @click="selectedType = type.value">
              <i class="fas" :class="type.icon"></i> {{ type.label }}
            </button>
          </div>
        </div>

        <div class="dropdown-filters">
          <div class="filter-group">
            <span class="filter-label">ORDENAR POR</span>
            <div class="select-wrapper">
              <AppSelect v-model="sortBy" :options="sortOptions" pill />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Content Grid -->
    <section class="items-section">
      <div v-if="itemsStore.loading" class="loading-state">
        <i class="fas fa-circle-notch fa-spin loading-spinner"></i>
        <span class="loading-text">Abriendo el baúl...</span>
      </div>

      <div v-else-if="filteredItems.length === 0" class="empty-state">
        <i class="fas fa-ghost empty-icon"></i>
        <div class="empty-content">
          <h3 class="empty-title">¡No tienes nada pendiente!</h3>
          <p class="empty-description">Añade algo nuevo a tu lista para empezar</p>
        </div>
      </div>

      <div v-else class="results-layout">
        <div class="pending-grid">
          <MediaCard v-for="item in paginatedItems" :key="item.id" :item="item" :selectable="isSelectionMode"
            :selected="isSelected(item.id)" @click="goToDetail" @toggle-select="toggleSelection" />
        </div>

        <div v-if="totalPages > 1" class="pagination-container">
          <button class="page-nav-btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button v-for="(page, index) in visiblePages" :key="index" class="page-nav-btn"
            :class="{ active: currentPage === page, 'dots': page === '...' }" @click="changePage(page)"
            :disabled="page === '...'">
            {{ page }}
          </button>
          <button class="page-nav-btn" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </section>

    <!-- Global App FAB -->
    <AppFab @click="uiStore.toggleQuickAdd(true, { type: selectedType || undefined, status: ItemStatus.PENDING })" />

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
.pending-view {
  width: 100%;
}

.pending-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 32px 0;
}

.header-title {
  font-size: 48px;
  font-weight: 900;
  color: white;
  letter-spacing: -0.05em;
  margin-bottom: 4px;
}

.header-subtitle {
  color: var(--color-text-secondary);
  opacity: 0.7;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn-small {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--color-border);
  border-radius: 99px;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: white;
  }

  &.active {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }
}

.filter-section {
  margin-bottom: 40px;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.category-tabs {
  display: flex;
  gap: 8px;
}

.type-tab-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 20px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 99px;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 700;
  transition: all 0.2s;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: white;
  }

  &.active {
    background: var(--color-accent);
    color: var(--color-bg-main);
    border-color: var(--color-accent);
    box-shadow: 0 0 20px rgba(0, 245, 255, 0.3);
  }
}

.dropdown-filters {
  display: flex;
  align-items: center;
  gap: 24px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter-label {
  font-size: 10px;
  font-weight: 800;
  color: var(--color-text-muted);
  letter-spacing: 0.1em;
}

.select-wrapper {
  width: 180px;
}

.items-section {
  padding-bottom: 64px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 0;
  gap: 16px;
}

.loading-spinner {
  font-size: 32px;
  color: var(--color-primary);
}

.loading-text {
  color: var(--color-text-secondary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 120px 0;
  gap: 16px;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.1;
  color: white;
}

.empty-title {
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
}

.empty-description {
  color: var(--color-text-muted);
  font-size: 14px;
}

.results-layout {
  display: flex;
  flex-direction: column;
  gap: 64px;
}

.pending-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  width: 100%;
}

.pagination-container {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.page-nav-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  color: var(--color-text-secondary);
  font-weight: 700;
  transition: all 0.2s;
  cursor: pointer;

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
    opacity: 0.4;
    cursor: not-allowed;
  }

  &.dots {
    border: none;
    background: transparent;
    cursor: default;
    color: var(--color-text-muted);
  }
}

@media (max-width: 1024px) {
  .pending-header {
    flex-direction: column;
    gap: 24px;
  }

  .filter-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
  }

  .category-filters-scroll {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 8px;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .category-tabs {
    flex-wrap: nowrap;
    min-width: min-content;
  }
}

.enrichment-modal {
  padding: 24px;
}

.enrichment-progress {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.progress-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  i {
    font-size: 48px;
    color: var(--color-accent);
  }

  .progress-text {
    font-size: 24px;
    font-weight: 700;
    color: white;
  }
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--color-bg-surface);
  border-radius: 99px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-primary));
  transition: width 0.3s ease;
}

.enrichment-result {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;

  .result-icon {
    font-size: 64px;
    color: var(--color-success);
  }

  h3 {
    font-size: 24px;
    font-weight: 700;
    color: white;
  }
}

.result-stats {
  display: flex;
  justify-content: center;
  gap: 24px;

  .stat {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    background: var(--color-bg-surface);
    border-radius: 12px;
    min-width: 100px;

    .stat-value {
      font-size: 32px;
      font-weight: 900;
    }

    &.success {
      color: var(--color-success);
    }

    &.error {
      color: var(--color-danger);
    }
  }
}

.errors-list {
  text-align: left;
  padding: 16px;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 8px;
  width: 100%;

  h4 {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-danger);
    margin-bottom: 12px;
    text-transform: uppercase;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    font-size: 14px;
    color: var(--color-text-secondary);
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);

    &:last-child {
      border-bottom: none;
    }
  }
}
</style>
