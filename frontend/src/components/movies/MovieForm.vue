<template>
  <form @submit.prevent="submitForm" class="movie-form">
    <h3>{{ formTitle }}</h3>
    <div>
      <label for="titulo">Título:</label>
      <input type="text" id="titulo" v-model="formData.titulo" required />
    </div>
    <div>
      <label for="puntuacion">Puntuación (1-10):</label>
      <input type="number" id="puntuacion" v-model.number="formData.puntuacion" min="1" max="10" />
    </div>
    <!-- COMENTARIOS PARA TI: Añade más campos según tu tabla 'Entrada' -->
    <!-- tipo, estado, nota, fecha_inicio, fecha_fin, favorito -->
    <button type="submit">{{ movieToEdit ? 'Actualizar' : 'Añadir' }} Película</button>
    <button type="button" @click="resetForm" v-if="movieToEdit">Cancelar Edición</button>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
// import type { Movie } from '../../types'; // O tu tipo 'Entrada'

// const props = defineProps<{
//   movieToEdit: Movie | null;
// }>();

// const emit = defineEmits(['submit-movie']);

// const initialFormData = {
//   id: undefined,
//   titulo: '',
//   tipo: 'película', // Valor por defecto
//   estado: 'pendiente', // Valor por defecto
//   puntuacion: null,
//   nota: '',
//   // ... otros campos
// };

// const formData = ref({ ...initialFormData });

// const formTitle = computed(() => props.movieToEdit ? 'Editar Película' : 'Añadir Nueva Película');

// watch(() => props.movieToEdit, (newVal) => {
//   if (newVal) {
//     formData.value = { ...newVal };
//   } else {
//     resetForm();
//   }
// }, { immediate: true });


// const submitForm = () => {
//   // Validaciones básicas aquí si quieres
//   emit('submit-movie', { ...formData.value });
//   if (!props.movieToEdit) { // Solo resetea si es un nuevo formulario
//       resetForm();
//   }
// };

// const resetForm = () => {
//   formData.value = { ...initialFormData };
//   // Si estás usando un sistema para limpiar el 'movieToEdit' en el padre,
//   // podrías emitir un evento para ello también.
// };
</script>

<style scoped>
.movie-form div {
  margin-bottom: 10px;
}
.movie-form label {
  display: block;
  margin-bottom: 5px;
}
</style> 