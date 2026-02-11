<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useItemsStore } from '@/stores/items'
import { ItemType, ItemStatus } from '@/types'

const router = useRouter()
const itemsStore = useItemsStore()
const selectedType = ref<ItemType | null>(null)

onMounted(() => {
    itemsStore.fetchItems()
})

const filteredItems = computed(() => {
    if (!selectedType.value) {
        return itemsStore.inProgressItems
    }
    return itemsStore.inProgressItems.filter(item => item.tipo === selectedType.value)
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
  <div class="in-progress-view py-12">
    <div class="container flex flex-col gap-10">
      <header class="page-header text-center flex flex-col gap-2">
        <h1 class="page-title text-3xl fw-bold flex items-center justify-center gap-4">
          <i class="fas fa-play-circle text-info"></i>
          En Progreso
        </h1>
        <p class="page-subtitle text-secondary">{{ filteredItems.length }} items en progreso</p>
      </header>

      <div class="flex gap-3 overflow-x-auto pb-2">
        <button class="filter-chip flex items-center gap-2 px-6 py-3 rounded-full bg-surface text-secondary fw-semibold transition-all hover:bg-card hover:text-primary" 
          :class="{ active: selectedType === null }" @click="selectType(null)">
          <i class="fas fa-th"></i>
          Todos
        </button>
        <button v-for="type in types" :key="type.value" class="filter-chip flex items-center gap-2 px-6 py-3 rounded-full bg-surface text-secondary fw-semibold transition-all hover:bg-card hover:text-primary"
          :class="{ active: selectedType === type.value }" @click="selectType(type.value)">
          <i class="fas" :class="type.icon"></i>
          {{ type.label }}
        </button>
      </div>

      <div v-if="filteredItems.length === 0" class="empty-state py-12 flex flex-col items-center gap-4 text-center">
        <i class="fas fa-play-circle text-5xl opacity-30"></i>
        <div>
          <h3 class="text-xl text-secondary fw-semibold">No hay items en progreso</h3>
          <p class="text-muted text-sm">Los items que marques como "En Progreso" aparecerán aquí</p>
        </div>
      </div>

      <div v-else class="flex flex-wrap gap-6 animate-fade">
        <div v-for="item in filteredItems" :key="item.id" class="item-card glass-card p-6 flex flex-col gap-6 hover-lift" @click="goToDetail(item.id)">
          <div class="item-header flex justify-between items-start">
            <h3 class="item-title text-lg fw-semibold truncate">{{ item.titulo }}</h3>
            <span class="item-type-badge flex-shrink-0 w-10 h-10 flex items-center justify-center rounded bg-primary text-white">
              <i class="fas" :class="types.find(t => t.value === item.tipo)?.icon"></i>
            </span>
          </div>
          <div class="item-footer flex justify-between items-center pt-4 border-t border-white/5">
            <div class="item-date flex items-center gap-2 text-sm text-muted" v-if="item.fechaInicio">
              <i class="fas fa-calendar-alt"></i>
              <span>Iniciado: {{ new Date(item.fechaInicio).toLocaleDateString() }}</span>
            </div>
            <div class="item-actions flex gap-2">
              <button class="btn-icon w-9 h-9 rounded bg-surface text-secondary flex items-center justify-center transition-all hover:bg-success hover:text-white" 
                title="Marcar completado"
                @click.stop="handleChangeStatus(item.id, ItemStatus.COMPLETED)">
                <i class="fas fa-check"></i>
              </button>
              <button class="btn-icon w-9 h-9 rounded bg-surface text-secondary flex items-center justify-center transition-all hover:bg-danger hover:text-white" 
                title="Abandonar"
                @click.stop="handleChangeStatus(item.id, ItemStatus.ABANDONED)">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.in-progress-view {
  min-height: calc(100vh - var(--header-height));

  .filter-chip {
    &.active {
      background: var(--color-primary);
      color: white;
    }
  }

  .item-card {
    width: calc(33.333% - 1.1rem);
    min-width: 300px;

    @media (max-width: 1024px) {
      width: calc(50% - 0.75rem);
    }

    @media (max-width: 768px) {
      width: 100%;
    }
  }
}
</style>
