import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/Icon'

export default function Signup() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signUp(email, password, name)
    setLoading(false)
    if (res?.error) setError(res.error.message)
    else navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Back button */}
        <Link to="/" className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-panel border border-ea-border mb-8 text-ink-faint hover:text-ink hover:bg-panel-2 transition-all">
          <Icon name="arrow-left-01" size={18} />
        </Link>

        <h1 className="text-2xl font-sora font-bold text-ink mb-8">Sign-up</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full name */}
          <div className="relative">
            <Icon name="user" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3.5 bg-panel border border-ea-border rounded-2xl text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Icon name="mail-01" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="email"
              placeholder="E-mail address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3.5 bg-panel border border-ea-border rounded-2xl text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Icon name="square-lock-01" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Create password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full pl-11 pr-12 py-3.5 bg-panel border border-ea-border rounded-2xl text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-soft transition-colors"
            >
              <Icon name={showPw ? 'eye-off-01' : 'eye-01'} size={18} />
            </button>
          </div>

          {error && (
            <div className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center gap-2">
              <Icon name="alert-circle-01" size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-panel-2 border border-ea-border text-ink rounded-2xl font-semibold text-[15px] hover:bg-panel active:scale-[0.98] disabled:opacity-50 transition-all"
          >
            {loading ? 'Creating account...' : 'Sign-up'}
          </button>
        </form>
      </div>
    </div>
  )
}
