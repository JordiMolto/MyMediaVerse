<script setup lang="ts">
defineEmits<{
    click: []
}>()
</script>

<template>
    <button class="app-fab" @click="$emit('click')">
        <i class="fas fa-plus"></i>
    </button>
</template>

<style scoped>
.app-fab {
    position: fixed;
    bottom: var(--space-8);
    right: var(--space-8);
    width: 64px;
    height: 64px;
    background: var(--color-accent);
    color: var(--color-bg-main);
    border: none;
    border-radius: 18px;
    /* Rounded square style from Image 1 */
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 100;
    transition: all var(--transition-base);
    box-shadow: 0 0 20px var(--color-accent-glow),
        0 0 40px rgba(0, 245, 255, 0.2);

    &:hover {
        box-shadow: 0 0 30px var(--color-accent-glow),
            0 0 60px rgba(0, 245, 255, 0.3);
    }

    &:active {
        transform: scale(0.95);
    }

    i {
        font-weight: 900;
    }
}

@media (max-width: 768px) {
    .app-fab {
        bottom: var(--space-6);
        right: var(--space-6);
        width: 56px;
        height: 56px;
    }
}
</style>
