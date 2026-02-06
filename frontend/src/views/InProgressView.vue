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
    <div class="in-progress-view">
        <div class="container">
            <div class="header">
                <h1 class="title">
                    <i class="fas fa-play-circle"></i>
                    En Progreso
                </h1>
                <p class="subtitle">{{ filteredItems.length }} items en progreso</p>
            </div>

            <div class="filters">
                <button class="filter-chip" :class="{ active: selectedType === null }" @click="selectType(null)">
                    <i class="fas fa-th"></i>
                    Todos
                </button>
                <button v-for="type in types" :key="type.value" class="filter-chip"
                    :class="{ active: selectedType === type.value }" @click="selectType(type.value)">
                    <i class="fas" :class="type.icon"></i>
                    {{ type.label }}
                </button>
            </div>

            <div v-if="filteredItems.length === 0" class="empty-state">
                <i class="fas fa-play-circle"></i>
                <h3>No hay items en progreso</h3>
                <p>Los items que marques como "En Progreso" aparecerán aquí</p>
            </div>

            <div v-else class="items-grid">
                <div v-for="item in filteredItems" :key="item.id" class="item-card" @click="goToDetail(item.id)">
                    <div class="item-header">
                        <h3 class="item-title">{{ item.titulo }}</h3>
                        <span class="item-type">
                            <i class="fas" :class="types.find(t => t.value === item.tipo)?.icon"></i>
                        </span>
                    </div>
                    <div class="item-footer">
                        <div class="item-date" v-if="item.fechaInicio">
                            <i class="fas fa-calendar-alt"></i>
                            Iniciado: {{ new Date(item.fechaInicio).toLocaleDateString() }}
                        </div>
                        <div class="item-actions">
                            <button class="btn-icon" title="Marcar completado"
                                @click.stop="handleChangeStatus(item.id, ItemStatus.COMPLETED)">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn-icon btn-danger" title="Abandonar"
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
    min-height: 100vh;
    padding: var(--spacing-xl);
    background: var(--bg-primary);
}

.container {
    max-width: 1400px;
    margin: 0 auto;
}

.header {
    margin-bottom: var(--spacing-xl);
}

.title {
    font-size: var(--font-size-3xl);
    font-weight: 700;
    margin-bottom: var(--spacing-xs);
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

.title i {
    color: var(--color-primary);
}

.subtitle {
    color: var(--text-secondary);
    font-size: var(--font-size-lg);
}

.filters {
    display: flex;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xl);
    flex-wrap: wrap;
}

.filter-chip {
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--bg-card);
    border: 1px solid transparent;
    border-radius: var(--radius-full);
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

.filter-chip:hover {
    background: var(--bg-card-hover);
    color: var(--text-primary);
}

.filter-chip.active {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
}

.empty-state {
    text-align: center;
    padding: var(--spacing-4xl) var(--spacing-xl);
    color: var(--text-muted);
}

.empty-state i {
    font-size: 4rem;
    margin-bottom: var(--spacing-lg);
    opacity: 0.3;
}

.empty-state h3 {
    font-size: var(--font-size-xl);
    margin-bottom: var(--spacing-sm);
    color: var(--text-secondary);
}

.items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--spacing-lg);
}

.item-card {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    cursor: pointer;
    transition: all var(--transition-normal);
    border: 1px solid transparent;
}

.item-card:hover {
    background: var(--bg-card-hover);
    transform: translateY(-2px);
    border-color: var(--color-primary);
}

.item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-md);
}

.item-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    flex: 1;
    margin-right: var(--spacing-sm);
}

.item-type {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    background: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: var(--font-size-lg);
}

.item-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--bg-secondary);
}

.item-date {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

.item-actions {
    display: flex;
    gap: var(--spacing-xs);
}

.btn-icon {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    background: var(--bg-secondary);
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-icon:hover {
    background: var(--color-success);
    color: white;
}

.btn-icon.btn-danger:hover {
    background: var(--color-danger);
}

@media (max-width: 768px) {
    .in-progress-view {
        padding: var(--spacing-md);
    }

    .items-grid {
        grid-template-columns: 1fr;
    }
}
</style>
