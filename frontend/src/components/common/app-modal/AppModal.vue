<script setup lang="ts">
interface Props {
    isOpen: boolean
    title?: string
    size?: 'small' | 'medium' | 'large'
    closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    size: 'medium',
    closeOnBackdrop: true
})

const emit = defineEmits<{
    close: []
}>()

function handleBackdropClick() {
    if (props.closeOnBackdrop) {
        emit('close')
    }
}

function handleClose() {
    emit('close')
}
</script>

<template>
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="isOpen" class="modal-overlay" @click="handleBackdropClick">
                <div class="modal-container" :class="`size-${size}`" @click.stop>
                    <div class="modal-header">
                        <h2 v-if="title" class="modal-title">{{ title }}</h2>
                        <button class="modal-close" @click="handleClose">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="modal-body">
                        <slot></slot>
                    </div>

                    <div v-if="$slots.footer" class="modal-footer">
                        <slot name="footer"></slot>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped src="./app-modal.css"></style>
