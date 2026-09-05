import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import BottomTabBar from '../components/layout/BottomTabBar'
import Icon from '../components/Icon'

export default function AiUstaz() {
  const { user } = useAuth()
  const [modules, setModules] = useState([])
  const [activeModuleId, setActiveModuleId] = useState(null)
  const [chats, setChats] = useState({}) // { [moduleId]: [{role, text}] }
  const [input, setInput] = useState('')
  const [quota, setQuota] = useState({ used: 0, total: 60 })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: userModules } = await supabase
        .from('user_modules')
        .select('modules(id, name, slug)')
        .eq('user_id', user.id)
      const list = (userModules ?? []).map((um) => um.modules).filter(Boolean)
      setModules(list)
      setActiveModuleId(list[0]?.id ?? null)
    }
    if (user) load()
  }, [user])

  useEffect(() => {
    if (!activeModuleId || !user) return
    async function loadQuota() {
      const today = new Date().toISOString().slice(0, 10)
      const [{ data: usage }, { data: config }] = await Promise.all([
        supabase.from('ai_usage_log').select('message_count').eq('user_id', user.id).eq('module_id', activeModuleId).eq('date', today).maybeSingle(),
        supabase.from('module_ai_config').select('daily_quota').eq('module_id', activeModuleId).single(),
      ])
      setQuota({ used: usage?.message_count ?? 0, total: config?.daily_quota ?? 60 })
    }
    loadQuota()
  }, [activeModuleId, user])

  const activeModule = modules.find((m) => m.id === activeModuleId)
  const messages = chats[activeModuleId] ?? []

  async function sendMessage(e) {
    e.preventDefault()
    if (!input.trim() || !activeModuleId) return
    const text = input
    setInput('')
    setChats((c) => ({ ...c, [activeModuleId]: [...(c[activeModuleId] ?? []), { role: 'user', text }] }))
    setSending(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-ustaz-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ module_id: activeModuleId, message: text }),
      })
      const data = await res.json()
      setChats((c) => ({
        ...c,
        [activeModuleId]: [...(c[activeModuleId] ?? []), { role: 'assistant', text: res.ok ? data.reply : `Error: ${data.error}` }],
      }))
      setQuota((q) => ({ ...q, used: q.used + 1 }))
    } catch {
      setChats((c) => ({ ...c, [activeModuleId]: [...(c[activeModuleId] ?? []), { role: 'assistant', text: 'Failed to reach AI Ustaz. Try again later.' }] }))
    } finally {
      setSending(false)
    }
  }

  if (!activeModuleId) {
    return (
      <div className="app-frame items-center justify-center px-5 text-center">
        <Icon name="chatting-01" size={40} className="text-app-violet mb-3" />
        <p className="text-app-inkSoft">Activate a module to chat with its AI Ustaz.</p>
        <BottomTabBar />
      </div>
    )
  }

  return (
    <div className="app-frame">
      <header className="px-5 pt-6 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-app-violet font-semibold">
            <Icon name="chatting-01" /> {activeModule?.name}
          </div>
          <select
            value={activeModuleId}
            onChange={(e) => setActiveModuleId(e.target.value)}
            className="bg-app-panel2 border border-app-border rounded-pill text-xs px-3 py-1.5"
          >
            {modules.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="h-1.5 bg-app-panel2 rounded-pill">
          <div className="h-1.5 bg-app-violet rounded-pill" style={{ width: `${Math.min(100, (quota.used / quota.total) * 100)}%` }} />
        </div>
        <p className="text-xs text-app-inkFaint mt-1">{quota.used}/{quota.total} messages today</p>
      </header>

      <main className="flex-1 px-5 pb-3 flex flex-col gap-3 overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            dir={m.role === 'user' ? 'auto' : 'ltr'}
            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              m.role === 'user' ? 'self-end bg-app-primary/20' : 'self-start bg-app-panel2'
            }`}
          >
            {m.text}
          </div>
        ))}
      </main>

      <form onSubmit={sendMessage} className="px-5 pb-5 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your Ustaz…"
          className="flex-1 bg-app-panel2 border border-app-border rounded-pill px-4 py-3 text-sm"
        />
        <button disabled={sending} className="w-11 h-11 rounded-full bg-app-primary text-app-bg flex items-center justify-center shrink-0 disabled:opacity-50">
          <Icon name="sent" size={18} />
        </button>
      </form>

      <BottomTabBar />
    </div>
  )
}
