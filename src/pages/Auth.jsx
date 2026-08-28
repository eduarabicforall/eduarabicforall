import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Auth() {
  const navigate = useNavigate()
  const { signIn, signUp, signInWithGoogle, isDemo } = useAuth()
  const [mode, setMode] = useState('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isJoin = mode === 'join'
  const signinActive = 'bg-ink text-[#0A0E1A]'
  const joinActive = 'bg-ink text-[#0A0E1A]'
  const idle = 'bg-transparent text-ink-soft'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (isJoin) {
      const res = await signUp(email, password, name)
      if (res?.error) setError(res.error.message)
      else {
        if (isDemo) setSuccess('Demo mode — signed in. Redirecting...')
        setTimeout(() => navigate('/chat'), isDemo ? 800 : 0)
      }
    } else {
      const res = await signIn(email, password)
      if (res?.error) setError(res.error.message)
      else {
        if (isDemo) setSuccess('Demo mode — signed in. Redirecting...')
        setTimeout(() => navigate('/chat'), isDemo ? 800 : 0)
      }
    }
  }

  const handleGoogle = async () => {
    setError('')
    const res = await signInWithGoogle()
    if (res?.error) setError(res.error.message)
    else navigate('/chat')
  }

  const handleQuickDemo = async () => {
    const res = await signIn('demo@eduarabic.com', 'demo1234')
    if (!res?.error) navigate('/chat')
  }

  return (
    <div className="relative min-h-screen bg-bg text-ink font-pjs flex items-center justify-center overflow-hidden">
      <div className="ea-gradient-bg-auth" />

      <div className="relative z-10 w-full max-w-[420px] mx-4 rounded-[26px] p-8 sm:p-10 bg-panel border border-ea-border backdrop-blur-lg shadow-ea-card ea-page-enter">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block">
            <span className="font-sora font-extrabold text-2xl text-ink tracking-tight">
              Edu<span className="text-primary">Arabic</span>
            </span>
          </Link>
          <p className="text-sm text-ink-faint mt-2">Your Arabic learning companion</p>
        </div>

        {/* Demo mode banner */}
        {isDemo && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-[rgba(240,180,41,.1)] border border-[rgba(240,180,41,.25)] text-[13px] text-ink-soft leading-relaxed">
            <span className="font-bold text-gold">Demo mode</span> — No Supabase connected. Type any email & password, or click "Quick demo" below.
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-panel-2 rounded-xl p-[5px] mb-6">
          <button onClick={() => setMode('signin')} className={`flex-1 py-2.5 rounded-[9px] text-sm font-bold transition-all ${isJoin ? idle : signinActive}`}>Sign in</button>
          <button onClick={() => setMode('join')} className={`flex-1 py-2.5 rounded-[9px] text-sm font-bold transition-all ${isJoin ? joinActive : idle}`}>Create account</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-3 mb-4">
            {isJoin && (
              <input type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,.03)] border border-ea-border text-ink text-sm focus:border-primary focus:outline-none transition-colors" />
            )}
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,.03)] border border-ea-border text-ink text-sm focus:border-primary focus:outline-none transition-colors" />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,.03)] border border-ea-border text-ink text-sm focus:border-primary focus:outline-none transition-colors" />
          </div>

          {error && <div className="mb-3 text-sm text-red-400">{error}</div>}
          {success && <div className="mb-3 text-sm text-primary">{success}</div>}

          <button type="submit" className="block w-full text-center py-3.5 rounded-xl bg-ink text-[#0A0E1A] font-bold text-sm mb-4 hover:scale-[1.02] active:scale-[0.98] transition-all">
            {isJoin ? 'Create account' : 'Sign in'}
          </button>
        </form>

        {/* Quick demo */}
        {isDemo && (
          <button onClick={handleQuickDemo} className="block w-full text-center py-3 rounded-xl bg-primary text-[#04140F] font-bold text-sm mb-5 hover:scale-[1.02] active:scale-[0.98] transition-all">
            ⚡ Quick demo login
          </button>
        )}

        <div className="flex items-center gap-3 mb-4">
          <span className="flex-1 h-px bg-ea-border-soft" />
          <span className="text-[11px] font-bold tracking-[.18em] text-ink-faint">OR</span>
          <span className="flex-1 h-px bg-ea-border-soft" />
        </div>

        <button onClick={handleGoogle} className="group flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-[rgba(255,255,255,.03)] border border-ea-border text-ink font-semibold text-sm hover:border-ink-faint hover:scale-[1.01] transition-all w-full">
          <span className="w-5 h-5 rounded-full bg-white grid place-items-center font-extrabold text-[13px] text-[#4285F4]">G</span> Continue with Google
        </button>

        <div className="text-center mt-5">
          <Link to="/" className="text-ink-faint text-xs font-medium hover:text-ink-soft transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
