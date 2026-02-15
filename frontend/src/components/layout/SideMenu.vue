<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const uiStore = useUIStore()
const authStore = useAuthStore()

const menuItems = [
    { name: 'Inicio', icon: 'fa-home', path: '/' },
    { name: 'Pendiente', icon: 'fa-clock', path: '/pendiente' },
    { name: 'En Progreso', icon: 'fa-play', path: '/en-progreso' },
    { name: 'Completado', icon: 'fa-check-circle', path: '/hecho' },
    { name: 'Favoritos', icon: 'fa-heart', path: '/favoritos', color: 'text-pink-500' },
    { name: 'Colecciones', icon: 'fa-layer-group', path: '/colecciones' }
]

function navigateTo(path: string) {
    router.push(path)
    uiStore.toggleSideMenu(false)
}

function handleOverlayClick() {
    uiStore.toggleSideMenu(false)
}
</script>

<template>
    <div class="side-menu-wrapper" :class="{ 'is-open': uiStore.isSideMenuOpen }">
        <!-- Backdrop Backdrop Overlay -->
        <div class="side-menu-overlay" @click="handleOverlayClick"></div>

        <!-- Sidebar Content -->
        <aside class="side-menu">
            <div class="side-menu-header">
                <div class="navbar-brand" @click="navigateTo('/')">
                    <i class="fas fa-rocket"></i>
                    <span>MyMediaVerse</span>
                </div>
                <button class="close-btn" @click="uiStore.toggleSideMenu(false)">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="side-menu-body">
                <nav class="side-nav">
                    <template v-for="item in menuItems" :key="item.path">
                        <button class="side-link" :class="{
                            'active': route.path === item.path,
                            [item.color || '']: true
                        }" @click="navigateTo(item.path)">
                            <i class="fas" :class="item.icon"></i>
                            <span>{{ item.name }}</span>
                            <i v-if="route.path === item.path"
                                class="fas fa-chevron-right ml-auto text-[10px] opacity-30"></i>
                        </button>
                    </template>
                </nav>

                <div class="side-menu-footer mt-auto pt-8">
                    <div v-if="authStore.isAuthenticated"
                        class="user-info p-4 rounded-2xl bg-white/5 flex items-center gap-3">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar"
                            class="w-10 h-10 rounded-full" />
                        <div class="flex-1 overflow-hidden">
                            <p class="text-sm font-bold text-white truncate">{{ authStore.user?.email?.split('@')[0] }}
                            </p>
                            <p class="text-[10px] text-muted truncate">{{ authStore.user?.email }}</p>
                        </div>
                        <button class="icon-btn" @click="navigateTo('/perfil')">
                            <i class="fas fa-cog"></i>
                        </button>
                    </div>
                    <div v-else class="p-4">
                        <button class="btn btn-primary w-full" @click="navigateTo('/login')">Entrar</button>
                    </div>
                </div>
            </div>
        </aside>
    </div>
</template>

<style scoped>
.side-menu-wrapper {
    position: fixed;
    inset: 0;
    z-index: 1000;
    pointer-events: none;
    visibility: hidden;
    transition: visibility 0.4s;
}

.side-menu-wrapper.is-open {
    pointer-events: auto;
    visibility: visible;
}

.side-menu-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    opacity: 0;
    transition: opacity 0.4s ease;
}

.side-menu-wrapper.is-open .side-menu-overlay {
    opacity: 1;
}

.side-menu {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 300px;
    background: #0a0c10;
    border-right: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    flex-direction: column;
    transform: translateX(-100%);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 20px 0 50px rgba(0, 0, 0, 0.5);
}

.side-menu-wrapper.is-open .side-menu {
    transform: translateX(0);
}

.side-menu-header {
    padding: var(--space-8);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.side-menu-body {
    flex: 1;
    padding: 0 var(--space-4);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

.side-nav {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.side-link {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-4) var(--space-5);
    background: transparent;
    border: none;
    border-radius: var(--radius-xl);
    color: var(--color-text-secondary);
    font-size: var(--fs-md);
    font-weight: var(--fw-bold);
    text-align: left;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.side-link:hover {
    background: rgba(255, 255, 255, 0.03);
    color: white;
    transform: translateX(5px);
}

.side-link.active {
    background: rgba(var(--color-primary-rgb), 0.1);
    color: var(--color-primary);
    box-shadow: inset 0 0 20px rgba(var(--color-primary-rgb), 0.05);
}

.side-link i {
    width: 20px;
    text-align: center;
}

.close-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.05);
    background: rgba(255, 255, 255, 0.03);
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
}

.close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

.user-info .icon-btn {
    background: transparent;
    border: none;
    color: var(--color-text-muted);
}
</style>
