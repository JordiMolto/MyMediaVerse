<script setup lang="ts">
import { computed } from 'vue'
import { Item, ItemType } from '@/types'

interface Props {
    item: Item
    selectable?: boolean
    selected?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
    click: [id: string]
    quickNote: [id: string]
    toggleSelect: [id: string]
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

function handleSelect(e: Event) {
    e.stopPropagation()
    emit('toggleSelect', props.item.id)
}

function handleCardClick() {
    if (props.selectable) {
        emit('toggleSelect', props.item.id)
    } else {
        emit('click', props.item.id)
    }
}
</script>

<template>
    <div class="media-card" :class="{ 'selectable': selectable, 'selected': selected }" @click="handleCardClick">
        <div class="card-inner">
            <!-- Poster Image -->
            <div class="poster-wrapper">
                <img v-if="hasImage" :src="item.imagen" :alt="item.titulo" class="poster-image" />
                <div v-else class="poster-placeholder">
                    <i class="fas" :class="typeIcon"></i>
                </div>

                <!-- Selection Checkbox (Top Left) -->
                <Transition name="fade">
                    <div v-if="selectable" class="selection-checkbox" @click="handleSelect">
                        <div class="checkbox-inner" :class="{ 'checked': selected }">
                            <i v-if="selected" class="fas fa-check"></i>
                        </div>
                    </div>
                </Transition>

                <!-- Status & Type Overlays (Top Right) -->
                <div class="card-status-overlays">
                    <div v-if="item.favorito" class="favorite-tag">
                        <i class="fas fa-heart"></i>
                    </div>
                    <div class="type-tag">
                        <i class="side-link-icon fas" :class="typeIcon"></i>
                    </div>
                </div>

                <!-- Info Overlay -->
                <div class="info-overlay">
                    <div class="info-header">
                        <h3 class="item-title">{{ item.titulo }}</h3>
                        <div v-if="item.rating" class="item-rating">
                            <i class="fas fa-star rating-star"></i>
                            <span class="rating-value">{{ item.rating }}</span>
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
    aspect-ratio: 2/3;
    background: var(--color-bg-surface);
    border-radius: var(--radius-xl);
    overflow: hidden;
    border: 1px solid var(--color-border);
    transition: all var(--transition-base);
    box-shadow: var(--shadow-md);

    .media-card:hover & {
        transform: translateY(-8px);
        border-color: rgba(255, 255, 255, 0.15);
        box-shadow: var(--shadow-lg);

        .poster-image {
            transform: scale(1.05);
            filter: brightness(0.6);
        }
    }

    .media-card.selected & {
        border-color: var(--color-accent);
        box-shadow: 0 0 0 3px rgba(0, 245, 255, 0.3), var(--shadow-lg);
    }
}

.card-status-overlays {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 5;
}

.favorite-tag {
    background: rgba(255, 51, 153, 0.8);
    backdrop-filter: blur(8px);
    width: 28px;
    height: 28px;
    border-radius: 50%;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    box-shadow: 0 4px 12px rgba(255, 51, 153, 0.3);
    animation: heartPulse 2s infinite;
}

@keyframes heartPulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.1);
    }

    100% {
        transform: scale(1);
    }
}

.type-tag {
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(8px);
    width: 28px;
    height: 28px;
    border-radius: 8px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.selection-checkbox {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 10;
}

.checkbox-inner {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    border: 2px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        border-color: white;
    }

    &.checked {
        background: var(--color-accent);
        border-color: var(--color-accent);
        color: var(--color-bg-main);
        font-size: 12px;
    }
}


.info-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 32px 16px 16px;
    background: linear-gradient(to top, rgba(14, 17, 22, 0.95) 0%, rgba(14, 17, 22, 0.8) 50%, transparent 100%);
    display: flex;
    flex-direction: column;
    gap: 4px;
    z-index: 2;
}

.info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
}

.item-title {
    font-size: 15px;
    font-weight: 700;
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
    gap: 4px;
    font-size: 11px;
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
    font-size: 40px;
    background: var(--color-bg-card);
    color: var(--color-text-muted);
}
</style>
