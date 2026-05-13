<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AppInput from "@/components/common/app-input/AppInput.vue";
import AppButton from "@/components/common/app-button/AppButton.vue";
import "./register-view.css";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const errors = ref<Record<string, string>>({});

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

  if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = "Las contraseñas no coinciden";
  }

  return Object.keys(errors.value).length === 0;
}

async function handleRegister() {
  if (!validate()) return;

  try {
    await authStore.signUp(email.value, password.value);
    router.push("/");
  } catch (error: any) {
    errors.value.general = error.message || "Error al registrarse";
  }
}

function goToLogin() {
  router.push("/login");
}
</script>

<template>
  <div class="register-view">
    <div class="container">
      <div class="register-container">
        <div>
          <div class="register-header">
            <h1 class="register-title">Crear Cuenta</h1>
            <p class="register-subtitle">Únete a MyMediaVerse</p>
          </div>

          <form @submit.prevent="handleRegister" class="register-form">
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

            <AppInput
              v-model="confirmPassword"
              type="password"
              label="Confirmar Contraseña"
              placeholder="••••••••"
              icon="fa-lock"
              :error="errors.confirmPassword"
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
              Crear Cuenta
            </AppButton>
          </form>

          <div class="register-footer">
            <p>¿Ya tienes cuenta?</p>
            <AppButton variant="ghost" @click="goToLogin">
              Inicia sesión aquí
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
