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
                            <i class="side-link-icon fas" :class="item.icon"></i>
                            <span class="side-link-text">{{ item.name }}</span>
                            <i v-if="route.path === item.path" class="active-indicator fas fa-chevron-right"></i>
                        </button>
                    </template>
                </nav>

                <div class="side-menu-footer">
                    <div v-if="authStore.isAuthenticated" class="user-profile-card">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar"
                            class="user-avatar" />
                        <div class="user-details">
                            <p class="user-name">{{ authStore.user?.email?.split('@')[0] }}</p>
                            <p class="user-email">{{ authStore.user?.email }}</p>
                        </div>
                        <button class="settings-btn" @click="navigateTo('/perfil')">
                            <i class="fas fa-cog"></i>
                        </button>
                    </div>
                    <div v-else class="auth-actions">
                        <button class="login-btn" @click="navigateTo('/login')">Entrar</button>
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
    width: 280px;
    background: var(--color-bg-surface);
    border-right: 1px solid var(--color-border);
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
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.side-menu-body {
    flex: 1;
    padding: 0 16px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

.side-nav {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.side-link {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    background: transparent;
    border: none;
    border-radius: 12px;
    color: var(--color-text-secondary);
    font-size: 15px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.03);
        color: white;
        transform: translateX(4px);
    }

    &.active {
        background: rgba(168, 85, 247, 0.1);
        color: var(--color-primary);
    }
}

.side-link-icon {
    width: 20px;
    text-align: center;
    font-size: 18px;
}

.active-indicator {
    margin-left: auto;
    font-size: 10px;
    opacity: 0.3;
}

.close-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid var(--color-border);
    background: rgba(255, 255, 255, 0.03);
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: var(--color-bg-card);
        color: white;
    }
}

.side-menu-footer {
    margin-top: auto;
    padding: 24px 16px;
    border-top: 1px solid var(--color-border);
}

.user-profile-card {
    background: rgba(255, 255, 255, 0.03);
    padding: 12px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}

.user-details {
    flex: 1;
    overflow: hidden;

    .user-name {
        font-size: 14px;
        font-weight: 700;
        color: white;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .user-email {
        font-size: 10px;
        color: var(--color-text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

.settings-btn {
    background: transparent;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 8px;
    transition: color 0.2s;

    &:hover {
        color: white;
    }
}

.auth-actions {
    padding: 8px;
}

.login-btn {
    width: 100%;
    padding: 12px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
        opacity: 0.9;
    }
}

@media (max-width: 768px) {
    .side-menu {
        width: 100%;
    }
}
</style>
