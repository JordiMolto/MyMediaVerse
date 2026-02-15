<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useItemsStore } from '@/stores/items'
import { ItemType, ItemStatus } from '@/types'
import AppInput from '@/components/common/app-input/AppInput.vue'
import AppSelect from '@/components/common/app-select/AppSelect.vue'
import MediaCard from '@/components/common/MediaCard.vue'
import AppModal from '@/components/common/app-modal/AppModal.vue'
import NoteForm from '@/components/notes/NoteForm.vue'
import { useNotesStore } from '@/stores/notes'

const router = useRouter()
const itemsStore = useItemsStore()
const notesStore = useNotesStore()

const searchQuery = ref('')
const selectedType = ref<ItemType | 'all'>('all')
const selectedStatus = ref<ItemStatus | 'all'>('all')
const showQuickNoteModal = ref(false)
const quickNoteItemId = ref<string | null>(null)

onMounted(() => {
  itemsStore.fetchItems()
})

const filteredResults = computed(() => {
  return itemsStore.filterItems({
    search: searchQuery.value,
    type: selectedType.value === 'all' ? undefined : selectedType.value as ItemType,
    status: selectedStatus.value === 'all' ? undefined : selectedStatus.value as ItemStatus
  })
})

const typeOptions = [
  { value: 'all', label: 'Todos los tipos' },
  { value: ItemType.MOVIE, label: 'Películas' },
  { value: ItemType.SERIES, label: 'Series' },
  { value: ItemType.ANIME, label: 'Anime' },
  { value: ItemType.BOOK, label: 'Libros' },
  { value: ItemType.VIDEOGAME, label: 'Videojuegos' },
  { value: ItemType.BOARDGAME, label: 'Juegos de Mesa' }
]

const statusOptions = [
  { value: 'all', label: 'Todos los estados' },
  { value: ItemStatus.PENDING, label: 'Pendiente' },
  { value: ItemStatus.IN_PROGRESS, label: 'En Progreso' },
  { value: ItemStatus.COMPLETED, label: 'Completado' },
  { value: ItemStatus.ABANDONED, label: 'Abandonado' }
]


function goToDetail(id: string) {
  router.push(`/item/${id}`)
}

function clearFilters() {
  searchQuery.value = ''
  selectedType.value = 'all'
  selectedStatus.value = 'all'
}

function handleQuickNote(itemId: string) {
  quickNoteItemId.value = itemId
  showQuickNoteModal.value = true
}

async function saveQuickNote(data: { texto: string; spoilers: boolean }) {
  if (!quickNoteItemId.value) return
  try {
    await notesStore.createNote({
      itemId: quickNoteItemId.value,
      contenido: data.texto,
      esSpoiler: data.spoilers
    })
    showQuickNoteModal.value = false
    quickNoteItemId.value = null
  } catch (error) {
    console.error('Error saving quick note:', error)
  }
}
</script>

<template>
  <div class="search-view">
    <div class="search-container">
      <header class="search-header">
        <h1 class="search-title">
          <i class="fas fa-search"></i>
          Buscar
        </h1>
        <p class="search-subtitle">Encuentra tus items rápidamente</p>
      </header>

      <div class="search-controls">
        <div class="search-input-field">
          <AppInput v-model="searchQuery" placeholder="Buscar por título, descripción o tags..." icon="fa-search"
            type="text" />
        </div>

        <div class="filters-row">
          <div class="filter-item">
            <AppSelect v-model="selectedType" :options="typeOptions" label="Tipo" />
          </div>
          <div class="filter-item">
            <AppSelect v-model="selectedStatus" :options="statusOptions" label="Estado" />
          </div>
          <button v-if="searchQuery || selectedType !== 'all' || selectedStatus !== 'all'" class="clear-filters-btn"
            @click="clearFilters">
            <i class="fas fa-times"></i>
            Limpiar filtros
          </button>
        </div>
      </div>

      <div v-if="!searchQuery && selectedType === 'all' && selectedStatus === 'all'" class="empty-state">
        <i class="fas fa-search empty-icon"></i>
        <div class="empty-text">
          <p class="empty-primary">Comienza a buscar</p>
          <p class="empty-secondary">Escribe algo en el campo de búsqueda o selecciona filtros</p>
        </div>
      </div>

      <div v-else-if="filteredResults.length === 0" class="empty-state">
        <i class="fas fa-inbox empty-icon"></i>
        <div class="empty-text">
          <p class="empty-primary">No se encontraron resultados</p>
          <p class="empty-secondary">Intenta con otros términos de búsqueda o filtros</p>
        </div>
      </div>

      <div v-else class="results-section">
        <div class="results-header">
          <h2 class="results-count">
            {{ filteredResults.length }} resultado{{ filteredResults.length !== 1 ? 's' : '' }}
          </h2>
        </div>

        <div class="results-grid">
          <div v-for="item in filteredResults" :key="item.id" class="result-item">
            <MediaCard :item="item" @click="goToDetail" @quick-note="handleQuickNote" />
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Note Modal -->
    <AppModal :is-open="showQuickNoteModal" title="Añadir Nota Rápida"
      @close="showQuickNoteModal = false; quickNoteItemId = null">
      <NoteForm v-if="quickNoteItemId" :item-id="quickNoteItemId" @save="saveQuickNote"
        @cancel="showQuickNoteModal = false" />
    </AppModal>
  </div>
</template>

<style scoped>
.search-view {
  width: 100%;
  padding-bottom: 48px;
}

.search-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.search-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-title {
  font-size: 32px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: white;

  i {
    color: var(--color-primary);
  }
}

.search-subtitle {
  color: var(--color-text-secondary);
  font-size: 16px;
}

.search-controls {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filters-row {
  display: flex;
  align-items: flex-end;
  gap: 24px;
  flex-wrap: wrap;
}

.filter-item {
  flex: 1;
  min-width: 200px;
}

.clear-filters-btn {
  padding: 0 16px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-danger);
  border-radius: 8px;
  color: var(--color-danger);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  height: 44px;

  &:hover {
    background: var(--color-danger);
    color: white;
  }
}

.empty-state {
  padding: 48px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.2;
  color: white;
}

.empty-text {
  text-align: center;
}

.empty-primary {
  font-size: 20px;
  color: var(--color-text-secondary);
}

.empty-secondary {
  font-size: 14px;
  color: var(--color-text-muted);
}

.results-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.results-count {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.results-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 32px 24px;
}

.result-item {
  width: calc(25% - 18px);
  min-width: 200px;

  @media (max-width: 1280px) {
    width: calc(33.333% - 16px);
  }

  @media (max-width: 1024px) {
    width: calc(50% - 12px);
  }

  @media (max-width: 640px) {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .clear-filters-btn {
    justify-content: center;
  }
}
</style>
