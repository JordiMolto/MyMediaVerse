<script setup lang="ts">
import { ref, computed } from 'vue'
import { Item, ItemType, ItemStatus, Priority } from '@/types'
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

const formData = ref({
    tipo: props.item?.tipo || ItemType.MOVIE,
    titulo: props.item?.titulo || '',
    estado: props.item?.estado || ItemStatus.PENDING,
    prioridad: props.item?.prioridad || Priority.MEDIUM,
    rating: props.item?.rating?.toString() || '',
    descripcion: props.item?.descripcion || '',
    tags: props.item?.tags?.join(', ') || ''
})

const errors = ref<Record<string, string>>({})

const typeOptions = [
    { value: ItemType.MOVIE, label: 'Película' },
    { value: ItemType.SERIES, label: 'Serie' },
    { value: ItemType.ANIME, label: 'Anime' },
    { value: ItemType.BOOK, label: 'Libro' },
    { value: ItemType.VIDEOGAME, label: 'Videojuego' },
    { value: ItemType.BOARDGAME, label: 'Juego de Mesa' }
]

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
        tags: formData.value.tags
            ? formData.value.tags.split(',').map(t => t.trim()).filter(Boolean)
            : undefined
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
    <form class="item-form" @submit.prevent="handleSubmit">
        <div class="form-grid">
            <AppSelect v-model="formData.tipo" :options="typeOptions" label="Tipo" required />

            <AppInput v-model="formData.titulo" label="Título" placeholder="Ej: Inception" icon="fa-heading" required
                :error="errors.titulo" />

            <AppSelect v-model="formData.estado" :options="statusOptions" label="Estado" required />

            <AppSelect v-if="showPriority" v-model="formData.prioridad" :options="priorityOptions" label="Prioridad" />

            <AppInput v-if="showRating" v-model="formData.rating" type="number" label="Rating (0-10)" placeholder="8"
                icon="fa-star" :error="errors.rating" />

            <AppInput v-model="formData.tags" label="Tags (separados por comas)"
                placeholder="ciencia ficción, thriller, acción" icon="fa-tags" />

            <div class="full-width">
                <AppInput v-model="formData.descripcion" type="textarea" label="Descripción (opcional)"
                    placeholder="Añade una descripción..." :rows="4" />
            </div>
        </div>

        <div class="form-actions">
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
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
}

.full-width {
    grid-column: 1 / -1;
}

.form-actions {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: flex-end;
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--bg-card);
}

@media (max-width: 768px) {
    .form-grid {
        grid-template-columns: 1fr;
    }
}
</style>
