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
  <form class="note-form flex flex-col gap-6" @submit.prevent="handleSubmit">
    <AppInput v-model="texto" type="textarea" label="Nota" placeholder="Escribe tu nota aquí..." :rows="6" required
      :error="error" />

    <div class="spoiler-checkbox py-2">
      <label class="checkbox-label flex items-center gap-3 cursor-pointer select-none">
        <input v-model="spoilers" type="checkbox" class="checkbox-input w-5 h-5 cursor-pointer accent-warning">
        <span class="checkbox-text flex items-center gap-2 text-sm text-secondary">
          <i class="fas fa-exclamation-triangle text-warning"></i>
          Contiene spoilers
        </span>
      </label>
    </div>

    <div class="form-actions flex gap-4 justify-end pt-6 border-t border-white/5">
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
  width: 100%;
}
</style>
