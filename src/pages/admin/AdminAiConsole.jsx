import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Pill from '../../components/ui/Pill'

export default function AdminAiConsole() {
  const [geminiKey, setGeminiKey] = useState('')
  const [modules, setModules] = useState([])
  const [activeModuleId, setActiveModuleId] = useState(null)
  const [config, setConfig] = useState(null)
  const toast = useToast()

  useEffect(() => {
    supabase.from('modules').select('*').order('name').then(({ data }) => {
      setModules(data ?? [])
      setActiveModuleId(data?.[0]?.id ?? null)
    })
  }, [])

  useEffect(() => {
    if (!activeModuleId) return
    supabase.from('module_ai_config').select('*').eq('module_id', activeModuleId).single().then(({ data }) => setConfig(data))
  }, [activeModuleId])

  async function saveKey(e) {
    e.preventDefault()
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-admin-settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ key: 'gemini_api_key', value: geminiKey }),
    })
    if (res.ok) { toast('Gemini API key saved'); setGeminiKey('') } else { toast('Failed to save key', 'danger') }
  }

  async function saveConfig(e) {
    e.preventDefault()
    const { error } = await supabase.from('module_ai_config').upsert({ module_id: activeModuleId, ...config })
    if (error) return toast(error.message, 'danger')
    toast('Save configuration')
  }

  return (
    <div>
      <h1 className="font-title font-extrabold text-2xl mb-6">AI console</h1>

      <form onSubmit={saveKey} className="bg-app-panel border border-app-border rounded-card p-5 max-w-md mb-8">
        <p className="font-semibold mb-1">Gemini API key</p>
        <p className="text-xs text-app-inkFaint mb-3">One key powers every module below. Never re-displayed once saved.</p>
        <div className="flex gap-2">
          <Input type="password" placeholder="AIza…" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} className="flex-1" />
          <Button type="submit">Save</Button>
        </div>
      </form>

      <div className="flex gap-2 mb-4">
        {modules.map((m) => <Pill key={m.id} active={activeModuleId === m.id} onClick={() => setActiveModuleId(m.id)}>{m.name}</Pill>)}
      </div>

      {config && (
        <form onSubmit={saveConfig} className="flex flex-col gap-3 max-w-md">
          <Input label="Persona name" value={config.persona_name} onChange={(e) => setConfig({ ...config, persona_name: e.target.value })} />
          <label className="block text-left">
            <span className="block text-xs text-app-inkSoft mb-1.5">System prompt</span>
            <textarea
              value={config.system_prompt}
              onChange={(e) => setConfig({ ...config, system_prompt: e.target.value })}
              className="w-full rounded-xl bg-app-panel2 border border-app-border px-4 py-3 text-sm"
              rows={4}
            />
          </label>
          <label className="block text-left">
            <span className="block text-xs text-app-inkSoft mb-1.5">Model</span>
            <select value={config.model} onChange={(e) => setConfig({ ...config, model: e.target.value })} className="rounded-xl bg-app-panel2 border border-app-border px-4 py-3 text-sm">
              <option value="gemini-2.5-flash">gemini-2.5-flash</option>
              <option value="gemini-2.5-pro">gemini-2.5-pro</option>
            </select>
          </label>
          <Input label="Daily quota/user" type="number" value={config.daily_quota} onChange={(e) => setConfig({ ...config, daily_quota: Number(e.target.value) })} />
          <Button type="submit">Save configuration</Button>
        </form>
      )}
    </div>
  )
}
