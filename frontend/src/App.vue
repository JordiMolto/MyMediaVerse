<template>
  <div id="app-wrapper">
    <header class="app-header">
      <div class="container header-container">
        <router-link to="/" class="logo">
          <h1>MyMediaVerse</h1>
        </router-link>
        <nav class="main-nav">
          <router-link to="/" class="nav-link">Inicio</router-link>
          <router-link to="/movies" class="nav-link">Películas</router-link>
          <router-link to="/series" class="nav-link">Series</router-link>
          <router-link to="/animes" class="nav-link">Animes</router-link>

          <!-- Enlaces de autenticación condicionales -->
          <template v-if="!isLoggedIn">
            <router-link to="/login" class="nav-link icon-link" title="Login">
              <i class="fas fa-sign-in-alt"></i>
            </router-link>
            <router-link to="/register" class="nav-link icon-link" title="Registro">
              <i class="fas fa-user-plus"></i>
            </router-link>
          </template>
          <template v-else>
            <router-link to="/profile" class="nav-link icon-link" title="Perfil">
              <i class="fas fa-user-circle"></i>
            </router-link>
            <a @click="handleLogout" class="nav-link icon-link" title="Logout" style="cursor: pointer;">
              <i class="fas fa-sign-out-alt"></i>
            </a>
          </template>
        </nav>
      </div>
    </header>

    <main class="app-main">
      <div class="container">
        <router-view />
      </div>
    </main>

    <footer class="app-footer">
      <div class="container">
        <p>&copy; {{ new Date().getFullYear() }} MyMediaVerse. Todos los derechos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// Simulamos el estado de autenticación
// En una aplicación real, esto vendría de Vuex/Pinia o localStorage tras un login exitoso
const isLoggedIn = ref(false); // Cambia a true para simular estar logueado

const router = useRouter();

const handleLogout = () => {
  isLoggedIn.value = false;
  // TODO: Aquí también limpiarías el token JWT de localStorage
  console.log('Usuario ha cerrado sesión (simulado)');
  router.push('/'); // Redirigir a la página de inicio después del logout
};

// Podrías tener una función para simular el login y poner isLoggedIn a true
// const simulateLogin = () => isLoggedIn.value = true;
</script>

<style scoped>
#app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--background-color);
}

.app-header {
  background: linear-gradient(90deg, var(--primary-color), var(--primary-color-dark));
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo h1 {
  margin: 0;
  font-size: 1.8rem;
  color: white; /* El color del h1 global se sobreescribe aquí */
  font-weight: 700;
}

.logo:hover h1 {
  text-decoration: none; /* Evita el subrayado del link global */
}

.main-nav {
  display: flex;
  align-items: center; /* Para alinear los iconos verticalmente con el texto si es necesario */
  gap: 1.5rem; /* Espacio entre links */
}

.nav-link {
  color: white;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.5rem 0;
  position: relative;
  transition: color 0.3s ease;
}

.nav-link.icon-link {
  font-size: 1.2rem; /* Hacer los iconos un poco más grandes */
  padding: 0.5rem 0.2rem; /* Ajustar padding para iconos */
}

.nav-link.icon-link i {
  vertical-align: middle;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: white;
  transition: width 0.3s ease;
}

.nav-link:hover::after,
.nav-link.router-link-exact-active::after {
  width: 100%;
}

.nav-link.router-link-exact-active {
  font-weight: 700;
}

/* Para el enlace de logout que no es un router-link */
.nav-link[style*="cursor: pointer"]:hover {
  color: #ddd; /* Un ligero cambio de color al pasar el ratón */
}
.nav-link[style*="cursor: pointer"]::after {
    background-color: #ddd; /* Color del subrayado para el enlace de logout */
}

.app-main {
  flex-grow: 1;
  padding-top: 2rem; /* Espacio después del header */
  padding-bottom: 2rem; /* Espacio antes del footer */
}

.app-footer {
  background-color: var(--text-color);
  color: var(--secondary-color);
  padding: 2rem 0;
  text-align: center;
  font-size: 0.9rem;
}

.app-footer p {
  margin: 0;
  color: var(--secondary-color); /* Párrafos del footer también claros */
}
</style> 