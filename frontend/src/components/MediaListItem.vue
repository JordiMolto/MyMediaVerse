<template>
  <div class="media-list-item" :class="{ 'favorito-row': item.favorito }">
    <div class="media-cell cell-titulo">{{ item.titulo }}</div>
    <div class="media-cell cell-estado">{{ item.estado }}</div>
    <div class="media-cell cell-puntuacion">
      {{ item.puntuacion !== null && item.puntuacion !== undefined ? item.puntuacion + '/10' : '-' }}
    </div>
    <div class="media-cell cell-favorito">
      <span v-if="item.favorito" title="Favorito" class="favorito-icon">⭐</span>
      <span v-else>-</span>
    </div>
    <div class="media-cell cell-acciones">
      <button @click="$emit('edit', item)" class="action-button-small edit">Editar</button>
      <button @click="$emit('delete', item.id)" class="action-button-small delete">Eliminar</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MediaItem } from '../types/media';
import { defineProps, defineEmits } from 'vue';

interface Props {
  item: MediaItem;
}
defineProps<Props>();

defineEmits(['edit', 'delete']);
</script>

<style scoped>
.media-list-item {
  display: contents; /* Hace que este div se comporte como si sus hijos fueran directos del grid padre */
}

.media-cell {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: var(--text-color-light);
}

/* Para que la última fila no tenga borde inferior si se desea, o para alternar colores */
/* .media-list-item:last-child .media-cell {
  border-bottom: none;
} */

.favorito-row .media-cell {
  /* Podrías añadir un ligero fondo o un indicador visual si es favorito */
  /* background-color: #fffadf; */
}

.cell-titulo {
  font-weight: 500;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-puntuacion,
.cell-favorito {
  text-align: center;
  justify-content: center; /* Centra el contenido si es un flex container */
}

.favorito-icon {
  color: #ffc107;
  font-size: 1.1rem;
}

.cell-acciones {
  gap: 0.5rem;
  justify-content: flex-end; /* Alinea los botones a la derecha */
}

.action-button-small {
  padding: 5px 10px;
  font-size: 0.8rem;
  border-radius: calc(var(--border-radius) - 3px);
  border: none;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.action-button-small.edit {
  background-color: var(--primary-color-dark);
}
.action-button-small.edit:hover {
  background-color: var(--primary-color);
}

.action-button-small.delete {
  background-color: #dc3545;
}
.action-button-small.delete:hover {
  background-color: #c82333;
}
</style> 