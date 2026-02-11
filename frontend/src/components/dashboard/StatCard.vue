<script setup lang="ts">
interface Props {
    title: string
    value: number | string
    label: string
    variant?: 'primary' | 'accent'
    progress: number // 0-100
    icon: string
}

withDefaults(defineProps<Props>(), {
    variant: 'primary'
})
</script>

<template>
    <div class="stat-card glass-card" :class="variant">
        <div class="card-header">
            <h3 class="stat-title">{{ title }}</h3>
            <div class="stat-icon-badge">
                <i class="fas" :class="icon"></i>
            </div>
        </div>

        <div class="card-body">
            <div class="value-row">
                <span class="stat-value">{{ value }}</span>
                <span class="stat-label">{{ label }}</span>
            </div>

            <div class="progress-container">
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" :style="{ width: progress + '%' }"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.stat-card {
    padding: var(--space-6) var(--space-8);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: var(--space-8);
    min-height: 160px;
    position: relative;
    overflow: hidden;
    transition: background var(--transition-base), box-shadow var(--transition-base);
    border-radius: var(--radius-xl);

    &:hover {
        background: rgba(255, 255, 255, 0.03);
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, transparent 100%);
        pointer-events: none;
    }
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.stat-title {
    font-size: 10px;
    text-transform: uppercase;
    font-weight: 800;
    letter-spacing: 0.1em;
    color: var(--color-text-muted);
}

.stat-icon-badge {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    color: var(--color-text-secondary);
    font-size: 0.9rem;
}

.value-row {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
}

.stat-value {
    font-size: var(--fs-4xl);
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.05em;
    color: var(--color-text-primary);
}

.stat-label {
    font-size: var(--fs-sm);
    color: var(--color-text-muted);
    font-weight: var(--fw-medium);
}

.progress-container {
    width: 100%;
}

.progress-bar-bg {
    height: var(--progress-height);
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-full);
    overflow: hidden;
}

.progress-bar-fill {
    height: 100%;
    border-radius: var(--radius-full);
}

/* Variants */
.stat-card.primary {
    .progress-bar-fill {
        background: var(--color-primary);
        box-shadow: 0 0 15px var(--color-primary-glow);
    }

    .stat-icon-badge {
        color: var(--color-primary);
        background: var(--color-primary-glow);
    }
}

.stat-card.accent {
    .progress-bar-fill {
        background: var(--color-accent);
        box-shadow: 0 0 15px var(--color-accent-glow);
    }

    .stat-icon-badge {
        color: var(--color-accent);
        background: var(--color-accent-glow);
    }
}

@media (max-width: 640px) {
    .stat-card {
        padding: var(--space-4) var(--space-6);
        min-height: 140px;
    }

    .stat-value {
        font-size: var(--fs-3xl);
    }
}
</style>
