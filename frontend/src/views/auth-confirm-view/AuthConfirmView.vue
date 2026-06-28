<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/config/supabase";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const status = ref<"loading" | "success" | "error">("loading");
const message = ref("");

onMounted(async () => {
  if (!supabase) {
    status.value = "error";
    message.value = "Supabase no está configurado.";
    return;
  }

  // Supabase detecta automáticamente el token del hash y dispara onAuthStateChange.
  // Esperamos el evento EMAIL_CHANGE (o USER_UPDATED) para confirmar.
  const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "EMAIL_CHANGE" || event === "USER_UPDATED") {
      listener.subscription.unsubscribe();
      if (session?.user) {
        authStore.user = session.user as any;
      }
      status.value = "success";
      message.value = "Email confirmado correctamente. Redirigiendo...";
      setTimeout(() => router.replace("/perfil"), 2000);
    } else if (event === "SIGNED_OUT") {
      listener.subscription.unsubscribe();
      status.value = "error";
      message.value = "El enlace no es válido o ha caducado.";
    }
  });

  // Timeout de seguridad: si en 8s no llega ningún evento, algo falló
  setTimeout(() => {
    if (status.value === "loading") {
      listener.subscription.unsubscribe();
      status.value = "error";
      message.value = "El enlace ha caducado o ya fue usado. Vuelve a solicitar el cambio.";
    }
  }, 8000);
});
</script>

<template>
  <div class="auth-confirm">
    <div class="confirm-card">
      <template v-if="status === 'loading'">
        <i class="fas fa-circle-notch fa-spin confirm-icon confirm-icon--loading"></i>
        <p class="confirm-text">Verificando tu email...</p>
      </template>
      <template v-else-if="status === 'success'">
        <i class="fas fa-check-circle confirm-icon confirm-icon--success"></i>
        <p class="confirm-text">{{ message }}</p>
      </template>
      <template v-else>
        <i class="fas fa-exclamation-triangle confirm-icon confirm-icon--error"></i>
        <p class="confirm-text">{{ message }}</p>
        <button class="confirm-btn" @click="$router.replace('/perfil')">Volver al perfil</button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.auth-confirm {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
}

.confirm-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-10) var(--space-8);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  max-width: 380px;
  width: 100%;
  text-align: center;
}

.confirm-icon {
  font-size: 3rem;

  &--loading { color: var(--color-text-muted); }
  &--success { color: #4caf50; }
  &--error   { color: #f44336; }
}

.confirm-text {
  font-size: var(--fs-base);
  color: var(--color-text-secondary);
  margin: 0;
}

.confirm-btn {
  padding: var(--space-2) var(--space-6);
  background: var(--color-primary);
  border: none;
  border-radius: var(--radius-full);
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: opacity var(--transition-fast);

  &:hover { opacity: 0.85; }
}
</style>
