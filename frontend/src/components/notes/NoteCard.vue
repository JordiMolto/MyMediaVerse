<script setup lang="ts">
import { computed } from 'vue'
import { Note, HitoType } from '@/types'

interface Props {
  note: Note
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [id: string]
  delete: [id: string]
}>()

const hitoConfig = {
  [HitoType.START]: { label: 'Iniciado', icon: 'fa-play', color: 'var(--color-primary)' },
  [HitoType.HALF]: { label: 'Mitad', icon: 'fa-chevron-right', color: 'var(--color-warning)' },
  [HitoType.END]: { label: 'Finalizado', icon: 'fa-check-double', color: 'var(--color-success)' },
  [HitoType.REWATCH]: { label: 'Revisionado', icon: 'fa-redo', color: 'var(--color-accent)' },
  [HitoType.NONE]: { label: '', icon: '', color: '' }
}

const hitoInfo = computed(() => {
  if (!props.note.tipoHito || props.note.tipoHito === HitoType.NONE) return null
  return hitoConfig[props.note.tipoHito]
})

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="note-card-wrapper" :class="{ 'has-milestone': hitoInfo }">
    <div class="timeline-trail">
      <div v-if="hitoInfo" class="milestone-marker" :style="{ background: hitoInfo.color }">
        <i class="fas" :class="hitoInfo.icon"></i>
      </div>
      <div v-else class="timeline-dot"></div>
      <div class="timeline-line"></div>
    </div>

    <div class="note-content-card glass-card">
      <div class="note-header text-xs text-muted">
        <div class="flex items-center gap-3">
          <span class="note-date">{{ formatDate(note.fechaCreacion) }}</span>
          <span v-if="hitoInfo" class="hito-badge px-2 py-0.5 rounded text-[10px] fw-bold uppercase tracking-wider"
            :style="{ background: hitoInfo.color + '20', color: hitoInfo.color, border: '1px solid ' + hitoInfo.color + '40' }">
            {{ hitoInfo.label }}
          </span>
        </div>
        <div class="note-actions">
          <button class="action-btn hover:text-primary" @click="emit('edit', note.id)">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn hover:text-danger" @click="emit('delete', note.id)">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <div class="note-body">
        <div v-if="note.esSpoiler" class="spoiler-label">
          <i class="fas fa-eye-slash"></i> SPOILER
        </div>
        <p class="note-text">{{ note.contenido }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.note-card-wrapper {
  display: flex;
  gap: var(--space-6);
  position: relative;

  .timeline-trail {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 32px;
    flex-shrink: 0;

    .timeline-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--color-border);
      margin-top: 14px;
      flex-shrink: 0;
      z-index: 2;
    }

    .milestone-marker {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.75rem;
      flex-shrink: 0;
      z-index: 2;
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
    }

    .timeline-line {
      flex: 1;
      width: 2px;
      background: linear-gradient(to bottom, var(--color-border), rgba(255, 255, 255, 0.05));
      margin-top: var(--space-1);
    }
  }

  .note-content-card {
    flex: 1;
    padding: var(--space-4) var(--space-5);
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    transition: all var(--transition-base);

    &:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.1);
    }
  }

  .note-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-3);
  }

  .note-actions {
    display: flex;
    gap: var(--space-3);
    opacity: 0;
    transition: opacity var(--transition-base);
  }

  &:hover .note-actions {
    opacity: 1;
  }

  .action-btn {
    background: none;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    font-size: 0.85rem;
    transition: color 0.2s;
  }

  .note-body {
    .spoiler-label {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: 2px 8px;
      background: var(--color-danger-alpha);
      color: var(--color-danger);
      border-radius: 4px;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-bottom: var(--space-2);
    }

    .note-text {
      color: var(--color-text-primary);
      line-height: 1.6;
      font-size: 0.95rem;
      white-space: pre-wrap;
    }
  }

  &.has-milestone {
    .note-content-card {
      background: rgba(255, 255, 255, 0.03);
    }
  }

  &:last-child .timeline-line {
    display: none;
  }
}
</style>
