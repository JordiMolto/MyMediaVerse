<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Item } from '@/types'

defineProps<{
    items: Item[]
}>()

const router = useRouter()
const timeFrame = ref<'year' | 'total'>('total')

const goToItem = (id: string) => {
    router.push(`/item/${id}`)
}
</script>

<template>
    <div class="top-rated-section">
        <div class="section-header">
            <h3 class="text-xl fw-bold text-white">Top 5 Personal</h3>
            <div class="toggle-group">
                <button class="toggle-btn" :class="{ active: timeFrame === 'year' }"
                    @click="timeFrame = 'year'">Año</button>
                <button class="toggle-btn" :class="{ active: timeFrame === 'total' }"
                    @click="timeFrame = 'total'">Histórico</button>
            </div>
        </div>

        <div class="top-list">
            <div v-for="(item, index) in items" :key="item.id" class="top-item clickable" @click="goToItem(item.id)">
                <div class="rank">{{ index + 1 }}</div>
                <img v-if="item.imagen" :src="item.imagen" alt="Cover" class="item-thumb" />
                <div v-else class="thumb-placeholder">
                    <i class="fas fa-image"></i>
                </div>
                <div class="item-info">
                    <h4 class="item-title">{{ item.titulo }}</h4>
                    <span class="item-type">{{ item.tipo }}</span>
                </div>
                <div class="rating">
                    <i class="fas fa-star text-accent"></i>
                    <span>{{ item.rating }}</span>
                </div>
            </div>

            <div v-if="items.length === 0" class="empty-top">
                <p>Completa y puntúa items para ver tu top aquí.</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.top-rated-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-xl);
    padding: var(--space-6);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-2);
}

.toggle-group {
    display: flex;
    background: var(--color-bg-surface);
    padding: 4px;
    border-radius: var(--radius-full);
}

.toggle-btn {
    padding: 4px 12px;
    border-radius: var(--radius-full);
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--color-text-muted);
    transition: all 0.2s;
    background: transparent;
    border: none;
    cursor: pointer;

    &.active {
        background: var(--color-accent);
        color: var(--color-bg-main);
    }
}

.top-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
}

.top-item {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-2);
    border-radius: var(--radius-lg);
    transition: background 0.2s;

    &.clickable {
        cursor: pointer;
    }

    &:hover {
        background: rgba(255, 255, 255, 0.03);
    }
}

.rank {
    font-size: var(--fs-lg);
    font-weight: 800;
    color: var(--color-primary);
    width: 24px;
    text-align: center;
}

.item-thumb {
    width: 36px;
    height: 54px;
    object-fit: cover;
    border-radius: var(--radius-xs);
}

.thumb-placeholder {
    width: 36px;
    height: 54px;
    background: var(--color-bg-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-xs);
    color: var(--color-text-muted);
}

.item-info {
    flex: 1;
    min-width: 0;
}

.item-title {
    font-size: var(--fs-sm);
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--color-text-primary);
}

.item-type {
    font-size: 10px;
    color: var(--color-text-muted);
    text-transform: uppercase;
}

.rating {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 700;
    color: var(--color-accent);
}

.empty-top {
    text-align: center;
    padding: var(--space-8);
    color: var(--color-text-muted);
    font-size: var(--fs-sm);
}
</style>
