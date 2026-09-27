import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { checkDeviceSession, clearDeviceId, DEVICE_CHECK_INTERVAL_MS } from '../lib/deviceSession.js'
import { startIdleWatch } from '../lib/idleTimer.js'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

async function fetchProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('id, email, full_name, role').eq('id', userId).single()
  if (error) return null
  return data
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const noticeTimer = useRef(null)

  const announce = useCallback((message) => {
    setNotice(message)
    clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(''), 6000)
  }, [])

  // Signs the device out for a reason it didn't choose itself (idle timeout,
  // or another device taking over the account) — as opposed to the user's
  // own signOut() below — so it's worth telling them why they landed back
  // on the sign-in page.
  const forceSignOut = useCallback(
    async (reason) => {
      clearDeviceId()
      announce(
        reason === 'idle'
          ? "You've been signed out after 15 minutes of inactivity."
          : 'Signed out — this account was signed in on another device.',
      )
      await supabase.auth.signOut()
    },
    [announce],
  )

  useEffect(() => {
    let active = true

    async function loadFromSession(session) {
      if (!session?.user) {
        if (active) setUser(null)
        return
      }
      const profile = await fetchProfile(session.user.id)
      if (!active) return
      setUser(
        profile
          ? { id: profile.id, email: profile.email, fullName: profile.full_name, role: profile.role }
          : { id: session.user.id, email: session.user.email, fullName: session.user.email.split('@')[0], role: 'student' },
      )
    }

    supabase.auth.getSession().then(({ data }) => {
      loadFromSession(data.session).finally(() => {
        if (active) setLoading(false)
      })
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      loadFromSession(session)
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  // Idle timeout and single-device enforcement only run while someone is
  // signed in. The device-session check also runs once immediately (not
  // just after the first interval) so a device that just signed in claims
  // the account right away, and a device that just got out-claimed is
  // signed out within one interval rather than waiting on the idle timer.
  useEffect(() => {
    if (!user?.id) return

    const stopIdleWatch = startIdleWatch(() => forceSignOut('idle'))

    let stopped = false
    async function runDeviceCheck() {
      const result = await checkDeviceSession(user.id)
      if (!stopped && result === 'kicked') forceSignOut('device')
    }
    runDeviceCheck()
    const deviceCheckInterval = setInterval(runDeviceCheck, DEVICE_CHECK_INTERVAL_MS)

    return () => {
      stopped = true
      stopIdleWatch()
      clearInterval(deviceCheckInterval)
    }
  }, [user?.id, forceSignOut])

  async function signIn({ email, password }) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp({ fullName, email, password }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
    // Email confirmation may be required before a session exists.
    return { needsEmailConfirmation: !data.session }
  }

  // Redirects to Google, then back to /dashboard with a session. New Google
  // users get a profile from the same signup trigger as email signups.
  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) throw error
  }

  async function signOut() {
    clearDeviceId()
    await supabase.auth.signOut()
  }

  async function refreshUser() {
    if (!user?.id) return
    const profile = await fetchProfile(user.id)
    if (profile) setUser({ id: profile.id, email: profile.email, fullName: profile.full_name, role: profile.role })
  }

  return (
    <AuthContext.Provider value={{ user, loading, notice, signIn, signUp, signInWithGoogle, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
