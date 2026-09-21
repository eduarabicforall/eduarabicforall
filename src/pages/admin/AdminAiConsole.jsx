import { useState } from 'react'
import Icon from '../../components/Icon.jsx'
import PasswordInput from '../../components/PasswordInput.jsx'
import { AI_MODULE_TABS } from '../../data/adminMock.js'
import { useAdmin } from '../../context/AdminContext.jsx'

export default function AdminAiConsole() {
  const { aiConfigs, aiConfigsLoading, saveAiConfig, confirmSaveAiConfig, apiKeySaved, saveApiKey } = useAdmin()
  const [aiModule, setAiModule] = useState('quran')
  const [apiKeyInput, setApiKeyInput] = useState('')
  const config = aiConfigs[aiModule]

  function handleSaveApiKey() {
    if (!apiKeyInput.trim()) return
    saveApiKey()
    setApiKeyInput('')
  }

  if (aiConfigsLoading || !config) {
    return <div className="text-sm text-app-inkFaint">Loading…</div>
  }

  return (
    <div>
      <h1 className="mb-6 font-poppins text-2xl font-extrabold">AI console</h1>

      <div className="mb-7 max-w-[640px] rounded-2xl border border-violet/20 bg-violet/[.06] p-5.5 p-[22px]">
        <div className="mb-3 flex items-center gap-2">
          <Icon name="key-01" size={16} className="text-violet" />
          <span className="text-[13.5px] font-bold">Gemini API key</span>
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <PasswordInput
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder={apiKeySaved ? '•••••••••••••••••••••••••••• (saved)' : 'AIza…'}
            wrapperClassName="flex-1"
            className="rounded-[10px] border border-app-border bg-app-panel2 px-3.5 py-2.5 font-mono text-[13px] text-app-ink placeholder:text-app-inkFaint"
          />
          <button
            type="button"
            onClick={handleSaveApiKey}
            className="rounded-[10px] bg-violet px-4.5 px-[18px] py-2.5 text-[13px] font-bold text-[#1a1230]"
          >
            Save key
          </button>
        </div>
        <div className="mt-2.5 text-[11.5px] text-app-inkFaint">
          One key powers every module below — stored encrypted server-side, never sent back to the client. Set here
          once; each module below only configures persona, prompt and quota.
        </div>
        <div className="mt-2 text-[11.5px] text-gold">
          Not yet wired to a backend — saving here only updates this screen. Persisting it needs a server-side Edge
          Function (the underlying table has no client-writable policy by design).
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2.5">
        {AI_MODULE_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setAiModule(t.id)}
            className={`rounded-pill border px-4 py-2.5 text-[12.5px] font-bold ${
              aiModule === t.id ? 'border-violet bg-violet/[.15] text-violet' : 'border-app-border bg-app-panel2 text-app-inkSoft'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex max-w-[640px] flex-col gap-4 rounded-2xl border border-app-border bg-app-panel p-6">
        <label className="text-xs font-semibold text-app-inkSoft">
          Persona name
          <input
            value={config.persona}
            onChange={(e) => saveAiConfig(aiModule, { persona: e.target.value })}
            className="mt-1.5 block w-full rounded-[10px] border border-app-border bg-app-panel2 px-3.5 py-2.5 text-[13.5px] text-app-ink"
          />
        </label>
        <label className="text-xs font-semibold text-app-inkSoft">
          System prompt
          <textarea
            value={config.prompt}
            onChange={(e) => saveAiConfig(aiModule, { prompt: e.target.value })}
            rows={5}
            className="mt-1.5 block w-full resize-y rounded-[10px] border border-app-border bg-app-panel2 px-3.5 py-2.5 text-[13px] text-app-ink"
          />
        </label>
        <div className="flex flex-col gap-3.5 sm:flex-row">
          <label className="flex-1 text-xs font-semibold text-app-inkSoft">
            Model
            <select
              value={config.model}
              onChange={(e) => saveAiConfig(aiModule, { model: e.target.value })}
              className="mt-1.5 block w-full rounded-[10px] border border-app-border bg-app-panel2 px-3.5 py-2.5 text-[13px] text-app-ink"
            >
              <option value="gemini-2.5-flash">gemini-2.5-flash</option>
              <option value="gemini-2.5-pro">gemini-2.5-pro</option>
            </select>
          </label>
          <label className="flex-1 text-xs font-semibold text-app-inkSoft">
            Daily quota / user
            <input
              type="number"
              value={config.quota}
              onChange={(e) => saveAiConfig(aiModule, { quota: parseInt(e.target.value) || 0 })}
              className="mt-1.5 block w-full rounded-[10px] border border-app-border bg-app-panel2 px-3.5 py-2.5 text-[13px] text-app-ink"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={() => confirmSaveAiConfig(aiModule)}
          className="mt-1 self-start rounded-[11px] bg-primary px-5.5 px-[22px] py-2.5 text-[13.5px] font-bold text-[#0B2A4A]"
        >
          Save configuration
        </button>
      </div>
    </div>
  )
}
