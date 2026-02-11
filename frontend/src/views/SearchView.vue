<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useItemsStore } from '@/stores/items'
import { ItemType, ItemStatus } from '@/types'
import AppInput from '@/components/common/app-input/AppInput.vue'
import AppSelect from '@/components/common/app-select/AppSelect.vue'

const router = useRouter()
const itemsStore = useItemsStore()

const searchQuery = ref('')
const selectedType = ref<ItemType | 'all'>('all')
const selectedStatus = ref<ItemStatus | 'all'>('all')

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

const typeIcons: Record<ItemType, string> = {
  [ItemType.MOVIE]: 'fa-film',
  [ItemType.SERIES]: 'fa-tv',
  [ItemType.ANIME]: 'fa-dragon',
  [ItemType.BOOK]: 'fa-book',
  [ItemType.VIDEOGAME]: 'fa-gamepad',
  [ItemType.BOARDGAME]: 'fa-dice'
}

const statusColors: Record<ItemStatus, string> = {
  [ItemStatus.PENDING]: 'var(--color-warning)',
  [ItemStatus.IN_PROGRESS]: 'hsl(200, 90%, 60%)',
  [ItemStatus.COMPLETED]: 'var(--color-success)',
  [ItemStatus.ABANDONED]: 'var(--text-muted)'
}

function goToDetail(id: string) {
  router.push(`/item/${id}`)
}

function clearFilters() {
  searchQuery.value = ''
  selectedType.value = 'all'
  selectedStatus.value = 'all'
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

        <div class="flex flex-wrap gap-6">
          <div v-for="item in filteredResults" :key="item.id" class="item-card glass-card p-6 flex flex-col gap-4 hover-lift" @click="goToDetail(item.id)">
            <div class="item-header flex gap-4 items-start">
              <div class="item-icon flex-shrink-0" :style="{ background: statusColors[item.estado] }">
                <i class="fas" :class="typeIcons[item.tipo]"></i>
              </div>
              <div class="item-info min-w-0 flex-1 flex flex-col gap-1">
                <h3 class="item-title text-lg fw-semibold truncate">{{ item.titulo }}</h3>
                <div class="item-meta flex gap-3 items-center flex-wrap">
                  <span class="meta-badge px-2 py-0.5 border rounded text-xs fw-semibold"
                    :style="{ borderColor: statusColors[item.estado], color: statusColors[item.estado] }">
                    {{statusOptions.find(s => s.value === item.estado)?.label}}
                  </span>
                  <span v-if="item.rating" class="item-rating flex items-center gap-1 text-warning text-sm fw-semibold">
                    <i class="fas fa-star"></i>
                    {{ item.rating }}/10
                  </span>
                </div>
              </div>
            </div>

            <p v-if="item.descripcion" class="item-description text-secondary text-sm line-clamp-2">
              {{ item.descripcion.substring(0, 100) }}{{ item.descripcion.length > 100 ? '...' : '' }}
            </p>

            <div v-if="item.tags && item.tags.length > 0" class="item-tags flex flex-wrap gap-2">
              <span v-for="tag in item.tags.slice(0, 3)" :key="tag" class="tag bg-primary px-2 py-0.5 rounded text-xs fw-semibold text-white">
                {{ tag }}
              </span>
              <span v-if="item.tags.length > 3" class="tag-more bg-surface px-2 py-0.5 rounded text-xs fw-semibold text-muted">
                +{{ item.tags.length - 3 }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
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

  .item-card {
    width: calc(33.333% - 1rem);
    min-width: 300px;

    .item-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 1024px) {
      width: calc(50% - 0.75rem);
    }

    @media (max-width: 768px) {
      width: 100%;
    }
  }
}
</style>
