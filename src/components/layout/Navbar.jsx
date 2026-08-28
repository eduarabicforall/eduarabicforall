import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const loc = useLocation()

  const navLinks = [
    { to: '/chat', label: 'AI Chat', icon: '💬' },
    { to: '/dialogue', label: 'Dialogue', icon: '🎙️' },
    { to: '/practice', label: 'Practice', icon: '📝' },
  ]

  const isActive = (path) => loc.pathname.startsWith(path)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-xl border-b border-ea-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-sora font-bold">
            Edu<span className="text-primary">Arabic</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive(l.to)
                  ? 'bg-primary/15 text-primary'
                  : 'text-ink-soft hover:text-ink hover:bg-white/5'
              }`}
            >
              <span className="mr-1">{l.icon}</span>
              {l.label}
            </Link>
          ))}
          {profile?.role === 'admin' && (
            <Link
              to="/admin"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive('/admin')
                  ? 'bg-gold/15 text-gold'
                  : 'text-ink-soft hover:text-ink hover:bg-white/5'
              }`}
            >
              ⚙️ Admin
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-ink-soft hidden sm:block">
                {profile?.full_name || user.email?.split('@')[0]}
              </span>
              {profile?.role === 'admin' && (
                <span className="px-2 py-0.5 bg-gold/15 text-gold text-xs rounded-full font-medium">
                  Admin
                </span>
              )}
              <button
                onClick={signOut}
                className="px-3 py-1.5 text-sm text-ink-soft hover:text-ink bg-white/5 hover:bg-white/10 rounded-full transition-all"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="px-4 py-2 text-sm font-medium bg-primary text-bg rounded-full hover:bg-primary/90 transition-all"
            >
              Sign in
            </Link>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-ink-soft hover:text-ink"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-ea-border bg-bg/95 backdrop-blur-xl px-4 py-3 space-y-1">
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive(l.to)
                  ? 'bg-primary/15 text-primary'
                  : 'text-ink-soft hover:text-ink hover:bg-white/5'
              }`}
            >
              <span className="mr-2">{l.icon}</span>
              {l.label}
            </Link>
          ))}
          {profile?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-medium text-ink-soft hover:text-ink hover:bg-white/5"
            >
              ⚙️ Admin
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
