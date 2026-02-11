<script setup lang="ts">
import { computed } from 'vue'
import { Item, ItemType } from '@/types'

interface Props {
    item: Item
}

const props = defineProps<Props>()

const emit = defineEmits<{
    click: [id: string]
    quickNote: [id: string]
}>()

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

const hasImage = computed(() => !!props.item.imagen)

function handleQuickNote(e: Event) {
    e.stopPropagation()
    emit('quickNote', props.item.id)
}
</script>

<template>
    <div class="media-card" @click="emit('click', item.id)">
        <div class="card-inner">
            <!-- Poster Image -->
            <div class="poster-wrapper">
                <img v-if="hasImage" :src="item.imagen" :alt="item.titulo" class="poster-image" />
                <div v-else class="poster-placeholder">
                    <i class="fas" :class="typeIcon"></i>
                </div>

                <!-- Type Icon Overlay (Top Right) -->
                <div class="type-overlay">
                    <i class="fas" :class="typeIcon"></i>
                </div>

                <!-- Action Button -->
                <button class="action-btn" @click="handleQuickNote" title="Añadir nota">
                    <i class="fas fa-plus"></i>
                </button>

                <!-- Gradient Overlay & Info -->
                <div class="info-overlay">
                    <div class="info-top flex justify-between items-end">
                        <h3 class="item-title">{{ item.titulo }}</h3>
                        <div v-if="item.rating" class="item-rating">
                            <i class="fas fa-star text-accent"></i>
                            <span>{{ item.rating }}</span>
                        </div>
                    </div>
                    <p v-if="item.descripcion" class="item-description">
                        {{ item.descripcion }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.media-card {
    width: 100%;
    cursor: pointer;
    perspective: 1000px;
}

.card-inner {
    position: relative;
    width: 100%;
    padding-top: 135%;
    /* Slightly taller than 125% but shorter than 150% (3:4 ratio) */
    background: var(--color-bg-surface);
    border-radius: var(--radius-xl);
    overflow: hidden;
    border: 1px solid var(--color-border);
    transition: all var(--transition-base);
    box-shadow: var(--shadow-md);
    transition: 0.3s;

    &:hover {
        transform: translateY(-8px);
        border-color: rgba(255, 255, 255, 0.15);
        box-shadow: var(--shadow-lg);

        .poster-image {
            transform: scale(1.05);
            filter: brightness(0.6);
        }

        .action-btn {
            opacity: 1;
            transform: scale(1);
        }
    }
}

.poster-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.poster-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.5s ease;
}

.type-overlay {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    width: 32px;
    height: 32px;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    color: white;
    z-index: 2;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.8);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: white;
    color: var(--color-bg-main);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all var(--transition-base);
    z-index: 3;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);

    &:hover {
        background: var(--color-accent);
        transform: translate(-50%, -50%) scale(1.1);
    }
}

.info-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: var(--space-8) var(--space-4) var(--space-4);
    background: linear-gradient(to top, rgba(14, 17, 22, 0.98) 0%, rgba(14, 17, 22, 0.7) 60%, transparent 100%);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    z-index: 2;
}

.info-top {
    gap: var(--space-2);
}

.item-title {
    font-size: var(--fs-base);
    font-weight: 800;
    color: white;
    margin: 0;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.item-rating {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--fs-xs);
    font-weight: 800;
    color: var(--color-accent);
}

.item-description {
    font-size: 10px;
    color: var(--color-text-muted);
    margin: 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.poster-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    background: var(--color-bg-card);
    color: var(--color-text-muted);
}
</style>
