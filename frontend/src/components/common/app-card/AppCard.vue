<script setup lang="ts">
interface Props {
    hoverable?: boolean
    clickable?: boolean
    padding?: 'none' | 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
    hoverable: false,
    clickable: false,
    padding: 'medium'
})
</script>

<template>
    <div class="app-card" :class="[
        `padding-${padding}`,
        { hoverable, clickable }
    ]">
        <slot></slot>
    </div>
</template>

<style scoped src="./app-card.css"></style>
