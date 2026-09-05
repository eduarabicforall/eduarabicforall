import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import Icon from '../components/Icon'

// PRD §6 issue #2: one input field for the FULL "XXXX-XXXX" code — matches
// the format Admin generates (generate_module_codes RPC), no more split
// part1/part2 fields from the original design canvas mock.
export default function Activate() {
  const [code, setCode] = useState('')
  const [state, setState] = useState('idle') // idle | error | success
  const [moduleInfo, setModuleInfo] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  function formatCode(v) {
    const clean = v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
    if (clean.length <= 4) return clean
    return `${clean.slice(0, 4)}-${clean.slice(4)}`
  }

  async function handleActivate(e) {
    e.preventDefault()
    const { data, error } = await supabase.rpc('activate_module_code', { p_code: code })
    if (error) {
      const map = {
        invalid_code: 'Invalid code',
        code_disabled: 'This code has been disabled',
        already_activated: 'Module already activated on your account',
      }
      setErrorMsg(map[error.message] || 'Invalid code')
      setState('error')
      return
    }
    setModuleInfo(data)
    setState('success')
  }

  return (
    <div className="app-frame items-center justify-center px-5">
      {state === 'idle' && (
        <form onSubmit={handleActivate} className="w-full max-w-sm text-center">
          <Icon name="qr-code-01" size={48} className="text-app-primary mx-auto mb-4" />
          <h1 className="font-title font-extrabold text-2xl mb-2">Activate Module</h1>
          <p className="text-app-inkSoft text-sm mb-6">Enter the code found inside your physical module.</p>
          <input
            value={code}
            onChange={(e) => setCode(formatCode(e.target.value))}
            placeholder="XXXX-XXXX"
            required
            className="w-full text-center tracking-[0.3em] font-title font-bold text-2xl bg-app-panel2 border border-app-border rounded-xl py-4 mb-4 uppercase"
          />
          <Button type="submit" className="w-full">Activate</Button>
        </form>
      )}

      {state === 'error' && (
        <div className="w-full max-w-sm text-center">
          <div className="bg-app-danger/10 border border-app-danger/40 rounded-card p-6 mb-4">
            <Icon name="alert-circle" size={36} className="text-app-danger mx-auto mb-2" />
            <p className="font-semibold text-app-danger">{errorMsg}</p>
          </div>
          <Button onClick={() => setState('idle')} className="w-full">Try again</Button>
        </div>
      )}

      {state === 'success' && (
        <div className="w-full max-w-sm text-center">
          <div className="bg-app-primary/10 border border-app-primary/40 rounded-card p-6 mb-4">
            <Icon name="checkmark-circle-02" size={36} className="text-app-primary mx-auto mb-2" />
            <p className="font-semibold">Module activated!</p>
            <p className="text-app-inkSoft text-sm mt-1">{moduleInfo?.name}</p>
          </div>
          <Button onClick={() => navigate(`/audio/${moduleInfo?.slug}`)} className="w-full">Start learning</Button>
        </div>
      )}

      <Link to="/dashboard" className="text-sm text-app-inkFaint mt-6">Back to Dashboard</Link>
    </div>
  )
}
