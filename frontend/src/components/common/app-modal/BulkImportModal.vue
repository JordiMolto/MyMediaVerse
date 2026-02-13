<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBulkImport } from '@/composables/useBulkImport'
import { useItemsStore } from '@/stores/items'
import { ItemType, ItemStatus } from '@/types'
import AppButton from '@/components/common/app-button/AppButton.vue'
import AppSelect from '@/components/common/app-select/AppSelect.vue'

defineProps<{
    isOpen: boolean
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'success', count: number): void
}>()

const step = ref<'upload' | 'enriching' | 'review'>('upload')
const selectType = ref<ItemType>(ItemType.MOVIE)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)

// Destructure from composable
const {
    isProcessing,
    progress,
    items: enrichedItems,
    error,
    parseAndEnrich,
    downloadTemplate
} = useBulkImport()

const itemsStore = useItemsStore()

// Selection for review step
const selectedForImport = ref<Set<string>>(new Set())

const validItemsCount = computed(() => {
    return enrichedItems.value.filter(i => i.found).length
})

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
        selectedFile.value = target.files[0]
    }
}

const startProcess = async () => {
    if (!selectedFile.value) return

    step.value = 'enriching'
    await parseAndEnrich(selectedFile.value, selectType.value)

    if (error.value) {
        step.value = 'upload'
        return
    }

    // Pre-select found items
    selectedForImport.value = new Set()
    enrichedItems.value.forEach(item => {
        if (item.found && item.id) selectedForImport.value.add(item.id)
    })

    step.value = 'review'
}

const toggleSelection = (id: string | undefined) => {
    if (!id) return
    if (selectedForImport.value.has(id)) {
        selectedForImport.value.delete(id)
    } else {
        selectedForImport.value.add(id)
    }
}

const confirmImport = async () => {
    // Only process items that have an ID and are selected
    const itemsToSave = enrichedItems.value.filter(i => i.id && selectedForImport.value.has(i.id))

    try {
        // Save sequentially to avoid race conditions/blocks
        for (const item of itemsToSave) {
            if (!item.tipo || !item.titulo) continue

            await itemsStore.createItem({
                tipo: item.tipo,
                titulo: item.titulo,
                estado: item.estado || ItemStatus.PENDING,
                rating: item.rating,
                descripcion: item.descripcion,
                imagen: item.imagen,
                fechaInicio: item.fechaInicio,
                // Add other enriched fields as needed
            } as any)
        }

        emit('success', itemsToSave.length)
        reset()
        emit('close')
    } catch (e) {
        console.error('Error importing items:', e)
        // Show error toast or alert
    }
}

const reset = () => {
    step.value = 'upload'
    selectedFile.value = null
    selectedForImport.value.clear()
    if (fileInput.value) fileInput.value.value = ''
}

const typeOptions = [
    { value: ItemType.MOVIE, label: 'Películas' },
    { value: ItemType.SERIES, label: 'Series' },
    { value: ItemType.VIDEOGAME, label: 'Videojuegos' },
    { value: ItemType.BOOK, label: 'Libros' },
]

const selectAll = () => {
    enrichedItems.value.forEach(i => {
        if (i.id) selectedForImport.value.add(i.id)
    })
}

const deselectAll = () => {
    selectedForImport.value.clear()
}

</script>

<template>
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-content">
            <header class="modal-header">
                <h2>Importación Masiva</h2>
                <button class="close-btn" :disabled="isProcessing" @click="$emit('close')">&times;</button>
            </header>

            <div class="modal-body">
                <!-- Step 1: Upload -->
                <div v-if="step === 'upload'" class="upload-step">
                    <div class="form-group">
                        <label>¿Qué vas a importar?</label>
                        <AppSelect v-model="selectType" :options="typeOptions" label="Tipo de Contenido" />
                    </div>

                    <div class="template-section">
                        <p>Descarga la plantilla para rellenar tus datos:</p>
                        <AppButton variant="secondary" size="small" @click="downloadTemplate(selectType)">
                            <i class="fas fa-download"></i> Descargar Excel/CSV
                        </AppButton>
                    </div>

                    <div class="drop-zone" @click="fileInput?.click()">
                        <input ref="fileInput" type="file" accept=".csv, .xlsx, .xls" hidden
                            @change="handleFileChange" />
                        <div v-if="!selectedFile">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Click para seleccionar archivo</p>
                            <span>Soporta .xlsx, .csv</span>
                        </div>
                        <div v-else class="file-selected">
                            <i class="fas fa-file-excel"></i>
                            <p>{{ selectedFile.name }}</p>
                            <p class="file-size">{{ (selectedFile.size / 1024).toFixed(1) }} KB</p>
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
                            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
                        </div>
                        <span>{{ progress }}%</span>
                    </div>
                </div>

                <!-- Step 3: Review -->
                <div v-if="step === 'review'" class="review-step">
                    <div class="review-header">
                        <p>Se han encontrado <strong>{{ validItemsCount }}</strong> coincidencias de {{
                            enrichedItems.length }} filas.</p>
                        <div class="review-actions">
                            <button class="text-btn" @click="selectAll">Seleccionar Todo</button>
                            <button class="text-btn" @click="deselectAll">Desmarcar Todo</button>
                        </div>
                    </div>

                    <div class="items-list">
                        <div v-for="item in enrichedItems" :key="item.id" class="review-item"
                            :class="{ 'selected': item.id && selectedForImport.has(item.id), 'not-found': !item.found }"
                            @click="toggleSelection(item.id)">
                            <div class="checkbox">
                                <i v-if="item.id && selectedForImport.has(item.id)" class="fas fa-check"></i>
                            </div>

                            <div class="item-preview">
                                <img v-if="item.imagen" :src="item.imagen" alt="Cover" class="item-cover" />
                                <div v-else class="no-cover">
                                    <i class="fas fa-image"></i>
                                </div>

                                <div class="item-info">
                                    <span class="original-title">Excel: {{ item.originalTitle }}</span>
                                    <h4 v-if="item.found">{{ item.titulo }}</h4>
                                    <span v-else class="not-found-badge">No encontrado</span>

                                    <div class="meta" v-if="item.found">
                                        <span v-if="item.fechaInicio">{{ new Date(item.fechaInicio).getFullYear()
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

<style scoped>
/* Reuse existing modal styles or define new ones */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    width: 90%;
    max-width: 600px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-xl);
}

.modal-header {
    padding: var(--space-4) var(--space-6);
    border-bottom: 1px solid var(--color-border);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
        font-size: var(--fs-lg);
        font-weight: 700;
        color: var(--color-text-primary);
    }
}

.close-btn {
    background: none;
    border: none;
    color: var(--color-text-muted);
    font-size: 1.5rem;
    cursor: pointer;
    padding: var(--space-1);
    transition: color 0.2s;

    &:hover {
        color: var(--color-text-primary);
    }
}

.modal-body {
    padding: var(--space-6);
    overflow-y: auto;
    flex: 1;
}

/* Upload Styles */
.upload-step {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
}

.drop-zone {
    border: 2px dashed var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-8);
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background: rgba(255, 255, 255, 0.02);

    &:hover {
        border-color: var(--color-accent);
        background: rgba(255, 255, 255, 0.04);
    }

    i {
        font-size: 2.5rem;
        color: var(--color-text-muted);
        margin-bottom: var(--space-4);
    }

    p {
        color: var(--color-text-secondary);
        margin-bottom: var(--space-2);
    }

    span {
        font-size: var(--fs-xs);
        color: var(--color-text-muted);
    }
}

.file-selected {
    i {
        color: #10B981;
        /* Green */
    }

    .file-size {
        font-size: var(--fs-xs);
        opacity: 0.7;
    }
}

.error-msg {
    color: var(--color-status-error);
    font-size: var(--fs-sm);
    text-align: center;
    padding: var(--space-2);
    background: rgba(239, 68, 68, 0.1);
    border-radius: var(--radius-md);
}

/* Loader */
.enriching-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-8) 0;
    gap: var(--space-4);

    p {
        color: var(--color-text-secondary);
    }
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    border-top-color: var(--color-accent);
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.progress-bar {
    width: 100%;
    height: 8px;
    background: var(--color-bg-surface);
    border-radius: var(--radius-full);
    overflow: hidden;
    margin-top: var(--space-2);
}

.progress-fill {
    height: 100%;
    background: var(--color-accent);
    transition: width 0.3s ease;
}

/* Review List */
.review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-4);
    color: var(--color-text-secondary);
    font-size: var(--fs-sm);
}

.text-btn {
    background: none;
    border: none;
    color: var(--color-accent);
    cursor: pointer;
    font-size: var(--fs-xs);
    font-weight: 600;
    margin-left: var(--space-4);

    &:hover {
        text-decoration: underline;
    }
}

.items-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    max-height: 400px;
    overflow-y: auto;
    padding-right: var(--space-2);
}

.review-item {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-3);
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        border-color: var(--color-text-muted);
    }

    &.selected {
        border-color: var(--color-accent);
        background: rgba(0, 245, 255, 0.05);
        /* Accent with opacity */

        .checkbox {
            background: var(--color-accent);
            border-color: var(--color-accent);
            color: var(--color-bg-main);
        }
    }
}

.checkbox {
    width: 24px;
    height: 24px;
    border: 2px solid var(--color-text-muted);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;
}

.item-preview {
    display: flex;
    gap: var(--space-3);
    flex: 1;
    overflow: hidden;
}

.item-cover {
    width: 40px;
    height: 60px;
    object-fit: cover;
    border-radius: var(--radius-sm);
}

.no-cover {
    width: 40px;
    height: 60px;
    background: var(--color-bg-card);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    color: var(--color-text-muted);
    font-size: 0.8rem;
}

.item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
    min-width: 0;
    /* Text truncation fix */

    h4 {
        font-size: var(--fs-sm);
        font-weight: 600;
        color: var(--color-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .original-title {
        font-size: var(--fs-xs);
        color: var(--color-text-muted);
    }

    .meta {
        font-size: 10px;
        color: var(--color-text-secondary);
        display: flex;
        gap: var(--space-3);
    }
}

.not-found-badge {
    color: #EF4444;
    /* Red */
    font-size: var(--fs-xs);
    font-weight: 600;
}

.items-list::-webkit-scrollbar {
    width: 6px;
}

.items-list::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 4px;
}

.actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
    margin-top: var(--space-6);
}
</style>
