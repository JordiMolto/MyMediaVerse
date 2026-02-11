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
    <div class="dashboard-list-item glass-card">
        <div class="item-leading">
            <div class="type-icon-box">
                <i class="fas" :class="typeIcon"></i>
            </div>
            <div class="item-info">
                <h4 class="item-title">{{ item.titulo }}</h4>
                <div class="item-meta">
                    <span class="item-type-label">{{ item.tipo.toUpperCase() }}</span>
                    <span class="meta-separator">•</span>
                    <span class="item-time">{{ formatRelativeTime(item.fechaCreacion) }}</span>
                </div>
            </div>
        </div>

        <div class="item-trailing">
            <div class="status-badge" :class="statusClass">
                {{ statusLabel }}
            </div>
            <button class="item-options-btn">
                <i class="fas fa-ellipsis-h"></i>
            </button>
        </div>
    </div>
</template>

<style scoped>
.dashboard-list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-5) var(--space-8);
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    transition: all var(--transition-base);

    &:hover {
        background: rgba(255, 255, 255, 0.04);
        border-color: rgba(255, 255, 255, 0.08);
    }
}

.item-leading {
    display: flex;
    align-items: center;
    gap: var(--space-4);
}

.type-icon-box {
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
    font-size: 1.1rem;
}

.item-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.item-title {
    font-size: var(--fs-base);
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
}

.item-meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
}

.meta-separator {
    opacity: 0.3;
}

.item-trailing {
    display: flex;
    align-items: center;
    gap: var(--space-6);
}

.status-badge {
    padding: 2px 12px;
    border-radius: var(--radius-full);
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.05em;

    &.active {
        background: rgba(168, 85, 247, 0.1);
        color: #A855F7;
        border: 1px solid rgba(168, 85, 247, 0.2);
    }

    &.queued {
        background: rgba(255, 255, 255, 0.05);
        color: var(--color-text-muted);
        border: 1px solid var(--color-border);
    }

    &.done {
        background: rgba(0, 245, 255, 0.1);
        color: var(--color-accent);
        border: 1px solid rgba(0, 245, 255, 0.2);
    }
}

.item-options-btn {
    background: transparent;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    padding: var(--space-2);
    opacity: 0.5;
    transition: opacity var(--transition-base);

    &:hover {
        opacity: 1;
    }
}

@media (max-width: 640px) {
    .item-trailing {
        gap: var(--space-3);
    }

    .status-badge {
        display: none;
    }
}
</style>
