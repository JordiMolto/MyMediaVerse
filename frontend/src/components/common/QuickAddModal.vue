<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ItemStatus, ItemType, Priority } from '@/types'
import { useCategoriesStore } from '@/stores/categories'
import { useItemsStore } from '@/stores/items'
import { searchTMDBResults, getTMDBImageUrl, getTMDBDetails, getYouTubeTrailerUrl, getStreamingPlatforms } from '@/services/external/tmdb.service'
import { searchGoogleBooksMultiple, type GoogleBookResult } from '@/services/external/google-books.service'
import { searchRawgGamesMultiple, type RawgGameResult } from '@/services/external/rawg.service'
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

// Normalized result type for display (unified across all APIs)
type SearchSource = 'tmdb_movie' | 'tmdb_tv' | 'googlebooks' | 'rawg'

interface NormalizedResult {
    id: string
    title: string
    posterUrl: string | null
    year: string | null
    rating: number | null
    mediaTypeLabel: string
    source: SearchSource
    raw: any
}

// State
const step = ref<'setup' | 'search' | 'bulk' | 'processing' | 'success' | 'manual'>('setup')
const selectedType = ref<string>('')
const selectedStatus = ref<ItemStatus>(ItemStatus.PENDING)
const searchQuery = ref('')
const results = ref<NormalizedResult[]>([])
const selectedIds = ref<Set<string>>(new Set())
const isSearching = ref(false)
const hasSearched = ref(false)
const isSaving = ref(false)
const progress = ref({ current: 0, total: 0 })
const manualId = ref('')
const isAddingManual = ref(false)
// Bulk quick-add
const bulkTitles = ref<string[]>([])
const bulkInput = ref('')

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

// Determine which API to use based on the category name
function getSearchSource(categoryName: string): SearchSource {
    const low = categoryName.toLowerCase()
    if (low.includes('serie') || low.includes('anime')) return 'tmdb_tv'
    if (low.includes('libro') || low.includes('book')) return 'googlebooks'
    if (low.includes('juego') || low.includes('game') || low.includes('videojuego')) return 'rawg'
    return 'tmdb_movie'
}

const currentSource = computed(() => getSearchSource(selectedType.value))
const isTmdbSource = computed(() => currentSource.value === 'tmdb_movie' || currentSource.value === 'tmdb_tv')

// Normalization helpers
function normalizeTMDB(items: any[], source: 'tmdb_movie' | 'tmdb_tv'): NormalizedResult[] {
    return items.map(r => ({
        id: String(r.id),
        title: r.title || r.name || '',
        posterUrl: getTMDBImageUrl(r.poster_path) || null,
        year: ((r.release_date || r.first_air_date) || '').split('-')[0] || null,
        rating: r.vote_average || null,
        mediaTypeLabel: source === 'tmdb_tv' ? 'Serie' : 'Película',
        source,
        raw: r,
    }))
}

function normalizeGoogleBooks(items: GoogleBookResult[]): NormalizedResult[] {
    return items.map(r => ({
        id: r.id,
        title: r.volumeInfo.title,
        posterUrl: r.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
        year: r.volumeInfo.publishedDate?.split('-')[0] || null,
        rating: null,
        mediaTypeLabel: 'Libro',
        source: 'googlebooks' as const,
        raw: r,
    }))
}

function normalizeRawg(items: RawgGameResult[]): NormalizedResult[] {
    return items.map(r => ({
        id: String(r.id),
        title: r.name,
        posterUrl: r.background_image,
        year: r.released?.split('-')[0] || null,
        rating: r.rating || null,
        mediaTypeLabel: 'Videojuego',
        source: 'rawg' as const,
        raw: r,
    }))
}

// Methods
const handleContinue = () => {
    if (selectedType.value && selectedStatus.value) {
        step.value = 'search'
    }
}

// Bulk quick-add functions
const addBulkTitle = () => {
    const lines = bulkInput.value
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0)
    if (lines.length === 0) return
    bulkTitles.value.push(...lines)
    bulkInput.value = ''
}

const removeBulkTitle = (index: number) => {
    bulkTitles.value.splice(index, 1)
}

const saveBulkTitles = async () => {
    if (bulkTitles.value.length === 0) return
    step.value = 'processing'
    progress.value = { current: 0, total: bulkTitles.value.length }
    try {
        for (const titulo of bulkTitles.value) {
            await itemsStore.createItem({
                titulo,
                tipo: selectedType.value,
                estado: selectedStatus.value,
                prioridad: Priority.MEDIUM,
            } as any)
            progress.value.current++
            await new Promise(r => setTimeout(r, 50))
        }
        step.value = 'success'
        setTimeout(() => { handleClose(); itemsStore.fetchItems() }, 2000)
    } catch (error) {
        console.error('Error saving bulk titles:', error)
        alert('Hubo un error al guardar.')
        step.value = 'bulk'
    }
}

const handleSearch = async () => {
    if (!searchQuery.value.trim()) return

    isSearching.value = true
    hasSearched.value = true
    results.value = []
    try {
        const source = currentSource.value
        if (source === 'tmdb_movie' || source === 'tmdb_tv') {
            const tmdbType = source === 'tmdb_tv' ? ItemType.SERIES : ItemType.MOVIE
            const raw = await searchTMDBResults(searchQuery.value, tmdbType)
            results.value = normalizeTMDB(raw, source)
        } else if (source === 'googlebooks') {
            const raw = await searchGoogleBooksMultiple(searchQuery.value)
            results.value = normalizeGoogleBooks(raw)
        } else if (source === 'rawg') {
            const raw = await searchRawgGamesMultiple(searchQuery.value)
            results.value = normalizeRawg(raw)
        }
    } finally {
        isSearching.value = false
    }
}

const toggleSelection = (id: string) => {
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
        const selectedResults = results.value.filter(r => selectedIds.value.has(r.id))

        for (const result of selectedResults) {
            const baseData: any = {
                tipo: selectedType.value,
                estado: selectedStatus.value,
                prioridad: Priority.MEDIUM,
            }

            if (result.source === 'tmdb_movie' || result.source === 'tmdb_tv') {
                const tmdbType = result.source === 'tmdb_tv' ? ItemType.SERIES : ItemType.MOVIE
                const details = await getTMDBDetails(Number(result.id), tmdbType)
                if (details) {
                    Object.assign(baseData, {
                        titulo: details.title || details.name || 'Sin título',
                        imagen: getTMDBImageUrl(details.poster_path),
                        backdropImage: getTMDBImageUrl(details.backdrop_path),
                        descripcion: details.overview,
                        tagline: details.tagline,
                        rating: details.vote_average ? Math.round(details.vote_average / 2) : undefined,
                        genero: details.genres?.map((g: any) => g.name) || [],
                        reparto: details.credits?.cast?.slice(0, 5).map((c: any) => c.name) || [],
                        trailer: getYouTubeTrailerUrl(details.videos),
                        streamingPlatforms: getStreamingPlatforms(details['watch/providers']),
                    })
                    if (details.runtime) baseData.duracion = details.runtime
                    else if (details.episode_run_time?.length) baseData.duracion = details.episode_run_time[0]
                    if (result.source === 'tmdb_tv') {
                        baseData.numberOfSeasons = details.number_of_seasons
                        baseData.numberOfEpisodes = details.number_of_episodes
                    }
                    if (details.release_date || details.first_air_date) {
                        baseData.fechaInicio = new Date(details.release_date || details.first_air_date!)
                    }
                    await itemsStore.createItem(baseData)
                }
            } else if (result.source === 'googlebooks') {
                const book = result.raw as GoogleBookResult
                Object.assign(baseData, {
                    titulo: book.volumeInfo.title,
                    imagen: book.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
                    descripcion: book.volumeInfo.description,
                    reparto: book.volumeInfo.authors || [],
                    genero: book.volumeInfo.categories || [],
                    duracion: book.volumeInfo.pageCount,
                })
                if (book.volumeInfo.publishedDate) {
                    baseData.fechaInicio = new Date(book.volumeInfo.publishedDate)
                }
                await itemsStore.createItem(baseData)
            } else if (result.source === 'rawg') {
                const game = result.raw as RawgGameResult
                Object.assign(baseData, {
                    titulo: game.name,
                    imagen: game.background_image,
                    descripcion: game.description_raw,
                    rating: game.rating ? Math.round(game.rating) : undefined,
                    genero: game.genres?.map(g => g.name) || [],
                })
                if (game.released) baseData.fechaInicio = new Date(game.released)
                await itemsStore.createItem(baseData)
            }

            progress.value.current++
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

// Manual TMDB ID add — only for movie/series sources
const handleManualIdAdd = async () => {
    if (!manualId.value || !isTmdbSource.value) return
    const id = parseInt(manualId.value)
    if (isNaN(id)) return

    isAddingManual.value = true
    try {
        const tmdbType = currentSource.value === 'tmdb_tv' ? ItemType.SERIES : ItemType.MOVIE
        const details = await getTMDBDetails(id, tmdbType)
        if (details) {
            const strId = String(details.id)
            if (!results.value.some(r => r.id === strId)) {
                results.value.unshift(normalizeTMDB([{
                    id: details.id,
                    title: details.title || details.name || '',
                    name: details.name,
                    overview: details.overview,
                    poster_path: details.poster_path,
                    backdrop_path: details.backdrop_path,
                    release_date: details.release_date,
                    first_air_date: details.first_air_date,
                    vote_average: details.vote_average,
                    media_type: currentSource.value === 'tmdb_tv' ? 'tv' : 'movie',
                }], currentSource.value as 'tmdb_movie' | 'tmdb_tv')[0])
            }
            selectedIds.value.add(strId)
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
    setTimeout(() => {
        step.value = 'setup'
        selectedType.value = uiStore.quickAddContext.type || ''
        selectedStatus.value = (uiStore.quickAddContext.status as ItemStatus) || ItemStatus.PENDING
        searchQuery.value = ''
        results.value = []
        selectedIds.value.clear()
        manualId.value = ''
        hasSearched.value = false
        bulkTitles.value = []
        bulkInput.value = ''
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
        @close="handleClose" size="xl">
        <div class="quick-add-container">
            <!-- STEP 1: SETUP -->
            <div v-if="step === 'setup'" class="setup-view">
                <div class="text-center setup-heading">
                    <h3 class="text-2xl font-black text-white tracking-tight">¿Qué vamos a añadir?</h3>
                    <p class="text-secondary">Configura el destino de tus nuevos descubrimientos.</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div class="field-group">
                        <label class="field-label">Colección</label>
                        <AppSelect v-model="selectedType" :options="typeOptions" pill />
                    </div>
                    <div class="field-group">
                        <label class="field-label">Estado Inicial</label>
                        <AppSelect v-model="selectedStatus" :options="statusOptions" pill />
                    </div>
                </div>

                <div class="setup-actions">
                    <AppButton variant="primary" size="large" icon="fa-search" @click="handleContinue"
                        :disabled="!selectedType">
                        Buscar y añadir
                    </AppButton>

                    <button class="setup-alt-btn" @click="step = 'bulk'">
                        <i class="fas fa-list-ul"></i>
                        Añadir lista de títulos
                    </button>

                    <button class="setup-link-btn" @click="handleManualMode">
                        Añadir manualmente con formulario
                    </button>
                </div>
            </div>

            <!-- STEP 2: SEARCH & SELECT -->
            <div v-else-if="step === 'search'" class="search-view">
                <div class="search-bar-row">
                    <div class="flex-1">
                        <AppInput v-model="searchQuery" placeholder="Busca por título, año..." icon="fa-search"
                            @keyup.enter="handleSearch" />
                    </div>
                    <AppButton variant="primary" @click="handleSearch" :loading="isSearching" class="search-btn">
                        Buscar
                    </AppButton>
                </div>

                <div class="results-grid custom-scrollbar">
                    <!-- Estado inicial — aún no ha buscado -->
                    <div v-if="!hasSearched && !isSearching" class="col-span-full empty-state">
                        <i class="fas fa-search empty-icon"></i>
                        <p class="empty-title">¿Qué vamos a ver hoy?</p>
                        <p class="empty-sub">Busca por título para empezar a añadir.</p>
                    </div>

                    <!-- Sin resultados tras buscar -->
                    <div v-else-if="hasSearched && results.length === 0 && !isSearching"
                        class="col-span-full empty-state">
                        <i class="fas fa-ghost empty-icon"></i>
                        <p class="empty-title">Sin resultados</p>
                        <p class="empty-sub">No encontramos nada para
                            <strong class="text-white">"{{ searchQuery }}"</strong>.
                            Prueba con otro término.
                        </p>
                        <div v-if="isTmdbSource" class="tmdb-id-helper">
                            <p class="field-label">O añade por ID de TMDB</p>
                            <div class="tmdb-id-row">
                                <input v-model="manualId" type="text" placeholder="ID de TMDB"
                                    class="manual-input" @keyup.enter="handleManualIdAdd" />
                                <button class="btn btn-primary btn-small" @click="handleManualIdAdd"
                                    :disabled="isAddingManual">
                                    <i class="fas" :class="isAddingManual ? 'fa-spinner fa-spin' : 'fa-plus'"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Cards de resultados -->
                    <div v-for="item in results" :key="item.id" class="result-card group"
                        :class="{ 'selected': selectedIds.has(item.id) }" @click="toggleSelection(item.id)">

                        <div class="card-poster">
                            <img v-if="item.posterUrl" :src="item.posterUrl" :alt="item.title" class="poster-img" />
                            <div v-else class="poster-placeholder">
                                <i class="fas fa-image"></i>
                                <span>{{ item.title }}</span>
                            </div>

                            <div class="card-badges">
                                <span v-if="item.year" class="badge badge-year">{{ item.year }}</span>
                                <span v-if="item.rating" class="badge badge-rating">
                                    <i class="fas fa-star"></i>
                                    {{ item.rating.toFixed(1) }}
                                </span>
                            </div>

                            <div class="selection-overlay">
                                <div class="selection-icon">
                                    <i class="fas" :class="selectedIds.has(item.id) ? 'fa-check' : 'fa-plus'"></i>
                                </div>
                            </div>
                        </div>

                        <div class="card-info">
                            <h4 class="info-title">{{ item.title }}</h4>
                            <div class="info-meta">
                                <span class="meta-type">{{ item.mediaTypeLabel }}</span>
                                <span v-if="selectedIds.has(item.id)" class="meta-selected">Seleccionado</span>
                            </div>
                        </div>
                    </div>

                    <!-- Añadir por ID TMDB al final de resultados -->
                    <div v-if="results.length > 0 && isTmdbSource"
                        class="col-span-full tmdb-id-footer">
                        <p class="field-label">¿No está en la lista? Añade por ID de TMDB</p>
                        <div class="tmdb-id-row">
                            <input v-model="manualId" type="text" placeholder="ID de TMDB"
                                class="manual-input" @keyup.enter="handleManualIdAdd" />
                            <button class="btn btn-primary btn-small" @click="handleManualIdAdd"
                                :disabled="isAddingManual">
                                <i class="fas" :class="isAddingManual ? 'fa-spinner fa-spin' : 'fa-plus'"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="footer-actions">
                    <button class="back-btn" @click="step = 'setup'">
                        <i class="fas fa-chevron-left"></i> Cambiar destino
                    </button>
                    <AppButton variant="primary" :disabled="selectedIds.size === 0" @click="handleSave">
                        {{ selectedIds.size > 0 ? `Añadir ${selectedIds.size} items` : 'Selecciona para añadir' }}
                    </AppButton>
                </div>
            </div>

            <!-- STEP: BULK (lista rápida de títulos) -->
            <div v-else-if="step === 'bulk'" class="bulk-view">
                <div class="bulk-header">
                    <p class="empty-title">Lista rápida de títulos</p>
                    <p class="empty-sub">Un título por línea, o pega una lista. Pulsa <kbd>Ctrl+Enter</kbd> o el botón + para añadirlos todos.</p>
                </div>

                <div class="bulk-input-row">
                    <textarea v-model="bulkInput"
                        placeholder="Un título por línea, o pega una lista completa..."
                        class="bulk-text-input"
                        rows="5"
                        @keydown.ctrl.enter.prevent="addBulkTitle"
                        @keydown.meta.enter.prevent="addBulkTitle"
                        autofocus />
                    <button class="bulk-add-btn" @click="addBulkTitle" title="Añadir títulos (Ctrl+Enter)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>

                <div v-if="bulkTitles.length > 0" class="bulk-tags-container custom-scrollbar">
                    <span class="field-label">{{ bulkTitles.length }} título{{ bulkTitles.length !== 1 ? 's' : '' }} añadido{{ bulkTitles.length !== 1 ? 's' : '' }}</span>
                    <div class="bulk-tags">
                        <div v-for="(title, i) in bulkTitles" :key="i" class="bulk-tag">
                            <span class="bulk-tag-text">{{ title }}</span>
                            <button class="bulk-tag-remove" @click="removeBulkTitle(i)">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div v-else class="empty-state empty-state--sm">
                    <i class="fas fa-list-ul empty-icon"></i>
                    <p class="empty-sub">Aún no has añadido ningún título.</p>
                </div>

                <div class="footer-actions">
                    <button class="back-btn" @click="step = 'setup'">
                        <i class="fas fa-chevron-left"></i> Atrás
                    </button>
                    <AppButton variant="primary" :disabled="bulkTitles.length === 0" @click="saveBulkTitles">
                        Guardar {{ bulkTitles.length > 0 ? bulkTitles.length + ' items' : '' }}
                    </AppButton>
                </div>
            </div>

            <!-- STEP: PROCESSING -->
            <div v-else-if="step === 'processing'" class="processing-view">
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

            <!-- STEP: SUCCESS -->
            <div v-else-if="step === 'success'" class="success-view anim-fade-in">
                <div class="success-icon">
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
/* ─── Layout general ─────────────────────────────────────── */
.quick-add-container {
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
}

/* ─── Utilidades compartidas ─────────────────────────────── */
.col-span-full { grid-column: 1 / -1; }

.field-label {
    font-size: var(--fs-xs);
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

.field-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.footer-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-4);
    padding-top: var(--space-5);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.back-btn {
    background: none;
    border: none;
    color: var(--color-text-secondary);
    font-size: var(--fs-sm);
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    transition: color 0.2s;
    padding: 0;
}
.back-btn:hover { color: var(--color-text-primary); }

/* ─── Estados vacíos / no-data ───────────────────────────── */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    padding: var(--space-12) var(--space-6);
    text-align: center;
}
.empty-state--sm { padding: var(--space-8) var(--space-4); }

.empty-icon {
    font-size: 3rem;
    opacity: 0.2;
}

.empty-title {
    font-size: var(--fs-lg);
    font-weight: 900;
    color: var(--color-text-primary);
    opacity: 0.6;
}

.empty-sub {
    font-size: var(--fs-sm);
    color: var(--color-text-secondary);
    max-width: 300px;
}

/* ─── SETUP ──────────────────────────────────────────────── */
.setup-view {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
}

.setup-heading {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    text-align: center;
}

.setup-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    padding-top: var(--space-6);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.setup-alt-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-lg);
    color: var(--color-text-secondary);
    font-size: var(--fs-sm);
    font-weight: 700;
    padding: var(--space-3) var(--space-5);
    cursor: pointer;
    transition: all 0.2s;
}
.setup-alt-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--color-text-primary);
    border-color: rgba(255, 255, 255, 0.2);
}

.setup-link-btn {
    background: none;
    border: none;
    color: var(--color-text-muted);
    font-size: var(--fs-xs);
    font-weight: 700;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    transition: color 0.2s;
    padding: 0;
}
.setup-link-btn:hover { color: var(--color-text-primary); }

/* ─── SEARCH ─────────────────────────────────────────────── */
.search-view {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
}

.search-bar-row {
    display: flex;
    gap: var(--space-3);
    align-items: stretch;
}

/* Grid de resultados */
.results-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-3);
    max-height: 52vh;
    overflow-y: auto;
    padding-right: var(--space-2);
}

@media (min-width: 500px)  { .results-grid { grid-template-columns: repeat(4, 1fr); } }
@media (min-width: 700px)  { .results-grid { grid-template-columns: repeat(5, 1fr); } }
@media (min-width: 900px)  { .results-grid { grid-template-columns: repeat(6, 1fr); } }
@media (min-width: 1100px) { .results-grid { grid-template-columns: repeat(7, 1fr); } }

/* Cards */
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
.result-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
.result-card.selected { border-color: var(--color-accent); box-shadow: 0 0 20px rgba(168,85,247,0.4); }

.card-poster {
    position: relative;
    aspect-ratio: 2 / 3;
    overflow: hidden;
    background: var(--color-bg-card);
}
.poster-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
.result-card:hover .poster-img { transform: scale(1.1); }

.poster-placeholder {
    width: 100%; height: 100%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: var(--space-4); text-align: center; color: var(--color-text-muted);
    gap: var(--space-2);
}
.poster-placeholder i { font-size: 2rem; opacity: 0.2; }
.poster-placeholder span { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; }

.card-badges {
    position: absolute; top: var(--space-2); left: var(--space-2); right: var(--space-2);
    display: flex; justify-content: space-between; z-index: 10;
}

.badge {
    padding: 2px 8px; border-radius: var(--radius-full);
    font-size: 0.65rem; font-weight: 900;
    backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.1); color: white;
}
.badge-year { background: rgba(0,0,0,0.6); }
.badge-rating {
    background: var(--color-accent); box-shadow: 0 4px 10px rgba(168,85,247,0.3);
    display: flex; align-items: center; gap: 4px;
}

.selection-overlay {
    position: absolute; inset: 0;
    background: rgba(168,85,247,0.6);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: all 0.3s ease; backdrop-filter: blur(2px);
}
.result-card:hover .selection-overlay,
.result-card.selected .selection-overlay { opacity: 1; }

.selection-icon {
    width: 40px; height: 40px; background: white; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: var(--color-accent);
    transform: scale(0.5); transition: transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275);
}
.result-card:hover .selection-icon,
.result-card.selected .selection-icon { transform: scale(1); }

.card-info {
    padding: var(--space-2);
    background: linear-gradient(to bottom, rgba(255,255,255,0.05), transparent);
    border-top: 1px solid rgba(255,255,255,0.05);
    flex-grow: 1; display: flex; flex-direction: column; justify-content: center;
    gap: var(--space-1); min-height: 44px;
}
.info-title {
    font-size: 0.75rem; font-weight: 800; color: white; line-height: 1.2;
    display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2;
    -webkit-box-orient: vertical; overflow: hidden;
}
.info-meta { display: flex; justify-content: space-between; align-items: center; }
.meta-type { font-size: 0.6rem; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.meta-selected { font-size: 0.6rem; color: var(--color-accent); font-weight: 900; text-transform: uppercase; }

/* Input TMDB manual */
.tmdb-id-helper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    margin-top: var(--space-4);
}

.tmdb-id-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-6) 0 var(--space-2);
    border-top: 1px solid rgba(255,255,255,0.05);
    opacity: 0.6;
    transition: opacity 0.2s;
}
.tmdb-id-footer:hover { opacity: 1; }

.tmdb-id-row {
    display: flex;
    gap: var(--space-2);
    width: 100%;
    max-width: 260px;
}

.manual-input {
    flex: 1;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: var(--radius-full);
    padding: var(--space-2) var(--space-4);
    color: white;
    font-size: var(--fs-sm);
    outline: none;
    transition: all 0.2s;
    min-width: 0;
}
.manual-input:focus {
    border-color: var(--color-accent);
    background: rgba(255,255,255,0.08);
    box-shadow: 0 0 15px rgba(168,85,247,0.2);
}

/* ─── BULK ───────────────────────────────────────────────── */
.bulk-view {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
}

.bulk-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    text-align: center;
}

.bulk-header kbd {
    display: inline-block;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: var(--radius-sm);
    padding: 1px 6px;
    font-size: 0.75rem;
    font-family: monospace;
    color: var(--color-text-primary);
}

.bulk-input-row {
    display: flex;
    gap: var(--space-3);
    align-items: flex-start;
}

.bulk-text-input {
    flex: 1;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: var(--radius-lg);
    padding: var(--space-3) var(--space-4);
    color: white;
    font-size: var(--fs-sm);
    font-family: inherit;
    line-height: 1.6;
    outline: none;
    resize: vertical;
    transition: all 0.2s;
}
.bulk-text-input::placeholder { color: var(--color-text-muted); }
.bulk-text-input:focus {
    border-color: var(--color-accent);
    background: rgba(255,255,255,0.08);
    box-shadow: 0 0 20px rgba(168,85,247,0.15);
}

.bulk-add-btn {
    width: 42px; height: 42px;
    background: var(--color-accent);
    border: none; border-radius: var(--radius-lg);
    color: white; font-size: 1rem;
    cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
}
.bulk-add-btn:hover { opacity: 0.85; transform: scale(1.05); }

.bulk-tags-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    max-height: 38vh;
    overflow-y: auto;
    padding-right: var(--space-1);
}

.bulk-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
}

.bulk-tag {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: var(--radius-full);
    padding: var(--space-1) var(--space-2) var(--space-1) var(--space-3);
    transition: all 0.15s;
}
.bulk-tag:hover { border-color: rgba(255,255,255,0.25); }

.bulk-tag-text {
    font-size: var(--fs-sm);
    color: var(--color-text-primary);
    font-weight: 500;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.bulk-tag-remove {
    width: 20px; height: 20px;
    background: rgba(255,255,255,0.1);
    border: none; border-radius: 50%;
    color: var(--color-text-muted);
    font-size: 0.6rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s; flex-shrink: 0;
}
.bulk-tag-remove:hover { background: rgba(239,68,68,0.3); color: #ef4444; }

/* ─── PROCESSING ─────────────────────────────────────────── */
.processing-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-6);
    padding: var(--space-16) 0;
    text-align: center;
}

/* ─── SUCCESS ────────────────────────────────────────────── */
.success-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-6);
    padding: var(--space-16) 0;
    text-align: center;
}

.success-icon {
    width: 96px; height: 96px;
    border-radius: 50%;
    background: rgba(34,197,94,0.15);
    color: #22c55e;
    display: flex; align-items: center; justify-content: center;
}

/* ─── Scrollbar ──────────────────────────────────────────── */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--color-accent); }

/* ─── Animaciones ────────────────────────────────────────── */
.anim-fade-in { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
}

/* ─── Responsive ─────────────────────────────────────────── */
@media (max-width: 500px) {
    .quick-add-container { padding: var(--space-4); }
    .results-grid { grid-template-columns: repeat(2, 1fr) !important; gap: var(--space-2) !important; }
    .search-bar-row { flex-direction: column; }
    .search-btn { width: 100%; }
    .footer-actions { flex-direction: column; gap: var(--space-3); }
    .footer-actions > * { width: 100%; }
}
</style>
