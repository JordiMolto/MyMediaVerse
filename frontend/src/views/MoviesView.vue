<template>
  <div class="media-view">
    <header class="view-header">
      <h2>Películas</h2>
      <button @click="openForm()" class="action-button">Añadir Película</button>
    </header>

    <!-- Controles de Filtro y Ordenación -->
    <div class="controls-bar">
      <div class="filter-group">
        <label for="filter-estado">Filtrar por Estado:</label>
        <select id="filter-estado" v-model="filterEstado">
          <option value="all">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="viendo">Viendo</option>
          <option value="completado">Completado</option>
          <option value="droppeado">Droppeado</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="filter-favorito">
          <input type="checkbox" id="filter-favorito" v-model="filterFavorito">
          Mostrar solo Favoritos
        </label>
      </div>
      <div class="sort-group">
        <label for="sort-by">Ordenar por:</label>
        <select id="sort-by" v-model="sortBy">
          <option value="titulo-asc">Título (A-Z)</option>
          <option value="titulo-desc">Título (Z-A)</option>
          <option value="puntuacion-desc">Puntuación (Mayor)</option>
          <option value="puntuacion-asc">Puntuación (Menor)</option>
        </select>
      </div>
    </div>

    <!-- Formulario para Añadir/Editar (Modal) -->
    <div v-if="showForm" class="form-modal">
      <div class="form-content">
        <h3>{{ currentItem ? 'Editar' : 'Añadir' }} Película</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="titulo">Título:</label>
            <input type="text" id="titulo" v-model="formValues.titulo" required>
          </div>
          <div class="form-group">
            <label for="estado">Estado:</label>
            <select id="estado" v-model="formValues.estado">
              <option value="pendiente">Pendiente</option>
              <option value="viendo">Viendo</option>
              <option value="completado">Completado</option>
              <option value="droppeado">Droppeado</option>
            </select>
          </div>
          <div class="form-group">
            <label for="puntuacion">Puntuación (1-10):</label>
            <input type="number" id="puntuacion" v-model.number="formValues.puntuacion" min="1" max="10">
          </div>
          <div class="form-group">
            <label for="nota">Nota:</label>
            <textarea id="nota" v-model="formValues.nota"></textarea>
          </div>
          <div class="form-group">
            <label for="imagenUrl">URL de la Imagen:</label>
            <input type="text" id="imagenUrl" v-model="formValues.imagenUrl">
            <!-- TODO Backend: Reemplazar con un input de tipo file y lógica de subida de archivos -->
          </div>
          <div class="form-group checkbox-group">
            <input type="checkbox" id="favorito" v-model="formValues.favorito">
            <label for="favorito">Marcar como Favorito</label>
          </div>
          <div class="form-actions">
            <button type="submit" class="action-button primary">{{ currentItem ? 'Actualizar' : 'Guardar' }}</button>
            <button type="button" @click="closeForm" class="action-button secondary">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Nueva estructura de "Tabla" con Divs -->
    <div class="media-table">
      <div class="media-table-header">
        <div class="header-cell cell-titulo">Título</div>
        <div class="header-cell cell-estado">Estado</div>
        <div class="header-cell cell-puntuacion">Puntuación</div>
        <div class="header-cell cell-favorito">Favorito</div>
        <div class="header-cell cell-acciones">Acciones</div>
      </div>

      <div v-if="filteredAndSortedItems.length === 0" class="empty-state-row">
        <p>No hay películas que coincidan con los filtros actuales. Intenta cambiarlos o añade una nueva película.</p>
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
import MediaListItem from '../components/MediaListItem.vue'; // Cambiado de MediaCard a MediaListItem

const allItems = ref<MediaItem[]>([]); // Todos los items cargados
const showForm = ref(false);
const currentItem = ref<MediaItem | null>(null);

// Filtros y Ordenación
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

// TODO: Estos datos serán cargados desde el backend
const loadMockData = () => {
  allItems.value = [
    { id: 1, titulo: 'Inception', tipo: 'película', estado: 'completado', puntuacion: 10, nota: 'Una obra maestra.', favorito: true, imagenUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkWTKZXMravGs_P.jpg' },
    { id: 2, titulo: 'The Matrix', tipo: 'película', estado: 'completado', puntuacion: 9, favorito: false, imagenUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' },
    { id: 3, titulo: 'Dune (2021)', tipo: 'película', estado: 'viendo', nota: 'Visualmente impresionante.', favorito: true, imagenUrl: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg' },
    { id: 4, titulo: 'Interstellar', tipo: 'película', estado: 'pendiente', puntuacion: 9, favorito: false },
  ];
};

onMounted(() => {
  // TODO Backend: Llamar a la API para obtener películas: GET /api/movies (con posibles parámetros de filtro/ordenación desde el inicio)
  console.log('MoviesView: Cargando datos mock...');
  loadMockData();
});

const filteredAndSortedItems = computed(() => {
  let itemsToDisplay = [...allItems.value];

  // Aplicar filtro por estado
  if (filterEstado.value !== 'all') {
    itemsToDisplay = itemsToDisplay.filter(item => item.estado === filterEstado.value);
  }

  // Aplicar filtro por favorito
  if (filterFavorito.value) {
    itemsToDisplay = itemsToDisplay.filter(item => item.favorito);
  }

  // Aplicar ordenación
  // TODO Backend: Idealmente, el backend debería manejar la ordenación y paginación por eficiencia.
  switch (sortBy.value) {
    case 'titulo-asc':
      itemsToDisplay.sort((a, b) => a.titulo.localeCompare(b.titulo));
      break;
    case 'titulo-desc':
      itemsToDisplay.sort((a, b) => b.titulo.localeCompare(a.titulo));
      break;
    case 'puntuacion-desc':
      itemsToDisplay.sort((a, b) => (b.puntuacion || 0) - (a.puntuacion || 0));
      break;
    case 'puntuacion-asc':
      itemsToDisplay.sort((a, b) => (a.puntuacion || 0) - (b.puntuacion || 0));
      break;
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
    // Asegurarse de no pasar fechas null directamente si el input no lo maneja bien
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
  // TODO Backend: Aquí es donde harías la llamada a la API (POST para crear, PUT para actualizar)
  // La API debería manejar la subida de imagen si se implementa de forma nativa.
  // Por ahora, solo actualizamos los datos mock.

  if (currentItem.value) {
    // Actualizar
    // TODO: Llamar a la API para actualizar: PUT /api/movies/:id
    const index = allItems.value.findIndex(i => i.id === currentItem.value!.id);
    if (index !== -1) {
      allItems.value[index] = { ...currentItem.value, ...formValues, tipo: 'película' };
      console.log('MoviesView: Actualizando película (mock)', allItems.value[index]);
    }
  } else {
    // Crear
    // TODO: Llamar a la API para crear: POST /api/movies
    const newItem: MediaItem = {
      id: Date.now(), // ID temporal para el mock
      ...formValues,
      tipo: 'película',
    };
    allItems.value.push(newItem);
    console.log('MoviesView: Creando nueva película (mock)', newItem);
  }
  closeForm();
};

const handleDelete = (id: number) => {
  if (confirm('¿Estás seguro de que quieres eliminar esta película?')) {
    // TODO: Llamar a la API para eliminar: DELETE /api/movies/:id
    allItems.value = allItems.value.filter(i => i.id !== id);
    console.log('MoviesView: Eliminando película (mock)', id);
  }
};

</script>

<style scoped>
/* Estilos generales para las vistas de media */
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

/* Estilos del Modal del Formulario */
.form-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001; /* Encima del header */
}

.form-content {
  background-color: white;
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
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
.form-group input[type="date"], /* Para las fechas */
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* Estilos para la lista y tarjetas */
.media-table {
  display: grid;
  /* Ajusta las columnas: Título (flexible), Estado, Puntuación, Favorito, Acciones (fijas o auto) */
  grid-template-columns: 2fr 1fr 100px 100px 150px; 
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  overflow: hidden; /* Para que el border-radius afecte a los hijos */
}

.media-table-header {
  display: contents; /* Hace que los hijos se comporten como directos del grid padre */
}

.header-cell {
  background-color: var(--secondary-color);
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: var(--text-color);
  border-bottom: 2px solid var(--primary-color); /* Borde más grueso para cabecera */
  text-align: left;
}

.header-cell.cell-puntuacion,
.header-cell.cell-favorito,
.header-cell.cell-acciones {
  text-align: center;
}

.empty-state-row {
  /* Ocupa todas las columnas del grid */
  grid-column: 1 / -1; 
  text-align: center;
  padding: 2rem;
  background-color: #fff; /* Fondo claro para el mensaje de vacío */
}

.empty-state-row p {
  font-size: 1.1rem;
  color: var(--text-color-light);
  margin: 0;
}

/* Nuevos estilos para la barra de controles */
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

.filter-group, .sort-group {
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

/* Estilos para las tarjetas con imagen */
.media-card {
  /* background-color: var(--secondary-color); Ya estaba */
  /* padding: 1.5rem; Ya estaba */
  /* border-radius: var(--border-radius); Ya estaba */
  /* box-shadow: var(--card-shadow); Ya estaba */
  display: flex; /* Asegura que el contenido se alinee bien */
  flex-direction: column;
  overflow: hidden; /* Para que la imagen no se salga si es muy grande */
}

.media-image {
  width: 100%;
  height: 300px; /* Altura fija para la imagen, ajusta según necesites */
  object-fit: cover; /* Cubre el área sin distorsionar, puede cortar partes */
  margin-bottom: 1rem;
  border-radius: var(--border-radius) var(--border-radius) 0 0; /* Redondear solo esquinas superiores si la imagen está arriba */
}

.media-card-content {
    padding: 0 1.5rem 1.5rem; /* Padding para el contenido debajo de la imagen */
    display: flex;
    flex-direction: column;
    flex-grow: 1; /* Para que ocupe el espacio y empuje las acciones abajo */
}

.media-card h4 {
  /* margin-top: 0; Ya estaba */
  /* margin-bottom: 0.75rem; Ya estaba */
  /* color: var(--primary-color); Ya estaba */
  display: flex; /* Para alinear el título y la estrella */
  justify-content: space-between;
  align-items: center;
}

.media-card h4 span {
  font-size: 1.2rem; /* Tamaño de la estrella */
  color: #ffc107; /* Color amarillo para la estrella */
}

.nota-text {
    flex-grow: 1; /* Para que la nota ocupe el espacio disponible */
    margin-bottom: 1rem; /* Espacio antes de los botones de acción */
}

.form-group.checkbox-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.form-group.checkbox-group label {
    margin-bottom: 0; /* Quitar margen inferior para label de checkbox */
    font-weight: normal; /* Puede ser más ligero */
}
</style> 