import React, { useState, useRef, useEffect } from 'react'
import { sendToGemini, getApiKey, setApiKey } from '../lib/gemini'

export default function AiChat() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Assalamualaikum! I\'m your AI Ustaz. Ask me anything about Arabic grammar, vocabulary, or send me an Arabic sentence to check. 🌙' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKeyState] = useState(getApiKey())
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const res = await sendToGemini(text)
      let aiText = res.reply || ''

      if (res.betul) {
        aiText += `\n\n✅ **Corrected:** ${res.betul}`
        if (res.asal) aiText += `\n📝 **Original:** ${res.asal}`
        if (res.penjelasan) aiText += `\n💡 ${res.penjelasan}`
      }

      setMessages(prev => [...prev, { role: 'ai', text: aiText }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: `⚠️ Error: ${err.message}` }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleSaveKey = () => {
    setApiKey(apiKey)
    setShowSettings(false)
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ea-border bg-bg/50 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">
            🧠
          </div>
          <div>
            <h1 className="text-sm font-semibold text-ink">AI Ustaz</h1>
            <p className="text-xs text-ink-faint">Arabic grammar & vocabulary assistant</p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-xl hover:bg-white/5 text-ink-faint hover:text-ink transition-all"
          title="Settings"
        >
          ⚙️
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="px-4 py-3 bg-bg-2 border-b border-ea-border space-y-3">
          <div>
            <label className="text-xs text-ink-faint mb-1 block">Gemini API Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKeyState(e.target.value)}
                placeholder="AIza..."
                className="flex-1 px-3 py-2 bg-panel border border-ea-border rounded-xl text-sm text-ink placeholder:text-ink-faint"
              />
              <button
                onClick={handleSaveKey}
                className="px-4 py-2 bg-primary text-bg rounded-xl text-sm font-medium hover:bg-primary/90 transition-all"
              >
                Save
              </button>
            </div>
          </div>
          <p className="text-xs text-ink-faint">
            Get your key at{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-primary underline">
              Google AI Studio
            </a>
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                msg.role === 'user'
                  ? 'bg-primary text-bg rounded-br-md'
                  : 'bg-panel border border-ea-border text-ink rounded-bl-md'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 bg-panel border border-ea-border rounded-2xl rounded-bl-md">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-ea-border bg-bg/50 backdrop-blur">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type in Arabic or English..."
            className="flex-1 px-4 py-3 bg-panel border border-ea-border rounded-2xl text-sm text-ink placeholder:text-ink-faint focus:border-primary transition-colors"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-5 py-3 bg-primary text-bg rounded-2xl text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
