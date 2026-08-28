import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading, isDemo } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg text-ink">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ink-soft text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // In demo mode, allow access without Supabase session
  if (isDemo) return children

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return children
}
