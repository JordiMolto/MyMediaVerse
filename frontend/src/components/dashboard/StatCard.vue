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
    <div class="stat-card" :class="variant">
        <div class="stat-header">
            <h3 class="stat-title">{{ title }}</h3>
            <div class="stat-icon-badge">
                <i class="fas" :class="icon"></i>
            </div>
        </div>

        <div class="stat-content">
            <div class="stat-value-row">
                <span class="stat-value">{{ value }}</span>
                <span class="stat-label">{{ label }}</span>
            </div>

            <div class="stat-progress">
                <div class="stat-progress-bg">
                    <div class="stat-progress-fill" :style="{ width: progress + '%' }"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.stat-card {
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    padding: 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 32px;
    min-height: 160px;
    border-radius: 24px;
    transition: all 0.3s ease;

    &:hover {
        background: var(--color-bg-card-hover);
        border-color: var(--color-border-hover);
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
    }
}

.stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.stat-title {
    font-size: 11px;
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
    font-size: 14px;
}

.stat-value-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 12px;
}

.stat-value {
    font-size: 48px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.05em;
    color: white;
}

.stat-label {
    font-size: 14px;
    color: var(--color-text-muted);
    font-weight: 500;
}

.stat-progress-bg {
    height: 8px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 99px;
    overflow: hidden;
}

.stat-progress-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card.primary {
    .stat-progress-fill {
        background: var(--color-primary);
        box-shadow: 0 0 15px var(--color-primary-glow);
    }

    .stat-icon-badge {
        color: var(--color-primary);
        background: var(--color-primary-alpha);
    }
}

.stat-card.accent {
    .stat-progress-fill {
        background: var(--color-accent);
        box-shadow: 0 0 15px var(--color-accent-glow);
    }

    .stat-icon-badge {
        color: var(--color-accent);
        background: rgba(var(--color-accent-rgb), 0.1);
    }
}

@media (max-width: 640px) {
    .stat-card {
        padding: 20px;
        min-height: 140px;
        gap: 24px;
    }

    .stat-value {
        font-size: 36px;
    }
}
</style>
