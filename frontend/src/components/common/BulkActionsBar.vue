<script setup lang="ts">
import { computed } from 'vue'
import { ItemStatus } from '@/types'

interface Props {
    selectedCount: number
    totalCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
    selectAll: []
    clearSelection: []
    changeStatus: [status: ItemStatus]
    deleteSelected: []
    'enrich-with-tmdb': []
}>()

const allSelected = computed(() => props.selectedCount === props.totalCount && props.totalCount > 0)

function handleEnrich() {
    console.log('BulkActionsBar: Enriquecer TMDB clicked')
    emit('enrich-with-tmdb')
}
</script>

<template>
    <Transition name="slide-up">
        <div v-if="selectedCount > 0" class="bulk-actions-bar">
            <div class="bulk-actions-content">
                <div class="selection-info">
                    <i class="fas fa-check-circle"></i>
                    <span class="count">{{ selectedCount }} seleccionado{{ selectedCount !== 1 ? 's' : '' }}</span>
                    <button class="link-btn" @click="emit('clearSelection')">
                        Limpiar
                    </button>
                </div>

                <div class="actions-group">
                    <button v-if="!allSelected" class="action-btn" @click="emit('selectAll')" title="Seleccionar todos">
                        <i class="fas fa-check-double"></i>
                        <span class="desktop-only">Todos</span>
                    </button>

                    <div class="divider"></div>

                    <button class="action-btn" @click="emit('changeStatus', ItemStatus.PENDING)"
                        title="Marcar como Pendiente">
                        <i class="fas fa-clock"></i>
                        <span class="desktop-only">Pendiente</span>
                    </button>

                    <button class="action-btn" @click="emit('changeStatus', ItemStatus.IN_PROGRESS)"
                        title="Marcar como En Progreso">
                        <i class="fas fa-play"></i>
                        <span class="desktop-only">En Progreso</span>
                    </button>

                    <button class="action-btn" @click="emit('changeStatus', ItemStatus.COMPLETED)"
                        title="Marcar como Completado">
                        <i class="fas fa-check"></i>
                        <span class="desktop-only">Completado</span>
                    </button>

                    <div class="divider"></div>

                    <button class="action-btn tmdb" @click="handleEnrich" title="Enriquecer con datos de TMDB">
                        <i class="fas fa-film"></i>
                        <span class="desktop-only">Enriquecer TMDB</span>
                    </button>

                    <div class="divider"></div>

                    <button class="action-btn danger" @click="emit('deleteSelected')" title="Eliminar seleccionados">
                        <i class="fas fa-trash"></i>
                        <span class="desktop-only">Eliminar</span>
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.bulk-actions-bar {
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    max-width: 90vw;
}

.bulk-actions-content {
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    padding: var(--space-4) var(--space-6);
    display: flex;
    align-items: center;
    gap: var(--space-6);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(10px);
}

.selection-info {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    color: var(--color-accent);
    font-weight: 700;
    font-size: var(--fs-sm);

    i {
        font-size: 1.2rem;
    }

    .count {
        color: white;
    }
}

.link-btn {
    background: none;
    border: none;
    color: var(--color-text-muted);
    font-size: var(--fs-xs);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: color var(--transition-base);

    &:hover {
        color: white;
    }
}

.actions-group {
    display: flex;
    align-items: center;
    gap: var(--space-2);
}

.action-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-lg);
    color: var(--color-text-secondary);
    font-size: var(--fs-sm);
    font-weight: 700;
    cursor: pointer;
    transition: all var(--transition-base);
    white-space: nowrap;

    i {
        font-size: 0.9rem;
    }

    &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border-color: rgba(255, 255, 255, 0.2);
    }

    &.danger {
        &:hover {
            background: rgba(244, 67, 54, 0.2);
            color: #F44336;
            border-color: #F44336;
        }
    }

    &.tmdb {
        &:hover {
            background: rgba(0, 245, 255, 0.2);
            color: var(--color-accent);
            border-color: var(--color-accent);
        }
    }
}

.divider {
    width: 1px;
    height: 24px;
    background: rgba(255, 255, 255, 0.1);
    margin: 0 var(--space-2);
}

/* Animations */
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
}

.slide-up-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
}

/* Responsive */
@media (max-width: 768px) {
    .bulk-actions-bar {
        bottom: 70px;
        max-width: 95vw;
    }

    .bulk-actions-content {
        padding: var(--space-3) var(--space-4);
        gap: var(--space-4);
        flex-wrap: wrap;
        justify-content: center;
    }

    .desktop-only {
        display: none;
    }

    .action-btn {
        padding: var(--space-2) var(--space-3);
        min-width: 40px;
        justify-content: center;
    }

    .divider {
        display: none;
    }
}
</style>
