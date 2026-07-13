import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)

const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

export function isAuthConfigured() {
  return hasSupabaseConfig
}

export async function getCurrentSession() {
  if (!supabase) {
    return null
  }

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    return null
  }

  return data.session ?? null
}

export async function loginWithPassword(email, password) {
  if (!supabase) {
    return {
      error: {
        message:
          'Authentication is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in app/.env.',
      },
      session: null,
    }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return {
    error,
    session: data.session ?? null,
  }
}

export async function registerWithPassword(email, password) {
  if (!supabase) {
    return {
      error: {
        message:
          'Authentication is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in app/.env.',
      },
      session: null,
      user: null,
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  return {
    error,
    session: data.session ?? null,
    user: data.user ?? null,
  }
}

export async function logoutUser() {
  if (!supabase) {
    return {
      error: null,
    }
  }

  const { error } = await supabase.auth.signOut()
  return {
    error,
  }
}

export function navigateTo(path, replace = false) {
  if (replace) {
    window.history.replaceState({}, '', path)
  } else {
    window.history.pushState({}, '', path)
  }

  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function getSupabaseClient() {
  return supabase
}
