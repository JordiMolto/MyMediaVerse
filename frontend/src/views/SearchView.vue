<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useItemsStore } from '@/stores/items'
import { ItemType, ItemStatus, Item } from '@/types'
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
  let results = itemsStore.searchItems(searchQuery.value)

  if (selectedType.value !== 'all') {
    results = results.filter((item: Item) => item.tipo === selectedType.value)
  }

  if (selectedStatus.value !== 'all') {
    results = results.filter((item: Item) => item.estado === selectedStatus.value)
  }

  return results
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
  <div class="search-view">
    <div class="container">
      <header class="page-header">
        <h1 class="page-title">
          <i class="fas fa-search"></i>
          Buscar
        </h1>
        <p class="page-subtitle">Encuentra tus items rápidamente</p>
      </header>

      <div class="search-controls">
        <div class="search-input-wrapper">
          <AppInput v-model="searchQuery" placeholder="Buscar por título, descripción o tags..." icon="fa-search"
            type="text" />
        </div>

        <div class="filters-row">
          <AppSelect v-model="selectedType" :options="typeOptions" label="Tipo" />
          <AppSelect v-model="selectedStatus" :options="statusOptions" label="Estado" />
          <button v-if="searchQuery || selectedType !== 'all' || selectedStatus !== 'all'" class="btn-clear"
            @click="clearFilters">
            <i class="fas fa-times"></i>
            Limpiar filtros
          </button>
        </div>
      </div>

      <div v-if="!searchQuery && selectedType === 'all' && selectedStatus === 'all'" class="empty-state">
        <i class="fas fa-search"></i>
        <p>Comienza a buscar</p>
        <p class="empty-hint">Escribe algo en el campo de búsqueda o selecciona filtros</p>
      </div>

      <div v-else-if="filteredResults.length === 0" class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>No se encontraron resultados</p>
        <p class="empty-hint">Intenta con otros términos de búsqueda o filtros</p>
      </div>

      <div v-else class="results-section">
        <div class="results-header">
          <h2 class="results-count">
            {{ filteredResults.length }} resultado{{ filteredResults.length !== 1 ? 's' : '' }}
          </h2>
        </div>

        <div class="items-grid">
          <div v-for="item in filteredResults" :key="item.id" class="item-card" @click="goToDetail(item.id)">
            <div class="item-header">
              <div class="item-icon" :style="{ background: statusColors[item.estado] }">
                <i class="fas" :class="typeIcons[item.tipo]"></i>
              </div>
              <div class="item-info">
                <h3 class="item-title">{{ item.titulo }}</h3>
                <div class="item-meta">
                  <span class="meta-badge"
                    :style="{ borderColor: statusColors[item.estado], color: statusColors[item.estado] }">
                    {{statusOptions.find(s => s.value === item.estado)?.label}}
                  </span>
                  <span v-if="item.rating" class="item-rating">
                    <i class="fas fa-star"></i>
                    {{ item.rating }}/10
                  </span>
                </div>
              </div>
            </div>

            <p v-if="item.descripcion" class="item-description">
              {{ item.descripcion.substring(0, 100) }}{{ item.descripcion.length > 100 ? '...' : '' }}
            </p>

            <div v-if="item.tags && item.tags.length > 0" class="item-tags">
              <span v-for="tag in item.tags.slice(0, 3)" :key="tag" class="tag">
                {{ tag }}
              </span>
              <span v-if="item.tags.length > 3" class="tag-more">
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
  min-height: 100vh;
  padding: var(--spacing-xl) 0;
}

.page-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.page-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  margin-bottom: var(--spacing-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.page-subtitle {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
}

.search-controls {
  margin-bottom: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.search-input-wrapper {
  width: 100%;
}

.filters-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: var(--spacing-md);
  align-items: end;
}

.btn-clear {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-card);
  border: 2px solid var(--color-danger);
  border-radius: var(--radius-md);
  color: var(--color-danger);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  white-space: nowrap;
  height: 44px;
}

.btn-clear:hover {
  background: var(--color-danger);
  color: white;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--text-secondary);
}

.empty-state i {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}

.empty-hint {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.results-section {
  animation: fadeIn var(--transition-normal);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.results-header {
  margin-bottom: var(--spacing-lg);
}

.results-count {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-secondary);
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-md);
}

.item-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.item-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.item-header {
  display: flex;
  gap: var(--spacing-sm);
  align-items: flex-start;
}

.item-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  color: white;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  flex-wrap: wrap;
}

.meta-badge {
  padding: 2px var(--spacing-xs);
  border: 1px solid;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.item-rating {
  color: var(--color-warning);
  font-size: var(--font-size-sm);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.item-description {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.5;
}

.item-tags {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.tag {
  padding: 2px var(--spacing-xs);
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.tag-more {
  padding: 2px var(--spacing-xs);
  background: var(--bg-secondary);
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

@media (max-width: 768px) {
  .filters-row {
    grid-template-columns: 1fr;
  }

  .btn-clear {
    justify-content: center;
  }

  .items-grid {
    grid-template-columns: 1fr;
  }
}
</style>
