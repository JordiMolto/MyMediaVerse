<script setup lang="ts">
defineProps<{
    insights: string[]
}>()
</script>

<template>
    <div class="insights-container">
        <div v-for="(insight, index) in insights" :key="index" class="insight-card">
            <div class="insight-icon">
                <i class="fas fa-lightbulb"></i>
            </div>
            <p class="insight-text">{{ insight }}</p>
        </div>

        <div v-if="insights.length === 0" class="insight-card empty">
            <p class="insight-text">Aún no hay suficientes datos para generar insights.</p>
        </div>
    </div>
</template>

<style scoped>
.insights-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-4);
    width: 100%;
}

.insight-card {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-4);
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-lg);
    transition: transform var(--transition-base);

    &:hover {
        transform: translateY(-2px);
        background: rgba(255, 255, 255, 0.05);
    }

    &.empty {
        justify-content: center;
        opacity: 0.6;
    }
}

.insight-icon {
    width: 40px;
    height: 40px;
    background: var(--color-primary-alpha);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    i {
        color: var(--color-primary);
        font-size: 1.2rem;
    }
}

.insight-text {
    font-size: var(--fs-sm);
    color: var(--color-text-secondary);
    line-height: 1.4;
    font-weight: 500;
}
</style>
