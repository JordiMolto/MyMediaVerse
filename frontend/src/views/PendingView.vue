<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useItemsStore } from '@/stores/items'
import { ItemType, ItemStatus, Item } from '@/types'
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
    return itemsStore.pendingItems
  }
  return itemsStore.pendingItems.filter(item => item.tipo === selectedType.value)
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

async function handleChangeStatus(id: string, status: ItemStatus) {
  try {
    await itemsStore.changeStatus(id, status)
  } catch (error) {
    console.error('Error changing status:', error)
  }
}
</script>

<template>
  <div class="pending-view py-12">
    <div class="container flex flex-col gap-10">
      <header class="page-header text-center flex flex-col gap-2">
        <h1 class="page-title text-3xl fw-bold flex items-center justify-center gap-4">
          <i class="fas fa-clock text-warning"></i>
          Pendientes
        </h1>
        <p class="page-subtitle text-secondary">{{ filteredItems.length }} items por ver/leer/jugar</p>
      </header>

      <div class="type-tabs flex gap-3 overflow-x-auto pb-2">
        <button class="type-tab flex items-center gap-2 px-6 py-3 rounded-md bg-surface text-secondary fw-semibold transition-all hover:bg-card hover:text-primary" 
          :class="{ active: selectedType === null }" @click="selectType(null)">
          <i class="fas fa-th"></i>
          Todos
        </button>
        <button v-for="type in types" :key="type.value" class="type-tab flex items-center gap-2 px-6 py-3 rounded-md bg-surface text-secondary fw-semibold transition-all hover:bg-card hover:text-primary"
          :class="{ active: selectedType === type.value }" @click="selectType(type.value)">
          <i class="fas" :class="type.icon"></i>
          {{ type.label }}
        </button>
      </div>

      <div v-if="itemsStore.loading" class="loading flex items-center justify-center gap-4 py-12 text-secondary">
        <i class="fas fa-spinner fa-spin text-2xl"></i>
        <span>Cargando...</span>
      </div>

      <div v-else-if="filteredItems.length === 0" class="empty-state flex flex-col items-center gap-4 py-12 text-secondary">
        <i class="fas fa-inbox text-5xl opacity-30"></i>
        <div class="text-center">
          <p class="text-xl">No hay items pendientes</p>
          <p class="empty-hint text-sm text-muted">¡Añade algo nuevo para empezar!</p>
        </div>
      </div>

      <div v-else class="flex flex-wrap gap-6 animate-fade">
        <div v-for="item in filteredItems" :key="item.id" class="item-card glass-card p-6 flex flex-col gap-6 hover-lift" @click="goToDetail(item.id)">
          <div class="item-header flex justify-between items-start">
            <h3 class="item-title text-lg fw-semibold truncate">{{ item.titulo }}</h3>
            <span class="item-type-badge flex-shrink-0 w-8 h-8 flex items-center justify-center rounded bg-primary text-white">
              <i class="fas" :class="types.find(t => t.value === item.tipo)?.icon"></i>
            </span>
          </div>
          <div class="item-footer flex justify-between items-center">
            <div class="item-priority flex gap-1 text-warning text-sm">
              <i v-for="n in (item.prioridad || 1)" :key="n" class="fas fa-star"></i>
            </div>
            <div class="item-actions flex gap-2">
              <button class="btn-icon w-8 h-8 rounded bg-surface text-secondary flex items-center justify-center transition-all hover:bg-primary hover:text-white" 
                title="Marcar en progreso"
                @click.stop="handleChangeStatus(item.id, ItemStatus.IN_PROGRESS)">
                <i class="fas fa-play"></i>
              </button>
              <button class="btn-icon w-8 h-8 rounded bg-surface text-secondary flex items-center justify-center transition-all hover:bg-success hover:text-white" 
                title="Marcar completado"
                @click.stop="handleChangeStatus(item.id, ItemStatus.COMPLETED)">
                <i class="fas fa-check"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Action Button -->
    <button class="fab fixed bottom-8 right-8 w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl z-20 hover-scale" 
      @click="showCreateModal = true" title="Añadir nuevo item">
      <i class="fas fa-plus"></i>
    </button>

    <!-- Create Item Modal -->
    <AppModal :is-open="showCreateModal" title="Crear Nuevo Item" size="large" @close="showCreateModal = false">
      <ItemForm mode="create" @save="handleCreateItem" @cancel="showCreateModal = false" />
    </AppModal>
  </div>
</template>

<style scoped>
.pending-view {
  min-height: calc(100vh - var(--header-height));

  .type-tab {
    &.active {
      background: var(--color-primary);
      color: white;
    }
  }

  .item-card {
    width: calc(33.333% - 1.1rem);
    min-width: 280px;

    @media (max-width: 1024px) {
      width: calc(50% - 0.75rem);
    }

    @media (max-width: 768px) {
      width: 100%;
    }
  }

  .fab {
    background: var(--color-primary);
    box-shadow: 0 4px 20px var(--color-primary-alpha);

    &:hover {
      box-shadow: 0 8px 30px var(--color-primary-alpha);
    }
  }
}
</style>
