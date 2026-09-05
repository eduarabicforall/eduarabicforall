import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(url && anonKey)

if (!supabaseConfigured) {
  // eslint-disable-next-line no-console
  console.error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — the app cannot ' +
    'reach Supabase. Set them in .env.local (see .env.example). There is ' +
    'no demo/offline fallback: features stay disabled until this is set.'
  )
}

export const supabase = supabaseConfigured
  ? createClient(url, anonKey)
  : null
