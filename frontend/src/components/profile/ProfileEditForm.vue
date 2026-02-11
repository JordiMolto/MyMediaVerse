<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const emit = defineEmits(['save', 'cancel'])

const form = ref({
    displayName: authStore.user?.user_metadata?.display_name || '',
    avatarUrl: authStore.user?.user_metadata?.avatar_url || ''
})

const isSubmitting = ref(false)

async function handleSubmit() {
    isSubmitting.value = true
    try {
        await authStore.updateUser({
            display_name: form.value.displayName,
            avatar_url: form.value.avatarUrl
        })
        emit('save')
    } catch (e) {
        console.error('Error updating profile:', e)
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <form @submit.prevent="handleSubmit" class="profile-edit-form">
        <div class="form-group flex flex-col gap-2 mb-6">
            <label for="displayName" class="text-sm fw-bold text-secondary">Nombre de Usuario</label>
            <input id="displayName" v-model="form.displayName" type="text" placeholder="Tu nombre..."
                class="form-input" />
        </div>

        <div class="form-group flex flex-col gap-2 mb-8">
            <label for="avatarUrl" class="text-sm fw-bold text-secondary">URL de Avatar</label>
            <input id="avatarUrl" v-model="form.avatarUrl" type="url" placeholder="https://..." class="form-input" />
            <p class="text-xs text-muted">Usa una URL de imagen (puedes usar DiceBear para demos).</p>
        </div>

        <div class="form-actions flex justify-end gap-4 mt-10">
            <button type="button" class="btn btn-glass px-8" @click="$emit('cancel')">Cancelar</button>
            <button type="submit" class="btn btn-primary px-8" :disabled="isSubmitting">
                {{ isSubmitting ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
        </div>
    </form>
</template>

<style scoped>
.form-input {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-4) var(--space-5);
    color: var(--color-text-primary);
    font-size: var(--fs-base);
    transition: all var(--transition-base);

    &:focus {
        background: rgba(255, 255, 255, 0.05);
        border-color: var(--color-primary);
        outline: none;
    }
}
</style>
