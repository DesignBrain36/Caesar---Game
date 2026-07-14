import { getSupabaseClient } from './auth.js'

function assertSupabase() {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return null
  }

  return supabase
}

export async function fetchAdminTable(table, select = '*', orderBy = 'id', ascending = true) {
  const supabase = assertSupabase()

  if (!supabase) {
    return {
      error: {
        message: 'Supabase is not configured.',
      },
      records: [],
    }
  }

  const { data, error } = await supabase
    .from(table)
    .select(select)
    .order(orderBy, { ascending })

  return {
    error,
    records: data ?? [],
  }
}

export async function saveAdminTableRecord(table, recordId, payload) {
  const supabase = assertSupabase()

  if (!supabase) {
    return {
      error: {
        message: 'Supabase is not configured.',
      },
      record: null,
    }
  }

  const query = recordId
    ? supabase.from(table).update(payload).eq('id', recordId)
    : supabase.from(table).insert(payload)

  const { data, error } = await query.select('id').maybeSingle()

  return {
    error,
    record: data ?? null,
  }
}

export async function deleteAdminTableRecord(table, recordId) {
  const supabase = assertSupabase()

  if (!supabase) {
    return {
      error: {
        message: 'Supabase is not configured.',
      },
    }
  }

  const { error } = await supabase.from(table).delete().eq('id', recordId)

  return { error }
}

export async function fetchAdminUsers() {
  const supabase = assertSupabase()

  if (!supabase) {
    return {
      error: {
        message: 'Supabase is not configured.',
      },
      records: [],
    }
  }

  const { data, error } = await supabase.rpc('admin_list_users')

  return {
    error,
    records: data ?? [],
  }
}

export async function saveAdminUser(userId, { nickname, avatarUrl, avatarPath, role }) {
  const supabase = assertSupabase()

  if (!supabase) {
    return {
      error: {
        message: 'Supabase is not configured.',
      },
    }
  }

  const { error } = await supabase.rpc('admin_update_user', {
    target_user_id: userId,
    user_metadata: {
      nickname,
      avatar_url: avatarUrl,
      avatar_path: avatarPath,
    },
    app_metadata: {
      role: role || null,
    },
  })

  return { error }
}

export async function deleteAdminUser(userId) {
  const supabase = assertSupabase()

  if (!supabase) {
    return {
      error: {
        message: 'Supabase is not configured.',
      },
    }
  }

  const { error } = await supabase.rpc('admin_delete_user', {
    target_user_id: userId,
  })

  return { error }
}