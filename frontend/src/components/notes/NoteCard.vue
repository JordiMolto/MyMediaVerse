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
    <div class="note-card">
        <div class="note-header">
            <div class="note-date">
                <i class="fas fa-calendar"></i>
                {{ formatDate(note.fecha) }}
            </div>
            <div class="note-actions">
                <button class="btn-icon" title="Editar nota" @click="emit('edit', note.id)">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-danger" title="Eliminar nota" @click="emit('delete', note.id)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>

        <div class="note-content">
            <div v-if="note.spoilers" class="spoiler-warning">
                <i class="fas fa-exclamation-triangle"></i>
                Contiene spoilers
            </div>
            <p class="note-text">{{ note.texto }}</p>
        </div>
    </div>
</template>

<style scoped>
.note-card {
    background: var(--bg-card);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
    border-left: 3px solid var(--color-primary);
}

.note-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
}

.note-date {
    font-size: var(--font-size-xs);
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

.note-actions {
    display: flex;
    gap: var(--spacing-xs);
}

.btn-icon {
    width: 28px;
    height: 28px;
    border: none;
    background: var(--bg-secondary);
    color: var(--text-secondary);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-sm);
}

.btn-icon:hover {
    background: var(--color-primary);
    color: white;
}

.btn-icon.btn-danger:hover {
    background: var(--color-danger);
}

.note-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.spoiler-warning {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: rgba(255, 193, 7, 0.1);
    border: 1px solid var(--color-warning);
    border-radius: var(--radius-sm);
    color: var(--color-warning);
    font-size: var(--font-size-xs);
    font-weight: 600;
    width: fit-content;
}

.note-text {
    color: var(--text-primary);
    line-height: 1.6;
    white-space: pre-wrap;
    word-wrap: break-word;
}
</style>
