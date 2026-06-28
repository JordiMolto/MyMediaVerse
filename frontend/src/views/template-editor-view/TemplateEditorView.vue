<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useDetailTemplatesStore, ALL_BLOCKS_ON } from "@/stores/detailTemplates";
import { useCategoriesStore } from "@/stores/categories";
import { DetailTemplate, TemplateBlocks } from "@/types";
import AppButton from "@/components/common/app-button/AppButton.vue";
import AppModal from "@/components/common/app-modal/AppModal.vue";
import { useConfirm } from "@/composables/useConfirm";
import "./template-editor-view.css";

const store = useDetailTemplatesStore();
const categoriesStore = useCategoriesStore();
const { showConfirm } = useConfirm();

const showModal = ref(false);
const editingId = ref<string | null>(null);
const saving = ref(false);
const formError = ref("");

const form = ref({
  nombre: "",
  tipoAsociado: "__null__" as string,
  bloques: { ...ALL_BLOCKS_ON } as TemplateBlocks,
});

const BLOCK_GROUPS: { label: string; icon: string; keys: (keyof TemplateBlocks)[] }[] = [
  {
    label: "Hero",
    icon: "fa-image",
    keys: ["hero", "heroTagline", "heroMeta", "heroGeneros"],
  },
  {
    label: "Sidebar",
    icon: "fa-columns",
    keys: ["poster", "acciones", "progreso", "plataformasStreaming", "trailer", "detalles"],
  },
  {
    label: "Contenido",
    icon: "fa-align-left",
    keys: ["estado", "sinopsis", "reparto", "diario"],
  },
];

const BLOCK_LABELS: Record<keyof TemplateBlocks, string> = {
  hero: "Imagen de fondo (hero)",
  heroTagline: "Tagline / subtítulo",
  heroMeta: "Metadatos del hero (año, duración…)",
  heroGeneros: "Géneros",
  poster: "Póster",
  acciones: "Botones de acción",
  progreso: "Progreso (temporadas / lectura)",
  plataformasStreaming: "Plataformas de streaming",
  trailer: "Tráiler",
  detalles: "Card de detalles",
  estado: "Estado y valoración",
  sinopsis: "Sinopsis",
  reparto: "Reparto principal",
  diario: "Diario de actividad",
};

onMounted(async () => {
  await Promise.all([store.fetchTemplates(), categoriesStore.fetchCategories()]);
});

const categoryOptions = computed(() => [
  { value: "__null__", label: "— Sin tipo (fallback global) —" },
  ...categoriesStore.categories.map((c) => ({ value: c.nombre, label: c.nombre })),
]);

const defaultTemplates = computed(() => store.templates.filter((t) => t.esPredeterminada));
const editableTemplates = computed(() => store.templates.filter((t) => !t.esPredeterminada));

// Devuelve true si esta plantilla es la que realmente se aplica para su tipo
function isActiveTemplate(tpl: DetailTemplate): boolean {
  if (tpl.tipoAsociado === null) {
    // Fallback global: activa solo si no hay ninguna otra para ese tipo
    return true; // el global siempre se "usa" como fallback, no lo marcamos inactivo
  }
  const competitors = store.templates.filter((t) => t.tipoAsociado === tpl.tipoAsociado);
  // Si hay una personalizada, la predeterminada queda inactiva
  const hasCustom = competitors.some((t) => !t.esPredeterminada);
  if (tpl.esPredeterminada && hasCustom) return false;
  // Si hay dos personalizadas del mismo tipo, solo "activa" la primera creada
  if (!tpl.esPredeterminada) {
    const customsForType = competitors.filter((t) => !t.esPredeterminada);
    return customsForType[0]?.id === tpl.id;
  }
  return true;
}

// Aviso de conflicto en el formulario
const typeConflictWarning = computed(() => {
  const tipo = form.value.tipoAsociado;
  if (tipo === "__null__") return null;
  const existing = store.templates.filter(
    (t) => t.tipoAsociado === tipo && t.id !== editingId.value,
  );
  if (existing.length === 0) return null;
  const active = existing.find((t) => {
    const competitors = store.templates.filter((tt) => tt.tipoAsociado === tipo);
    const hasCustom = competitors.some((tt) => !tt.esPredeterminada);
    if (t.esPredeterminada && hasCustom) return false;
    if (!t.esPredeterminada) return competitors.filter((tt) => !tt.esPredeterminada)[0]?.id === t.id;
    return true;
  });
  if (!active) return null;
  const isPreset = active.esPredeterminada;
  return isPreset
    ? `La plantilla predeterminada "${active.nombre}" se aplica a este tipo. La tuya la sobreescribirá.`
    : `Ya hay una plantilla personalizada activa para este tipo ("${active.nombre}"). Esta quedará inactiva.`;
});

async function openCreate() {
  await categoriesStore.fetchCategories();
  editingId.value = null;
  formError.value = "";
  form.value = { nombre: "", tipoAsociado: "__null__", bloques: { ...ALL_BLOCKS_ON } };
  showModal.value = true;
}

async function openEdit(tpl: DetailTemplate) {
  await categoriesStore.fetchCategories();
  editingId.value = tpl.id;
  formError.value = "";
  form.value = {
    nombre: tpl.nombre,
    tipoAsociado: tpl.tipoAsociado ?? "__null__",
    bloques: { ...tpl.bloques },
  };
  showModal.value = true;
}

async function handleSave() {
  if (!form.value.nombre.trim()) {
    formError.value = "El nombre es obligatorio.";
    return;
  }
  saving.value = true;
  formError.value = "";
  const tipoAsociado = form.value.tipoAsociado === "__null__" ? null : form.value.tipoAsociado;
  try {
    if (editingId.value) {
      await store.updateTemplate(editingId.value, {
        nombre: form.value.nombre,
        tipoAsociado,
        bloques: form.value.bloques,
      });
    } else {
      await store.createTemplate({
        nombre: form.value.nombre,
        tipoAsociado,
        esPredeterminada: false,
        bloques: form.value.bloques,
      });
    }
    showModal.value = false;
  } catch (e: any) {
    formError.value = e.message || "Error al guardar";
  } finally {
    saving.value = false;
  }
}

async function handleDelete(tpl: DetailTemplate) {
  const ok = await showConfirm({
    title: "Eliminar plantilla",
    message: `¿Seguro que quieres eliminar "${tpl.nombre}"?`,
    confirmLabel: "Eliminar",
    danger: true,
  });
  if (ok) await store.deleteTemplate(tpl.id);
}

function toggleAll(on: boolean) {
  (Object.keys(form.value.bloques) as (keyof TemplateBlocks)[]).forEach(
    (k) => (form.value.bloques[k] = on),
  );
}

function activeCount(bloques: TemplateBlocks) {
  return Object.values(bloques).filter(Boolean).length;
}
</script>

<template>
  <div class="template-editor-view">
    <header class="te-header">
      <div class="te-header-info">
        <h1 class="te-title">
          <i class="fas fa-puzzle-piece"></i>
          Plantillas de Vista
        </h1>
        <p class="te-subtitle">
          Personaliza qué bloques se muestran en la vista de detalle según el tipo de media.
        </p>
      </div>
      <AppButton variant="primary" icon="fa-plus" @click="openCreate">
        Nueva plantilla
      </AppButton>
    </header>

    <div v-if="store.loading" class="te-loading">
      <i class="fas fa-circle-notch fa-spin"></i>
      <span>Cargando plantillas…</span>
    </div>

    <template v-else>
      <!-- Predeterminadas -->
      <section class="te-section">
        <div class="te-section-header">
          <h2 class="te-section-title">
            <i class="fas fa-bookmark"></i> Predeterminadas
          </h2>
          <span class="te-section-count">{{ defaultTemplates.length }}</span>
        </div>
        <p class="te-section-desc">
          Se crean automáticamente para cada tipo. Puedes editarlas pero no eliminarlas.
        </p>
        <div class="te-grid">
          <div
            v-for="tpl in defaultTemplates"
            :key="tpl.id"
            class="te-card te-card--default"
            :class="{ 'te-card--inactive': !isActiveTemplate(tpl) }"
          >
            <div v-if="!isActiveTemplate(tpl)" class="te-card-inactive-mask">
              <i class="fas fa-eye-slash"></i> Inactiva — sobreescrita por una personalizada
            </div>
            <div class="te-card-head">
              <div class="te-card-name-row">
                <span class="te-card-name">{{ tpl.nombre }}</span>
                <span class="te-card-badge">{{ tpl.tipoAsociado ?? "Global" }}</span>
              </div>
              <span class="te-card-stat">
                {{ activeCount(tpl.bloques) }}/{{ Object.keys(tpl.bloques).length }} bloques
              </span>
            </div>
            <div class="te-block-list">
              <span
                v-for="(val, key) in tpl.bloques"
                :key="key"
                class="te-block-chip"
                :class="{ off: !val }"
              >
                <i class="fas" :class="val ? 'fa-check' : 'fa-minus'"></i>
                {{ BLOCK_LABELS[key as keyof TemplateBlocks] }}
              </span>
            </div>
            <div class="te-card-footer">
              <AppButton variant="ghost" icon="fa-edit" size="small" @click="openEdit(tpl)">
                Editar
              </AppButton>
            </div>
          </div>
        </div>
      </section>

      <!-- Personalizadas -->
      <section class="te-section">
        <div class="te-section-header">
          <h2 class="te-section-title">
            <i class="fas fa-paint-brush"></i> Personalizadas
          </h2>
          <span class="te-section-count">{{ editableTemplates.length }}</span>
        </div>

        <div v-if="editableTemplates.length === 0" class="te-empty">
          <i class="fas fa-layer-group te-empty-icon"></i>
          <p>Aún no tienes plantillas personalizadas.</p>
          <AppButton variant="glass" icon="fa-plus" @click="openCreate">
            Crear la primera
          </AppButton>
        </div>

        <div v-else class="te-grid">
          <div
            v-for="tpl in editableTemplates"
            :key="tpl.id"
            class="te-card"
            :class="{ 'te-card--inactive': !isActiveTemplate(tpl) }"
          >
            <div v-if="!isActiveTemplate(tpl)" class="te-card-inactive-mask">
              <i class="fas fa-eye-slash"></i> Inactiva — otra plantilla personalizada tiene prioridad
            </div>
            <div class="te-card-head">
              <div class="te-card-name-row">
                <span class="te-card-name">{{ tpl.nombre }}</span>
                <span class="te-card-badge te-card-badge--custom">
                  {{ tpl.tipoAsociado ?? "Global" }}
                </span>
              </div>
              <span class="te-card-stat">
                {{ activeCount(tpl.bloques) }}/{{ Object.keys(tpl.bloques).length }} bloques
              </span>
            </div>
            <div class="te-block-list">
              <span
                v-for="(val, key) in tpl.bloques"
                :key="key"
                class="te-block-chip"
                :class="{ off: !val }"
              >
                <i class="fas" :class="val ? 'fa-check' : 'fa-minus'"></i>
                {{ BLOCK_LABELS[key as keyof TemplateBlocks] }}
              </span>
            </div>
            <div class="te-card-footer">
              <AppButton variant="ghost" icon="fa-edit" size="small" @click="openEdit(tpl)">
                Editar
              </AppButton>
              <AppButton variant="ghost" icon="fa-trash" size="small" @click="handleDelete(tpl)" />
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- Modal -->
    <AppModal
      :is-open="showModal"
      :title="editingId ? 'Editar plantilla' : 'Nueva plantilla'"
      size="large"
      @close="showModal = false"
    >
      <div class="te-form">
        <!-- Nombre -->
        <div class="te-field">
          <label class="te-field-label">Nombre</label>
          <input
            v-model="form.nombre"
            class="te-field-input"
            placeholder="Ej: Solo póster y notas"
            @keydown.enter="handleSave"
          />
        </div>

        <!-- Tipo asociado -->
        <div class="te-field">
          <label class="te-field-label">Tipo asociado</label>
          <select v-model="form.tipoAsociado" class="te-field-input te-field-select">
            <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <p class="te-field-hint">
            Si se asocia a un tipo, esta plantilla se aplica automáticamente a ese tipo de items.
            Dejándolo vacío actúa como fallback global.
          </p>
          <p v-if="typeConflictWarning" class="te-field-warning">
            <i class="fas fa-exclamation-triangle"></i>
            {{ typeConflictWarning }}
          </p>
        </div>

        <!-- Bloques -->
        <div class="te-field">
          <div class="te-field-label-row">
            <label class="te-field-label">Bloques visibles</label>
            <div class="te-quick-actions">
              <button class="te-quick-btn" @click="toggleAll(true)">Activar todos</button>
              <button class="te-quick-btn" @click="toggleAll(false)">Desactivar todos</button>
            </div>
          </div>

          <div v-for="group in BLOCK_GROUPS" :key="group.label" class="te-group">
            <div class="te-group-title">
              <i class="fas" :class="group.icon"></i>
              {{ group.label }}
            </div>
            <div class="te-group-toggles">
              <label
                v-for="key in group.keys"
                :key="key"
                class="te-toggle"
                :class="{ active: form.bloques[key] }"
              >
                <span class="te-toggle-text">{{ BLOCK_LABELS[key] }}</span>
                <div class="te-toggle-switch">
                  <input type="checkbox" v-model="form.bloques[key]" class="te-toggle-checkbox" />
                  <div class="te-toggle-track">
                    <div class="te-toggle-thumb"></div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <p v-if="formError" class="te-form-error">{{ formError }}</p>

        <div class="te-form-actions">
          <AppButton variant="ghost" @click="showModal = false">Cancelar</AppButton>
          <AppButton variant="primary" icon="fa-save" :loading="saving" @click="handleSave">
            Guardar
          </AppButton>
        </div>
      </div>
    </AppModal>
  </div>
</template>
