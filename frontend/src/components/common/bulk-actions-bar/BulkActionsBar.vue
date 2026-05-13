<script setup lang="ts">
import { computed } from "vue";
import { ItemStatus } from "@/types";
import "./bulk-actions-bar.css";

interface Props {
  selectedCount: number;
  totalCount: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  selectAll: [];
  clearSelection: [];
  changeStatus: [status: ItemStatus];
  deleteSelected: [];
  "enrich-with-tmdb": [];
}>();

const allSelected = computed(
  () => props.selectedCount === props.totalCount && props.totalCount > 0,
);

function handleEnrich() {
  emit("enrich-with-tmdb");
}
</script>

<template>
  <Transition name="slide-up">
    <div v-if="selectedCount > 0" class="bulk-actions-bar">
      <div class="bulk-actions-content">
        <div class="selection-info">
          <i class="fas fa-check-circle"></i>
          <span class="count"
            >{{ selectedCount }} seleccionado{{
              selectedCount !== 1 ? "s" : ""
            }}</span
          >
          <button class="link-btn" @click="emit('clearSelection')">
            Limpiar
          </button>
        </div>

        <div class="actions-group">
          <button
            v-if="!allSelected"
            class="action-btn"
            @click="emit('selectAll')"
            title="Seleccionar todos"
          >
            <i class="fas fa-check-double"></i>
            <span class="desktop-only">Todos</span>
          </button>

          <div class="divider"></div>

          <button
            class="action-btn"
            @click="emit('changeStatus', ItemStatus.PENDING)"
            title="Marcar como Pendiente"
          >
            <i class="fas fa-clock"></i>
            <span class="desktop-only">Pendiente</span>
          </button>

          <button
            class="action-btn"
            @click="emit('changeStatus', ItemStatus.IN_PROGRESS)"
            title="Marcar como En Progreso"
          >
            <i class="fas fa-play"></i>
            <span class="desktop-only">En Progreso</span>
          </button>

          <button
            class="action-btn"
            @click="emit('changeStatus', ItemStatus.COMPLETED)"
            title="Marcar como Completado"
          >
            <i class="fas fa-check"></i>
            <span class="desktop-only">Completado</span>
          </button>

          <div class="divider"></div>

          <button
            class="action-btn action-btn--tmdb"
            @click="handleEnrich"
            title="Enriquecer con datos de TMDB"
          >
            <i class="fas fa-film"></i>
            <span class="desktop-only">Enriquecer TMDB</span>
          </button>

          <div class="divider"></div>

          <button
            class="action-btn action-btn--danger"
            @click="emit('deleteSelected')"
            title="Eliminar seleccionados"
          >
            <i class="fas fa-trash"></i>
            <span class="desktop-only">Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
