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

const mode = ref<"login" | "forgot">("login");
const forgotEmail = ref("");
const forgotSent = ref(false);
const forgotError = ref("");

function validate(): boolean {
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

  return Object.keys(errors.value).length === 0;
}

async function handleLogin() {
  if (!validate()) return;

  try {
    await authStore.signIn(email.value, password.value);
    router.push("/");
  } catch (error: any) {
    errors.value.general = error.message || "Error al iniciar sesión";
  }
}

async function handleForgotPassword() {
  forgotError.value = "";
  if (!forgotEmail.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.value)) {
    forgotError.value = "Introduce un email válido";
    return;
  }
  try {
    await authStore.resetPassword(forgotEmail.value);
    forgotSent.value = true;
  } catch (e: any) {
    forgotError.value = e.message || "Error al enviar el correo";
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
        <div v-if="mode === 'login'">
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

            <button type="button" class="forgot-link" @click="mode = 'forgot'">
              ¿Olvidaste tu contraseña?
            </button>

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
            <AppButton variant="ghost" @click="goToRegister">Regístrate aquí</AppButton>
          </div>

          <div class="local-mode-notice">
            <i class="fas fa-info-circle"></i>
            <p>También puedes usar la app sin cuenta (solo local)</p>
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

        <div v-else>
          <div class="login-header">
            <h1 class="login-title">Recuperar contraseña</h1>
            <p class="login-subtitle">Te enviaremos un enlace para restablecerla</p>
          </div>

          <div v-if="forgotSent" class="success-message">
            <i class="fas fa-check-circle"></i>
            Correo enviado a <strong>{{ forgotEmail }}</strong>. Revisa tu bandeja de entrada.
          </div>

          <form v-else @submit.prevent="handleForgotPassword" class="login-form">
            <AppInput
              v-model="forgotEmail"
              type="email"
              label="Tu email"
              placeholder="tu@email.com"
              icon="fa-envelope"
              :error="forgotError"
              required
            />

            <AppButton
              type="submit"
              variant="primary"
              size="large"
              :loading="authStore.loading"
              full-width
            >
              Enviar enlace
            </AppButton>
          </form>

          <div class="login-footer">
            <AppButton variant="ghost" @click="mode = 'login'">
              <i class="fas fa-arrow-left"></i> Volver al inicio de sesión
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
