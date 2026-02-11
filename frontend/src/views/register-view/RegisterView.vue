<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppInput from '@/components/common/app-input/AppInput.vue'
import AppButton from '@/components/common/app-button/AppButton.vue'
import AppCard from '@/components/common/app-card/AppCard.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errors = ref<Record<string, string>>({})

function validate(): boolean {
    errors.value = {}

    if (!email.value.trim()) {
        errors.value.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        errors.value.email = 'Email inválido'
    }

    if (!password.value) {
        errors.value.password = 'La contraseña es obligatoria'
    } else if (password.value.length < 6) {
        errors.value.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (password.value !== confirmPassword.value) {
        errors.value.confirmPassword = 'Las contraseñas no coinciden'
    }

    return Object.keys(errors.value).length === 0
}

async function handleRegister() {
    if (!validate()) return

    try {
        await authStore.signUp(email.value, password.value)
        router.push('/')
    } catch (error: any) {
        errors.value.general = error.message || 'Error al registrarse'
    }
}

function goToLogin() {
    router.push('/login')
}
</script>

<template>
    <div class="register-view">
        <div class="container">
            <div class="register-container">
                <AppCard padding="large">
                    <div class="register-header">
                        <h1 class="register-title">Crear Cuenta</h1>
                        <p class="register-subtitle">Únete a MyMediaVerse</p>
                    </div>

                    <form @submit.prevent="handleRegister" class="register-form">
                        <AppInput v-model="email" type="email" label="Email" placeholder="tu@email.com"
                            icon="fa-envelope" :error="errors.email" required />

                        <AppInput v-model="password" type="password" label="Contraseña" placeholder="••••••••"
                            icon="fa-lock" :error="errors.password" required />

                        <AppInput v-model="confirmPassword" type="password" label="Confirmar Contraseña"
                            placeholder="••••••••" icon="fa-lock" :error="errors.confirmPassword" required />

                        <div v-if="errors.general" class="error-message">
                            <i class="fas fa-exclamation-circle"></i>
                            {{ errors.general }}
                        </div>

                        <AppButton type="submit" variant="primary" size="large" :loading="authStore.loading" full-width>
                            Crear Cuenta
                        </AppButton>
                    </form>

                    <div class="register-footer">
                        <p>¿Ya tienes cuenta?</p>
                        <AppButton variant="ghost" @click="goToLogin">
                            Inicia sesión aquí
                        </AppButton>
                    </div>
                </AppCard>
            </div>
        </div>
    </div>
</template>

<style scoped>
.register-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background: radial-gradient(circle at top left, var(--color-primary-alpha), transparent),
              radial-gradient(circle at bottom right, var(--color-accent-alpha), transparent),
              var(--color-bg-main);

  .register-container {
    width: 100%;
    margin: 0 auto;
    max-width: 450px;
  }

  .register-header {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);

    .register-title {
      font-size: var(--fs-3xl);
      font-weight: var(--fw-bold);
      color: var(--color-text-primary);
    }

    .register-subtitle {
      color: var(--color-text-secondary);
      font-size: var(--fs-base);
    }
  }

  .register-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .error-message {
    padding: var(--space-3) var(--space-4);
    background: hsla(0, 85%, 60%, 0.1);
    border: 1px solid var(--color-danger);
    border-radius: var(--radius-md);
    color: var(--color-danger);
    font-size: var(--fs-sm);
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .register-footer {
    text-align: center;
    padding-top: var(--space-6);
    border-top: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);

    p {
      color: var(--color-text-secondary);
      font-size: var(--fs-sm);
    }
  }

  @media (max-width: 768px) {
    padding: var(--space-4);
  }
}
</style>
