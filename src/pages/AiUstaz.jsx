import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'

// No real Gemini/Edge Function wired yet — the Ustaz's replies here are
// canned, not generated. Everything else (which modules are unlocked, the
// persona name, the daily quota) is real, read from the same tables Admin's
// AI console manages, so the mock at least reflects real configuration.
const MOCK_REPLIES = [
  "Good question! Let's break that down together — could you tell me which word you're unsure about?",
  'Right, that\'s a common one for learners. Try saying it out loud a few times — repetition really helps with Arabic.',
  "You're on the right track! Take a look at the dialogue in your current unit for more examples like this.",
  'Great effort! One tip: pay attention to the vowel marks (harakat) — they change the meaning quite a bit.',
  "Let's practice this together. Can you use it in a short sentence?",
]

function pickReply() {
  return MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)]
}

export default function AiUstaz() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [modules, setModules] = useState(null) // null = loading
  const [moduleId, setModuleId] = useState('')
  const [chats, setChats] = useState({})
  const [usedByModule, setUsedByModule] = useState({})
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!user?.id) return
    let active = true

    async function load() {
      const { data: activated, error: activatedError } = await supabase
        .from('user_modules')
        .select('modules(id, slug, name)')
        .eq('user_id', user.id)
      if (activatedError) {
        console.error('Failed to load activated modules', activatedError)
        if (active) setModules([])
        return
      }

      const { data: configs } = await supabase
        .from('module_ai_config')
        .select('module_id, persona_name, daily_quota, modules(slug)')

      const configBySlug = {}
      for (const c of configs || []) {
        if (c.modules) configBySlug[c.modules.slug] = { persona: c.persona_name, quota: c.daily_quota }
      }

      const list = (activated || [])
        .filter((row) => row.modules)
        .map((row) => ({
          id: row.modules.slug,
          name: row.modules.name,
          persona: configBySlug[row.modules.slug]?.persona || 'Ustaz',
          limit: configBySlug[row.modules.slug]?.quota || 60,
        }))

      if (!active) return
      setModules(list)
      if (list.length > 0) {
        setModuleId(list[0].id)
        setChats({ [list[0].id]: [{ from: 'them', text: `Assalamualaikum! I'm ${list[0].persona}. What are you working on today?` }] })
      }
    }

    load()
    return () => {
      active = false
    }
  }, [user?.id])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [chats, moduleId, typing])

  const currentModule = modules?.find((m) => m.id === moduleId)
  const messages = chats[moduleId] || []
  const used = usedByModule[moduleId] || 0
  const quotaReached = currentModule && used >= currentModule.limit
  const quotaPct = currentModule ? Math.round((used / currentModule.limit) * 100) : 0

  function switchModule(id) {
    setModuleId(id)
    if (!chats[id]) {
      const m = modules.find((mod) => mod.id === id)
      setChats((prev) => ({
        ...prev,
        [id]: [{ from: 'them', text: `Assalamualaikum! I'm ${m.persona}. What are you working on today?` }],
      }))
    }
  }

  function send(e) {
    e.preventDefault()
    if (!draft.trim() || quotaReached) return
    const text = draft.trim()
    setChats((prev) => ({ ...prev, [moduleId]: [...(prev[moduleId] || []), { from: 'me', text }] }))
    setDraft('')
    setUsedByModule((prev) => ({ ...prev, [moduleId]: (prev[moduleId] || 0) + 1 }))
    setTyping(true)
    setTimeout(() => {
      setChats((prev) => ({ ...prev, [moduleId]: [...(prev[moduleId] || []), { from: 'them', text: pickReply() }] }))
      setTyping(false)
    }, 700 + Math.random() * 500)
  }

  if (modules === null) {
    return (
      <AppShell>
        <div className="p-5 text-sm text-app-inkFaint">Loading…</div>
      </AppShell>
    )
  }

  if (modules.length === 0) {
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
          <div className="font-sora text-base font-extrabold">AI Ustaz</div>
        </div>
        <div className="mx-5 mt-2 rounded-2xl border border-app-border bg-app-panel px-4 py-6 text-center">
          <Icon name="sparkles" size={22} className="mx-auto mb-2.5 text-violet" />
          <div className="mb-1 text-[14px] font-bold">No module activated yet</div>
          <div className="mb-4 text-[12.5px] text-app-inkSoft">
            Activate a module to unlock its AI Ustaz.
          </div>
          <button
            type="button"
            onClick={() => navigate('/activate')}
            className="rounded-xl bg-primary px-5 py-2.5 text-[13px] font-bold text-[#0B2A4A]"
          >
            Enter code
          </button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="border-b border-app-border px-5 pb-3.5 pt-5">
        <div className="mb-3.5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[11px] border border-app-border bg-app-panel2"
          >
            <Icon name="arrow-left-01" size={16} className="text-app-inkSoft" />
          </button>
          <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] bg-violet/[.15]">
            <Icon name="sparkles" size={17} className="text-violet" />
          </div>
          <div className="font-sora text-[15px] font-extrabold">{currentModule.persona}</div>
        </div>

        <div className="mb-3.5 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-app-panel2">
            <div className="h-full rounded-full bg-violet" style={{ width: `${quotaPct}%` }} />
          </div>
          <div className="flex-shrink-0 text-[11px] font-bold text-violet">
            {used}/{currentModule.limit}
          </div>
        </div>

        <select
          value={moduleId}
          onChange={(e) => switchModule(e.target.value)}
          className="w-full rounded-[11px] border border-app-border bg-app-panel2 px-3 py-2.5 text-[13px] font-semibold text-app-ink"
        >
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} · {m.persona}
            </option>
          ))}
        </select>
      </div>

      <div ref={scrollRef} className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-5 py-4.5 py-[18px]">
        {messages.map((msg, i) => (
          <div key={i} className={`max-w-[82%] ${msg.from === 'me' ? 'self-end' : 'self-start'}`}>
            <div
              dir="auto"
              className={`px-4 py-2.5 text-[13.5px] leading-relaxed ${
                msg.from === 'me'
                  ? 'rounded-[14px_14px_4px_14px] bg-primary/[.16]'
                  : 'rounded-[14px_14px_14px_4px] bg-app-panel2'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="max-w-[82%] self-start">
            <div className="flex items-center gap-1 rounded-[14px_14px_14px_4px] bg-app-panel2 px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-app-inkFaint [animation-delay:-0.2s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-app-inkFaint" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-app-inkFaint [animation-delay:0.2s]" />
            </div>
          </div>
        )}
      </div>

      {quotaReached && (
        <div className="px-5 pb-2 text-center text-[12px] font-semibold text-danger">
          Daily quota reached for {currentModule.persona}. Come back tomorrow!
        </div>
      )}

      <form onSubmit={send} className="flex items-center gap-2.5 border-t border-app-border px-4 pb-5 pt-3.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={quotaReached}
          placeholder="Ask your Ustaz…"
          className="flex-1 rounded-pill border border-app-border bg-app-panel2 px-4 py-3 text-[13.5px] text-app-ink placeholder:text-app-inkFaint disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={quotaReached}
          className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-full bg-violet disabled:opacity-50"
        >
          <Icon name="sent" size={17} className="text-[#1a1230]" />
        </button>
      </form>
    </AppShell>
  )
}
