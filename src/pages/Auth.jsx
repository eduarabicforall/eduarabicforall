import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { gsap } from '../hooks/useGsap'

export default function Auth() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { signIn, signUp, signInWithGoogle, isDemo } = useAuth()
  const [mode, setMode] = useState('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const leftRef = useRef(null)
  const formRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Left panel entrance
      const leftItems = leftRef.current?.querySelectorAll('h1, p, [class*="flex items-center gap-3"]')
      if (leftItems?.length) {
        gsap.from(leftItems, { opacity: 0, x: -40, duration: 0.7, stagger: 0.12, ease: 'power3.out', delay: 0.2 })
      }
      // Form card entrance
      if (formRef.current) {
        gsap.from(formRef.current, { opacity: 0, y: 30, scale: 0.96, duration: 0.7, ease: 'power3.out', delay: 0.3 })
      }
    })
    return () => ctx.revert()
  }, [])

  const isJoin = mode === 'join'
  const signinActive = 'bg-ink text-[#0A0E1A]'
  const joinActive = 'bg-ink text-[#0A0E1A]'
  const idle = 'bg-transparent text-ink-soft'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (isJoin) {
      const res = await signUp(email || 'demo@eduarabic.com', password || 'demo1234', name || 'Demo User')
      if (res?.error) setError(res.error.message)
      else {
        if (isDemo) setSuccess('Demo mode — no real account created. Redirecting...')
        setTimeout(() => navigate('/dashboard'), isDemo ? 800 : 0)
      }
    } else {
      const res = await signIn(email || 'demo@eduarabic.com', password || 'demo1234')
      if (res?.error) setError(res.error.message)
      else {
        if (isDemo) setSuccess('Demo mode — signed in as demo user. Redirecting...')
        setTimeout(() => navigate('/dashboard'), isDemo ? 800 : 0)
      }
    }
  }

  const handleGoogle = async () => {
    setError('')
    const res = await signInWithGoogle()
    if (res?.error) setError(res.error.message)
    else navigate('/dashboard')
  }

  const handleQuickDemo = async () => {
    const res = await signIn('demo@eduarabic.com', 'demo1234')
    if (!res?.error) navigate('/dashboard')
  }

  return (
    <div className="relative min-h-screen bg-bg text-ink font-pjs grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      <div className="ea-gradient-bg-auth" />

      {/* Left brand panel */}
      <div ref={leftRef} className="relative z-10 flex flex-col justify-center px-10 sm:px-14 md:px-[72px] py-12 lg:py-0">
        <Link to="/" className="flex items-center mb-12 no-underline">
          <span className="font-sora font-extrabold text-2xl text-ink tracking-tight">
            Edu<span className="text-primary">Arabic</span>
          </span>
        </Link>
        <h1 className="font-sora font-extrabold text-4xl sm:text-5xl md:text-[64px] leading-tight tracking-tight mb-6">
          {t('auth.brand_title').split('. ').map((p, i) => <React.Fragment key={i}>{p}{i === 0 ? '. ' : ''}</React.Fragment>)}
        </h1>
        <p className="text-lg leading-relaxed text-ink-soft max-w-[400px] mb-9">{t('auth.brand_desc')}</p>
        <div className="flex flex-col gap-4 max-w-[380px]">
          {[t('auth.perk1'), t('auth.perk2'), t('auth.perk3')].map((text, i) => {
            const icons = ['refresh', 'ai-brain-01', 'lock']
            return (
              <div key={i} className="group flex items-center gap-3.5 text-ink-soft text-[15px] cursor-default">
                <span className="w-[34px] h-[34px] shrink-0 rounded-[10px] bg-panel-2 grid place-items-center text-primary group-hover:bg-primary group-hover:text-[#04140F] transition-all duration-300">
                  <i className={`hgi-stroke hgi-${icons[i]}`} style={{ fontSize: '19px' }} />
                </span>
                {text}
              </div>
            )
          })}
        </div>
      </div>

      {/* Right form panel */}
      <div className="relative z-10 flex items-center justify-center p-10">
        <div ref={formRef} className="w-full max-w-[420px] rounded-[26px] p-10 bg-panel border border-ea-border backdrop-blur-lg shadow-ea-card">
          <div className="flex justify-center mb-6">
            <span className="font-sora font-extrabold text-2xl text-ink tracking-tight">
              Edu<span className="text-primary">Arabic</span>
            </span>
          </div>

          {/* Demo mode banner */}
          {isDemo && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-[rgba(240,180,41,.1)] border border-[rgba(240,180,41,.25)] text-[13px] text-ink-soft leading-relaxed">
              <span className="font-bold text-gold">Demo mode</span> — Tiada Supabase disambung. Taip mana-mana email & password, atau klik "Quick demo" di bawah.
            </div>
          )}

          {/* Tabs */}
          <div className="flex bg-panel-2 rounded-xl p-[5px] mb-7">
            <button onClick={() => setMode('signin')} className={`flex-1 py-2.5 border-none rounded-[9px] cursor-pointer font-pjs text-sm font-bold transition-all duration-200 ${isJoin ? idle : signinActive}`}>{t('auth.signin_tab')}</button>
            <button onClick={() => setMode('join')} className={`flex-1 py-2.5 border-none rounded-[9px] cursor-pointer font-pjs text-sm font-bold transition-all duration-200 ${isJoin ? joinActive : idle}`}>{t('auth.join_tab')}</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3.5 mb-5">
              {isJoin && (
                <input type="text" placeholder={t('auth.full_name')} value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-[15px] rounded-xl bg-[rgba(255,255,255,.03)] border border-ea-border text-ink text-[15px] font-pjs focus:border-primary focus:outline-none transition-colors duration-200" />
              )}
              <input type="email" placeholder={t('auth.email')} value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-[15px] rounded-xl bg-[rgba(255,255,255,.03)] border border-ea-border text-ink text-[15px] font-pjs focus:border-primary focus:outline-none transition-colors duration-200" />
              <input type="password" placeholder={isJoin ? t('auth.password_join') : t('auth.password')} value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-[15px] rounded-xl bg-[rgba(255,255,255,.03)] border border-ea-border text-ink text-[15px] font-pjs focus:border-primary focus:outline-none transition-colors duration-200" />
              {!isJoin && (
                <a href="#" className="self-end text-[13px] text-ink-soft hover:text-primary transition-colors no-underline">{t('auth.forgot_password')}</a>
              )}
            </div>

            {error && <div className="mb-3 text-sm text-red-400">{error}</div>}
            {success && <div className="mb-3 text-sm text-primary">{success}</div>}

            <button type="submit" className="block w-full text-center py-4 rounded-xl bg-ink text-[#0A0E1A] font-bold text-[15px] mb-4 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border-none cursor-pointer font-pjs">
              {isJoin ? t('auth.join_tab') : t('auth.signin_tab')}
            </button>
          </form>

          {/* Quick demo button */}
          {isDemo && (
            <button onClick={handleQuickDemo} className="block w-full text-center py-3 rounded-xl bg-primary text-[#04140F] font-bold text-[14px] mb-5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border-none cursor-pointer font-pjs">
              ⚡ Quick demo login
            </button>
          )}

          <div className="flex items-center gap-3.5 mb-5">
            <span className="flex-1 h-px bg-ea-border-soft" />
            <span className="text-[11px] font-bold tracking-[.18em] text-ink-faint">{t('auth.or_continue')}</span>
            <span className="flex-1 h-px bg-ea-border-soft" />
          </div>

          <div className="flex flex-col gap-3 mb-6">
            <button onClick={handleGoogle} className="group flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-[rgba(255,255,255,.03)] border border-ea-border text-ink font-semibold text-[14.5px] hover:border-ink-faint hover:scale-[1.01] transition-all duration-200 cursor-pointer font-pjs">
              <span className="w-5 h-5 rounded-full bg-white grid place-items-center font-extrabold text-[13px] text-[#4285F4] font-sora">G</span> {t('auth.google')}
            </button>
            <button className="group flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-[rgba(255,255,255,.03)] border border-ea-border text-ink font-semibold text-[14.5px] hover:border-ink-faint hover:scale-[1.01] transition-all duration-200 cursor-pointer font-pjs">
              <i className="hgi-stroke hgi-smart-phone-01" style={{ fontSize: '20px' }} /> {t('auth.apple')}
            </button>
          </div>

          <Link to="/" className="group flex items-center justify-center gap-2 text-ink-faint text-xs font-bold tracking-[.14em] hover:text-ink-soft transition-colors no-underline">
            <i className="hgi-stroke hgi-arrow-left-01 transition-transform duration-200 group-hover:-translate-x-1" style={{ fontSize: '16px' }} /> {t('auth.back_home')}
          </Link>
        </div>
      </div>
    </div>
  )
}
