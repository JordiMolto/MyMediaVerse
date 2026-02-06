<script setup lang="ts">
interface Props {
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
    size?: 'small' | 'medium' | 'large'
    disabled?: boolean
    loading?: boolean
    icon?: string
    fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'primary',
    size: 'medium',
    disabled: false,
    loading: false,
    fullWidth: false
})
</script>

<template>
    <button class="app-button" :class="[
        `variant-${variant}`,
        `size-${size}`,
        { 'full-width': fullWidth, 'is-loading': loading }
    ]" :disabled="disabled || loading">
        <i v-if="loading" class="fas fa-spinner fa-spin"></i>
        <i v-else-if="icon" class="fas" :class="icon"></i>
        <slot></slot>
    </button>
</template>

<style scoped src="./app-button.css"></style>
