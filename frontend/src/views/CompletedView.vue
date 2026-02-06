<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useItemsStore } from '@/stores/items'
import { ItemType, Item } from '@/types'
import AppModal from '@/components/common/app-modal/AppModal.vue'
import ItemForm from '@/components/items/ItemForm.vue'

const router = useRouter()
const itemsStore = useItemsStore()
const selectedType = ref<ItemType | null>(null)
const showCreateModal = ref(false)

onMounted(() => {
  itemsStore.fetchItems()
})

const filteredItems = computed(() => {
  if (!selectedType.value) {
    return itemsStore.completedItems
  }
  return itemsStore.completedItems.filter(item => item.tipo === selectedType.value)
})

const types = [
  { value: ItemType.MOVIE, label: 'Películas', icon: 'fa-film' },
  { value: ItemType.SERIES, label: 'Series', icon: 'fa-tv' },
  { value: ItemType.ANIME, label: 'Anime', icon: 'fa-dragon' },
  { value: ItemType.BOOK, label: 'Libros', icon: 'fa-book' },
  { value: ItemType.VIDEOGAME, label: 'Videojuegos', icon: 'fa-gamepad' },
  { value: ItemType.BOARDGAME, label: 'Juegos de Mesa', icon: 'fa-dice' }
]

function selectType(type: ItemType | null) {
  selectedType.value = type
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

function goToDetail(id: string) {
  router.push(`/item/${id}`)
}

function getRatingStars(rating?: number) {
  if (!rating) return { fullStars: 0, halfStar: false }
  const fullStars = Math.floor(rating / 2)
  const halfStar = rating % 2 >= 1
  return { fullStars, halfStar }
}
</script>

<template>
  <div class="completed-view">
    <div class="container">
      <header class="page-header">
        <h1 class="page-title">
          <i class="fas fa-check-circle"></i>
          Completados
        </h1>
        <p class="page-subtitle">{{ filteredItems.length }} items vistos/leídos/jugados</p>
      </header>

      <div class="type-tabs">
        <button class="type-tab" :class="{ active: selectedType === null }" @click="selectType(null)">
          <i class="fas fa-th"></i>
          Todos
        </button>
        <button v-for="type in types" :key="type.value" class="type-tab"
          :class="{ active: selectedType === type.value }" @click="selectType(type.value)">
          <i class="fas" :class="type.icon"></i>
          {{ type.label }}
        </button>
      </div>

      <div v-if="itemsStore.loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        Cargando...
      </div>

      <div v-else-if="filteredItems.length === 0" class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>No hay items completados</p>
        <p class="empty-hint">¡Completa algo de tu lista pendiente!</p>
      </div>

      <div v-else class="items-grid">
        <div v-for="item in filteredItems" :key="item.id" class="item-card" @click="goToDetail(item.id)">
          <div class="item-header">
            <h3 class="item-title">{{ item.titulo }}</h3>
            <span class="item-type">
              <i class="fas" :class="types.find(t => t.value === item.tipo)?.icon"></i>
            </span>
          </div>

          <div v-if="item.rating" class="item-rating">
            <i v-for="n in getRatingStars(item.rating).fullStars" :key="'full-' + n" class="fas fa-star"></i>
            <i v-if="getRatingStars(item.rating).halfStar" class="fas fa-star-half-alt"></i>
            <span class="rating-value">{{ item.rating }}/10</span>
          </div>

          <div class="item-footer">
            <div class="item-date">
              <i class="fas fa-calendar"></i>
              {{ new Date(item.fechaFin || item.fechaCreacion).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short'
              }) }}
            </div>
            <button class="btn-add-note" @click.stop="goToDetail(item.id)">
              <i class="fas fa-plus"></i>
              Añadir nota
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Action Button -->
    <button class="fab" @click="showCreateModal = true" title="Añadir nuevo item">
      <i class="fas fa-plus"></i>
    </button>

    <!-- Create Item Modal -->
    <AppModal :is-open="showCreateModal" title="Crear Nuevo Item" size="large" @close="showCreateModal = false">
      <ItemForm mode="create" @save="handleCreateItem" @cancel="showCreateModal = false" />
    </AppModal>
  </div>
</template>

<style scoped>
.completed-view {
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
  color: var(--color-success);
}

.page-subtitle {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
}

.type-tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
  overflow-x: auto;
  padding-bottom: var(--spacing-xs);
}

.type-tab {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-card);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.type-tab:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.type-tab.active {
  background: var(--color-success);
  color: white;
  border-color: var(--color-success);
}

.loading {
  text-align: center;
  padding: var(--spacing-xl);
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
}

.loading i {
  margin-right: var(--spacing-sm);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
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

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-md);
}

.item-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
}

.item-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
}

.item-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  flex: 1;
  margin-right: var(--spacing-sm);
}

.item-type {
  width: 32px;
  height: 32px;
  background: var(--color-success);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.item-rating {
  color: var(--color-warning);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.rating-value {
  color: var(--text-secondary);
  margin-left: var(--spacing-xs);
  font-weight: 600;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-sm);
}

.item-date {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.btn-add-note {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-secondary);
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.btn-add-note:hover {
  background: var(--color-primary);
  color: white;
}

.fab {
  position: fixed;
  bottom: var(--spacing-xl);
  right: var(--spacing-xl);
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-success), hsl(140, 60%, 42%));
  color: white;
  border: none;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  transition: all var(--transition-normal);
  z-index: 100;
}

.fab:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 32px rgba(34, 197, 94, 0.5);
}

@media (max-width: 768px) {
  .items-grid {
    grid-template-columns: 1fr;
  }
}
</style>
