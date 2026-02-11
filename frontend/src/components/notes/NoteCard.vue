<script setup lang="ts">
import { Note } from '@/types'

interface Props {
    note: Note
}

defineProps<Props>()

const emit = defineEmits<{
    edit: [id: string]
    delete: [id: string]
}>()

function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}
</script>

<template>
  <div class="note-card glass-card p-6 flex flex-col gap-4">
    <div class="note-header flex justify-between items-center">
      <div class="note-date flex items-center gap-2 text-xs text-muted">
        <i class="fas fa-calendar"></i>
        <span>{{ formatDate(note.fechaCreacion) }}</span>
      </div>
      <div class="note-actions flex gap-2">
        <button class="btn-icon p-1.5 rounded bg-surface text-secondary transition-all hover:bg-primary hover:text-white" title="Editar nota" @click="emit('edit', note.id)">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-icon p-1.5 rounded bg-surface text-secondary transition-all hover:bg-danger hover:text-white" title="Eliminar nota" @click="emit('delete', note.id)">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>

    <div class="note-content flex flex-col gap-3">
      <div v-if="note.esSpoiler" class="spoiler-warning flex items-center gap-2 px-3 py-1 rounded-md bg-warning/10 border border-warning text-warning text-xs fw-bold w-fit">
        <i class="fas fa-exclamation-triangle"></i>
        <span>Contiene spoilers</span>
      </div>
      <p class="note-text text-primary leading-relaxed whitespace-pre-wrap break-words">{{ note.contenido }}</p>
    </div>
  </div>
</template>

<style scoped>
.note-card {
  border-left: 4px solid var(--color-primary);

  .btn-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
  }
}
</style>
