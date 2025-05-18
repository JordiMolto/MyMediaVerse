<template>
  <div class="media-card">
    <img 
      :src="item.imagenUrl || `https://via.placeholder.com/250x375.png?text=${encodeURIComponent(item.titulo)}`" 
      :alt="item.titulo" 
      class="media-image"
    >
    <div class="media-card-content">
      <h4>
        {{ item.titulo }} 
        <span v-if="item.favorito" title="Favorito" class="favorite-star">⭐</span>
      </h4>
      <p><strong>Tipo:</strong> {{ item.tipo }}</p>
      <p><strong>Estado:</strong> {{ item.estado }}</p>
      <p>
        <strong>Puntuación:</strong> 
        {{ item.puntuacion !== null && item.puntuacion !== undefined ? item.puntuacion + '/10' : '-' }}
      </p>
      <p><strong>Fecha Inicio:</strong> {{ item.fecha_inicio || '-' }}</p>
      <p><strong>Fecha Fin:</strong> {{ item.fecha_fin || '-' }}</p>
      <p class="nota-text"><strong>Nota:</strong> {{ item.nota || '-' }}</p>
    </div>
    <div class="card-actions">
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
.media-card {
  background-color: var(--secondary-color);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* Ajuste para hacerlas un poco más pequeñas */
  /* El ancho se controlará por el grid-template-columns en la vista padre */
  /* Considera ajustar minmax(250px, 1fr) o similar en el grid padre */
}

.media-image {
  width: 100%;
  /* Altura ligeramente reducida para hacer la tarjeta más compacta */
  height: 250px; 
  object-fit: cover;
}

.media-card-content {
  padding: 1rem; /* Padding reducido un poco */
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.media-card-content h4 {
  margin-top: 0;
  margin-bottom: 0.6rem; /* Reducido margen */
  color: var(--primary-color);
  font-size: 1.1rem; /* Ligeramente reducido */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.favorite-star {
  font-size: 1rem; /* Reducido tamaño de la estrella */
  color: #ffc107;
}

.media-card-content p {
  font-size: 0.85rem; /* Ligeramente reducido */
  margin-bottom: 0.4rem; /* Reducido margen */
  line-height: 1.4;
}

.nota-text {
  flex-grow: 1;
  margin-bottom: 0.8rem; /* Reducido margen */
  /* Opcional: limitar altura y mostrar scroll si es muy largo */
  /* max-height: 60px; */
  /* overflow-y: auto; */
}

.card-actions {
  padding: 0 1rem 0.8rem 1rem; /* Ajustado padding */
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: auto; /* Asegura que los botones se alineen abajo */
}

.action-button-small {
  padding: 5px 10px; /* Reducido padding */
  font-size: 0.8rem; /* Reducida fuente */
  border-radius: calc(var(--border-radius) - 3px);
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