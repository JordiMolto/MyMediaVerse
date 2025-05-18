<template>
  <div class="movie-list">
    <h3>Lista de Películas</h3>
    <ul v-if="movies.length">
      <li v-for="movie in movies" :key="movie.id">
        {{ movie.titulo }} ({{ movie.puntuacion }}/10)
        <button @click="$emit('edit-movie', movie)">Editar</button>
        <button @click="$emit('delete-movie', movie.id)">Eliminar</button>
      </li>
    </ul>
    <p v-else>No hay películas para mostrar.</p>
  </div>
</template>

<script setup lang="ts">
// import type { Movie } from '../../types'; // Asegúrate de tener este tipo definido

// defineProps<{
//   movies: Movie[];
// }>();

// defineEmits(['edit-movie', 'delete-movie']);
</script>

<style scoped>
.movie-list ul {
  list-style: none;
  padding: 0;
}
.movie-list li {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #eee;
}
</style> 