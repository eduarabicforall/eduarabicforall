import { createContext, useContext, useEffect, useState } from 'react'
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

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function refreshUser() {
    if (!user?.id) return
    const profile = await fetchProfile(user.id)
    if (profile) setUser({ id: profile.id, email: profile.email, fullName: profile.full_name, role: profile.role })
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refreshUser }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
