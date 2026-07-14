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

export async function getCurrentUser() {
  if (!supabase) {
    return null
  }

  const { data, error } = await supabase.auth.getUser()

  if (error) {
    return null
  }

  return data.user ?? null
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

export function hasAdminRole(userOrSession) {
  const user = userOrSession?.user ?? userOrSession
  const appMetadata = user?.app_metadata ?? {}
  const roleValue = appMetadata.role ?? user?.role ?? ''
  const rolesValue = appMetadata.roles

  return roleValue === 'admin' || (Array.isArray(rolesValue) && rolesValue.includes('admin'))
}

export async function updateCurrentUserProfile({ nickname, avatarUrl, avatarPath }) {
  if (!supabase) {
    return {
      error: {
        message:
          'Authentication is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in app/.env.',
      },
      user: null,
    }
  }

  const payload = {
    data: {
      nickname,
      avatar_url: avatarUrl,
      avatar_path: avatarPath,
    },
  }

  const { data, error } = await supabase.auth.updateUser(payload)

  return {
    error,
    user: data.user ?? null,
  }
}

export async function uploadAvatarFile(file, userId) {
  if (!supabase) {
    return {
      error: {
        message:
          'Authentication is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in app/.env.',
      },
      path: null,
      publicUrl: null,
    }
  }

  const fileExtension = file.name.includes('.') ? file.name.split('.').pop() : 'png'
  const cleanExtension = String(fileExtension || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png'
  const avatarPath = `${userId}/${Date.now()}-${crypto.randomUUID()}.${cleanExtension}`

  const { error: uploadError } = await supabase.storage.from('avatars').upload(avatarPath, file, {
    upsert: true,
    contentType: file.type || 'image/png',
    cacheControl: '3600',
  })

  if (uploadError) {
    return {
      error: uploadError,
      path: null,
      publicUrl: null,
    }
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(avatarPath)

  return {
    error: null,
    path: avatarPath,
    publicUrl: data.publicUrl,
  }
}

export async function removeAvatarFile(avatarPath) {
  if (!supabase || !avatarPath) {
    return {
      error: null,
    }
  }

  const { error } = await supabase.storage.from('avatars').remove([avatarPath])

  return {
    error,
  }
}
