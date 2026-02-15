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
    <div v-if="!isAuthPage">
        <!-- Mobile Top Header -->
        <header class="mobile-header">
            <div class="navbar-brand" @click="goToHome">
                <i class="fas fa-rocket"></i>
                <span class="brand-text">MyMediaVerse</span>
            </div>

            <div class="mobile-actions">
                <button class="icon-btn highlight" @click="uiStore.toggleQuickAdd(true)" title="Añadir rápido">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="icon-btn" @click="showImportModal = true">
                    <i class="fas fa-file-import"></i>
                </button>
                <button class="icon-btn">
                    <i class="fas fa-bell"></i>
                </button>
                <div v-if="authStore.isAuthenticated" class="user-profile-trigger" @click="router.push('/perfil')">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User Avatar"
                        class="avatar-img shadow-sm" />
                </div>
                <button v-else class="login-btn-mobile" @click="router.push('/login')">
                    <i class="fas fa-sign-in-alt"></i>
                </button>
            </div>
        </header>

        <!-- Main Desktop / Mobile Bottom Nav -->
        <nav class="navbar">
            <div class="navbar-container">
                <div class="navbar-brand desktop-only" @click="goToHome">
                    <i class="fas fa-rocket"></i>
                    <span>MyMediaVerse</span>
                </div>

                <div class="navbar-menu">
                    <button class="nav-link" :class="{ active: route.name === 'home' }" @click="router.push('/')">
                        <i class="fas fa-home"></i>
                        <span>Inicio</span>
                    </button>
                    <button class="nav-link" :class="{ active: route.name === 'pending' }"
                        @click="router.push('/pendiente')">
                        <i class="fas fa-clock"></i>
                        <span>Pendiente</span>
                    </button>
                    <button class="nav-link" :class="{ active: route.name === 'in-progress' }"
                        @click="router.push('/en-progreso')">
                        <i class="fas fa-play"></i>
                        <span>En Progreso</span>
                    </button>
                    <button class="nav-link" :class="{ active: route.name === 'completed' }"
                        @click="router.push('/hecho')">
                        <i class="fas fa-check-circle"></i>
                        <span>Completado</span>
                    </button>
                    <button class="nav-link" :class="{ active: route.name === 'collections' }"
                        @click="router.push('/colecciones')">
                        <i class="fas fa-layer-group"></i>
                        <span>Colecciones</span>
                    </button>
                </div>

                <div class="navbar-actions desktop-only">
                    <button class="icon-btn highlight" title="Añadir rápido" @click="uiStore.toggleQuickAdd(true)">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="icon-btn" title="Importar Masiva" @click="showImportModal = true">
                        <i class="fas fa-file-import"></i>
                    </button>
                    <button class="icon-btn" title="Notificaciones">
                        <i class="fas fa-bell"></i>
                    </button>
                    <div v-if="authStore.isAuthenticated" class="user-profile-trigger" @click="router.push('/perfil')"
                        title="Mi Perfil">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User Avatar"
                            class="avatar-img shadow-sm" />
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
