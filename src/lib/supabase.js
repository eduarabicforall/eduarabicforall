import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// ─── Demo Mode (localStorage) ───────────────────────────────────────
const DEMO_USER_KEY = 'ea_demo_user'
const DEMO_SESSION_KEY = 'ea_demo_session'

function getDemoUser() {
  try {
    const raw = localStorage.getItem(DEMO_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function setDemoUser(user) {
  if (user) localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(DEMO_USER_KEY)
}

function getDemoSession() {
  try {
    const raw = localStorage.getItem(DEMO_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function setDemoSession(session) {
  if (session) localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session))
  else localStorage.removeItem(DEMO_SESSION_KEY)
}

function genId() {
  return 'demo-' + Math.random().toString(36).slice(2, 12)
}

// ─── Unified Auth API ───────────────────────────────────────────────
// Works with both real Supabase and demo mode

export async function authSignIn(email, password) {
  if (supabase) {
    return supabase.auth.signInWithPassword({ email, password })
  }
  // Demo mode: accept any email/password
  const user = {
    id: genId(),
    email,
    user_metadata: { full_name: email.split('@')[0] },
    created_at: new Date().toISOString(),
  }
  const session = { access_token: 'demo-token', user }
  setDemoUser(user)
  setDemoSession(session)
  return { data: { user, session }, error: null }
}

export async function authSignUp(email, password, fullName) {
  if (supabase) {
    return supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
  }
  const user = {
    id: genId(),
    email,
    user_metadata: { full_name: fullName || email.split('@')[0] },
    created_at: new Date().toISOString(),
  }
  const session = { access_token: 'demo-token', user }
  setDemoUser(user)
  setDemoSession(session)
  return { data: { user, session }, error: null }
}

export async function authSignInWithGoogle() {
  if (supabase) {
    return supabase.auth.signInWithOAuth({ provider: 'google' })
  }
  // Demo mode: simulate Google sign-in
  const user = {
    id: genId(),
    email: 'demo@gmail.com',
    user_metadata: { full_name: 'Demo User', avatar_url: '' },
    created_at: new Date().toISOString(),
  }
  const session = { access_token: 'demo-token', user }
  setDemoUser(user)
  setDemoSession(session)
  return { data: { user, session }, error: null }
}

export async function authSignOut() {
  if (supabase) {
    return supabase.auth.signOut()
  }
  setDemoUser(null)
  setDemoSession(null)
  return { error: null }
}

export function authGetSession() {
  if (supabase) {
    return supabase.auth.getSession()
  }
  const session = getDemoSession()
  return Promise.resolve({ data: { session }, error: null })
}

export function authOnAuthStateChange(callback) {
  if (supabase) {
    return supabase.auth.onAuthStateChange(callback)
  }
  // Demo mode: fire initial callback with current state
  const session = getDemoSession()
  const user = session?.user || null
  setTimeout(() => callback('INITIAL', session), 0)
  return { data: { subscription: { unsubscribe: () => {} } } }
}

// ─── Demo Profile ───────────────────────────────────────────────────
const DEMO_PROFILE_KEY = 'ea_demo_profile'

function getDemoProfile() {
  try {
    const raw = localStorage.getItem(DEMO_PROFILE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function setDemoProfile(profile) {
  if (profile) localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(profile))
  else localStorage.removeItem(DEMO_PROFILE_KEY)
}

export function getProfile(userId) {
  if (supabase) {
    return supabase.from('profiles').select('*').eq('id', userId).single()
  }
  const profile = getDemoProfile()
  if (!profile) {
    const newProfile = {
      id: userId,
      full_name: getDemoUser()?.user_metadata?.full_name || 'Demo User',
      role: 'user',
      plan: 'free',
      xp: 1240,
      streak: 12,
      locale: 'en',
    }
    setDemoProfile(newProfile)
    return Promise.resolve({ data: newProfile, error: null })
  }
  return Promise.resolve({ data: profile, error: null })
}

export function updateProfile(userId, updates) {
  if (supabase) {
    return supabase.from('profiles').update(updates).eq('id', userId)
  }
  const profile = { ...getDemoProfile(), ...updates }
  setDemoProfile(profile)
  return Promise.resolve({ data: profile, error: null })
}

// ─── Demo Admin ─────────────────────────────────────────────────────
export function isAdmin(userId) {
  const profile = getDemoProfile()
  return profile?.role === 'admin'
}

export function makeAdmin() {
  const profile = getDemoProfile()
  if (profile) {
    profile.role = 'admin'
    setDemoProfile(profile)
  }
}

// ─── Progress ───────────────────────────────────────────────────────
const DEMO_PROGRESS_KEY = 'ea_demo_progress'

function getDemoProgress() {
  try {
    const raw = localStorage.getItem(DEMO_PROGRESS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function setDemoProgress(progress) {
  localStorage.setItem(DEMO_PROGRESS_KEY, JSON.stringify(progress))
}

export function getProgress(userId) {
  if (supabase) {
    return supabase.from('progress').select('*').eq('user_id', userId)
  }
  return Promise.resolve({ data: getDemoProgress(), error: null })
}

export function updateProgress(userId, lessonId, status) {
  if (supabase) {
    return supabase.from('progress').upsert({ user_id: userId, lesson_id: lessonId, status, completed_at: status === 'done' ? new Date().toISOString() : null })
  }
  const progress = getDemoProgress()
  const idx = progress.findIndex(p => p.lesson_id === lessonId)
  if (idx >= 0) { progress[idx].status = status }
  else { progress.push({ user_id: userId, lesson_id: lessonId, status, completed_at: status === 'done' ? new Date().toISOString() : null }) }
  setDemoProgress(progress)
  return Promise.resolve({ data: progress, error: null })
}
