<script setup lang="ts">
import { ref } from "vue";
import AppInput from "@/components/common/app-input/AppInput.vue";
import AppButton from "@/components/common/app-button/AppButton.vue";
import AppSelect from "@/components/common/app-select/AppSelect.vue";
import { HitoType } from "@/types";
import "./note-form.css";

interface Props {
  itemId: string;
  initialText?: string;
  initialSpoilers?: boolean;
  initialHito?: HitoType;
}

const props = withDefaults(defineProps<Props>(), {
  initialText: "",
  initialSpoilers: false,
  initialHito: HitoType.NONE,
});

const emit = defineEmits<{
  save: [data: { texto: string; spoilers: boolean; hito: HitoType }];
  cancel: [];
}>();

const texto = ref(props.initialText);
const spoilers = ref(props.initialSpoilers);
const hito = ref<HitoType>(props.initialHito);
const error = ref("");

const hitoOptions = [
  { value: HitoType.NONE, label: "Ninguno" },
  { value: HitoType.START, label: "Empezado" },
  { value: HitoType.HALF, label: "Mitad de camino" },
  { value: HitoType.END, label: "Finalizado" },
  { value: HitoType.REWATCH, label: "Re-consumo (Re-watch/read)" },
];

function validate(): boolean {
  error.value = "";
  if (!texto.value.trim()) {
    error.value = "El texto de la nota es obligatorio";
    return false;
  }
  return true;
}

function handleSubmit() {
  if (!validate()) return;
  emit("save", {
    texto: texto.value.trim(),
    spoilers: spoilers.value,
    hito: hito.value,
  });
}

function handleCancel() {
  emit("cancel");
}
</script>

<template>
  <form class="note-form" @submit.prevent="handleSubmit">
    <div class="form-row">
      <AppSelect
        v-model="hito"
        :options="hitoOptions"
        label="Hito / Evento"
        icon="fa-flag"
      />
    </div>

    <AppInput
      v-model="texto"
      type="textarea"
      label="Nota / Pensamiento"
      placeholder="Escribe tu nota aquí..."
      :rows="6"
      required
      :error="error"
    />

    <div class="spoiler-checkbox">
      <label class="checkbox-label">
        <input v-model="spoilers" type="checkbox" class="checkbox-input" />
        <span class="checkbox-text">
          <i class="fas fa-exclamation-triangle warning-icon"></i>
          Contiene spoilers
        </span>
      </label>
    </div>

    <div class="form-actions">
      <AppButton type="button" variant="ghost" @click="handleCancel">
        Cancelar
      </AppButton>
      <AppButton type="submit" variant="primary" icon="fa-save">
        Guardar Nota
      </AppButton>
    </div>
  </form>
</template>
