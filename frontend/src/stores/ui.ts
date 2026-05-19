import { defineStore } from "pinia";
import { ref, reactive } from "vue";

export const useUIStore = defineStore("ui", () => {
  const isModalOpen = ref(false);
  const isQuickAddOpen = ref(false);
  const quickAddContext = ref<{ type?: string; status?: string }>({});
  const modalComponent = ref<string | null>(null);
  const modalProps = ref<Record<string, any>>({});

  const viewFilters = reactive({
    pending: null as string | null,
    inProgress: null as string | null,
    completed: null as string | null,
    favorites: null as string | null,
    favoritesStatus: "" as string,
    home: "all" as string,
  });

  function toggleQuickAdd(
    value?: boolean,
    context: { type?: string; status?: string } = {},
  ) {
    if (context.type || context.status) {
      quickAddContext.value = context;
    }

    if (value !== undefined) {
      isQuickAddOpen.value = value;
    } else {
      isQuickAddOpen.value = !isQuickAddOpen.value;
    }
  }

  function openModal(component: string, props: Record<string, any> = {}) {
    modalComponent.value = component;
    modalProps.value = props;
    isModalOpen.value = true;
  }

  function closeModal() {
    isModalOpen.value = false;
    modalComponent.value = null;
    modalProps.value = {};
  }

  const isSideMenuOpen = ref(false);

  function toggleSideMenu(value?: boolean) {
    if (value !== undefined) {
      isSideMenuOpen.value = value;
    } else {
      isSideMenuOpen.value = !isSideMenuOpen.value;
    }
  }

  return {
    isModalOpen,
    isQuickAddOpen,
    quickAddContext,
    isSideMenuOpen,
    modalComponent,
    modalProps,
    viewFilters,
    openModal,
    closeModal,
    toggleQuickAdd,
    toggleSideMenu,
  };
});
