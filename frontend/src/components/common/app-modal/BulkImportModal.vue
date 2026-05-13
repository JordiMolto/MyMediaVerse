<script setup lang="ts">
import { ref, computed } from "vue";
import { useBulkImport } from "@/composables/useBulkImport";
import { useItemsStore } from "@/stores/items";
import { ItemType, ItemStatus } from "@/types";
import AppButton from "@/components/common/app-button/AppButton.vue";
import AppSelect from "@/components/common/app-select/AppSelect.vue";
import "./bulk-import-modal.css";

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "success", count: number): void;
}>();

const step = ref<"upload" | "enriching" | "review">("upload");
const selectType = ref<ItemType>(ItemType.MOVIE);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);

// Destructure from composable
const {
  isProcessing,
  progress,
  items: enrichedItems,
  error,
  parseAndEnrich,
  downloadTemplate,
} = useBulkImport();

const itemsStore = useItemsStore();

// Selection for review step
const selectedForImport = ref<Set<string>>(new Set());

const validItemsCount = computed(() => {
  return enrichedItems.value.filter((i) => i.found).length;
});

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
  }
};

const startProcess = async () => {
  if (!selectedFile.value) return;

  step.value = "enriching";
  await parseAndEnrich(selectedFile.value, selectType.value);

  if (error.value) {
    step.value = "upload";
    return;
  }

  // Pre-select found items
  selectedForImport.value = new Set();
  enrichedItems.value.forEach((item) => {
    if (item.found && item.id) selectedForImport.value.add(item.id);
  });

  step.value = "review";
};

const toggleSelection = (id: string | undefined) => {
  if (!id) return;
  if (selectedForImport.value.has(id)) {
    selectedForImport.value.delete(id);
  } else {
    selectedForImport.value.add(id);
  }
};

const confirmImport = async () => {
  // Only process items that have an ID and are selected
  const itemsToSave = enrichedItems.value.filter(
    (i) => i.id && selectedForImport.value.has(i.id),
  );

  try {
    // Save sequentially to avoid race conditions/blocks
    for (const item of itemsToSave) {
      if (!item.tipo || !item.titulo) continue;

      await itemsStore.createItem({
        tipo: item.tipo,
        titulo: item.titulo,
        estado: item.estado || ItemStatus.PENDING,
        rating: item.rating,
        descripcion: item.descripcion,
        imagen: item.imagen,
        fechaInicio: item.fechaInicio,
        // Add other enriched fields as needed
      } as any);
    }

    emit("success", itemsToSave.length);
    reset();
    emit("close");
  } catch (e) {
    console.error("Error importing items:", e);
    // Show error toast or alert
  }
};

const reset = () => {
  step.value = "upload";
  selectedFile.value = null;
  selectedForImport.value.clear();
  if (fileInput.value) fileInput.value.value = "";
};

const typeOptions = [
  { value: ItemType.MOVIE, label: "Películas" },
  { value: ItemType.SERIES, label: "Series" },
  { value: ItemType.VIDEOGAME, label: "Videojuegos" },
  { value: ItemType.BOOK, label: "Libros" },
];

const selectAll = () => {
  enrichedItems.value.forEach((i) => {
    if (i.id) selectedForImport.value.add(i.id);
  });
};

const deselectAll = () => {
  selectedForImport.value.clear();
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <header class="modal-header">
        <h2>Importación Masiva</h2>
        <button
          class="close-btn"
          :disabled="isProcessing"
          @click="$emit('close')"
        >
          &times;
        </button>
      </header>

      <div class="modal-body">
        <!-- Step 1: Upload -->
        <div v-if="step === 'upload'" class="upload-step">
          <div class="form-group">
            <label>¿Qué vas a importar?</label>
            <AppSelect
              v-model="selectType"
              :options="typeOptions"
              label="Tipo de Contenido"
            />
          </div>

          <div class="template-section">
            <p>Descarga la plantilla para rellenar tus datos:</p>
            <AppButton
              variant="secondary"
              size="small"
              @click="downloadTemplate(selectType)"
            >
              <i class="fas fa-download"></i> Descargar Excel/CSV
            </AppButton>
          </div>

          <div class="drop-zone" @click="fileInput?.click()">
            <input
              ref="fileInput"
              type="file"
              accept=".csv, .xlsx, .xls"
              hidden
              @change="handleFileChange"
            />
            <div v-if="!selectedFile">
              <i class="fas fa-cloud-upload-alt"></i>
              <p>Click para seleccionar archivo</p>
              <span>Soporta .xlsx, .csv</span>
            </div>
            <div v-else class="file-selected">
              <i class="fas fa-file-excel"></i>
              <p>{{ selectedFile.name }}</p>
              <p class="file-size">
                {{ (selectedFile.size / 1024).toFixed(1) }} KB
              </p>
            </div>
          </div>

          <div v-if="error" class="error-msg">
            {{ error }}
          </div>

          <div class="actions">
            <AppButton :disabled="!selectedFile" @click="startProcess">
              Procesar Archivo
            </AppButton>
          </div>
        </div>

        <!-- Step 2: Processing -->
        <div v-if="step === 'enriching'" class="enriching-step">
          <div class="loader-container">
            <div class="spinner"></div>
            <p>Analizando y buscando datos...</p>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: progress + '%' }"
              ></div>
            </div>
            <span>{{ progress }}%</span>
          </div>
        </div>

        <!-- Step 3: Review -->
        <div v-if="step === 'review'" class="review-step">
          <div class="review-header">
            <p>
              Se han encontrado
              <strong>{{ validItemsCount }}</strong> coincidencias de
              {{ enrichedItems.length }} filas.
            </p>
            <div class="review-actions">
              <button class="text-btn" @click="selectAll">
                Seleccionar Todo
              </button>
              <button class="text-btn" @click="deselectAll">
                Desmarcar Todo
              </button>
            </div>
          </div>

          <div class="items-list">
            <div
              v-for="item in enrichedItems"
              :key="item.id"
              class="review-item"
              :class="{
                selected: item.id && selectedForImport.has(item.id),
                'not-found': !item.found,
              }"
              @click="toggleSelection(item.id)"
            >
              <div class="checkbox">
                <i
                  v-if="item.id && selectedForImport.has(item.id)"
                  class="fas fa-check"
                ></i>
              </div>

              <div class="item-preview">
                <img
                  v-if="item.imagen"
                  :src="item.imagen"
                  alt="Cover"
                  class="item-cover"
                />
                <div v-else class="no-cover">
                  <i class="fas fa-image"></i>
                </div>

                <div class="item-info">
                  <span class="original-title"
                    >Excel: {{ item.originalTitle }}</span
                  >
                  <h4 v-if="item.found">{{ item.titulo }}</h4>
                  <span v-else class="not-found-badge">No encontrado</span>

                  <div class="meta" v-if="item.found">
                    <span v-if="item.fechaInicio">{{
                      new Date(item.fechaInicio).getFullYear()
                    }}</span>
                    <span v-if="item.rating">★ {{ item.rating }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="actions footer-actions">
            <AppButton variant="secondary" @click="reset">Cancelar</AppButton>
            <AppButton @click="confirmImport">
              Importar {{ selectedForImport.size }} Items
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
