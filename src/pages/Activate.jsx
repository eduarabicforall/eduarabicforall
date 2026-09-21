import { useState } from 'react'
import { useTransitionNavigate } from '../components/TransitionNavLink.jsx'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import PlaceholderBlock from '../components/PlaceholderBlock.jsx'
import { supabase } from '../lib/supabase.js'

// PRD §6 issue #2: one input for the full "XXXX-XXXX" code, matching the
// format Admin generates — no more split part1/part2 fields from the mock.
function formatCode(value) {
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
  if (clean.length <= 4) return clean
  return `${clean.slice(0, 4)}-${clean.slice(4)}`
}

function friendlyActivateError(error) {
  const msg = error?.message || ''
  if (msg.includes('invalid_code')) return "We couldn't find that activation code. Check for typos and try again."
  if (msg.includes('already_activated')) return 'This module is already activated on your account.'
  if (msg.includes('code_disabled')) return 'This code has been disabled. Contact support for help.'
  return "We couldn't find that activation code. Check for typos and try again."
}

export default function Activate() {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState('idle') // idle | error | success
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [activatedModule, setActivatedModule] = useState(null)
  const navigate = useTransitionNavigate()

  async function handleActivate(e) {
    e.preventDefault()
    if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) {
      setErrorMessage('Enter the full 8-character code, e.g. PEMU-1234.')
      setStatus('error')
      return
    }
    setSubmitting(true)
    const { data, error } = await supabase.rpc('activate_module_code', { p_code: code })
    setSubmitting(false)
    if (error) {
      setErrorMessage(friendlyActivateError(error))
      setStatus('error')
      return
    }
    setActivatedModule(data)
    setStatus('success')
  }

  return (
    <AppShell>
      <div className="flex items-center gap-3 px-5 pb-1.5 pt-5.5 pt-[22px]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-app-border bg-app-panel2"
        >
          <Icon name="arrow-left-01" size={16} className="text-app-inkSoft" />
        </button>
        <div className="font-poppins text-base font-extrabold">Activate module</div>
      </div>

      <div className="px-6 py-6.5 px-6 py-[26px]">
        {status === 'idle' && (
          <form onSubmit={handleActivate} className="flex flex-col items-center text-center">
            <div className="mb-4.5 mb-[18px] flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/[.14]">
              <Icon name="key-01" size={26} className="text-primary" />
            </div>
            <div className="mb-1.5 font-poppins text-[19px] font-extrabold">Enter your activation code</div>
            <div className="mb-6.5 mb-[26px] text-[13px] leading-relaxed text-app-inkSoft">
              Find the unique code printed inside your physical module.
            </div>
            <input
              value={code}
              onChange={(e) => setCode(formatCode(e.target.value))}
              placeholder="XXXX-XXXX"
              className="w-full rounded-xl border border-app-border bg-app-panel2 px-2 py-4 text-center font-poppins text-lg font-bold uppercase tracking-[.15em] text-app-ink placeholder:text-app-inkFaint placeholder:tracking-[.15em]"
            />
            <button
              type="submit"
              disabled={submitting}
              className="mt-5.5 mt-[22px] w-full rounded-[13px] bg-primary py-[15px] text-[15px] font-bold text-white disabled:opacity-60"
            >
              {submitting ? 'Activating…' : 'Activate'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center text-center">
            <div className="mb-4.5 mb-[18px] flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/[.14]">
              <Icon name="alert-circle" size={26} className="text-danger" />
            </div>
            <div className="mb-1.5 font-poppins text-[19px] font-extrabold">Invalid code</div>
            <div className="mb-6.5 mb-[26px] text-[13px] leading-relaxed text-app-inkSoft">{errorMessage}</div>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="w-full rounded-[13px] bg-primary py-[15px] text-[15px] font-bold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/[.18]">
              <Icon name="checkmark-circle-02" size={26} className="text-primary" />
            </div>
            <div className="mb-5 font-poppins text-[19px] font-extrabold">Module activated!</div>
            <div className="mb-6 flex w-full items-center gap-3.5 rounded-2xl border border-app-border bg-app-panel p-4 text-left">
              <PlaceholderBlock variant="dark" label="" className="h-[52px] w-[52px] flex-shrink-0 rounded-[13px]" />
              <div>
                <div className="text-sm font-bold">{activatedModule?.name}</div>
                <div className="text-[11.5px] text-app-inkFaint">Audio Library + AI Ustaz unlocked</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full rounded-[13px] bg-primary py-[15px] text-[15px] font-bold text-white"
            >
              Start learning
            </button>
          </div>
        )}
      </div>
    </AppShell>
  )
}
