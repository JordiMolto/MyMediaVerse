<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AppInput from "@/components/common/app-input/AppInput.vue";
import AppButton from "@/components/common/app-button/AppButton.vue";
import "./login-view.css";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const errors = ref<Record<string, string>>({});

function validate(): boolean {
  console.log("Validating login form...");
  errors.value = {};

  if (!email.value.trim()) {
    errors.value.email = "El email es obligatorio";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = "Email inválido";
  }

  if (!password.value) {
    errors.value.password = "La contraseña es obligatoria";
  } else if (password.value.length < 6) {
    errors.value.password = "La contraseña debe tener al menos 6 caracteres";
  }

  const isValid = Object.keys(errors.value).length === 0;
  console.log("Form is valid:", isValid, errors.value);
  return isValid;
}

async function handleLogin() {
  console.log("handleLogin called");
  if (!validate()) return;

  try {
    console.log("Attempting signIn through store...");
    await authStore.signIn(email.value, password.value);
    console.log("SignIn successful, redirecting to home...");
    router.push("/");
  } catch (error: any) {
    console.error("Login error in view:", error);
    errors.value.general = error.message || "Error al iniciar sesión";
  }
}

function goToRegister() {
  router.push("/register");
}
</script>

<template>
  <div class="login-view">
    <div class="container">
      <div class="login-container">
        <div>
          <div class="login-header">
            <h1 class="login-title">Iniciar Sesión</h1>
            <p class="login-subtitle">Accede a tu cuenta de MyMediaVerse</p>
          </div>

          <form @submit.prevent="handleLogin" class="login-form">
            <AppInput
              v-model="email"
              type="email"
              label="Email"
              placeholder="tu@email.com"
              icon="fa-envelope"
              :error="errors.email"
              required
            />

            <AppInput
              v-model="password"
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              icon="fa-lock"
              :error="errors.password"
              required
            />

            <div v-if="errors.general" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ errors.general }}
            </div>

            <AppButton
              type="submit"
              variant="primary"
              size="large"
              :loading="authStore.loading"
              full-width
            >
              Iniciar Sesión
            </AppButton>
          </form>

          <div class="login-footer">
            <p>¿No tienes cuenta?</p>
            <AppButton variant="ghost" @click="goToRegister">
              Regístrate aquí
            </AppButton>
          </div>

          <div class="local-mode-notice">
            <i class="fas fa-info-circle"></i>
            <p>También puedes usar la app sin cuenta (solo local)</p>
            <div class="test-actions">
              <AppButton variant="ghost" size="small" @click="router.push('/')">
                Continuar sin cuenta
              </AppButton>
              <AppButton
                variant="ghost"
                size="small"
                @click="
                  email = 'test@example.com';
                  password = 'password123';
                  handleLogin();
                "
              >
                <i class="fas fa-vial"></i> Acceso de Test
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
