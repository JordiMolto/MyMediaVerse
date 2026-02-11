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
  <div class="search-view py-12">
    <div class="container flex flex-col gap-10">
      <header class="page-header text-center flex flex-col gap-2">
        <h1 class="page-title text-3xl fw-bold flex items-center justify-center gap-4">
          <i class="fas fa-search text-primary"></i>
          Buscar
        </h1>
        <p class="page-subtitle text-secondary">Encuentra tus items rápidamente</p>
      </header>

      <div class="search-controls flex flex-col gap-6">
        <div class="search-input-wrapper">
          <AppInput v-model="searchQuery" placeholder="Buscar por título, descripción o tags..." icon="fa-search"
            type="text" />
        </div>

        <div class="filters-row flex items-end gap-6 flex-wrap">
          <div class="flex-1 min-w-[200px]">
            <AppSelect v-model="selectedType" :options="typeOptions" label="Tipo" />
          </div>
          <div class="flex-1 min-w-[200px]">
            <AppSelect v-model="selectedStatus" :options="statusOptions" label="Estado" />
          </div>
          <button v-if="searchQuery || selectedType !== 'all' || selectedStatus !== 'all'" class="btn-clear"
            @click="clearFilters">
            <i class="fas fa-times"></i>
            Limpiar filtros
          </button>
        </div>
      </div>

      <div v-if="!searchQuery && selectedType === 'all' && selectedStatus === 'all'" class="empty-state py-12 flex flex-col items-center gap-4">
        <i class="fas fa-search text-5xl opacity-30"></i>
        <div class="text-center">
          <p class="text-xl text-secondary">Comienza a buscar</p>
          <p class="empty-hint text-muted text-sm">Escribe algo en el campo de búsqueda o selecciona filtros</p>
        </div>
      </div>

      <div v-else-if="filteredResults.length === 0" class="empty-state py-12 flex flex-col items-center gap-4">
        <i class="fas fa-inbox text-5xl opacity-30"></i>
        <div class="text-center">
          <p class="text-xl text-secondary">No se encontraron resultados</p>
          <p class="empty-hint text-muted text-sm">Intenta con otros términos de búsqueda o filtros</p>
        </div>
      </div>

      <div v-else class="results-section flex flex-col gap-6 animate-fade">
        <div class="results-header">
          <h2 class="results-count text-xl fw-semibold text-secondary">
            {{ filteredResults.length }} resultado{{ filteredResults.length !== 1 ? 's' : '' }}
          </h2>
        </div>

        <div class="flex flex-wrap gap-x-6 gap-y-10">
          <div v-for="item in filteredResults" :key="item.id" class="search-item-wrapper">
            <MediaCard :item="item" @click="goToDetail" @quick-note="handleQuickNote" />
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Note Modal -->
    <AppModal :is-open="showQuickNoteModal" title="Añadir Nota Rápida" 
      @close="showQuickNoteModal = false; quickNoteItemId = null">
      <NoteForm v-if="quickNoteItemId" :item-id="quickNoteItemId" @save="saveQuickNote" @cancel="showQuickNoteModal = false" />
    </AppModal>
  </div>
</template>

<style scoped>
.search-view {
  min-height: calc(100vh - var(--header-height));

  .btn-clear {
    padding: var(--space-2) var(--space-4);
    background: var(--color-bg-card);
    border: 1px solid var(--color-danger);
    border-radius: var(--radius-md);
    color: var(--color-danger);
    font-size: var(--fs-sm);
    font-weight: var(--fw-semibold);
    cursor: pointer;
    transition: var(--transition-base);
    display: flex;
    align-items: center;
    gap: var(--space-2);
    white-space: nowrap;
    height: 44px;

    &:hover {
      background: var(--color-danger);
      color: white;
    }
  }

  .filters-row {
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: stretch;

      .btn-clear {
        justify-content: center;
      }
    }
  }

  .search-item-wrapper {
    width: calc(25% - 1.25rem);
    min-width: 200px;

    @media (max-width: 1280px) {
      width: calc(33.333% - 1rem);
    }

    @media (max-width: 1024px) {
      width: calc(50% - 0.75rem);
    }

    @media (max-width: 640px) {
      width: 100%;
    }
  }
}
</style>
