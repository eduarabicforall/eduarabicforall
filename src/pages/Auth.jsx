import { useEffect, useRef, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { TransitionLink, useTransitionNavigate } from '../components/TransitionNavLink.jsx'
import gsap from 'gsap'
import Icon from '../components/Icon.jsx'
import PasswordInput from '../components/PasswordInput.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'

const inputClass =
  'mt-1.5 block w-full rounded-xl border border-app-border bg-app-panel2 px-3.5 py-3 font-poppins text-sm text-app-ink placeholder:text-app-inkFaint'

function GoogleLogo({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.98v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.96 10.71A5.4 5.4 0 0 1 3.68 9c0-.59.1-1.17.28-1.71V4.96H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.04l2.98-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.96l2.98 2.33C4.67 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  )
}

function friendlyError(error) {
  if (!error) return ''
  if (error.message?.includes('Invalid login credentials')) return 'Incorrect email or password.'
  if (error.message?.includes('already registered')) return 'An account with this email already exists.'
  return error.message || 'Something went wrong. Please try again.'
}

export default function Auth() {
  const [searchParams] = useSearchParams()
  const [view, setView] = useState(searchParams.get('view') === 'signup' ? 'signup' : 'signin') // signin | signup | forgot
  const [sent, setSent] = useState(false)
  const [signupSent, setSignupSent] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user, signIn, signUp, signInWithGoogle } = useAuth()
  const navigate = useTransitionNavigate()
  const cardRef = useRef(null)
  const isFirstViewRender = useRef(true)

  // Entrance animation when arriving here (e.g. from the Landing page's
  // Sign in / Sign up buttons), and a quick cross-fade whenever the view
  // switches between sign in / sign up / forgot — both skipped for users
  // who prefer reduced motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(cardRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' })
  }, [])

  useEffect(() => {
    if (isFirstViewRender.current) {
      isFirstViewRender.current = false
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(cardRef.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' })
  }, [view])

  async function handleSignIn(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signIn({ email, password })
      navigate('/dashboard')
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSignUp(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { needsEmailConfirmation } = await signUp({ fullName, email, password })
      if (needsEmailConfirmation) {
        setSignupSent(true)
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setSubmitting(true)
    try {
      await signInWithGoogle() // navigates away to Google on success
    } catch (err) {
      setError(friendlyError(err))
      setSubmitting(false)
    }
  }

  async function handleSendReset(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email)
      if (resetError) throw resetError
      setSent(true)
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setSubmitting(false)
    }
  }

  // Already signed in — including the moment right after signIn() resolves,
  // when the profile is still loading and ProtectedRoute bounces us back here.
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg p-10 text-app-ink">
      <div ref={cardRef} className="w-full max-w-[400px]">
        <TransitionLink to="/" className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-app-inkSoft">
          <Icon name="arrow-left-01" size={14} /> Back to site
        </TransitionLink>

        {view === 'signin' && (
          <form onSubmit={handleSignIn} className="flex flex-col gap-4.5 gap-y-[18px]">
            <h1 className="text-center font-poppins text-[28px] font-extrabold">Sign in</h1>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={submitting}
              className="flex items-center justify-center gap-2.5 rounded-xl border border-app-border bg-app-panel2 py-[13px] text-sm font-semibold text-app-ink transition-all duration-200 enabled:hover:-translate-y-px enabled:hover:border-primary/50 enabled:hover:bg-primary/[.08] enabled:active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/60 disabled:opacity-60 motion-reduce:transition-none motion-reduce:enabled:hover:translate-y-0"
            >
              <GoogleLogo size={16} /> Continue with Google
            </button>
            <div className="flex items-center gap-2.5 text-xs text-app-inkFaint">
              <div className="h-px flex-1 bg-app-border" />or<div className="h-px flex-1 bg-app-border" />
            </div>
            <label className="text-[13px] font-semibold text-app-inkSoft">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className={inputClass}
              />
            </label>
            <label className="text-[13px] font-semibold text-app-inkSoft">
              Password
              <PasswordInput
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </label>
            <div className="-mt-2.5 text-right">
              <button
                type="button"
                onClick={() => {
                  setError('')
                  setView('forgot')
                }}
                className="text-[13px] font-semibold text-app-inkSoft"
              >
                Forgot password?
              </button>
            </div>
            {error && <div className="text-[13px] font-semibold text-danger">{error}</div>}
            <button
              type="submit"
              disabled={submitting}
              className="mt-1 rounded-xl bg-primary py-3.5 text-[15px] font-bold text-white disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
            <p className="mt-1.5 text-center text-[13px] text-app-inkSoft">
              No account?{' '}
              <button
                type="button"
                onClick={() => {
                  setError('')
                  setView('signup')
                }}
                className="font-bold text-primary"
              >
                Sign up
              </button>
            </p>
          </form>
        )}

        {view === 'signup' && !signupSent && (
          <form onSubmit={handleSignUp} className="flex flex-col gap-[18px]">
            <h1 className="text-center font-poppins text-[28px] font-extrabold">Create account</h1>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={submitting}
              className="flex items-center justify-center gap-2.5 rounded-xl border border-app-border bg-app-panel2 py-[13px] text-sm font-semibold text-app-ink transition-all duration-200 enabled:hover:-translate-y-px enabled:hover:border-primary/50 enabled:hover:bg-primary/[.08] enabled:active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/60 disabled:opacity-60 motion-reduce:transition-none motion-reduce:enabled:hover:translate-y-0"
            >
              <GoogleLogo size={16} /> Continue with Google
            </button>
            <div className="flex items-center gap-2.5 text-xs text-app-inkFaint">
              <div className="h-px flex-1 bg-app-border" />or<div className="h-px flex-1 bg-app-border" />
            </div>
            <label className="text-[13px] font-semibold text-app-inkSoft">
              Full name
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className={inputClass}
              />
            </label>
            <label className="text-[13px] font-semibold text-app-inkSoft">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className={inputClass}
              />
            </label>
            <label className="text-[13px] font-semibold text-app-inkSoft">
              Password
              <PasswordInput
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className={inputClass}
              />
            </label>
            {error && <div className="text-[13px] font-semibold text-danger">{error}</div>}
            <button
              type="submit"
              disabled={submitting}
              className="mt-1 rounded-xl bg-primary py-3.5 text-[15px] font-bold text-white disabled:opacity-60"
            >
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
            <p className="mt-1.5 text-center text-[13px] text-app-inkSoft">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setError('')
                  setView('signin')
                }}
                className="font-bold text-primary"
              >
                Sign in
              </button>
            </p>
          </form>
        )}

        {view === 'signup' && signupSent && (
          <div className="flex flex-col items-center gap-3.5 rounded-2xl border border-primary/[.22] bg-primary/[.08] px-5 py-7 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/[.18]">
              <Icon name="mail-01" size={22} className="text-primary" />
            </div>
            <div className="text-[15px] font-bold">Check your email</div>
            <div className="text-[13px] leading-relaxed text-app-inkSoft">
              We've sent a confirmation link to {email}. Confirm your account, then sign in.
            </div>
            <button
              type="button"
              onClick={() => {
                setSignupSent(false)
                setView('signin')
              }}
              className="mt-1 font-bold text-primary"
            >
              ← Back to sign in
            </button>
          </div>
        )}

        {view === 'forgot' && (
          <div className="flex flex-col gap-[18px]">
            <div>
              <h1 className="mb-1.5 font-poppins text-[28px] font-extrabold">Reset password</h1>
              <p className="text-sm text-app-inkSoft">We'll email you a link to reset it.</p>
            </div>

            {!sent ? (
              <form onSubmit={handleSendReset} className="flex flex-col gap-[18px]">
                <label className="text-[13px] font-semibold text-app-inkSoft">
                  Email
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className={inputClass}
                  />
                </label>
                {error && <div className="text-[13px] font-semibold text-danger">{error}</div>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-primary py-3.5 text-[15px] font-bold text-white disabled:opacity-60"
                >
                  {submitting ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center gap-3.5 rounded-2xl border border-primary/[.22] bg-primary/[.08] px-5 py-7 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/[.18]">
                  <Icon name="mail-01" size={22} className="text-primary" />
                </div>
                <div className="text-[15px] font-bold">Check your email</div>
                <div className="text-[13px] leading-relaxed text-app-inkSoft">
                  We've sent a password reset link. It expires in 30 minutes.
                </div>
              </div>
            )}
            <p className="mt-1.5 text-center text-[13px] text-app-inkSoft">
              <button
                type="button"
                onClick={() => {
                  setError('')
                  setView('signin')
                  setSent(false)
                }}
                className="font-bold text-primary"
              >
                ← Back to sign in
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
