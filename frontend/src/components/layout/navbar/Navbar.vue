<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import BulkImportModal from '@/components/common/app-modal/BulkImportModal.vue'
import AppButton from '@/components/common/app-button/AppButton.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUIStore()

const isAuthPage = computed(() => {
    return route.name === 'login' || route.name === 'register'
})

function goToHome() {
    router.push('/')
}

const showImportModal = ref(false)

const handleImportSuccess = (count: number) => {
    // Ideally use a toast notification here
    alert(`Se han importado ${count} elementos correctamente.`)
}

</script>

<template>
    <div v-if="!isAuthPage" class="navbar-wrapper">
        <nav class="navbar">
            <div class="navbar-container">
                <!-- Left: Hamburger -->
                <button class="hamburger-btn" @click="uiStore.toggleSideMenu(true)" title="Menú">
                    <i class="fas fa-bars"></i>
                </button>

                <!-- Center: Brand -->
                <div class="navbar-brand" @click="goToHome">
                    <i class="fas fa-rocket"></i>
                    <span class="desktop-only">MyMediaVerse</span>
                </div>

                <!-- Right: Actions -->
                <div class="navbar-actions">
                    <button class="action-icon-btn highlight" title="Añadir rápido"
                        @click="uiStore.toggleQuickAdd(true)">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="action-icon-btn import-btn" title="Importar Masiva" @click="showImportModal = true">
                        <i class="fas fa-file-import"></i>
                    </button>
                    <div v-if="authStore.isAuthenticated" class="user-profile-trigger" @click="router.push('/perfil')"
                        title="Mi Perfil">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User Avatar"
                            class="avatar-img" />
                    </div>
                    <AppButton v-else variant="primary" size="small" icon="fa-sign-in-alt"
                        @click="router.push('/login')">
                        Entrar
                    </AppButton>
                </div>
            </div>
        </nav>
        <BulkImportModal :is-open="showImportModal" @close="showImportModal = false" @success="handleImportSuccess" />
    </div>
</template>

<style scoped src="./navbar.css"></style>
