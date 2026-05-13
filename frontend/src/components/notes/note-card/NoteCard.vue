<script setup lang="ts">
import { computed } from "vue";
import { Note, HitoType } from "@/types";
import "./note-card.css";

interface Props {
  note: Note;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  edit: [id: string];
  delete: [id: string];
}>();

const hitoConfig = {
  [HitoType.START]: {
    label: "Iniciado",
    icon: "fa-play",
    color: "var(--color-primary)",
  },
  [HitoType.HALF]: {
    label: "Mitad",
    icon: "fa-chevron-right",
    color: "var(--color-warning)",
  },
  [HitoType.END]: {
    label: "Finalizado",
    icon: "fa-check-double",
    color: "var(--color-success)",
  },
  [HitoType.REWATCH]: {
    label: "Revisionado",
    icon: "fa-redo",
    color: "var(--color-accent)",
  },
  [HitoType.NONE]: { label: "", icon: "", color: "" },
};

const hitoInfo = computed(() => {
  if (!props.note.tipoHito || props.note.tipoHito === HitoType.NONE)
    return null;
  return hitoConfig[props.note.tipoHito];
});

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>

<template>
  <div class="note-card-wrapper" :class="{ 'has-milestone': hitoInfo }">
    <div class="timeline-trail">
      <div
        v-if="hitoInfo"
        class="milestone-marker"
        :style="{ background: hitoInfo.color }"
      >
        <i class="fas" :class="hitoInfo.icon"></i>
      </div>
      <div v-else class="timeline-dot"></div>
      <div class="timeline-line"></div>
    </div>

    <div class="note-content-card glass-card">
      <div class="note-header">
        <div class="note-meta">
          <span class="note-date">{{ formatDate(note.fechaCreacion) }}</span>
          <span
            v-if="hitoInfo"
            class="hito-badge"
            :style="{
              background: hitoInfo.color + '20',
              color: hitoInfo.color,
              border: '1px solid ' + hitoInfo.color + '40',
            }"
          >
            {{ hitoInfo.label }}
          </span>
        </div>
        <div class="note-actions">
          <button
            class="action-btn action-btn--edit"
            @click="emit('edit', note.id)"
          >
            <i class="fas fa-edit"></i>
          </button>
          <button
            class="action-btn action-btn--delete"
            @click="emit('delete', note.id)"
          >
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
