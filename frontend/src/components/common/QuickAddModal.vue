<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ItemStatus, ItemType, Priority } from '@/types'
import { useCategoriesStore } from '@/stores/categories'
import { useItemsStore } from '@/stores/items'
import { searchTMDBResults, getTMDBImageUrl, type TMDBResult, getTMDBDetails, getYouTubeTrailerUrl, getStreamingPlatforms } from '@/services/external/tmdb.service'
import AppModal from './app-modal/AppModal.vue'
import AppButton from './app-button/AppButton.vue'
import AppSelect from './app-select/AppSelect.vue'
import AppInput from './app-input/AppInput.vue'
import ItemForm from '../items/ItemForm.vue'
import { useUIStore } from '@/stores/ui'

const props = defineProps<{
    isOpen: boolean
}>()

const emit = defineEmits<{
    close: []
}>()

const categoriesStore = useCategoriesStore()
const itemsStore = useItemsStore()
const uiStore = useUIStore()

// State
const step = ref<'setup' | 'search' | 'processing' | 'success' | 'manual'>('setup')
const selectedType = ref<string>('')
const selectedStatus = ref<ItemStatus>(ItemStatus.PENDING)
const searchQuery = ref('')
const results = ref<TMDBResult[]>([])
const selectedIds = ref<Set<number>>(new Set())
const isSearching = ref(false)
const isSaving = ref(false)
const progress = ref({ current: 0, total: 0 })
const manualId = ref('')
const isAddingManual = ref(false)

// Options
const typeOptions = computed(() => {
    return categoriesStore.categories
        .filter(c => !c.oculto)
        .map(c => ({
            value: c.nombre,
            label: c.nombre
        }))
})

const statusOptions = [
    { value: ItemStatus.PENDING, label: 'Pendiente' },
    { value: ItemStatus.IN_PROGRESS, label: 'En Progreso' },
    { value: ItemStatus.COMPLETED, label: 'Completado' },
    { value: ItemStatus.ABANDONED, label: 'Abandonado' }
]

// Methods
const handleContinue = () => {
    if (selectedType.value && selectedStatus.value) {
        step.value = 'search'
    }
}

const handleSearch = async () => {
    if (!searchQuery.value.trim()) return

    isSearching.value = true
    try {
        // Map category to ItemType for TMDB
        let tmdbType: ItemType = ItemType.MOVIE
        const lowType = selectedType.value.toLowerCase()
        if (lowType.includes('serie') || lowType.includes('anime')) {
            tmdbType = ItemType.SERIES
        }

        results.value = await searchTMDBResults(searchQuery.value, tmdbType)
    } finally {
        isSearching.value = false
    }
}

const toggleSelection = (id: number) => {
    if (selectedIds.value.has(id)) {
        selectedIds.value.delete(id)
    } else {
        selectedIds.value.add(id)
    }
}

const handleSave = async () => {
    if (selectedIds.value.size === 0) return

    step.value = 'processing'
    isSaving.value = true
    progress.value = { current: 0, total: selectedIds.value.size }

    try {
        const ids = Array.from(selectedIds.value)
        let tmdbType: ItemType = ItemType.MOVIE
        const lowType = selectedType.value.toLowerCase()
        if (lowType.includes('serie') || lowType.includes('anime')) {
            tmdbType = ItemType.SERIES
        }

        for (const id of ids) {
            const details = await getTMDBDetails(id, tmdbType)
            if (details) {
                const itemData: any = {
                    titulo: details.title || details.name || 'Sin título',
                    tipo: selectedType.value,
                    estado: selectedStatus.value,
                    prioridad: Priority.MEDIUM,
                    imagen: getTMDBImageUrl(details.poster_path),
                    backdropImage: getTMDBImageUrl(details.backdrop_path),
                    descripcion: details.overview,
                    tagline: details.tagline,
                    rating: details.vote_average ? Math.round(details.vote_average / 2) : undefined,
                    genero: details.genres?.map(g => g.name) || [],
                    reparto: details.credits?.cast?.slice(0, 5).map(c => c.name) || [],
                    trailer: getYouTubeTrailerUrl(details.videos),
                    streamingPlatforms: getStreamingPlatforms(details['watch/providers'])
                }

                if (details.runtime) {
                    itemData.duracion = details.runtime
                } else if (details.episode_run_time && details.episode_run_time.length > 0) {
                    itemData.duracion = details.episode_run_time[0]
                }

                if (tmdbType === ItemType.SERIES) {
                    itemData.numberOfSeasons = details.number_of_seasons
                    itemData.numberOfEpisodes = details.number_of_episodes
                }

                if (details.release_date || details.first_air_date) {
                    itemData.fechaInicio = new Date(details.release_date || details.first_air_date!)
                }

                await itemsStore.createItem(itemData)
            }
            progress.value.current++
            // Tiny delay to be safe with DB/API
            await new Promise(r => setTimeout(r, 100))
        }
        step.value = 'success'
        setTimeout(() => {
            handleClose()
            itemsStore.fetchItems()
        }, 2000)
    } catch (error) {
        console.error('Error in Quick Add:', error)
        alert('Hubo un error al añadir los items.')
        step.value = 'search'
    } finally {
        isSaving.value = false
    }
}

const handleManualIdAdd = async () => {
    if (!manualId.value) return
    const id = parseInt(manualId.value)
    if (isNaN(id)) return

    isAddingManual.value = true
    try {
        let tmdbType: ItemType = ItemType.MOVIE
        const lowType = selectedType.value.toLowerCase()
        if (lowType.includes('serie') || lowType.includes('anime')) {
            tmdbType = ItemType.SERIES
        }

        const details = await getTMDBDetails(id, tmdbType)
        if (details) {
            // Check if already in results to avoid duplicates in selection
            if (!results.value.some(r => r.id === details.id)) {
                results.value.unshift({
                    id: details.id,
                    title: details.title || details.name || '',
                    name: details.name,
                    overview: details.overview,
                    poster_path: details.poster_path,
                    backdrop_path: details.backdrop_path,
                    release_date: details.release_date,
                    first_air_date: details.first_air_date,
                    vote_average: details.vote_average,
                    media_type: tmdbType === ItemType.SERIES ? 'tv' : 'movie'
                })
            }
            selectedIds.value.add(details.id)
            manualId.value = ''
        } else {
            alert('No se encontró nada con ese ID.')
        }
    } finally {
        isAddingManual.value = false
    }
}

const handleClose = () => {
    emit('close')
    // Reset state
    setTimeout(() => {
        step.value = 'setup'
        selectedType.value = uiStore.quickAddContext.type || ''
        selectedStatus.value = (uiStore.quickAddContext.status as ItemStatus) || ItemStatus.PENDING
        searchQuery.value = ''
        results.value = []
        selectedIds.value.clear()
        manualId.value = ''
    }, 300)
}

const handleManualMode = () => {
    step.value = 'manual'
}

const handleManualSave = async () => {
    handleClose()
}

// Watchers
watch(() => props.isOpen, (val) => {
    if (val) {
        if (uiStore.quickAddContext.type) selectedType.value = uiStore.quickAddContext.type
        if (uiStore.quickAddContext.status) selectedStatus.value = uiStore.quickAddContext.status as ItemStatus

        if (typeOptions.value.length > 0 && !selectedType.value) {
            selectedType.value = typeOptions.value[0].value
        }
    }
})

</script>

<template>
    <AppModal :is-open="isOpen" :title="step === 'manual' ? 'Añadir Item Manualmente' : 'Selector Modal Universal'"
        @close="handleClose" size="large">
        <div class="quick-add-container p-6">
            <!-- STEP 1: SETUP -->
            <div v-if="step === 'setup'" class="setup-view space-y-8 py-4">
                <div class="text-center space-y-2">
                    <h3 class="text-2xl font-black text-white tracking-tight">¿Qué vamos a añadir?</h3>
                    <p class="text-secondary">Configura el destino de tus nuevos descubrimientos.</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label class="text-xs font-bold text-muted uppercase tracking-widest">Colección</label>
                        <AppSelect v-model="selectedType" :options="typeOptions" pill />
                    </div>
                    <div class="space-y-2">
                        <label class="text-xs font-bold text-muted uppercase tracking-widest">Estado Inicial</label>
                        <AppSelect v-model="selectedStatus" :options="statusOptions" pill />
                    </div>
                </div>

                <div class="pt-6 mt-4 border-t border-white/5 flex flex-col items-center gap-4">
                    <AppButton variant="primary" size="large" icon="fa-arrow-right" @click="handleContinue"
                        :disabled="!selectedType">
                        Continuar a la búsqueda
                    </AppButton>

                    <button
                        class="text-xs font-bold text-muted hover:text-white transition-colors uppercase tracking-widest"
                        @click="handleManualMode">
                        Lo haré manualmente
                    </button>
                </div>
            </div>

            <!-- STEP 2: SEARCH & SELECT -->
            <div v-else-if="step === 'search'" class="search-view space-y-6">
                <!-- ... existing search code ... -->
                <div class="search-bar-row flex gap-3 items-stretch">
                    <div class="flex-1">
                        <AppInput v-model="searchQuery" placeholder="Busca por título, año..." icon="fa-search"
                            @keyup.enter="handleSearch" />
                    </div>
                    <AppButton variant="primary" @click="handleSearch" :loading="isSearching" class="search-btn">Buscar
                    </AppButton>
                </div>

                <div class="results-grid custom-scrollbar">
                    <div v-if="results.length === 0 && !isSearching" class="col-span-full py-20 text-center">
                        <div class="opacity-30 mb-6">
                            <i class="fas fa-search text-6xl mb-4"></i>
                            <p class="text-xl font-black">¿Qué vamos a ver hoy?</p>
                            <p class="text-sm">Busca por título para empezar a añadir.</p>
                        </div>

                        <div
                            class="manual-id-helper glass-card p-6 inline-block w-full max-w-sm mx-auto border-dashed border-white/10">
                            <p class="text-xs font-bold text-muted uppercase tracking-widest mb-4">¿No encuentras lo que
                                buscas?</p>
                            <div class="flex gap-2">
                                <input v-model="manualId" type="text" placeholder="ID de TMDB"
                                    class="manual-input flex-1 min-w-0" @keyup.enter="handleManualIdAdd" />
                                <button class="btn btn-primary btn-small shrink-0" @click="handleManualIdAdd"
                                    :disabled="isAddingManual">
                                    <i class="fas" :class="isAddingManual ? 'fa-spinner fa-spin' : 'fa-plus'"></i>
                                </button>
                            </div>
                            <p class="text-[10px] text-muted mt-4 opacity-70">
                                Busca el ID en <a href="https://www.themoviedb.org/" target="_blank"
                                    class="text-accent underline">TMDB</a>
                            </p>
                        </div>
                    </div>

                    <div v-for="item in results" :key="item.id" class="result-card group"
                        :class="{ 'selected': selectedIds.has(item.id) }" @click="toggleSelection(item.id)">

                        <div class="card-poster">
                            <img v-if="item.poster_path" :src="getTMDBImageUrl(item.poster_path)"
                                :alt="item.title || item.name" class="poster-img" />
                            <div v-else class="poster-placeholder">
                                <i class="fas fa-image"></i>
                                <span>{{ item.title || item.name }}</span>
                            </div>

                            <!-- Badges -->
                            <div class="card-badges">
                                <span v-if="item.release_date || item.first_air_date" class="badge badge-year">
                                    {{ (item.release_date || item.first_air_date || '').split('-')[0] }}
                                </span>
                                <span v-if="item.vote_average" class="badge badge-rating">
                                    <i class="fas fa-star"></i>
                                    {{ item.vote_average.toFixed(1) }}
                                </span>
                            </div>

                            <!-- Selection Overlay -->
                            <div class="selection-overlay">
                                <div class="selection-icon">
                                    <i class="fas" :class="selectedIds.has(item.id) ? 'fa-check' : 'fa-plus'"></i>
                                </div>
                            </div>
                        </div>

                        <div class="card-info">
                            <h4 class="info-title">{{ item.title || item.name }}</h4>
                            <div class="info-meta">
                                <span class="meta-type">{{ item.media_type === 'tv' ? 'Serie' : 'Película' }}</span>
                                <span v-if="selectedIds.has(item.id)" class="meta-selected">Seleccionado</span>
                            </div>
                        </div>
                    </div>

                    <!-- Manual Add Section at the end of results if any -->
                    <div v-if="results.length > 0" class="col-span-full py-8 mt-4 border-t border-white/5">
                        <div class="flex flex-col items-center gap-4 opacity-70 hover:opacity-100 transition-opacity">
                            <p class="text-[10px] font-black text-muted uppercase tracking-[0.2em]">¿No está en la
                                lista?</p>
                            <div class="flex gap-2 w-full max-w-xs">
                                <input v-model="manualId" type="text" placeholder="Añadir por ID de TMDB"
                                    class="manual-input text-xs py-2 px-4 bg-white/5 border border-white/10 rounded-full flex-1 focus:border-accent outline-none text-white"
                                    @keyup.enter="handleManualIdAdd" />
                                <button class="btn btn-primary btn-small shrink-0" @click="handleManualIdAdd"
                                    :disabled="isAddingManual">
                                    <i class="fas" :class="isAddingManual ? 'fa-spinner fa-spin' : 'fa-plus'"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    class="footer-actions flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-white/5">
                    <button
                        class="text-secondary text-sm font-bold hover:text-white transition-colors flex items-center gap-2"
                        @click="step = 'setup'">
                        <i class="fas fa-chevron-left"></i> Cambiar destino
                    </button>
                    <AppButton variant="primary" :disabled="selectedIds.size === 0" @click="handleSave"
                        class="w-full sm:w-auto">
                        {{ selectedIds.size > 0 ? `Añadir ${selectedIds.size} items` : 'Selecciona para añadir' }}
                    </AppButton>
                </div>
            </div>

            <!-- STEP 3: PROCESSING -->
            <div v-else-if="step === 'processing'" class="processing-view py-20 text-center space-y-6">
                <!-- ... existing processing code ... -->
                <div class="relative inline-block">
                    <i class="fas fa-circle-notch fa-spin text-6xl text-accent"></i>
                    <div class="absolute inset-0 flex items-center justify-center font-black text-xs">
                        {{ Math.round((progress.current / progress.total) * 100) }}%
                    </div>
                </div>
                <div>
                    <h3 class="text-2xl font-black text-white">Añadiendo a tu biblioteca...</h3>
                    <p class="text-secondary">Procesando {{ progress.current }} de {{ progress.total }}</p>
                </div>
            </div>

            <!-- STEP 4: SUCCESS -->
            <div v-else-if="step === 'success'" class="success-view py-20 text-center space-y-6 anim-fade-in">
                <div
                    class="w-24 h-24 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-check text-5xl"></i>
                </div>
                <div>
                    <h3 class="text-3xl font-black text-white tracking-tight">¡Todo listo!</h3>
                    <p class="text-secondary">Los items se han añadido correctamente a tu lista.</p>
                </div>
            </div>

            <!-- STEP: MANUAL (Internal ItemForm) -->
            <div v-else-if="step === 'manual'" class="manual-view">
                <ItemForm mode="create" :initial-type="selectedType" :initial-status="selectedStatus"
                    @save="handleManualSave" @cancel="step = 'setup'" />
            </div>
        </div>
    </AppModal>
</template>

<style scoped>
.results-grid {
    display: grid;
    grid-template-cols: repeat(2, 1fr);
    gap: var(--space-4);
    max-height: 50vh;
    overflow-y: auto;
    padding-right: var(--space-2);
}

@media (min-width: 640px) {
    .results-grid {
        grid-template-cols: repeat(3, 1fr);
    }
}

@media (min-width: 768px) {
    .results-grid {
        grid-template-cols: repeat(4, 1fr);
    }
}

@media (min-width: 1024px) {
    .results-grid {
        grid-template-cols: repeat(5, 1fr);
    }
}

.result-card {
    position: relative;
    background: var(--color-bg-surface);
    border-radius: var(--radius-xl);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    border: 2px solid transparent;
    display: flex;
    flex-direction: column;
}

.result-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.result-card.selected {
    border-color: var(--color-accent);
    box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
}

.card-poster {
    position: relative;
    aspect-ratio: 2 / 3;
    overflow: hidden;
    background: var(--color-bg-card);
}

.poster-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
}

.result-card:hover .poster-img {
    transform: scale(1.1);
}

.poster-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-4);
    text-align: center;
    color: var(--color-text-muted);
}

.poster-placeholder i {
    font-size: 2rem;
    margin-bottom: var(--space-2);
    opacity: 0.2;
}

.poster-placeholder span {
    font-size: 0.6rem;
    font-weight: 700;
    text-transform: uppercase;
}

.card-badges {
    position: absolute;
    top: var(--space-2);
    left: var(--space-2);
    right: var(--space-2);
    display: flex;
    justify-content: space-between;
    z-index: 10;
}

.badge {
    padding: 2px 8px;
    border-radius: var(--radius-full);
    font-size: 0.65rem;
    font-weight: 900;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
}

.badge-year {
    background: rgba(0, 0, 0, 0.6);
}

.badge-rating {
    background: var(--color-accent);
    box-shadow: 0 4px 10px rgba(168, 85, 247, 0.3);
    display: flex;
    align-items: center;
    gap: 4px;
}

.selection-overlay {
    position: absolute;
    inset: 0;
    background: rgba(168, 85, 247, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.3s ease;
    backdrop-filter: blur(2px);
}

.result-card:hover .selection-overlay,
.result-card.selected .selection-overlay {
    opacity: 1;
}

.selection-icon {
    width: 40px;
    height: 40px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-accent);
    transform: scale(0.5);
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.result-card:hover .selection-icon,
.result-card.selected .selection-icon {
    transform: scale(1);
}

.card-info {
    padding: var(--space-3);
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.05), transparent);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 60px;
}

.info-title {
    font-size: 0.75rem;
    font-weight: 800;
    color: white;
    margin-bottom: 4px;
    line-height: 1.2;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.info-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.meta-type {
    font-size: 0.6rem;
    color: var(--color-text-muted);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.meta-selected {
    font-size: 0.6rem;
    color: var(--color-accent);
    font-weight: 900;
    text-transform: uppercase;
}

.manual-input {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-lg);
    padding: var(--space-2) var(--space-4);
    color: white;
    font-size: var(--fs-sm);
    outline: none;
    transition: all 0.2s;
}

.manual-input:focus {
    border-color: var(--color-accent);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 15px rgba(168, 85, 247, 0.2);
}

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: var(--color-accent);
}

.anim-fade-in {
    animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsive Fixes */
@media (max-width: 640px) {
    .quick-add-container {
        padding: var(--space-4) !important;
    }

    .results-grid {
        grid-template-cols: repeat(2, 1fr) !important;
        gap: var(--space-3) !important;
    }

    .search-bar-row {
        flex-direction: column;
        align-items: stretch !important;
    }

    .search-btn {
        width: 100%;
    }
}

@media (min-width: 641px) and (max-width: 1024px) {
    .results-grid {
        grid-template-cols: repeat(3, 1fr) !important;
    }
}
</style>
