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
  const canUseSupabase = computed(() => !!supabase && isAuthenticated.value)

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
    if (!supabase) {
      error.value = 'Supabase not configured'
      return null
    }

    loading.value = true
    error.value = null
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (signInError) throw signInError
      
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

  async function initialize() {
    if (!supabase) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user ?? null

      supabase.auth.onAuthStateChange((_event, session) => {
        user.value = session?.user ?? null
      })
    } catch (e) {
      console.error('Auth initialization error:', e)
    }
  }

  return {
    user,
    loading,
    initialized,
    error,
    isAuthenticated,
    canUseSupabase,
    signUp,
    signIn,
    signOut,
    initialize
  }
})
