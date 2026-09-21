import { useEffect, useRef, useState } from 'react'
import { useTransitionNavigate } from '../components/TransitionNavLink.jsx'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'word', label: 'Words' },
  { id: 'sentence', label: 'Sentences' },
]

// Plays a saved Arabic word/sentence. The audio comes from the ai-ustaz-speak
// function (Gemini's speech model reads the harakat properly); each clip is kept
// in memory so replaying is instant. If that fails we fall back to the browser's
// own voice so the button still does something.
function useSpeech() {
  const [speakingId, setSpeakingId] = useState(null)
  const [loadingId, setLoadingId] = useState(null)
  const [notice, setNotice] = useState('')
  const audioRef = useRef(null)
  const clips = useRef(new Map()) // arabic text -> blob URL

  function stop() {
    audioRef.current?.pause()
    audioRef.current = null
    window.speechSynthesis?.cancel()
    setSpeakingId(null)
  }

  useEffect(() => {
    const cache = clips.current
    return () => {
      stop()
      cache.forEach((url) => URL.revokeObjectURL(url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function browserVoice(id, text) {
    const synth = window.speechSynthesis
    if (!synth) {
      setNotice("Couldn't play the audio right now — please try again.")
      return
    }
    const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith('ar'))
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = voice?.lang || 'ar-SA'
    if (voice) utterance.voice = voice
    utterance.rate = 0.85
    utterance.onend = () => setSpeakingId((cur) => (cur === id ? null : cur))
    utterance.onerror = utterance.onend
    setSpeakingId(id)
    synth.speak(utterance)
  }

  async function toggle(id, text) {
    if (speakingId === id || loadingId === id) {
      stop()
      setLoadingId(null)
      return
    }
    stop()
    setNotice('')

    let url = clips.current.get(text)
    if (!url) {
      setLoadingId(id)
      try {
        const { data, error } = await supabase.functions.invoke('ai-ustaz-speak', { body: { text } })
        if (error || !data?.audio) throw error || new Error('no audio')
        const bytes = Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0))
        url = URL.createObjectURL(new Blob([bytes], { type: data.mime || 'audio/wav' }))
        clips.current.set(text, url)
      } catch (err) {
        console.error('Speech function failed, using browser voice', err)
        setLoadingId(null)
        browserVoice(id, text)
        return
      }
      setLoadingId(null)
    }

    const audio = new Audio(url)
    audio.onended = () => setSpeakingId((cur) => (cur === id ? null : cur))
    audio.onerror = () => {
      setSpeakingId(null)
      setNotice("Couldn't play the audio right now — please try again.")
    }
    audioRef.current = audio
    setSpeakingId(id)
    audio.play().catch(() => setSpeakingId(null))
  }

  return { speakingId, loadingId, notice, toggle }
}

// Words and sentences the learner saved from AI Ustaz replies.
export default function MyVocab() {
  const { user } = useAuth()
  const navigate = useTransitionNavigate()
  const [items, setItems] = useState(null) // null = loading
  const [error, setError] = useState('')
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const speech = useSpeech()

  useEffect(() => {
    if (!user?.id) return
    let active = true
    supabase
      .from('user_vocab')
      .select('id, kind, arabic, transliteration, translation, topic, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (!active) return
        if (err) {
          console.error('Failed to load vocab', err)
          setError("Couldn't load your saved vocab.")
          setItems([])
          return
        }
        setItems(data)
      })
    return () => {
      active = false
    }
  }, [user?.id])

  async function remove(id) {
    const previous = items
    setItems((list) => list.filter((it) => it.id !== id))
    const { error: err } = await supabase.from('user_vocab').delete().eq('id', id)
    if (err) {
      console.error('Failed to delete vocab', err)
      setItems(previous)
      setError("Couldn't remove that item — please try again.")
    }
  }

  const needle = query.trim().toLowerCase()
  const visible = (items || []).filter(
    (it) =>
      (tab === 'all' || it.kind === tab) &&
      (!needle ||
        [it.arabic, it.transliteration, it.translation, it.topic].some((v) => v?.toLowerCase().includes(needle))),
  )
  const counts = { word: 0, sentence: 0 }
  for (const it of items || []) counts[it.kind] += 1

  return (
    <AppShell>
      <div className="flex items-center gap-3 px-5 pb-1.5 pt-[22px]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-app-border bg-app-panel2"
        >
          <Icon name="arrow-left-01" size={16} className="text-app-inkSoft" />
        </button>
        <div className="font-poppins text-base font-extrabold">My Vocab</div>
        {items && (
          <div className="ml-auto text-[11.5px] font-semibold text-app-inkFaint">
            {counts.word} words · {counts.sentence} sentences
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3.5 px-5 py-4">
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-bold ${
                tab === t.id ? 'bg-primary text-white' : 'border border-app-border bg-app-panel text-app-inkSoft'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Arabic, transliteration or meaning…"
          className="rounded-[11px] border border-app-border bg-app-panel2 px-3.5 py-2.5 text-[13px] text-app-ink placeholder:text-app-inkFaint"
        />

        {error && <div className="text-[12px] font-semibold text-danger">{error}</div>}
        {speech.notice && <div className="text-[12px] font-semibold text-gold">{speech.notice}</div>}
        {items === null && <div className="text-[12.5px] text-app-inkFaint">Loading…</div>}

        {items?.length === 0 && !error && (
          <div className="rounded-2xl border border-dashed border-app-border bg-app-panel/60 p-5 text-center">
            <Icon name="book-bookmark-02" size={22} className="mx-auto mb-2 text-primary" />
            <div className="mb-1 text-[13.5px] font-bold">Nothing saved yet</div>
            <div className="mb-3.5 text-[12.5px] text-app-inkSoft">
              Ask AI Ustaz about a word, then tap “Save word” or “Save” beside a sentence.
            </div>
            <button
              type="button"
              onClick={() => navigate('/ai-ustaz')}
              className="rounded-xl bg-primary px-5 py-2.5 text-[13px] font-bold text-white"
            >
              Open AI Ustaz
            </button>
          </div>
        )}

        {items?.length > 0 && visible.length === 0 && (
          <div className="text-[12.5px] text-app-inkFaint">No matches.</div>
        )}

        {visible.map((it) => (
          <div key={it.id} className="rounded-2xl border border-app-border bg-app-panel p-4">
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${
                  it.kind === 'word' ? 'bg-primary/10 text-primary' : 'bg-violet/[.15] text-violet'
                }`}
              >
                {it.kind === 'word' ? 'Word' : 'Sentence'}
              </span>
              {it.topic && <span className="truncate text-[11px] text-app-inkFaint">{it.topic}</span>}
              <button
                type="button"
                onClick={() => remove(it.id)}
                aria-label="Remove from My Vocab"
                className="ml-auto flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-app-inkFaint hover:text-danger"
              >
                <Icon name="delete-02" size={15} />
              </button>
            </div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => speech.toggle(it.id, it.arabic)}
                aria-label={speech.speakingId === it.id ? 'Stop audio' : 'Listen'}
                className={`flex h-9 flex-shrink-0 items-center gap-1.5 rounded-[10px] px-3 text-[12px] font-bold ${
                  speech.speakingId === it.id ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                }`}
              >
                <Icon
                  name={speech.speakingId === it.id || speech.loadingId === it.id ? 'stop' : 'volume-high'}
                  size={14}
                />
                {speech.loadingId === it.id ? 'Loading…' : speech.speakingId === it.id ? 'Stop' : 'Listen'}
              </button>
              <div dir="rtl" className="min-w-0 font-amiri text-[22px] leading-snug">
                {it.arabic}
              </div>
            </div>
            {it.transliteration && <div className="text-[12.5px] italic text-app-inkSoft">{it.transliteration}</div>}
            {it.translation && <div className="mt-0.5 text-[13.5px] font-semibold">{it.translation}</div>}
          </div>
        ))}
      </div>
    </AppShell>
  )
}
