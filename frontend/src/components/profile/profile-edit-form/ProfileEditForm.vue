<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import "./profile-edit-form.css";

const authStore = useAuthStore();
const emit = defineEmits(["save", "cancel"]);

const displayName = ref(authStore.user?.user_metadata?.display_name || "");
const isSubmittingName = ref(false);
const nameSaved = ref(false);

const newEmail = ref("");
const isSubmittingEmail = ref(false);
const emailSent = ref(false);
const emailError = ref("");

async function handleSaveName() {
  isSubmittingName.value = true;
  nameSaved.value = false;
  try {
    await authStore.updateUser({ display_name: displayName.value });
    nameSaved.value = true;
    setTimeout(() => emit("save"), 800);
  } catch (e) {
    console.error("Error updating profile:", e);
  } finally {
    isSubmittingName.value = false;
  }
}

async function handleChangeEmail() {
  emailError.value = "";
  emailSent.value = false;

  if (!newEmail.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.value)) {
    emailError.value = "Introduce un email válido";
    return;
  }
  if (newEmail.value === authStore.user?.email) {
    emailError.value = "El email es el mismo que el actual";
    return;
  }

  isSubmittingEmail.value = true;
  try {
    await authStore.updateEmail(newEmail.value);
    emailSent.value = true;
    newEmail.value = "";
  } catch (e: any) {
    emailError.value = e.message || "Error al cambiar el email";
  } finally {
    isSubmittingEmail.value = false;
  }
}
</script>

<template>
  <div class="profile-edit-form">
    <section class="form-section">
      <h3 class="section-title">Nombre de Usuario</h3>
      <div class="form-group">
        <label for="displayName" class="form-label">Nombre visible</label>
        <input
          id="displayName"
          v-model="displayName"
          type="text"
          placeholder="Tu nombre..."
          class="form-input"
          autocomplete="nickname"
        />
      </div>
      <div class="form-actions form-actions--inline">
        <button type="button" class="btn btn-glass" @click="$emit('cancel')">Cancelar</button>
        <button
          type="button"
          class="btn btn-primary"
          :disabled="isSubmittingName"
          @click="handleSaveName"
        >
          {{ isSubmittingName ? "Guardando..." : nameSaved ? "¡Guardado!" : "Guardar nombre" }}
        </button>
      </div>
    </section>

    <template v-if="!authStore.isMock">
      <div class="section-divider"></div>

      <section class="form-section">
        <h3 class="section-title">Cambiar email</h3>
        <p class="form-hint" style="margin-bottom: var(--space-4)">
          Email actual: <strong>{{ authStore.user?.email }}</strong>
        </p>

        <div v-if="emailSent" class="inline-success">
          <i class="fas fa-check-circle"></i>
          Revisa tu nuevo correo para confirmar el cambio.
        </div>

        <template v-else>
          <div class="form-group">
            <label for="newEmail" class="form-label">Nuevo email</label>
            <input
              id="newEmail"
              v-model="newEmail"
              type="email"
              placeholder="nuevo@email.com"
              class="form-input"
              :class="{ 'form-input--error': emailError }"
              autocomplete="email"
            />
            <span v-if="emailError" class="form-error">{{ emailError }}</span>
          </div>
          <div class="form-actions form-actions--inline">
            <button
              type="button"
              class="btn btn-primary"
              :disabled="isSubmittingEmail"
              @click="handleChangeEmail"
            >
              {{ isSubmittingEmail ? "Enviando..." : "Cambiar email" }}
            </button>
          </div>
        </template>
      </section>
    </template>
  </div>
</template>
