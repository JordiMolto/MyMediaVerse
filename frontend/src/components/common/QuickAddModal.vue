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

const props = defineProps<{
    isOpen: boolean
}>()

const emit = defineEmits<{
    close: []
}>()

const categoriesStore = useCategoriesStore()
const itemsStore = useItemsStore()

// State
const step = ref<'setup' | 'search' | 'processing' | 'success'>('setup')
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
        selectedType.value = ''
        selectedStatus.value = ItemStatus.PENDING
        searchQuery.value = ''
        results.value = []
        selectedIds.value.clear()
        manualId.value = ''
    }, 300)
}

// Watchers
watch(() => props.isOpen, (val) => {
    if (val && typeOptions.value.length > 0 && !selectedType.value) {
        selectedType.value = typeOptions.value[0].value
    }
})

</script>

<template>
    <AppModal :is-open="isOpen" title="Selector Modal Universal" @close="handleClose" size="large">
        <div class="quick-add-container p-6">
            <!-- STEP 1: SETUP -->
            <div v-if="step === 'setup'" class="setup-view space-y-8 py-4">
                <div class="text-center space-y-2">
                    <h3 class="text-2xl font-black text-white tracking-tight">¿Qué vamos a añadir?</h3>
                    <p class="text-secondary">Configura el destino de tus nuevos descubrimientos.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label class="text-xs font-bold text-muted uppercase tracking-widest">Colección</label>
                        <AppSelect v-model="selectedType" :options="typeOptions" pill />
                    </div>
                    <div class="space-y-2">
                        <label class="text-xs font-bold text-muted uppercase tracking-widest">Estado Inicial</label>
                        <AppSelect v-model="selectedStatus" :options="statusOptions" pill />
                    </div>
                </div>

                <div class="pt-6 flex justify-center">
                    <AppButton variant="primary" size="large" icon="fa-arrow-right" @click="handleContinue"
                        :disabled="!selectedType">
                        Continuar a la búsqueda
                    </AppButton>
                </div>
            </div>

            <!-- STEP 2: SEARCH & SELECT -->
            <div v-else-if="step === 'search'" class="search-view space-y-6">
                <div class="flex flex-col md:flex-row gap-4 items-end">
                    <div class="flex-1">
                        <AppInput v-model="searchQuery" placeholder="Busca por título, año..." icon="fa-search"
                            @keyup.enter="handleSearch" />
                    </div>
                    <AppButton variant="primary" @click="handleSearch" :loading="isSearching">Buscar</AppButton>
                </div>

                <div
                    class="results-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    <div v-if="results.length === 0 && !isSearching" class="col-span-full py-20 text-center">
                        <div class="opacity-30 mb-6">
                            <i class="fas fa-search text-6xl mb-4"></i>
                            <p class="text-xl font-black">¿Qué vamos a ver hoy?</p>
                            <p class="text-sm">Busca por título para empezar a añadir.</p>
                        </div>

                        <div
                            class="manual-id-helper glass-card p-6 inline-block max-w-sm mx-auto border-dashed border-white/10">
                            <p class="text-xs font-bold text-muted uppercase tracking-widest mb-4">¿No encuentras lo que
                                buscas?</p>
                            <div class="flex gap-2">
                                <input v-model="manualId" type="text" placeholder="ID de TMDB (ej: 157336)"
                                    class="manual-input flex-1" @keyup.enter="handleManualIdAdd" />
                                <button class="btn btn-primary btn-small" @click="handleManualIdAdd"
                                    :disabled="isAddingManual">
                                    <i class="fas" :class="isAddingManual ? 'fa-spinner fa-spin' : 'fa-plus'"></i>
                                </button>
                            </div>
                            <p class="text-[10px] text-muted mt-4">
                                Puedes buscar el ID en <a href="https://www.themoviedb.org/" target="_blank"
                                    class="text-accent underline">TMDB</a>
                                copiando el número de la URL.
                            </p>
                        </div>
                    </div>

                    <div v-for="item in results" :key="item.id"
                        class="result-card relative rounded-2xl overflow-hidden cursor-pointer group transition-all duration-500 hover:-translate-y-2"
                        :class="{ 'selected': selectedIds.has(item.id) }" @click="toggleSelection(item.id)">

                        <div class="aspect-[2/3] bg-surface-light relative overflow-hidden shadow-2xl">
                            <img v-if="item.poster_path" :src="getTMDBImageUrl(item.poster_path)"
                                :alt="item.title || item.name"
                                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div v-else class="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                                <i class="fas fa-image text-4xl mb-2 opacity-10"></i>
                                <span class="text-[10px] text-muted font-bold uppercase tracking-tighter">{{ item.title
                                    || item.name }}</span>
                            </div>

                            <!-- Year Badge -->
                            <div class="absolute top-2 right-2 z-10">
                                <span
                                    class="bg-black/60 backdrop-blur-md text-[9px] font-black text-white px-2 py-0.5 rounded-full border border-white/10">
                                    {{ (item.release_date || item.first_air_date || '').split('-')[0] || 'TBA' }}
                                </span>
                            </div>

                            <!-- Rating Badge -->
                            <div v-if="item.vote_average" class="absolute top-2 left-2 z-10">
                                <span
                                    class="bg-accent text-[9px] font-black text-white px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                                    <i class="fas fa-star text-[7px]"></i>
                                    {{ item.vote_average.toFixed(1) }}
                                </span>
                            </div>

                            <!-- Selection Overlay -->
                            <div class="absolute inset-0 bg-accent/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                                :class="{ 'opacity-100': selectedIds.has(item.id) }">
                                <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center text-accent shadow-2xl transform scale-50 group-hover:scale-100 transition-transform duration-500"
                                    :class="{ 'scale-100': selectedIds.has(item.id) }">
                                    <i class="fas text-xl"
                                        :class="selectedIds.has(item.id) ? 'fa-check' : 'fa-plus'"></i>
                                </div>
                            </div>
                        </div>

                        <div
                            class="p-3 bg-gradient-to-t from-black/90 to-black/40 backdrop-blur-md border-t border-white/5">
                            <h4 class="text-xs font-bold text-white truncate leading-tight mb-1">{{ item.title ||
                                item.name }}</h4>
                            <div class="flex items-center justify-between">
                                <span class="text-[9px] text-muted font-black uppercase tracking-widest">
                                    {{ item.media_type === 'tv' ? 'Serie' : 'Película' }}
                                </span>
                                <span v-if="selectedIds.has(item.id)"
                                    class="text-[9px] text-accent font-black uppercase tracking-widest">Seleccionado</span>
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
                                <button
                                    class="w-10 h-10 rounded-full bg-white/10 border border-white/10 text-white hover:bg-accent hover:border-accent transition-all flex items-center justify-center"
                                    @click="handleManualIdAdd" :disabled="isAddingManual">
                                    <i class="fas" :class="isAddingManual ? 'fa-spinner fa-spin' : 'fa-plus'"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="footer-actions flex justify-between items-center pt-6 border-t border-white/5">
                    <button class="text-secondary text-sm font-bold hover:text-white transition-colors"
                        @click="step = 'setup'">
                        <i class="fas fa-chevron-left mr-2"></i> Cambiar destino
                    </button>
                    <AppButton variant="primary" :disabled="selectedIds.size === 0" @click="handleSave">
                        Añadir {{ selectedIds.size }} items seleccionados
                    </AppButton>
                </div>
            </div>

            <!-- STEP 3: PROCESSING -->
            <div v-else-if="step === 'processing'" class="processing-view py-20 text-center space-y-6">
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
        </div>
    </AppModal>
</template>

<style scoped>
.result-card {
    border: 2px solid transparent;
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
}

.result-card.selected {
    border-color: var(--color-accent);
    box-shadow: 0 0 30px rgba(168, 85, 247, 0.6);
    transform: scale(0.98);
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
</style>
