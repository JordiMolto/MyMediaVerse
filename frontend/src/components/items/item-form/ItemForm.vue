<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Item, ItemType, ItemStatus, Priority } from "@/types";
import { useCategoriesStore } from "@/stores/categories";
import AppInput from "@/components/common/app-input/AppInput.vue";
import AppSelect from "@/components/common/app-select/AppSelect.vue";
import AppButton from "@/components/common/app-button/AppButton.vue";
import "./item-form.css";

interface Props {
  item?: Item;
  mode?: "create" | "edit";
  initialType?: string | null;
  initialStatus?: ItemStatus | null;
}

const props = withDefaults(defineProps<Props>(), {
  mode: "create",
});

const emit = defineEmits<{
  save: [item: Partial<Item>];
  cancel: [];
}>();

const categoriesStore = useCategoriesStore();
const isLoadingCategories = ref(true);

onMounted(async () => {
  await categoriesStore.fetchCategories();
  isLoadingCategories.value = false;

  if (!props.item) {
    if (props.initialType && props.initialType !== "all") {
      formData.value.tipo = props.initialType;
    } else if (categoriesStore.categories.length > 0) {
      formData.value.tipo = categoriesStore.categories[0].nombre;
    }
  }
});

const formData = ref({
  tipo: props.item?.tipo || props.initialType || "",
  titulo: props.item?.titulo || "",
  estado: props.item?.estado || props.initialStatus || ItemStatus.PENDING,
  prioridad: props.item?.prioridad || Priority.MEDIUM,
  rating: props.item?.rating?.toString() ?? "0",
  descripcion: props.item?.descripcion || "",
  tags: props.item?.tags?.join(", ") || "",
  imagen: props.item?.imagen || "",
  duracion: props.item?.duracion?.toString() || "",
  progresoTemporadas: props.item?.progresoTemporadas || "",
  progresoLectura: props.item?.progresoLectura || "",
  plataforma: props.item?.plataforma || "",
  director: props.item?.director || "",
  autor: props.item?.autor || "",
  editorial: props.item?.editorial || "",
  genero: props.item?.genero?.join(", ") || "",
  reparto: props.item?.reparto?.join(", ") || "",
  developer: props.item?.developer || "",
  tiempoEstimado: props.item?.tiempoEstimado || "",
  trailer: props.item?.trailer || "",
  streamingPlatforms: [...(props.item?.streamingPlatforms || [])],
  fechaInicio: props.item?.fechaInicio
    ? new Date(props.item.fechaInicio).toISOString().split("T")[0]
    : "",
});

const newPlatform = ref("");
const errors = ref<Record<string, string>>({});

const typeOptions = computed(() => {
  const customOptions = categoriesStore.categories
    .filter((c) => !c.oculto || c.nombre === props.item?.tipo)
    .map((c) => ({ value: c.nombre, label: c.nombre }));

  if (customOptions.length > 0) return customOptions;

  return [
    { value: "Película", label: "Película" },
    { value: "Serie", label: "Serie" },
    { value: "Anime", label: "Anime" },
    { value: "Libro", label: "Libro" },
    { value: "Videojuego", label: "Videojuego" },
    { value: "Juego de Mesa", label: "Juego de Mesa" },
  ];
});

const statusOptions = [
  { value: ItemStatus.PENDING, label: "Pendiente" },
  { value: ItemStatus.IN_PROGRESS, label: "En Progreso" },
  { value: ItemStatus.COMPLETED, label: "Completado" },
  { value: ItemStatus.ABANDONED, label: "Abandonado" },
];

const priorityOptions = [
  { value: Priority.LOW, label: "Baja" },
  { value: Priority.MEDIUM, label: "Media" },
  { value: Priority.HIGH, label: "Alta" },
];

const showRating = computed(() => formData.value.estado === ItemStatus.COMPLETED);
const showPriority = computed(() => formData.value.estado === ItemStatus.PENDING);

const isVisual = computed(() => {
  const type = formData.value.tipo.toLowerCase();
  return [ItemType.MOVIE, ItemType.SERIES, ItemType.ANIME, "película", "pelicula", "serie"].some(
    (v) => type.includes(v),
  );
});
const isSeries = computed(() => {
  const type = formData.value.tipo.toLowerCase();
  return type === ItemType.SERIES || type.includes("serie");
});
const isBook = computed(() => {
  const type = formData.value.tipo.toLowerCase();
  return type === ItemType.BOOK || type.includes("libro") || type.includes("book");
});
const isGame = computed(() => {
  const type = formData.value.tipo.toLowerCase();
  return type === ItemType.VIDEOGAME || type.includes("juego") || type.includes("game");
});

function addPlatform() {
  const val = newPlatform.value.trim();
  if (!val) return;
  if (!formData.value.streamingPlatforms.includes(val)) {
    formData.value.streamingPlatforms.push(val);
  }
  newPlatform.value = "";
}

function removePlatform(platform: string) {
  formData.value.streamingPlatforms = formData.value.streamingPlatforms.filter(
    (p) => p !== platform,
  );
}

function validate(): boolean {
  errors.value = {};

  if (!formData.value.titulo.trim()) {
    errors.value.titulo = "El título es obligatorio";
  }

  if (showRating.value) {
    if (!formData.value.rating) {
      errors.value.rating = "La nota es obligatoria al marcar como completado";
    } else {
      const rating = Number(formData.value.rating);
      if (isNaN(rating) || rating < 0 || rating > 10) {
        errors.value.rating = "El rating debe estar entre 0 y 10";
      }
    }
  }

  return Object.keys(errors.value).length === 0;
}

function handleSubmit() {
  if (!validate()) return;

  const itemData: Partial<Item> = {
    tipo: formData.value.tipo as ItemType,
    titulo: formData.value.titulo.trim(),
    estado: formData.value.estado as ItemStatus,
    descripcion: formData.value.descripcion.trim() || undefined,
    imagen: formData.value.imagen.trim() || undefined,
    tags: formData.value.tags
      ? formData.value.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined,
    director: formData.value.director.trim() || undefined,
    reparto: formData.value.reparto
      ? formData.value.reparto
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean)
      : undefined,
    progresoTemporadas: formData.value.progresoTemporadas.trim() || undefined,
    autor: formData.value.autor.trim() || undefined,
    editorial: formData.value.editorial.trim() || undefined,
    progresoLectura: formData.value.progresoLectura.trim() || undefined,
    developer: formData.value.developer.trim() || undefined,
    plataforma: formData.value.plataforma.trim() || undefined,
    tiempoEstimado: formData.value.tiempoEstimado.trim() || undefined,
    genero: formData.value.genero
      ? formData.value.genero
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean)
      : undefined,
    trailer: formData.value.trailer.trim() || undefined,
    streamingPlatforms:
      formData.value.streamingPlatforms.length > 0 ? formData.value.streamingPlatforms : undefined,
    fechaInicio: formData.value.fechaInicio ? new Date(formData.value.fechaInicio) : undefined,
  };

  if (formData.value.duracion) {
    const dur = Number(formData.value.duracion);
    if (!isNaN(dur)) itemData.duracion = dur;
  }

  if (showPriority.value) {
    itemData.prioridad = formData.value.prioridad as Priority;
  }

  if (showRating.value && formData.value.rating) {
    const ratingNum = Number(formData.value.rating);
    if (!isNaN(ratingNum)) itemData.rating = ratingNum;
  }

  emit("save", itemData);
}

function handleCancel() {
  emit("cancel");
}
</script>

<template>
  <form class="item-form" @submit.prevent="handleSubmit">
    <div class="form-content">
      <!-- Sección 1: Básico -->
      <section class="form-section">
        <h3 class="section-heading">Básico</h3>
        <div class="form-row">
          <AppSelect
            v-model="formData.tipo"
            :options="typeOptions"
            label="Tipo"
            required
            class="form-field"
          />
          <AppInput
            v-model="formData.titulo"
            label="Título"
            placeholder="Ej: Inception"
            icon="fa-heading"
            required
            :error="errors.titulo"
            class="form-field form-field--wide"
          />
        </div>
        <AppInput
          v-model="formData.imagen"
          label="URL del póster"
          icon="fa-image"
          placeholder="https://..."
        />
      </section>

      <!-- Sección 2: Estado -->
      <section class="form-section">
        <h3 class="section-heading">Estado</h3>
        <div class="form-row">
          <AppSelect
            v-model="formData.estado"
            :options="statusOptions"
            label="Estado"
            required
            class="form-field"
          />
          <AppSelect
            v-if="showPriority"
            v-model="formData.prioridad"
            :options="priorityOptions"
            label="Prioridad"
            class="form-field"
          />
          <AppInput
            v-if="showRating"
            v-model="formData.rating"
            type="number"
            label="Nota (0–10)"
            placeholder="0"
            icon="fa-star"
            required
            :error="errors.rating"
            class="form-field"
          />
        </div>
      </section>

      <!-- Sección 3: Metadata por tipo -->
      <section class="form-section">
        <h3 class="section-heading">Detalles</h3>

        <div v-if="isVisual" class="meta-fields">
          <div class="form-row">
            <AppInput
              v-model="formData.director"
              :label="isSeries ? 'Creador / Showrunner' : 'Director'"
              icon="fa-user-tie"
              class="form-field"
            />
            <AppInput
              v-if="isSeries"
              v-model="formData.progresoTemporadas"
              label="Progreso (ej: S02/05)"
              icon="fa-list-ol"
              class="form-field form-field--sm"
            />
            <AppInput
              v-else
              v-model="formData.duracion"
              label="Duración (min)"
              type="number"
              icon="fa-clock"
              class="form-field form-field--sm"
            />
          </div>
          <AppInput
            v-model="formData.reparto"
            label="Reparto (separado por comas)"
            icon="fa-users"
          />
        </div>

        <div v-if="isBook" class="meta-fields">
          <div class="form-row">
            <AppInput v-model="formData.autor" label="Autor" icon="fa-pen-nib" class="form-field" />
            <AppInput
              v-model="formData.editorial"
              label="Editorial"
              icon="fa-book-open"
              class="form-field"
            />
          </div>
          <AppInput
            v-model="formData.progresoLectura"
            label="Progreso (pág o %)"
            icon="fa-bookmark"
          />
        </div>

        <div v-if="isGame" class="meta-fields">
          <div class="form-row">
            <AppInput
              v-model="formData.developer"
              label="Desarrollador"
              icon="fa-code"
              class="form-field"
            />
            <AppInput
              v-model="formData.plataforma"
              label="Plataforma"
              icon="fa-laptop"
              class="form-field"
            />
          </div>
          <AppInput
            v-model="formData.tiempoEstimado"
            label="Tiempo estimado"
            icon="fa-hourglass-half"
          />
        </div>

        <div class="form-row">
          <AppInput
            v-model="formData.fechaInicio"
            type="date"
            label="Fecha de estreno / publicación"
            icon="fa-calendar"
            class="form-field"
          />
          <AppInput
            v-model="formData.genero"
            label="Géneros (separados por comas)"
            icon="fa-tags"
            class="form-field form-field--wide"
          />
        </div>
      </section>

      <!-- Sección 4: Dónde verlo -->
      <section class="form-section">
        <h3 class="section-heading">Dónde verlo</h3>

        <div class="platforms-editor">
          <div class="platforms-chips">
            <span
              v-for="platform in formData.streamingPlatforms"
              :key="platform"
              class="platform-chip"
            >
              {{ platform }}
              <button type="button" class="chip-remove" @click="removePlatform(platform)">
                <i class="fas fa-times"></i>
              </button>
            </span>
            <span v-if="formData.streamingPlatforms.length === 0" class="platforms-empty">
              Sin plataformas añadidas
            </span>
          </div>
          <div class="platform-add-row">
            <input
              v-model="newPlatform"
              class="platform-input"
              placeholder="Netflix, HBO Max..."
              @keydown.enter.prevent="addPlatform"
            />
            <button type="button" class="platform-add-btn" @click="addPlatform">
              <i class="fas fa-plus"></i> Añadir
            </button>
          </div>
        </div>

        <AppInput
          v-model="formData.trailer"
          label="URL del tráiler"
          icon="fa-play-circle"
          placeholder="https://youtube.com/..."
        />
      </section>

      <!-- Sección 5: Descripción y etiquetas -->
      <section class="form-section">
        <h3 class="section-heading">Descripción y etiquetas</h3>
        <AppInput
          v-model="formData.descripcion"
          type="textarea"
          label="Sinopsis / Descripción"
          placeholder="Añade una descripción..."
          :rows="3"
        />
        <AppInput
          v-model="formData.tags"
          label="Etiquetas personales"
          placeholder="ciencia ficción, masterpiece, para repetir"
          icon="fa-hashtag"
        />
      </section>
    </div>

    <div class="form-actions">
      <AppButton type="button" variant="ghost" @click="handleCancel"> Cancelar </AppButton>
      <AppButton type="submit" variant="primary" icon="fa-save">
        {{ mode === "create" ? "Crear" : "Guardar" }}
      </AppButton>
    </div>
  </form>
</template>
