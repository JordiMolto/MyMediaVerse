<script setup lang="ts">
import { computed } from 'vue'
import { Item, ItemType, ItemStatus } from '@/types'

interface Props {
    item: Item
}

const props = defineProps<Props>()

const typeIcon = computed(() => {
    switch (props.item.tipo) {
        case ItemType.MOVIE: return 'fa-film'
        case ItemType.SERIES: return 'fa-tv'
        case ItemType.ANIME: return 'fa-dragon'
        case ItemType.BOOK: return 'fa-book'
        case ItemType.VIDEOGAME: return 'fa-gamepad'
        case ItemType.BOARDGAME: return 'fa-dice'
        default: return 'fa-folder'
    }
})

const statusLabel = computed(() => {
    switch (props.item.estado) {
        case ItemStatus.IN_PROGRESS: return 'ACTIVO'
        case ItemStatus.PENDING: return 'EN COLA'
        case ItemStatus.COMPLETED: return 'HECHO'
        default: return 'EN COLA'
    }
})

const statusClass = computed(() => {
    switch (props.item.estado) {
        case ItemStatus.IN_PROGRESS: return 'active'
        case ItemStatus.PENDING: return 'queued'
        case ItemStatus.COMPLETED: return 'done'
        default: return 'queued'
    }
})

function formatRelativeTime(date: Date) {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) return 'AHORA'
    if (hours < 24) return `HACE ${hours}H`
    if (hours < 48) return 'AYER'
    return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).toUpperCase()
}
</script>

<template>
    <div class="dashboard-list-item">
        <div class="item-leading">
            <div class="type-icon-box">
                <i class="fas" :class="typeIcon"></i>
            </div>
            <div class="item-content">
                <h4 class="item-title">{{ item.titulo }}</h4>
                <div class="item-meta">
                    <span class="type-badge">{{ item.tipo.toUpperCase() }}</span>
                    <span class="dot-separator">•</span>
                    <span class="time-stamp">{{ formatRelativeTime(item.fechaCreacion) }}</span>
                </div>
            </div>
        </div>

        <div class="item-trailing">
            <div class="status-badge" :class="statusClass">
                {{ statusLabel }}
            </div>
            <button class="options-btn">
                <i class="fas fa-ellipsis-h"></i>
            </button>
        </div>
    </div>
</template>

<style scoped lang="scss">
.dashboard-list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: 16px;
    transition: all 0.2s ease;

    &:hover {
        background: var(--color-bg-card-hover);
        border-color: var(--color-border-hover);
        transform: translateX(4px);
    }
}

.item-leading {
    display: flex;
    align-items: center;
    gap: 16px;
}

.type-icon-box {
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
    font-size: 18px;
}

.item-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.item-title {
    font-size: 16px;
    font-weight: 700;
    color: white;
    margin: 0;
}

.item-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
}

.dot-separator {
    opacity: 0.3;
}

.item-trailing {
    display: flex;
    align-items: center;
    gap: 24px;
}

.status-badge {
    padding: 4px 12px;
    border-radius: 99px;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.05em;

    &.active {
        background: rgba(var(--color-primary-rgb), 0.1);
        color: var(--color-primary);
        border: 1px solid rgba(var(--color-primary-rgb), 0.2);
    }

    &.queued {
        background: rgba(255, 255, 255, 0.05);
        color: var(--color-text-muted);
        border: 1px solid var(--color-border);
    }

    &.done {
        background: rgba(var(--color-accent-rgb), 0.1);
        color: var(--color-accent);
        border: 1px solid rgba(var(--color-accent-rgb), 0.2);
    }
}

.options-btn {
    background: transparent;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 8px;
    opacity: 0.5;
    transition: all 0.2s;

    &:hover {
        opacity: 1;
        color: white;
    }
}

@media (max-width: 640px) {
    .dashboard-list-item {
        padding: 12px 16px;
    }

    .item-trailing {
        gap: 12px;
    }

    .status-badge {
        display: none;
    }
}
</style>
