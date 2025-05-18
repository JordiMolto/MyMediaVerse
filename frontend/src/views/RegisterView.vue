<template>
  <div class="auth-view">
    <div class="auth-form-container">
      <h2>Crear Cuenta</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="email" required>
        </div>
        <div class="form-group">
          <label for="password">Contraseña:</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirmar Contraseña:</label>
          <input type="password" id="confirmPassword" v-model="confirmPassword" required>
        </div>
        <div class="form-actions">
          <button type="submit" class="action-button primary">Registrarse</button>
        </div>
        <p class="switch-form-text">
          ¿Ya tienes una cuenta? <router-link to="/login">Inicia sesión aquí</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const router = useRouter();

const handleRegister = () => {
  // TODO: Implementar lógica de registro
  // - Validar campos (ej: que las contraseñas coincidan)
  // - Enviar petición al backend (POST /api/auth/register)
  // - Manejar respuesta (redirigir a login, mostrar mensaje de éxito/error)
  if (password.value !== confirmPassword.value) {
    alert('Las contraseñas no coinciden.');
    return;
  }
  console.log('Register attempt:', { email: email.value, password: password.value });
  alert('Lógica de registro pendiente de implementación.');
  // Ejemplo de redirección tras registro exitoso (lo harías dentro del then/catch de la llamada a la API)
  // router.push('/login');
};
</script>

<style scoped>
/* Estilos idénticos a LoginView.vue, se pueden extraer a un CSS común si se desea */
.auth-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 180px); /* Ajustar según altura de header/footer */
  padding: 2rem;
}

.auth-form-container {
  background-color: var(--secondary-color);
  padding: 2rem 2.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  width: 100%;
  max-width: 400px;
}

.auth-form-container h2 {
  text-align: center;
  color: var(--primary-color);
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color-light);
}

.form-group input[type="email"],
.form-group input[type="password"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-sizing: border-box;
  font-family: inherit;
  font-size: 1rem;
}

.form-actions {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}

.form-actions .action-button {
  width: 100%;
  padding: 0.8rem;
}

.switch-form-text {
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-color-light);
}

.switch-form-text a {
  color: var(--primary-color);
  font-weight: 500;
}
</style> 