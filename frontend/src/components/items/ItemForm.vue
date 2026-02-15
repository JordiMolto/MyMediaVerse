<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Item, ItemType, ItemStatus, Priority } from '@/types'
import { useCategoriesStore } from '@/stores/categories'
import AppInput from '@/components/common/app-input/AppInput.vue'
import AppSelect from '@/components/common/app-select/AppSelect.vue'
import AppButton from '@/components/common/app-button/AppButton.vue'

interface Props {
  item?: Item
  mode?: 'create' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

const emit = defineEmits<{
  save: [item: Partial<Item>]
  cancel: []
}>()

const categoriesStore = useCategoriesStore()
const isLoadingCategories = ref(true)

onMounted(async () => {
  // Always fetch to ensure we have the latest categories
  await categoriesStore.fetchCategories()
  isLoadingCategories.value = false

  // Set default tipo if creating new item
  if (!props.item && categoriesStore.categories.length > 0) {
    formData.value.tipo = categoriesStore.categories[0].nombre
  }
})

const formData = ref({
  tipo: props.item?.tipo || '',
  titulo: props.item?.titulo || '',
  estado: props.item?.estado || ItemStatus.PENDING,
  prioridad: props.item?.prioridad || Priority.MEDIUM,
  rating: props.item?.rating?.toString() || '',
  descripcion: props.item?.descripcion || '',
  tags: props.item?.tags?.join(', ') || '',
  imagen: props.item?.imagen || '',
  // Metadata
  duracion: props.item?.duracion?.toString() || '',
  progresoTemporadas: props.item?.progresoTemporadas || '',
  progresoLectura: props.item?.progresoLectura || '',
  plataforma: props.item?.plataforma || '',
  director: props.item?.director || '',
  autor: props.item?.autor || '',
  editorial: props.item?.editorial || '',
  genero: props.item?.genero?.join(', ') || '',
  reparto: props.item?.reparto?.join(', ') || '',
  developer: props.item?.developer || '',
  tiempoEstimado: props.item?.tiempoEstimado || ''
})

const errors = ref<Record<string, string>>({})

const typeOptions = computed(() => {
  // Get custom categories from store
  const customOptions = categoriesStore.categories.map(c => ({
    value: c.nombre,
    label: c.nombre
  }))

  // If there are custom categories, use only those
  if (customOptions.length > 0) {
    return customOptions
  }

  // Otherwise, show defaults
  return [
    { value: 'Película', label: 'Película' },
    { value: 'Serie', label: 'Serie' },
    { value: 'Anime', label: 'Anime' },
    { value: 'Libro', label: 'Libro' },
    { value: 'Videojuego', label: 'Videojuego' },
    { value: 'Juego de Mesa', label: 'Juego de Mesa' }
  ]
})

const statusOptions = [
  { value: ItemStatus.PENDING, label: 'Pendiente' },
  { value: ItemStatus.IN_PROGRESS, label: 'En Progreso' },
  { value: ItemStatus.COMPLETED, label: 'Completado' },
  { value: ItemStatus.ABANDONED, label: 'Abandonado' }
]

const priorityOptions = [
  { value: Priority.LOW, label: 'Baja' },
  { value: Priority.MEDIUM, label: 'Media' },
  { value: Priority.HIGH, label: 'Alta' }
]

const showRating = computed(() => formData.value.estado === ItemStatus.COMPLETED)
const showPriority = computed(() => formData.value.estado === ItemStatus.PENDING)

const isVisual = computed(() => {
  const type = formData.value.tipo.toLowerCase()
  return [ItemType.MOVIE, ItemType.SERIES, ItemType.ANIME, 'película', 'pelicula', 'serie'].some(v => type.includes(v))
})
const isSeries = computed(() => {
  const type = formData.value.tipo.toLowerCase()
  return type === ItemType.SERIES || type.includes('serie')
})
const isBook = computed(() => {
  const type = formData.value.tipo.toLowerCase()
  return type === ItemType.BOOK || type.includes('libro') || type.includes('book')
})
const isGame = computed(() => {
  const type = formData.value.tipo.toLowerCase()
  return type === ItemType.VIDEOGAME || type.includes('juego') || type.includes('game')
})

function validate(): boolean {
  errors.value = {}

  if (!formData.value.titulo.trim()) {
    errors.value.titulo = 'El título es obligatorio'
  }

  if (showRating.value && formData.value.rating) {
    const rating = Number(formData.value.rating)
    if (isNaN(rating) || rating < 0 || rating > 10) {
      errors.value.rating = 'El rating debe estar entre 0 y 10'
    }
  }

  return Object.keys(errors.value).length === 0
}

function handleSubmit() {
  if (!validate()) return

  const itemData: Partial<Item> = {
    tipo: formData.value.tipo as ItemType,
    titulo: formData.value.titulo.trim(),
    estado: formData.value.estado as ItemStatus,
    descripcion: formData.value.descripcion.trim() || undefined,
    imagen: formData.value.imagen.trim() || undefined,
    tags: formData.value.tags
      ? formData.value.tags.split(',').map(t => t.trim()).filter(Boolean)
      : undefined,
    // Metadata
    director: formData.value.director.trim() || undefined,
    reparto: formData.value.reparto ? formData.value.reparto.split(',').map(r => r.trim()).filter(Boolean) : undefined,
    progresoTemporadas: formData.value.progresoTemporadas.trim() || undefined,
    autor: formData.value.autor.trim() || undefined,
    editorial: formData.value.editorial.trim() || undefined,
    progresoLectura: formData.value.progresoLectura.trim() || undefined,
    developer: formData.value.developer.trim() || undefined,
    plataforma: formData.value.plataforma.trim() || undefined,
    tiempoEstimado: formData.value.tiempoEstimado.trim() || undefined,
    genero: formData.value.genero ? formData.value.genero.split(',').map(g => g.trim()).filter(Boolean) : undefined
  }

  if (formData.value.duracion) {
    const dur = Number(formData.value.duracion)
    if (!isNaN(dur)) itemData.duracion = dur
  }

  if (showPriority.value) {
    itemData.prioridad = formData.value.prioridad as Priority
  }

  if (showRating.value && formData.value.rating) {
    const ratingNum = Number(formData.value.rating)
    if (!isNaN(ratingNum)) {
      itemData.rating = ratingNum
    }
  }

  emit('save', itemData)
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <form class="item-form flex flex-col gap-10" @submit.prevent="handleSubmit">
    <div class="form-content flex flex-col gap-6">
      <div class="form-section">
        <h3 class="text-xs uppercase fw-bold text-muted mb-4 tracking-widest">Información Básica</h3>
        <div class="form-row flex gap-6 flex-wrap">
          <div class="flex-1 min-w-[200px]">
            <AppSelect v-model="formData.tipo" :options="typeOptions" label="Tipo" required />
          </div>
          <div class="flex-1 min-w-[300px]">
            <AppInput v-model="formData.titulo" label="Título" placeholder="Ej: Inception" icon="fa-heading" required
              :error="errors.titulo" />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3 class="text-xs uppercase fw-bold text-muted mb-4 tracking-widest">Estado y Prioridad</h3>
        <div class="form-row flex gap-6 flex-wrap">
          <div class="flex-1 min-w-[200px]">
            <AppSelect v-model="formData.estado" :options="statusOptions" label="Estado" required />
          </div>
          <div v-if="showPriority" class="flex-1 min-w-[200px]">
            <AppSelect v-model="formData.prioridad" :options="priorityOptions" label="Prioridad" />
          </div>
          <div v-if="showRating" class="flex-1 min-w-[200px]">
            <AppInput v-model="formData.rating" type="number" label="Rating (0-10)" placeholder="8" icon="fa-star"
              :error="errors.rating" />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3 class="text-xs uppercase fw-bold text-muted mb-4 tracking-widest">Metadata Adaptativa</h3>

        <!-- Películas / Series / Anime -->
        <div v-if="isVisual" class="flex flex-col gap-4">
          <div class="form-row flex gap-4">
            <AppInput v-model="formData.director" :label="isSeries ? 'Showrunner / Creador' : 'Director'"
              icon="fa-user-tie" class="flex-1" />
            <AppInput v-if="isSeries" v-model="formData.progresoTemporadas" label="Progreso (ej: S02/05)"
              icon="fa-list-ol" class="w-1/3" />
            <AppInput v-else v-model="formData.duracion" label="Duración (minutos)" type="number" icon="fa-clock"
              class="w-1/3" />
          </div>
          <AppInput v-model="formData.reparto" label="Reparto Principal (separado por comas)" icon="fa-users" />
        </div>

        <!-- Libros -->
        <div v-if="isBook" class="flex flex-col gap-4">
          <div class="form-row flex gap-4">
            <AppInput v-model="formData.autor" label="Autor" icon="fa-pen-nib" class="flex-1" />
            <AppInput v-model="formData.editorial" label="Editorial" icon="fa-book-open" class="flex-1" />
          </div>
          <AppInput v-model="formData.progresoLectura" label="Progreso de lectura (pág o %)" icon="fa-bookmark" />
        </div>

        <!-- Videojuegos -->
        <div v-if="isGame" class="flex flex-col gap-4">
          <div class="form-row flex gap-4">
            <AppInput v-model="formData.developer" label="Desarrollador" icon="fa-code" class="flex-1" />
            <AppInput v-model="formData.plataforma" label="Plataforma" icon="fa-laptop" class="flex-1" />
          </div>
          <AppInput v-model="formData.tiempoEstimado" label="Tiempo Estimado (HLTB)" icon="fa-hourglass-half" />
        </div>

        <div class="mt-4">
          <AppInput v-model="formData.genero" label="Géneros (comas)" icon="fa-tags" />
        </div>
      </div>

      <div class="form-section">
        <h3 class="text-xs uppercase fw-bold text-muted mb-4 tracking-widest">Extra</h3>
        <AppInput v-model="formData.imagen" label="URL de la Imagen / Póster" icon="fa-image"
          placeholder="https://..." />
        <div class="mt-4">
          <AppInput v-model="formData.tags" label="Etiquetas Personales"
            placeholder="ciencia ficción, masterpiece, para repetir" icon="fa-hashtag" />
        </div>
        <div class="mt-4">
          <AppInput v-model="formData.descripcion" type="textarea" label="Sinopsis / Descripción"
            placeholder="Añade una descripción..." :rows="3" />
        </div>
      </div>
    </div>

    <div class="form-actions flex gap-4 justify-end pt-6 border-t border-white/5">
      <AppButton type="button" variant="ghost" @click="handleCancel">
        Cancelar
      </AppButton>
      <AppButton type="submit" variant="primary" icon="fa-save">
        {{ mode === 'create' ? 'Crear' : 'Guardar' }}
      </AppButton>
    </div>
  </form>
</template>

<style scoped>
.item-form {
  width: 100%;

  .form-row {
    @media (max-width: 640px) {
      flex-direction: column;
      gap: var(--space-4);
    }
  }

  .min-w-\[200px\] {
    min-width: 200px;
  }
}
</style>
