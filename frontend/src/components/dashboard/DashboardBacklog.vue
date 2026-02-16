<script setup lang="ts">
import { Item } from '@/types'
import { useRouter } from 'vue-router'

const props = defineProps<{
    oldest: Item | null
    best: Item | null
    random: Item | null
}>()

const router = useRouter()

const goToItem = (id?: string) => {
    if (id) router.push(`/item/${id}`)
}
</script>

<template>
    <div class="backlog-section">
        <h3 class="text-xl fw-bold text-white mb-4">Tu Backlog Real</h3>

        <div class="backlog-grid">
            <!-- Oldest Pending -->
            <div class="backlog-card" @click="goToItem(oldest?.id)">
                <div class="card-tag">MÁS ANTIGUO</div>
                <div v-if="oldest" class="card-content">
                    <img v-if="oldest.imagen" :src="oldest.imagen" class="card-bg" />
                    <div class="overlay"></div>
                    <div class="info">
                        <h4 class="title">{{ oldest.titulo }}</h4>
                        <span class="date">Añadido hace poco tiempo</span>
                    </div>
                </div>
                <div v-else class="empty-card">No hay pendientes</div>
            </div>

            <!-- Best Rated Pending -->
            <div class="backlog-card" @click="goToItem(best?.id)">
                <div class="card-tag">MEJOR VALORADO</div>
                <div v-if="best" class="card-content">
                    <img v-if="best.imagen" :src="best.imagen" class="card-bg" />
                    <div class="overlay"></div>
                    <div class="info">
                        <h4 class="title">{{ best.titulo }}</h4>
                        <span class="rating">★ {{ best.rating || 'N/A' }}</span>
                    </div>
                </div>
                <div v-else class="empty-card">No hay pendientes</div>
            </div>

            <!-- Random Choice -->
            <div class="backlog-card random" @click="goToItem(random?.id)">
                <div class="card-tag">QUÉ CONSUMIR AHORA</div>
                <div v-if="random" class="random-inner">
                    <i class="fas fa-dice text-4xl mb-2 text-accent"></i>
                    <p class="mb-2">¿No te decides? Prueba con:</p>
                    <h4 class="title">{{ random.titulo }}</h4>
                </div>
                <div v-else class="empty-card">Nada que recomendar</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.backlog-section {
    width: 100%;
}

.backlog-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-4);
}

.backlog-card {
    position: relative;
    height: 160px;
    background: var(--color-bg-surface);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);

    &:hover {
        transform: translateY(-8px) scale(1.02);
        border-color: var(--color-primary);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
        background: var(--color-bg-card-hover);

        .overlay {
            background: linear-gradient(to top, rgba(168, 85, 247, 0.4) 0%, transparent 100%);
        }
    }

    &.random {
        background: linear-gradient(135deg, var(--color-bg-card) 0%, var(--color-bg-surface) 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: var(--space-4);
        border: 2px dashed var(--color-accent);

        &:hover {
            border-style: solid;
            background: rgba(0, 245, 255, 0.08);
            border-color: var(--color-accent);
            box-shadow: 0 0 30px var(--color-accent-glow);
        }
    }
}

.card-tag {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 2;
    background: var(--color-primary);
    color: white;
    font-size: 8px;
    font-weight: 800;
    padding: 2px 8px;
    border-radius: 4px;
    letter-spacing: 0.1em;
}

.card-content {
    width: 100%;
    height: 100%;
}

.card-bg {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, transparent 100%);
}

.info {
    position: absolute;
    bottom: 12px;
    left: 12px;
    right: 12px;
    z-index: 2;
}

.title {
    font-size: var(--fs-base);
    font-weight: 700;
    color: white;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.date,
.rating {
    font-size: 10px;
    color: var(--color-text-secondary);
}

.random-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--color-text-secondary);
}

.empty-card {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
    font-size: var(--fs-sm);
    font-style: italic;
}
</style>
