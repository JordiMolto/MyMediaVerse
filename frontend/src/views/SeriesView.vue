<template>
  <div class="media-view">
    <header class="view-header">
      <h2>Series</h2>
      <button @click="openForm()" class="action-button">Añadir Serie</button>
    </header>

    <div class="controls-bar">
      <div class="filter-group">
        <label for="filter-estado-series">Filtrar por Estado:</label>
        <select id="filter-estado-series" v-model="filterEstado">
          <option value="all">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="viendo">Viendo</option>
          <option value="completado">Completado</option>
          <option value="droppeado">Droppeado</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="filter-favorito-series">
          <input type="checkbox" id="filter-favorito-series" v-model="filterFavorito">
          Mostrar solo Favoritos
        </label>
      </div>
      <div class="sort-group">
        <label for="sort-by-series">Ordenar por:</label>
        <select id="sort-by-series" v-model="sortBy">
          <option value="titulo-asc">Título (A-Z)</option>
          <option value="titulo-desc">Título (Z-A)</option>
          <option value="puntuacion-desc">Puntuación (Mayor)</option>
          <option value="puntuacion-asc">Puntuación (Menor)</option>
        </select>
      </div>
    </div>

    <div v-if="showForm" class="form-modal">
      <div class="form-content">
        <h3>{{ currentItem ? 'Editar' : 'Añadir' }} Serie</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="titulo-serie">Título:</label>
            <input type="text" id="titulo-serie" v-model="formValues.titulo" required>
          </div>
          <div class="form-group">
            <label for="estado-serie">Estado:</label>
            <select id="estado-serie" v-model="formValues.estado">
              <option value="pendiente">Pendiente</option>
              <option value="viendo">Viendo</option>
              <option value="completado">Completado</option>
              <option value="droppeado">Droppeado</option>
            </select>
          </div>
          <div class="form-group">
            <label for="puntuacion-serie">Puntuación (1-10):</label>
            <input type="number" id="puntuacion-serie" v-model.number="formValues.puntuacion" min="1" max="10">
          </div>
          <div class="form-group">
            <label for="nota-serie">Nota:</label>
            <textarea id="nota-serie" v-model="formValues.nota"></textarea>
          </div>
          <div class="form-group">
            <label for="imagenUrl-serie">URL de la Imagen:</label>
            <input type="text" id="imagenUrl-serie" v-model="formValues.imagenUrl">
          </div>
          <div class="form-group checkbox-group">
            <input type="checkbox" id="favorito-serie" v-model="formValues.favorito">
            <label for="favorito-serie">Marcar como Favorito</label>
          </div>
          <div class="form-actions">
            <button type="submit" class="action-button primary">{{ currentItem ? 'Actualizar' : 'Guardar' }}</button>
            <button type="button" @click="closeForm" class="action-button secondary">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <div class="media-table">
      <div class="media-table-header">
        <div class="header-cell cell-titulo">Título</div>
        <div class="header-cell cell-estado">Estado</div>
        <div class="header-cell cell-puntuacion">Puntuación</div>
        <div class="header-cell cell-favorito">Favorito</div>
        <div class="header-cell cell-acciones">Acciones</div>
      </div>

      <div v-if="filteredAndSortedItems.length === 0" class="empty-state-row">
        <p>No hay series que coincidan con los filtros actuales.</p>
      </div>
      <template v-else>
        <MediaListItem 
          v-for="item in filteredAndSortedItems" 
          :key="item.id" 
          :item="item"
          @edit="openForm(item)" 
          @delete="handleDelete(item.id)"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import type { MediaItem, MediaStatus } from '../types/media';
import MediaListItem from '../components/MediaListItem.vue';

const allItems = ref<MediaItem[]>([]);
const showForm = ref(false);
const currentItem = ref<MediaItem | null>(null);

const filterEstado = ref<MediaStatus | 'all'>('all');
const filterFavorito = ref(false);
const sortBy = ref<'titulo-asc' | 'titulo-desc' | 'puntuacion-desc' | 'puntuacion-asc'>('titulo-asc');

const initialFormValues = (): Omit<MediaItem, 'id' | 'tipo'> => ({
  titulo: '',
  estado: 'pendiente' as MediaStatus,
  puntuacion: null,
  nota: '',
  fecha_inicio: null,
  fecha_fin: null,
  favorito: false,
  imagenUrl: '',
});

const formValues = reactive(initialFormValues());

const loadMockData = () => {
  allItems.value = [
    { id: 1, titulo: 'Breaking Bad', tipo: 'serie', estado: 'completado', puntuacion: 10, nota: 'Increíble.', favorito: true, imagenUrl: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg' },
    { id: 2, titulo: 'Game of Thrones', tipo: 'serie', estado: 'completado', puntuacion: 8, favorito: false, imagenUrl: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg' },
    { id: 3, titulo: 'The Mandalorian', tipo: 'serie', estado: 'viendo', favorito: true, imagenUrl: 'https://image.tmdb.org/t/p/w500/vuAWv4q923oA12YyStg0seIZhEk.jpg' },
    { id: 4, titulo: 'Stranger Things', tipo: 'serie', estado: 'pendiente', puntuacion: 9, favorito: false, imagenUrl: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg' },
  ];
};

onMounted(() => {
  loadMockData();
});

const filteredAndSortedItems = computed(() => {
  let itemsToDisplay = [...allItems.value];
  if (filterEstado.value !== 'all') {
    itemsToDisplay = itemsToDisplay.filter(item => item.estado === filterEstado.value);
  }
  if (filterFavorito.value) {
    itemsToDisplay = itemsToDisplay.filter(item => item.favorito);
  }
  switch (sortBy.value) {
    case 'titulo-asc': itemsToDisplay.sort((a, b) => a.titulo.localeCompare(b.titulo)); break;
    case 'titulo-desc': itemsToDisplay.sort((a, b) => b.titulo.localeCompare(a.titulo)); break;
    case 'puntuacion-desc': itemsToDisplay.sort((a, b) => (b.puntuacion || 0) - (a.puntuacion || 0)); break;
    case 'puntuacion-asc': itemsToDisplay.sort((a, b) => (a.puntuacion || 0) - (b.puntuacion || 0)); break;
  }
  return itemsToDisplay;
});

const resetForm = () => {
  Object.assign(formValues, initialFormValues());
  currentItem.value = null;
}

const openForm = (itemToEdit: MediaItem | null = null) => {
  if (itemToEdit) {
    currentItem.value = { ...itemToEdit };
    formValues.titulo = itemToEdit.titulo;
    formValues.estado = itemToEdit.estado;
    formValues.puntuacion = itemToEdit.puntuacion;
    formValues.nota = itemToEdit.nota;
    formValues.favorito = itemToEdit.favorito;
    formValues.imagenUrl = itemToEdit.imagenUrl;
    formValues.fecha_inicio = itemToEdit.fecha_inicio || null;
    formValues.fecha_fin = itemToEdit.fecha_fin || null;
  } else {
    resetForm();
  }
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  resetForm();
}

const handleSubmit = () => {
  if (currentItem.value) {
    const index = allItems.value.findIndex(i => i.id === currentItem.value!.id);
    if (index !== -1) {
      allItems.value[index] = {
        ...allItems.value[index],
        ...formValues,
        tipo: 'serie'
      };
    }
  } else {
    allItems.value.push({
      id: Date.now(),
      ...formValues,
      tipo: 'serie'
    });
  }
  closeForm();
};

const handleDelete = (id: number) => {
  if (confirm('¿Estás seguro de que quieres eliminar esta serie?')) {
    allItems.value = allItems.value.filter(i => i.id !== id);
  }
};
</script>

<style scoped>
.media-view {
  padding: 1rem 0;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.view-header h2 {
  margin: 0;
  color: var(--text-color);
}

.controls-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: var(--secondary-color);
  border-radius: var(--border-radius);
  align-items: center;
}

.filter-group,
.sort-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label,
.sort-group label {
  font-weight: 500;
  color: var(--text-color-light);
}

.filter-group select,
.sort-group select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-family: inherit;
}

.filter-group input[type="checkbox"] {
  margin-right: 0.25rem;
}

.form-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}

.form-content {
  background-color: white;
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
}

.form-content h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: center;
  color: var(--primary-color);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color-light);
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group input[type="date"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-sizing: border-box;
  font-family: inherit;
  font-size: 1rem;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-group.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-group.checkbox-group label {
  margin-bottom: 0;
  font-weight: normal;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.media-table {
  display: grid;
  grid-template-columns: 2fr 1fr 100px 100px 150px; 
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.media-table-header {
  display: contents;
}

.header-cell {
  background-color: var(--secondary-color);
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: var(--text-color);
  border-bottom: 2px solid var(--primary-color);
  text-align: left;
}

.header-cell.cell-puntuacion,
.header-cell.cell-favorito,
.header-cell.cell-acciones {
  text-align: center;
}

.empty-state-row {
  grid-column: 1 / -1; 
  text-align: center;
  padding: 2rem;
  background-color: #fff;
}

.empty-state-row p {
  font-size: 1.1rem;
  color: var(--text-color-light);
  margin: 0;
}
</style>