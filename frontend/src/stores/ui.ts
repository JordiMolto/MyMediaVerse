import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const isModalOpen = ref(false)
  const isQuickAddOpen = ref(false)
  const modalComponent = ref<string | null>(null)
  const modalProps = ref<Record<string, any>>({})

  function toggleQuickAdd(value?: boolean) {
    if (value !== undefined) {
      isQuickAddOpen.value = value
    } else {
      isQuickAddOpen.value = !isQuickAddOpen.value
    }
  }

  function openModal(component: string, props: Record<string, any> = {}) {
    modalComponent.value = component
    modalProps.value = props
    isModalOpen.value = true
  }

  function closeModal() {
    isModalOpen.value = false
    modalComponent.value = null
    modalProps.value = {}
  }

  const isSideMenuOpen = ref(false)

  function toggleSideMenu(value?: boolean) {
    if (value !== undefined) {
      isSideMenuOpen.value = value
    } else {
      isSideMenuOpen.value = !isSideMenuOpen.value
    }
  }

  return {
    isModalOpen,
    isQuickAddOpen,
    isSideMenuOpen,
    modalComponent,
    modalProps,
    openModal,
    closeModal,
    toggleQuickAdd,
    toggleSideMenu
  }
})
