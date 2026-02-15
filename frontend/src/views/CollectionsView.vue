<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCategoriesStore } from '@/stores/categories'
import AppModal from '@/components/common/app-modal/AppModal.vue'
import AppButton from '@/components/common/app-button/AppButton.vue'

const router = useRouter()
const categoriesStore = useCategoriesStore()

const showAddModal = ref(false)
const showEditModal = ref(false)
const selectedCategory = ref<any>(null)

const newCategory = ref({
    nombre: '',
    icono: 'fa-folder',
    color: '#FF5722'
})

const editCategoryData = ref({
    nombre: '',
    icono: '',
    color: ''
})

onMounted(() => {
    categoriesStore.fetchCategories()
})

const handleAddCategory = async () => {
    if (!newCategory.value.nombre) return
    try {
        await categoriesStore.createCategory({ ...newCategory.value })
        showAddModal.value = false
        newCategory.value = { nombre: '', icono: 'fa-folder', color: '#FF5722' }
    } catch (err) {
        alert('Error al crear la colección')
    }
}

const handleEditCategory = async () => {
    if (!selectedCategory.value || !editCategoryData.value.nombre) return
    try {
        await categoriesStore.updateCategory(selectedCategory.value.id, { ...editCategoryData.value })
        showEditModal.value = false
        selectedCategory.value = null
    } catch (err) {
        alert('Error al actualizar la colección')
    }
}

const openEditModal = (category: any) => {
    selectedCategory.value = category
    editCategoryData.value = {
        nombre: category.nombre,
        icono: category.icono,
        color: category.color
    }
    showEditModal.value = true
}

const handleToggleVisibility = async (category: any) => {
    try {
        await categoriesStore.updateCategory(category.id, { oculto: !category.oculto })
    } catch (err) {
        alert('Error al cambiar la visibilidad')
    }
}

const confirmDelete = async (category: any) => {
    if (confirm(`¿Estás seguro de que quieres borrar la colección "${category.nombre}"?`)) {
        try {
            await categoriesStore.deleteCategory(category.id)
        } catch (err) {
            alert('Error al borrar la colección')
        }
    }
}


const icons = [
    'fa-folder', 'fa-film', 'fa-tv', 'fa-book', 'fa-gamepad', 'fa-dice',
    'fa-music', 'fa-headphones', 'fa-camera', 'fa-paint-brush', 'fa-code',
    'fa-heart', 'fa-star', 'fa-rocket', 'fa-ghost', 'fa-mask'
]

const colors = [
    '#A855F7', '#00F5FF', '#4CAF50', '#FFC107', '#FF5722', '#F44336',
    '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#00BCD4',
    '#009688', '#8BC34A', '#CDDC39', '#FFEB3B'
]

</script>

<template>
    <div class="collections-view container mx-auto p-6 pt-24 pb-32">
        <header class="flex justify-between items-center mb-12">
            <div>
                <button class="btn-back mb-4" @click="router.push('/perfil')">
                    <i class="fas fa-arrow-left mr-2"></i> Volver a Perfil
                </button>
                <h1 class="text-4xl font-black text-white tracking-tighter">Mis Colecciones</h1>
                <p class="text-secondary mt-2">Gestiona las categorías de tus medios.</p>
            </div>
            <AppButton variant="primary" icon="fa-plus" @click="showAddModal = true">
                Añadir Colección
            </AppButton>
        </header>

        <div v-if="categoriesStore.error" class="error-state glass-card p-10 text-center border-red-500/20 mb-8">
            <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <h3 class="text-xl font-bold text-white">¡No se pudieron cargar las colecciones!</h3>
            <p class="text-secondary mt-2">{{ categoriesStore.error }}</p>
            <p class="text-xs text-muted mt-4">Asegúrate de haber ejecutado la migración SQL en Supabase.</p>
        </div>

        <div v-if="categoriesStore.loading && categoriesStore.categories.length === 0" class="flex justify-center p-20">
            <i class="fas fa-spinner fa-spin text-4xl text-accent"></i>
            <span class="ml-4 text-secondary">Cargando colecciones...</span>
        </div>

        <div v-else-if="categoriesStore.categories.length === 0" class="empty-state glass-card p-20 text-center">
            <i class="fas fa-layer-group text-6xl text-muted mb-6"></i>
            <h3 class="text-xl font-bold text-white">No tienes colecciones personalizadas</h3>
            <p class="text-secondary mt-2">Crea tu primera colección o restaura las predeterminadas.</p>
            <div class="flex gap-4 justify-center mt-8">
                <AppButton variant="primary" icon="fa-plus" @click="showAddModal = true">
                    Crear Colección
                </AppButton>
            </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="cat in categoriesStore.categories" :key="cat.id"
                class="category-card glass-card p-6 flex items-center justify-between group relative overflow-hidden"
                :class="{ 'opacity-50': cat.oculto }">
                <div class="flex items-center gap-4 relative z-10">
                    <div class="icon-box shadow-lg" :style="{ backgroundColor: cat.color, color: 'white' }">
                        <i class="fas" :class="cat.icono"></i>
                    </div>
                    <div>
                        <h4 class="text-lg font-bold text-white">{{ cat.nombre }}</h4>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-muted uppercase tracking-widest font-black">Colección</span>
                            <span v-if="cat.oculto"
                                class="text-[10px] bg-white/10 text-white/50 px-2 py-0.5 rounded uppercase font-bold">Oculta</span>
                        </div>
                    </div>
                </div>
                <div class="flex gap-2 relative z-10">
                    <button class="action-btn visibility" @click="handleToggleVisibility(cat)"
                        :title="cat.oculto ? 'Mostrar' : 'Ocultar'">
                        <i class="fas" :class="cat.oculto ? 'fa-eye-slash' : 'fa-eye'"></i>
                    </button>
                    <button class="action-btn edit" @click="openEditModal(cat)" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" @click="confirmDelete(cat)" title="Borrar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <!-- Background decoration -->
                <div class="absolute -right-4 -bottom-4 opacity-5 pointer-events-none transform rotate-12">
                    <i class="fas text-8xl" :class="cat.icono" :style="{ color: cat.color }"></i>
                </div>
            </div>
        </div>

        <!-- Add Modal -->
        <AppModal :is-open="showAddModal" title="Nueva Colección" @close="showAddModal = false">
            <div class="p-4 space-y-6">
                <div>
                    <label class="block text-sm font-bold text-secondary mb-2 uppercase tracking-wider">Nombre</label>
                    <input v-model="newCategory.nombre" type="text" placeholder="Ej: Cómics, Retro, Vinilos..."
                        class="w-full bg-surface-light border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent" />
                </div>

                <div>
                    <label class="block text-sm font-bold text-secondary mb-4 uppercase tracking-wider">Icono</label>
                    <div class="icon-grid">
                        <button v-for="icon in icons" :key="icon" class="icon-option"
                            :class="{ 'active': newCategory.icono === icon }" @click="newCategory.icono = icon">
                            <i class="fas" :class="icon"></i>
                        </button>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-bold text-secondary mb-4 uppercase tracking-wider">Color</label>
                    <div class="color-grid">
                        <button v-for="color in colors" :key="color" class="color-option"
                            :style="{ backgroundColor: color }" :class="{ 'selected': newCategory.color === color }"
                            @click="newCategory.color = color">
                        </button>
                    </div>
                </div>

                <div class="flex gap-4 pt-4">
                    <AppButton variant="glass" class="flex-1" @click="showAddModal = false">Cancelar</AppButton>
                    <AppButton variant="primary" class="flex-1" @click="handleAddCategory">Crear</AppButton>
                </div>
            </div>
        </AppModal>

        <!-- Edit Modal -->
        <AppModal :is-open="showEditModal" title="Editar Colección" @close="showEditModal = false">
            <div class="p-4 space-y-6">
                <div>
                    <label class="block text-sm font-bold text-secondary mb-2 uppercase tracking-wider">Nombre</label>
                    <input v-model="editCategoryData.nombre" type="text"
                        class="w-full bg-surface-light border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent" />
                </div>

                <div>
                    <label class="block text-sm font-bold text-secondary mb-4 uppercase tracking-wider">Icono</label>
                    <div class="icon-grid">
                        <button v-for="icon in icons" :key="icon" class="icon-option"
                            :class="{ 'active': editCategoryData.icono === icon }"
                            @click="editCategoryData.icono = icon">
                            <i class="fas" :class="icon"></i>
                        </button>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-bold text-secondary mb-4 uppercase tracking-wider">Color</label>
                    <div class="color-grid">
                        <button v-for="color in colors" :key="color" class="color-option"
                            :style="{ backgroundColor: color }"
                            :class="{ 'selected': editCategoryData.color === color }"
                            @click="editCategoryData.color = color">
                        </button>
                    </div>
                </div>

                <div class="flex gap-4 pt-4">
                    <AppButton variant="glass" class="flex-1" @click="showEditModal = false">Cancelar</AppButton>
                    <AppButton variant="primary" class="flex-1" @click="handleEditCategory">Guardar Cambios</AppButton>
                </div>
            </div>
        </AppModal>
    </div>
</template>

<style scoped>
.btn-back {
    background: transparent;
    border: none;
    color: var(--color-accent);
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    cursor: pointer;
    transition: opacity 0.2s;
}

.icon-box {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
}

.action-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    color: var(--color-text-secondary);
    transition: all 0.2s;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn.edit:hover {
    background: rgba(33, 150, 243, 0.1);
    color: #2196F3;
    border-color: #2196F3;
}

.action-btn.visibility:hover {
    background: rgba(0, 245, 255, 0.1);
    color: var(--color-accent);
    border-color: var(--color-accent);
}

.action-btn.delete:hover {
    background: rgba(244, 67, 54, 0.1);
    color: #F44336;
    border-color: #F44336;
}

.icon-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 8px;
}

.icon-option {
    padding: 12px;
    border-radius: var(--radius-lg);
    border: 1px solid rgba(255, 255, 255, 0.05);
    background: rgba(255, 255, 255, 0.03);
    color: var(--color-text-muted);
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.icon-option:hover {
    background: rgba(255, 255, 255, 0.08);
    color: white;
}

.icon-option.active {
    background: var(--color-accent);
    color: white;
    border-color: var(--color-accent);
    box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
}

.color-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 12px;
}

.color-option {
    width: 100%;
    aspect-ratio: 1/1;
    border-radius: 50%;
    border: 3px solid transparent;
    transition: all 0.2s;
    padding: 0;
    cursor: pointer;
}

.color-option:hover {
    transform: scale(1.1);
}

.color-option.selected {
    border-color: white;
    transform: scale(1.2);
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
}

@media (max-width: 640px) {

    .icon-grid,
    .color-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}
</style>
