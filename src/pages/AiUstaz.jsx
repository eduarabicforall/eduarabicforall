import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Sidebar from '../components/layout/Sidebar'
import MobileTabBar from '../components/layout/MobileTabBar'
import { getApiKey, setApiKey, sendToGemini } from '../lib/gemini'

const SUGGESTIONS = [
  { key: 'suggest1', text: 'أنا ذهب إلى المدرسة' },
  { key: 'suggest2', text: 'Explain idafah' },
  { key: 'suggest3', text: 'Give me a practice sentence' },
]

const MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash']

export default function AiUstaz() {
  const { t } = useTranslation()
  const chatEndRef = useRef(null)

  const [messages, setMessages] = useState([
    { isAI: true, text: t('ai_ustaz.welcome') },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKeyState] = useState(getApiKey())
  const [reveal, setReveal] = useState(false)
  const [saved, setSaved] = useState(false)
  const [model, setModel] = useState('gemini-2.5-flash')
  const [persona, setPersona] = useState('')

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const hasKey = !!apiKey.trim()

  const push = async (text) => {
    if (!text.trim() || loading) return
    const userMsg = { isUser: true, dir: 'rtl', text: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await sendToGemini(text.trim(), model)
      const aiMsg = {
        isAI: true,
        text: res.reply || 'Shukran! Here\'s a quick check of that. Keep practising — try forming another sentence and I\'ll review it.',
        hasCorrection: !!(res.asal && res.betul),
        wrong: res.asal || '',
        right: res.betul || '',
        explain: res.penjelasan || '',
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      setMessages(prev => [...prev, {
        isAI: true,
        text: hasKey
          ? `Error: ${err.message}. Please check your API key and try again.`
          : 'No API key configured. Go to Settings to add your Google AI Studio API key.',
      }])
    }
    setLoading(false)
  }

  const handleSaveKey = () => {
    setApiKey(apiKey.trim())
    setSaved(true)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      push(input)
    }
  }

  return (
    <div className="flex h-screen bg-bg text-ink font-pjs">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <div className="border-b border-ea-border-soft py-4 px-6 md:px-8 flex items-center gap-3.5 bg-[rgba(7,10,20,.6)]">
          <span className="w-11 h-11 rounded-[13px] bg-gradient-to-br from-[rgba(120,80,220,.4)] to-[rgba(47,196,159,.3)] grid place-items-center text-white">
            <i className="hgi-stroke hgi-ai-brain-01" style={{ fontSize: '24px' }} />
          </span>
          <div>
            <div className="font-sora font-bold text-[17px]">{t('ai_ustaz.title')}</div>
            <div className="text-[13px] text-primary flex items-center gap-1.5">
              <span className="w-[7px] h-[7px] rounded-full bg-primary" /> {t('ai_ustaz.status_online')}
            </div>
          </div>
          <div className="ms-auto flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-[11px] py-[6px] rounded-full ${hasKey ? 'bg-[rgba(47,196,159,.14)] text-primary' : 'bg-[rgba(240,180,41,.12)] text-gold'}`}>
              <i className={`hgi-stroke hgi-${hasKey ? 'checkmark-circle-01' : 'alert-02'}`} style={{ fontSize: '15px' }} /> {hasKey ? t('ai_ustaz.api_connected') : t('ai_ustaz.no_api_key')}
            </span>
            <button onClick={() => { setShowSettings(!showSettings); setSaved(false) }} className="w-10 h-10 rounded-[11px] border border-ea-border bg-panel text-ink-soft hover:border-primary hover:text-primary transition-colors cursor-pointer grid place-items-center">
              <i className="hgi-stroke hgi-settings-02" style={{ fontSize: '20px' }} />
            </button>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="absolute inset-0 z-50 bg-[rgba(4,7,15,.6)] backdrop-blur-[3px] flex justify-end">
            <div className="w-[420px] max-w-[90%] h-full bg-bg-2 border-s border-ea-border p-7 overflow-y-auto shadow-[-30px_0_80px_-30px_rgba(0,0,0,.8)]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-sora font-bold text-[19px]">{t('ai_ustaz.settings_title')}</span>
                <button onClick={() => setShowSettings(false)} className="w-[34px] h-[34px] rounded-[10px] border border-ea-border bg-transparent text-ink-soft hover:text-ink transition-colors cursor-pointer grid place-items-center">
                  <i className="hgi-stroke hgi-cancel-01" style={{ fontSize: '18px' }} />
                </button>
              </div>
              <p className="text-[13.5px] text-ink-soft leading-relaxed mb-6">{t('ai_ustaz.settings_desc')}</p>

              <label className="block text-[13px] font-bold mb-2">{t('ai_ustaz.api_key_label')}</label>
              <div className="flex gap-2 mb-2">
                <div className="flex-1 flex items-center gap-2 px-3.5 py-3 rounded-[11px] bg-[rgba(255,255,255,.03)] border border-ea-border">
                  <i className="hgi-stroke hgi-square-lock-01" style={{ fontSize: '17px', color: '#6B7488' }} />
                  <input type={reveal ? 'text' : 'password'} placeholder="AIza..." value={apiKey} onChange={e => { setApiKeyState(e.target.value); setSaved(false) }} className="flex-1 bg-transparent border-none text-ink text-sm font-pjs outline-none" />
                  <button onClick={() => setReveal(!reveal)} className="bg-transparent border-none text-ink-faint cursor-pointer grid place-items-center">
                    <i className={`hgi-stroke hgi-${reveal ? 'view-off' : 'view'}`} style={{ fontSize: '17px' }} />
                  </button>
                </div>
              </div>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[12.5px] text-primary no-underline mb-5">
                {t('ai_ustaz.get_key')} <i className="hgi-stroke hgi-arrow-right-01" style={{ fontSize: '15px' }} />
              </a>

              <label className="block text-[13px] font-bold mb-2">{t('ai_ustaz.model_label')}</label>
              <select value={model} onChange={e => setModel(e.target.value)} className="w-full px-3.5 py-3 rounded-[11px] bg-[rgba(255,255,255,.03)] border border-ea-border text-ink font-pjs text-sm mb-5">
                {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>

              <label className="block text-[13px] font-bold mb-2">{t('ai_ustaz.persona_label')}</label>
              <textarea rows={3} placeholder={t('ai_ustaz.persona_placeholder')} value={persona} onChange={e => setPersona(e.target.value)} className="w-full px-3.5 py-3 rounded-[11px] bg-[rgba(255,255,255,.03)] border border-ea-border text-ink font-pjs text-sm leading-relaxed resize-none mb-6" />

              <button onClick={handleSaveKey} className="w-full py-3.5 rounded-xl bg-primary text-[#04140F] font-bold text-[15px] hover:opacity-90 transition-opacity border-none cursor-pointer font-pjs">
                {saved ? t('ai_ustaz.saved') : t('ai_ustaz.save_key')}
              </button>
              <div className="mt-4 p-3.5 rounded-[11px] bg-[rgba(240,180,41,.08)] border border-[rgba(240,180,41,.2)] text-[12.5px] text-ink-soft leading-relaxed">
                <i className="hgi-stroke hgi-shield-01 me-1.5" style={{ fontSize: '15px', color: '#F0B429' }} /> {t('ai_ustaz.security_note')}
              </div>
            </div>
          </div>
        )}

        {/* Chat messages */}
        <div id="chatScroll" className="flex-1 overflow-y-auto px-6 md:px-8 py-7 flex flex-col gap-5">
          <div className="text-center py-5 pb-2"><div className="text-sm text-ink-faint">Today</div></div>

          {messages.map((m, i) => (
            m.isUser ? (
              <div key={i} className="self-end max-w-[62%]">
                <div dir="rtl" className="bg-primary text-[#04140F] px-[17px] py-3.5 rounded-[16px_16px_4px_16px] text-[15px] leading-relaxed">{m.text}</div>
              </div>
            ) : (
              <div key={i} className="self-start max-w-[74%] flex gap-3">
                <span className="w-[34px] h-[34px] shrink-0 rounded-[10px] bg-[rgba(120,80,220,.18)] grid place-items-center text-violet">
                  <i className="hgi-stroke hgi-ai-brain-01" style={{ fontSize: '19px' }} />
                </span>
                <div className="bg-panel border border-ea-border-soft p-4 rounded-[4px_16px_16px_16px]">
                  <p className="text-[15px] leading-relaxed text-ink m-0">{m.text}</p>
                  {m.hasCorrection && (
                    <div className="mt-3.5 rounded-xl overflow-hidden border border-ea-border-soft">
                      <div className="px-3.5 py-[11px] bg-[rgba(214,69,91,.09)] border-b border-ea-border-soft">
                        <div className="text-[11px] font-bold tracking-[.1em] uppercase text-[#E07A8B] mb-1.5">{t('ai_ustaz.you_wrote')}</div>
                        <div dir="rtl" className="font-amiri text-[19px] text-ink-soft" style={{ textDecoration: 'line-through', textDecorationColor: 'rgba(224,122,139,.7)' }}>{m.wrong}</div>
                      </div>
                      <div className="px-3.5 py-[11px] bg-[rgba(47,196,159,.08)]">
                        <div className="text-[11px] font-bold tracking-[.1em] uppercase text-primary mb-1.5">{t('ai_ustaz.correct')}</div>
                        <div dir="rtl" className="font-amiri text-xl text-ink">{m.right}</div>
                      </div>
                    </div>
                  )}
                  {m.hasCorrection && m.explain && (
                    <p className="text-[13.5px] leading-relaxed text-ink-soft mt-3 mb-0">
                      <span className="text-gold font-bold">{t('ai_ustaz.why')}:</span> {m.explain}
                    </p>
                  )}
                </div>
              </div>
            )
          ))}
          {loading && (
            <div className="self-start flex gap-3">
              <span className="w-[34px] h-[34px] shrink-0 rounded-[10px] bg-[rgba(120,80,220,.18)] grid place-items-center text-violet">
                <i className="hgi-stroke hgi-ai-brain-01" style={{ fontSize: '19px' }} />
              </span>
              <div className="bg-panel border border-ea-border-soft px-4 py-3 rounded-[4px_16px_16px_16px]">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-ink-faint animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-ink-faint animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-ink-faint animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div className="px-6 md:px-8 py-4 border-t border-ea-border-soft">
          <div className="flex gap-2 mb-3 flex-wrap">
            {SUGGESTIONS.map(s => (
              <button key={s.key} onClick={() => push(s.text)} className="px-3.5 py-2 rounded-full bg-panel border border-ea-border text-ink-soft font-pjs text-[13px] font-medium hover:border-primary hover:text-ink transition-colors cursor-pointer">
                {t(`ai_ustaz.${s.key}`)}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-3 px-4 py-2.5 ps-[18px] rounded-2xl bg-panel border border-ea-border">
            <textarea rows={1} placeholder={t('ai_ustaz.input_placeholder')} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} className="flex-1 resize-none bg-transparent border-none text-ink text-[15px] leading-relaxed py-1.5 outline-none max-h-[120px] font-pjs" />
            <button onClick={() => push(input)} className="w-[42px] h-[42px] shrink-0 rounded-xl bg-primary text-[#04140F] grid place-items-center border-none cursor-pointer hover:opacity-90 transition-opacity">
              <i className="hgi-stroke hgi-arrow-up-01" style={{ fontSize: '22px' }} />
            </button>
          </div>
          <div className="text-center text-xs text-ink-faint mt-2.5">{t('ai_ustaz.disclaimer')}</div>
        </div>
      </main>
      <MobileTabBar />
    </div>
  )
}
