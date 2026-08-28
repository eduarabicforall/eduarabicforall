import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const loc = useLocation()

  const navLinks = [
    { to: '/dashboard', label: 'Home', icon: '🏠' },
    { to: '/chat', label: 'AI Chat', icon: '💬' },
    { to: '/dialogue', label: 'Dialogue', icon: '🎙️' },
    { to: '/practice', label: 'Practice', icon: '📝' },
  ]

  const isActive = (path) => loc.pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-xl border-b border-ea-border">
      <div className="max-w-lg mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="text-lg font-sora font-bold">
          Edu<span className="text-primary">Arabic</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isActive(l.to)
                  ? 'bg-primary/15 text-primary'
                  : 'text-ink-faint hover:text-ink'
              }`}
            >
              {l.icon} {l.label}
            </Link>
          ))}
          {profile?.role === 'admin' && (
            <Link to="/admin" className="px-3 py-1.5 rounded-xl text-xs font-medium text-gold hover:bg-gold/10 transition-all">
              ⚙️
            </Link>
          )}
          <button onClick={signOut} className="px-3 py-1.5 text-xs text-ink-faint hover:text-ink transition-all">
            Sign out
          </button>
        </div>

        {/* Mobile: just avatar */}
        {user && (
          <div className="flex items-center gap-2 md:hidden">
            <span className="text-xs text-ink-faint">{profile?.full_name || user.email?.split('@')[0]}</span>
            <button onClick={signOut} className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
