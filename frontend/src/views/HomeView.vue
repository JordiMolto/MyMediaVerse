<template>
  <div class="home-view">
    <section class="hero-section">
      <template v-if="!isLoggedIn">
        <h2>Bienvenido a MyMediaVerse</h2>
        <p class="subtitle">Tu universo personal para organizar y descubrir series, películas y animes.</p>
        <div class="actions">
          <router-link to="/register" class="action-button primary">Crear Cuenta</router-link>
          <router-link to="/login" class="action-button secondary">Iniciar Sesión</router-link>
        </div>
        <p class="explore-text">O simplemente <router-link to="/movies">explora como invitado</router-link>.</p>
      </template>
      <template v-else>
        <h2>¡Hola de nuevo, MediaNauta!</h2>
        <p class="subtitle">Listo para sumergirte en tu universo multimedia.</p>
        <div class="actions quick-add">
          <button @click="goToAndOpenForm('/movies')" class="action-button primary small-padding">
            <i class="fas fa-film"></i> Añadir Película
          </button>
          <button @click="goToAndOpenForm('/series')" class="action-button primary small-padding">
            <i class="fas fa-tv"></i> Añadir Serie
          </button>
          <button @click="goToAndOpenForm('/animes')" class="action-button primary small-padding">
            <i class="fas fa-dragon"></i> Añadir Anime
          </button>
        </div>
      </template>
    </section>

    <section class="features-section" v-if="!isLoggedIn">
      <h3>Descubre lo que Puedes Hacer</h3>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon"><i class="fas fa-save"></i></div>
          <h4>Registra Todo</h4>
          <p>Lleva un control detallado de lo que has visto, estás viendo o quieres ver.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon"><i class="fas fa-star-half-alt"></i></div>
          <h4>Puntúa y Comenta</h4>
          <p>Guarda tus opiniones, notas personales y puntuaciones para no olvidar nada.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon"><i class="fas fa-tags"></i></div>
          <h4>Organiza Fácilmente</h4>
          <p>Usa estados y favoritos para encontrar rápidamente lo que buscas.</p>
        </div>
      </div>
    </section>

    <section class="explore-collections-section">
      <h3>Explora Tus Colecciones</h3>
      <div class="collections-grid">
        <router-link to="/movies" class="collection-card movies-bg">
          <div class="collection-icon-alt"><i class="fas fa-film"></i></div>
          <h4>Películas</h4>
          <p>Tu cinemateca personal.</p>
        </router-link>
        <router-link to="/series" class="collection-card series-bg">
          <div class="collection-icon-alt"><i class="fas fa-tv"></i></div>
          <h4>Series</h4>
          <p>Maratones y temporadas.</p>
        </router-link>
        <router-link to="/animes" class="collection-card animes-bg">
          <div class="collection-icon-alt"><i class="fas fa-dragon"></i></div>
          <h4>Animes</h4>
          <p>Animación de todo el mundo.</p>
        </router-link>
      </div>
    </section>

    <section v-if="isLoggedIn" class="recent-activity-section">
        <h3>Tu Actividad Reciente</h3>
        <div class="media-list-preview">
            <div v-for="item in recentActivityItems" :key="item.id" class="media-card-preview">
                <img :src="item.imagenUrl || 'https://via.placeholder.com/150x225.png?text=' + encodeURIComponent(item.titulo)" :alt="item.titulo" class="media-image-preview">
                <div class="media-card-preview-content">
                    <h5>{{ item.titulo }}</h5>
                    <span class="media-type-badge">{{ item.tipo }}</span>
                    <p class="recent-status">Estado: {{ item.estado }}</p>
                </div>
            </div>
        </div>
        <div class="view-all-cta">
          <router-link to="/movies" class="action-button secondary">Ver todas mis películas</router-link>
        </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const isLoggedIn = ref(false); // Cambia a true para simular estar logueado
const router = useRouter();

const goToAndOpenForm = (path: string) => {
  router.push(path);
  setTimeout(() => {
    alert(`Navegando a ${path} y simulando apertura de formulario.\n(Esta parte requiere lógica adicional en la vista de destino)`);
  }, 100);
};

interface ActivityMediaItem {
  id: number;
  titulo: string;
  tipo: 'película' | 'serie' | 'anime';
  estado: 'viendo' | 'completado' | 'pendiente'; // Estados relevantes para actividad reciente
  imagenUrl?: string;
}

const allMockItems = ref<ActivityMediaItem[]>([]);

const recentActivityItems = computed(() => {
  // Simula tomar los 3 más "recientes" o "activos"
  return allMockItems.value.slice(0, 3);
});

const loadMockData = () => {
  allMockItems.value = [
    { id: 1, titulo: 'Inception', tipo: 'película', estado: 'completado', imagenUrl: 'https://image.tmdb.org/t/p/w300/9gk7adHYeDvHkWTKZXMravGs_P.jpg' },
    { id: 2, titulo: 'Dune (2021)', tipo: 'película', estado: 'viendo', imagenUrl: 'https://image.tmdb.org/t/p/w300/d5NXSklXo0qyIYkgV94XAgMIckC.jpg' },
    { id: 3, titulo: 'Breaking Bad', tipo: 'serie', estado: 'viendo', imagenUrl: 'https://image.tmdb.org/t/p/w300/ggFHVNu6YYI5L9pCfOacjizRGt.jpg' },
    { id: 4, titulo: 'Attack on Titan', tipo: 'anime', estado: 'pendiente', imagenUrl: 'https://image.tmdb.org/t/p/w300/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg' },
    { id: 5, titulo: 'The Mandalorian', tipo: 'serie', estado: 'completado', imagenUrl: 'https://image.tmdb.org/t/p/w300/vuAWv4q923oA12YyStg0seIZhEk.jpg' },
  ];
};

onMounted(() => {
  loadMockData();
});

</script>

<style scoped>
.home-view {
  padding-bottom: 3rem;
}

.hero-section {
  text-align: center;
  padding: 3rem 1.5rem;
  background-color: var(--secondary-color);
  border-radius: var(--border-radius);
  margin-bottom: 3rem;
}

.hero-section h2 {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  color: var(--primary-color);
}

.subtitle {
  font-size: 1.15rem;
  color: var(--text-color-light);
  margin-bottom: 2rem;
  max-width: 650px;
  margin-left: auto;
  margin-right: auto;
}

.actions {
  margin-bottom: 1.5rem;
}

.actions .action-button {
  margin: 0.5rem;
  padding: 12px 25px;
  font-size: 1.05rem;
}
.actions.quick-add .action-button {
  margin: 0.5rem 0.3rem;
}

.action-button.secondary {
  background-color: transparent;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
}

.action-button.secondary:hover {
  background-color: var(--primary-color);
  color: white;
}

.action-button.small-padding {
  padding: 10px 18px;
  font-size: 0.95rem;
}

.action-button i {
  margin-right: 0.5em;
}

.explore-text {
  margin-top: 1.5rem;
  font-size: 0.95rem;
  color: var(--text-color-light);
}

.explore-text a {
  font-weight: 600;
}

/* Estilos para Explora Tus Colecciones (Rediseñados) */
.explore-collections-section {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;
}

.explore-collections-section h3 {
  font-size: 2rem;
  color: var(--text-color);
  margin-bottom: 2.5rem;
}

.collections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem; /* Reducido el gap un poco */
}

.collection-card {
  padding: 2.5rem 1.5rem;
  border-radius: var(--border-radius);
  text-decoration: none;
  color: white; /* Texto blanco para contraste */
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px; /* Altura mínima */
}

.collection-card:hover {
  transform: scale(1.03);
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
  filter: brightness(1.1);
}

.movies-bg {
  background: linear-gradient(135deg, #4A90E2, #357ABD);
}
.series-bg {
  background: linear-gradient(135deg, #50E3C2, #38A89D);
}
.animes-bg {
  background: linear-gradient(135deg, #F5A623, #D08C1B);
}

.collection-icon-alt {
  font-size: 3.5rem; /* Icono más grande */
  margin-bottom: 1rem;
}

.collection-card h4 {
  font-size: 1.6rem; /* Título más grande */
  color: white;
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.collection-card p {
  font-size: 0.95rem;
  color: rgba(255,255,255,0.85);
  line-height: 1.5;
  max-width: 90%; /* Evitar que el texto sea demasiado ancho */
}

/* Estilos de Features Section */
.features-section {
  text-align: center;
  margin-bottom: 3rem;
}

.features-section h3 {
  font-size: 2rem;
  color: var(--text-color);
  margin-bottom: 2.5rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background-color: white;
  padding: 2rem 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  text-align: center;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.feature-card h4 {
  font-size: 1.35rem;
  color: var(--primary-color);
  margin-top: 0;
  margin-bottom: 0.75rem;
}
.feature-card p {
    font-size: 0.95rem;
    color: var(--text-color-light);
}

/* Estilos para Tu Actividad Reciente */
.recent-activity-section {
    text-align: center;
    padding: 2.5rem 0;
    margin-bottom: 2rem;
}

.recent-activity-section h3 {
    font-size: 2rem;
    color: var(--text-color);
    margin-bottom: 2.5rem;
}

.media-list-preview {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1.5rem;
    padding: 0 1rem;
    max-width: 1000px; /* Ajustado para 3 tarjetas cómodas */
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 2.5rem;
}

.media-card-preview {
    background-color: white;
    border-radius: var(--border-radius);
    box-shadow: var(--card-shadow);
    overflow: hidden;
    width: 220px; /* Un poco más anchas */
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    display: flex;
    flex-direction: column;
}

.media-card-preview:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 18px rgba(0,0,0,0.1);
}

.media-image-preview {
    width: 100%;
    height: 280px; /* Altura ajustada */
    object-fit: cover;
}

.media-card-preview-content {
    padding: 1rem;
    text-align: left;
    flex-grow: 1; /* Para que el contenido ocupe espacio */
    display: flex;
    flex-direction: column;
}

.media-card-preview-content h5 {
    font-size: 1.05rem; /* Ligeramente ajustado */
    color: var(--primary-color);
    margin: 0 0 0.5rem 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.media-type-badge {
    display: inline-block;
    padding: 0.25em 0.6em;
    font-size: 0.7rem; /* Un poco más pequeño */
    font-weight: 600;
    background-color: var(--primary-color-dark);
    color: white;
    border-radius: 4px;
    margin-bottom: 0.5rem; /* Espacio debajo del badge */
    align-self: flex-start; /* Alinear a la izquierda */
}

.recent-status {
    font-size: 0.85rem;
    color: var(--text-color-light);
    margin-top: auto; /* Empuja el estado al final de la tarjeta */
}

.view-all-cta {
    margin-top: 1rem;
}
</style> 