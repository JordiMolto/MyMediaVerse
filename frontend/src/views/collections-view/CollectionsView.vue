<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCategoriesStore } from "@/stores/categories";
import AppModal from "@/components/common/app-modal/AppModal.vue";
import AppButton from "@/components/common/app-button/AppButton.vue";
import "./collections-view.css";

const router = useRouter();
const categoriesStore = useCategoriesStore();

const showAddModal = ref(false);
const showEditModal = ref(false);
const selectedCategory = ref<any>(null);

const newCategory = ref({
  nombre: "",
  icono: "fa-folder",
  color: "#FF5722",
});

const editCategoryData = ref({
  nombre: "",
  icono: "",
  color: "",
});

onMounted(() => {
  categoriesStore.fetchCategories();
});

const handleAddCategory = async () => {
  if (!newCategory.value.nombre) return;
  try {
    await categoriesStore.createCategory({ ...newCategory.value });
    showAddModal.value = false;
    newCategory.value = { nombre: "", icono: "fa-folder", color: "#FF5722" };
  } catch (err) {
    alert("Error al crear la colección");
  }
};

const handleEditCategory = async () => {
  if (!selectedCategory.value || !editCategoryData.value.nombre) return;
  try {
    await categoriesStore.updateCategory(selectedCategory.value.id, {
      ...editCategoryData.value,
    });
    showEditModal.value = false;
    selectedCategory.value = null;
  } catch (err) {
    alert("Error al actualizar la colección");
  }
};

const openEditModal = (category: any) => {
  selectedCategory.value = category;
  editCategoryData.value = {
    nombre: category.nombre,
    icono: category.icono,
    color: category.color,
  };
  showEditModal.value = true;
};

const handleToggleVisibility = async (category: any) => {
  try {
    await categoriesStore.updateCategory(category.id, {
      oculto: !category.oculto,
    });
  } catch (err) {
    alert("Error al cambiar la visibilidad");
  }
};

const confirmDelete = async (category: any) => {
  if (
    confirm(
      `¿Estás seguro de que quieres borrar la colección "${category.nombre}"?`,
    )
  ) {
    try {
      await categoriesStore.deleteCategory(category.id);
    } catch (err) {
      alert("Error al borrar la colección");
    }
  }
};

const icons = [
  "fa-folder",
  "fa-film",
  "fa-tv",
  "fa-book",
  "fa-gamepad",
  "fa-dice",
  "fa-music",
  "fa-headphones",
  "fa-camera",
  "fa-paint-brush",
  "fa-code",
  "fa-heart",
  "fa-star",
  "fa-rocket",
  "fa-ghost",
  "fa-mask",
];

const colors = [
  "#A855F7",
  "#00F5FF",
  "#4CAF50",
  "#FFC107",
  "#FF5722",
  "#F44336",
  "#E91E63",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
  "#2196F3",
  "#00BCD4",
  "#009688",
  "#8BC34A",
  "#CDDC39",
  "#FFEB3B",
];
</script>

<template>
  <div class="collections-view">
    <header class="collections-header">
      <div class="header-info">
        <button class="btn-back" @click="router.push('/perfil')">
          <i class="fas fa-arrow-left"></i> Volver a Perfil
        </button>
        <h1 class="page-title">Mis Colecciones</h1>
        <p class="page-subtitle">Gestiona las categorías de tus medios.</p>
      </div>
      <AppButton variant="primary" icon="fa-plus" @click="showAddModal = true">
        Añadir Colección
      </AppButton>
    </header>

    <div v-if="categoriesStore.error" class="error-state glass-card">
      <i class="fas fa-exclamation-triangle error-icon"></i>
      <h3 class="state-title">¡No se pudieron cargar las colecciones!</h3>
      <p class="state-body">{{ categoriesStore.error }}</p>
      <p class="state-hint">
        Asegúrate de haber ejecutado la migración SQL en Supabase.
      </p>
    </div>

    <div
      v-if="categoriesStore.loading && categoriesStore.categories.length === 0"
      class="loading-state"
    >
      <i class="fas fa-spinner fa-spin loading-icon"></i>
      <span class="loading-text">Cargando colecciones...</span>
    </div>

    <div
      v-else-if="categoriesStore.categories.length === 0"
      class="empty-state glass-card"
    >
      <i class="fas fa-layer-group empty-icon"></i>
      <h3 class="state-title">No tienes colecciones personalizadas</h3>
      <p class="state-body">
        Crea tu primera colección o restaura las predeterminadas.
      </p>
      <div class="empty-actions">
        <AppButton
          variant="primary"
          icon="fa-plus"
          @click="showAddModal = true"
        >
          Crear Colección
        </AppButton>
      </div>
    </div>

    <div v-else class="categories-grid">
      <div
        v-for="cat in categoriesStore.categories"
        :key="cat.id"
        class="category-card glass-card"
        :class="{ 'is-hidden': cat.oculto }"
      >
        <div class="card-body">
          <div
            class="icon-box"
            :style="{ backgroundColor: cat.color, color: 'white' }"
          >
            <i class="fas" :class="cat.icono"></i>
          </div>
          <div class="card-info">
            <h4 class="cat-name">{{ cat.nombre }}</h4>
            <div class="cat-meta">
              <span class="cat-type">Colección</span>
              <span v-if="cat.oculto" class="hidden-badge">Oculta</span>
            </div>
          </div>
        </div>
        <div class="card-actions">
          <button
            class="action-btn action-btn--visibility"
            @click="handleToggleVisibility(cat)"
            :title="cat.oculto ? 'Mostrar' : 'Ocultar'"
          >
            <i class="fas" :class="cat.oculto ? 'fa-eye-slash' : 'fa-eye'"></i>
          </button>
          <button
            class="action-btn action-btn--edit"
            @click="openEditModal(cat)"
            title="Editar"
          >
            <i class="fas fa-edit"></i>
          </button>
          <button
            class="action-btn action-btn--delete"
            @click="confirmDelete(cat)"
            title="Borrar"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div class="card-decoration" aria-hidden="true">
          <i class="fas" :class="cat.icono" :style="{ color: cat.color }"></i>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <AppModal
      :is-open="showAddModal"
      title="Nueva Colección"
      @close="showAddModal = false"
    >
      <div class="modal-form">
        <div class="modal-field">
          <label class="field-label">Nombre</label>
          <input
            v-model="newCategory.nombre"
            type="text"
            placeholder="Ej: Cómics, Retro, Vinilos..."
            class="field-input"
          />
        </div>

        <div class="modal-field">
          <label class="field-label">Icono</label>
          <div class="icon-grid">
            <button
              v-for="icon in icons"
              :key="icon"
              class="icon-option"
              :class="{ active: newCategory.icono === icon }"
              @click="newCategory.icono = icon"
            >
              <i class="fas" :class="icon"></i>
            </button>
          </div>
        </div>

        <div class="modal-field">
          <label class="field-label">Color</label>
          <div class="color-grid">
            <button
              v-for="color in colors"
              :key="color"
              class="color-option"
              :style="{ backgroundColor: color }"
              :class="{ selected: newCategory.color === color }"
              @click="newCategory.color = color"
            ></button>
          </div>
        </div>

        <div class="modal-actions">
          <AppButton variant="glass" @click="showAddModal = false"
            >Cancelar</AppButton
          >
          <AppButton variant="primary" @click="handleAddCategory"
            >Crear</AppButton
          >
        </div>
      </div>
    </AppModal>

    <!-- Edit Modal -->
    <AppModal
      :is-open="showEditModal"
      title="Editar Colección"
      @close="showEditModal = false"
    >
      <div class="modal-form">
        <div class="modal-field">
          <label class="field-label">Nombre</label>
          <input
            v-model="editCategoryData.nombre"
            type="text"
            class="field-input"
          />
        </div>

        <div class="modal-field">
          <label class="field-label">Icono</label>
          <div class="icon-grid">
            <button
              v-for="icon in icons"
              :key="icon"
              class="icon-option"
              :class="{ active: editCategoryData.icono === icon }"
              @click="editCategoryData.icono = icon"
            >
              <i class="fas" :class="icon"></i>
            </button>
          </div>
        </div>

        <div class="modal-field">
          <label class="field-label">Color</label>
          <div class="color-grid">
            <button
              v-for="color in colors"
              :key="color"
              class="color-option"
              :style="{ backgroundColor: color }"
              :class="{ selected: editCategoryData.color === color }"
              @click="editCategoryData.color = color"
            ></button>
          </div>
        </div>

        <div class="modal-actions">
          <AppButton variant="glass" @click="showEditModal = false"
            >Cancelar</AppButton
          >
          <AppButton variant="primary" @click="handleEditCategory"
            >Guardar Cambios</AppButton
          >
        </div>
      </div>
    </AppModal>
  </div>
</template>
