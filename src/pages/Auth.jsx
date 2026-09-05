import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Icon from '../components/Icon'

export default function Auth() {
  const [params] = useSearchParams()
  const [view, setView] = useState(params.get('view') === 'signup' ? 'signup' : 'signin')
  const [forgotSent, setForgotSent] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, resetPassword } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (view === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
        navigate('/dashboard')
      } else if (view === 'signup') {
        const { error } = await signUp(email, password, fullName)
        if (error) throw error
        navigate('/dashboard')
      } else if (view === 'forgot') {
        const { error } = await resetPassword(email)
        if (error) throw error
        setForgotSent(true)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg px-5 py-10">
      <div className="w-full max-w-[400px]">
        <Link to="/" className="text-sm text-app-inkFaint hover:text-app-ink mb-6 inline-flex items-center gap-1">
          <Icon name="arrow-left-01" size={16} /> Back to site
        </Link>

        <div className="bg-app-panel border border-app-border rounded-card p-6">
          {view !== 'forgot' && (
            <>
              <h1 className="font-title font-extrabold text-2xl mb-1">
                {view === 'signin' ? 'Sign in' : 'Create account'}
              </h1>
              <p className="text-app-inkSoft text-sm mb-6">
                {view === 'signin' ? 'Welcome back to EduArabic for All.' : 'Start your Arabic learning journey.'}
              </p>

              <button
                type="button"
                disabled
                title="Coming soon"
                className="w-full mb-4 flex items-center justify-center gap-2 rounded-pill border border-app-border py-3 text-sm font-semibold text-app-inkFaint cursor-not-allowed"
              >
                <Icon name="google" size={18} /> Continue with Google
                <span className="text-[10px] bg-app-panel2 px-2 py-0.5 rounded-pill">Coming soon</span>
              </button>

              <div className="flex items-center gap-3 mb-4 text-app-inkFaint text-xs">
                <div className="flex-1 h-px bg-app-border" /> or <div className="flex-1 h-px bg-app-border" />
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {view === 'signup' && (
                  <Input label="Full name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                )}
                <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input label="Password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />

                {view === 'signin' && (
                  <button type="button" onClick={() => setView('forgot')} className="text-xs text-app-primary text-right">
                    Forgot password?
                  </button>
                )}

                {error && <p className="text-app-danger text-xs">{error}</p>}

                <Button type="submit" disabled={loading} className="w-full mt-2">
                  {loading ? 'Please wait…' : view === 'signin' ? 'Sign in' : 'Create account'}
                </Button>
              </form>

              <p className="text-center text-sm text-app-inkSoft mt-5">
                {view === 'signin' ? (
                  <>Don't have an account? <button onClick={() => setView('signup')} className="text-app-primary font-semibold">Sign up</button></>
                ) : (
                  <>Already have an account? <button onClick={() => setView('signin')} className="text-app-primary font-semibold">Sign in</button></>
                )}
              </p>
            </>
          )}

          {view === 'forgot' && !forgotSent && (
            <>
              <h1 className="font-title font-extrabold text-2xl mb-1">Forgot password</h1>
              <p className="text-app-inkSoft text-sm mb-6">We'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                {error && <p className="text-app-danger text-xs">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full mt-2">Send reset link</Button>
              </form>
              <button onClick={() => setView('signin')} className="text-center text-sm text-app-primary mt-5 w-full">
                Back to sign in
              </button>
            </>
          )}

          {view === 'forgot' && forgotSent && (
            <div className="text-center py-6">
              <Icon name="mail-01" size={40} className="text-app-primary mb-3" />
              <h2 className="font-title font-bold text-lg mb-1">Check your email</h2>
              <p className="text-app-inkSoft text-sm">The reset link expires in 30 minutes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
