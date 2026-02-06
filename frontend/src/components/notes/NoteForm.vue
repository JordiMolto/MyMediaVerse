<script setup lang="ts">
import { ref } from 'vue'
import AppInput from '@/components/common/app-input/AppInput.vue'
import AppButton from '@/components/common/app-button/AppButton.vue'

interface Props {
    itemId: string
    initialText?: string
    initialSpoilers?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    initialText: '',
    initialSpoilers: false
})

const emit = defineEmits<{
    save: [data: { texto: string; spoilers: boolean }]
    cancel: []
}>()

const texto = ref(props.initialText)
const spoilers = ref(props.initialSpoilers)
const error = ref('')

function validate(): boolean {
    error.value = ''

    if (!texto.value.trim()) {
        error.value = 'El texto de la nota es obligatorio'
        return false
    }

    return true
}

function handleSubmit() {
    if (!validate()) return

    emit('save', {
        texto: texto.value.trim(),
        spoilers: spoilers.value
    })
}

function handleCancel() {
    emit('cancel')
}
</script>

<template>
    <form class="note-form" @submit.prevent="handleSubmit">
        <AppInput v-model="texto" type="textarea" label="Nota" placeholder="Escribe tu nota aquí..." :rows="6" required
            :error="error" />

        <div class="spoiler-checkbox">
            <label class="checkbox-label">
                <input v-model="spoilers" type="checkbox" class="checkbox-input">
                <span class="checkbox-text">
                    <i class="fas fa-exclamation-triangle"></i>
                    Contiene spoilers
                </span>
            </label>
        </div>

        <div class="form-actions">
            <AppButton type="button" variant="ghost" @click="handleCancel">
                Cancelar
            </AppButton>
            <AppButton type="submit" variant="primary" icon="fa-save">
                Guardar Nota
            </AppButton>
        </div>
    </form>
</template>

<style scoped>
.note-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.spoiler-checkbox {
    padding: var(--spacing-sm) 0;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    cursor: pointer;
    user-select: none;
}

.checkbox-input {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: var(--color-warning);
}

.checkbox-text {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

.checkbox-text i {
    color: var(--color-warning);
}

.form-actions {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: flex-end;
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--bg-card);
}
</style>
