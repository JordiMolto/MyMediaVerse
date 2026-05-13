import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/config/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const initialized = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const isMock = computed(() => user.value?.email === 'test@example.com')
  
  // Only allow Supabase if it exists, user is logged in, AND it's not the mock user
  const canUseSupabase = computed(() => !!supabase && isAuthenticated.value && !isMock.value)

  async function signUp(email: string, password: string) {
    if (!supabase) {
      error.value = 'Supabase not configured'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      })

      if (signUpError) throw signUpError

      user.value = data.user
      return data
    } catch (e: any) {
      error.value = e.message || 'Error al registrarse'
      console.error('Sign up error:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function signIn(email: string, password: string) {
    console.log('SignIn attempt with:', email);
    
    // Desarrollo local: bypass de login para testeo
    if (email === 'test@example.com' && password === 'password123') {
      console.log('Using test login bypass');
      user.value = {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'test@example.com',
        user_metadata: { display_name: 'Usuario de Test' },
        aud: 'authenticated',
        role: 'authenticated',
      } as any
      return { data: { user: user.value, session: {} }, error: null }
    }

    if (!supabase) {
      console.error('Supabase not configured in signIn');
      error.value = 'Supabase not configured'
      throw new Error('Supabase not configured. Revisa tu archivo .env')
    }

    loading.value = true
    error.value = null

    try {
      console.log('Calling Supabase signInWithPassword...');
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        console.error('Supabase signIn error:', signInError);
        throw signInError
      }

      console.log('Login successful, user:', data.user?.email);
      user.value = data.user
      return data
    } catch (e: any) {
      error.value = e.message || 'Error al iniciar sesión'
      console.error('Sign in error:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    if (isMock.value) {
      user.value = null
      return
    }

    if (!supabase) return

    loading.value = true
    error.value = null

    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError

      user.value = null
    } catch (e: any) {
      error.value = e.message || 'Error al cerrar sesión'
      console.error('Sign out error:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateUser(updates: { display_name?: string; avatar_url?: string }) {
    if (isMock.value) {
      if (user.value) {
        user.value.user_metadata = { ...user.value.user_metadata, ...updates }
      }
      return user.value
    }

    if (!supabase) return

    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: updates
      })

      if (updateError) throw updateError
      user.value = data.user
      return data.user
    } catch (e: any) {
      error.value = e.message || 'Error al actualizar perfil'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function initialize() {
    console.log('Initializing Auth Store...');
    try {
      if (!supabase) {
        console.warn('Supabase not configured. Running in local-only mode.');
        initialized.value = true;
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user ?? null
      console.log('Initial auth session:', session ? 'User logged in' : 'No user');

      supabase.auth.onAuthStateChange((_event, session) => {
        console.log('Auth state change event:', _event);
        // Only update if not in mock mode or if we're actually getting a real session
        if (!isMock.value || session) {
          user.value = session?.user ?? null
        }
      })
    } catch (e) {
      console.error('Auth initialization error:', e)
    } finally {
      initialized.value = true
      console.log('Auth Store initialized.');
    }
  }

  return {
    user,
    loading,
    initialized,
    error,
    isAuthenticated,
    isMock,
    canUseSupabase,
    signUp,
    signIn,
    signOut,
    updateUser,
    initialize
  }
})
