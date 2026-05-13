<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import "./profile-edit-form.css";

const authStore = useAuthStore();
const emit = defineEmits(["save", "cancel"]);

const form = ref({
  displayName: authStore.user?.user_metadata?.display_name || "",
});

const isSubmitting = ref(false);

async function handleSubmit() {
  isSubmitting.value = true;
  try {
    await authStore.updateUser({ display_name: form.value.displayName });
    emit("save");
  } catch (e) {
    console.error("Error updating profile:", e);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="profile-edit-form">
    <div class="form-group">
      <label for="displayName" class="form-label">Nombre de Usuario</label>
      <input
        id="displayName"
        v-model="form.displayName"
        type="text"
        placeholder="Tu nombre..."
        class="form-input"
        autocomplete="nickname"
      />
    </div>

    <div class="form-actions">
      <button type="button" class="btn btn-glass" @click="$emit('cancel')">
        Cancelar
      </button>
      <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
        {{ isSubmitting ? "Guardando..." : "Guardar Cambios" }}
      </button>
    </div>
  </form>
</template>
