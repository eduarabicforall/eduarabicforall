import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  isSupabaseConfigured,
  authGetSession,
  authOnAuthStateChange,
  authSignIn,
  authSignUp,
  authSignInWithGoogle,
  authSignOut,
  getProfile,
} from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await authGetSession()
      setUser(session?.user ?? null)
      setLoading(false)

      // Listen for changes
      authOnAuthStateChange(async (_event, session) => {
        const u = session?.user ?? null
        setUser(u)
        if (u) {
          const { data } = await getProfile(u.id)
          setProfile(data)
        } else {
          setProfile(null)
        }
      })
    }
    init()
  }, [])

  // Fetch profile when user changes
  useEffect(() => {
    if (user?.id) {
      getProfile(user.id).then(({ data }) => setProfile(data))
    } else {
      setProfile(null)
    }
  }, [user?.id])

  const signIn = async (email, password) => {
    const res = await authSignIn(email, password)
    return res
  }

  const signUp = async (email, password, fullName) => {
    const res = await authSignUp(email, password, fullName)
    return res
  }

  const signInWithGoogle = async () => {
    const res = await authSignInWithGoogle()
    return res
  }

  const signOut = async () => {
    await authSignOut()
    setUser(null)
    setProfile(null)
  }

  const role = profile?.role || 'user'
  const isDemo = !isSupabaseConfigured

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, signIn, signUp, signInWithGoogle, signOut, isDemo }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
