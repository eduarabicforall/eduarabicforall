import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTransitionNavigate } from '../components/TransitionNavLink.jsx'
import AppShell from '../components/AppShell.jsx'
import BottomTabBar from '../components/BottomTabBar.jsx'
import Icon from '../components/Icon.jsx'
import { formatDuration, parseDurationToSeconds, useModuleTree } from '../context/ModuleTreeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { resolveAudioUrl } from '../lib/audioUrl.js'
import { supabase } from '../lib/supabase.js'

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]
const SPEED_KEY = 'audio-speed'

function readSpeed() {
  try {
    const v = Number(localStorage.getItem(SPEED_KEY))
    return SPEEDS.includes(v) ? v : 1
  } catch {
    return 1
  }
}

const speedLabel = (v) => `${v}×`

export default function AudioLibrary() {
  const { moduleId } = useParams()
  const { moduleTree, loading: moduleTreeLoading } = useModuleTree()
  const { user } = useAuth()
  const material = moduleTree.find((m) => m.id === moduleId) || moduleTree[0]

  const [unitIndex, setUnitIndex] = useState(0)
  const [playingIndex, setPlayingIndex] = useState(null) // the loaded track (may be paused)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(false) // fetching the link or buffering
  const [time, setTime] = useState({ current: 0, duration: 0 })
  const [speed, setSpeed] = useState(readSpeed)
  const loadRef = useRef(0)
  const [activated, setActivated] = useState(null) // null = checking
  const [audioError, setAudioError] = useState('')
  const audioRef = useRef(null)
  // The <audio> element only exists once the page has loaded past its
  // loading / locked screens, so effects must wait for it via state.
  const [audioEl, setAudioEl] = useState(null)
  const setAudioNode = useCallback((node) => {
    audioRef.current = node
    setAudioEl(node)
  }, [])
  const navigate = useTransitionNavigate()
  const tracks = material?.units[unitIndex]?.tracks || []

  useEffect(() => {
    if (!material?.dbId || !user?.id) return
    let active = true
    setActivated(null)
    supabase
      .from('user_modules')
      .select('id')
      .eq('user_id', user.id)
      .eq('module_id', material.dbId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setActivated(!!data)
      })
    return () => {
      active = false
    }
  }, [material?.dbId, user?.id])

  useEffect(() => {
    setUnitIndex(0)
    stopPlayback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material?.id])

  function stopPlayback() {
    loadRef.current += 1
    audioRef.current?.pause()
    setPlayingIndex(null)
    setIsPlaying(false)
    setLoading(false)
    setTime({ current: 0, duration: 0 })
  }

  // Keep React in step with the shared <audio> element.
  useEffect(() => {
    const el = audioEl
    if (!el) return
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => {
      setIsPlaying(false)
      el.currentTime = 0
      setTime((t) => ({ ...t, current: 0 }))
    }
    const onWaiting = () => setLoading(true)
    const onPlaying = () => {
      setLoading(false)
      setIsPlaying(true)
    }
    const onError = () => {
      // Fired when the signed link is rejected or the file isn't playable audio.
      console.error('Audio element error', el.error, el.currentSrc)
      setLoading(false)
      setIsPlaying(false)
      setPlayingIndex(null)
      setAudioError("This audio couldn't be loaded. Please try again, or contact us if it keeps happening.")
    }
    const onMeta = () => {
      el.playbackRate = speed
      if (isFinite(el.duration)) setTime((t) => ({ ...t, duration: el.duration }))
    }
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('ended', onEnded)
    el.addEventListener('loadedmetadata', onMeta)
    el.addEventListener('durationchange', onMeta)
    el.addEventListener('waiting', onWaiting)
    el.addEventListener('playing', onPlaying)
    el.addEventListener('error', onError)
    return () => {
      el.removeEventListener('waiting', onWaiting)
      el.removeEventListener('playing', onPlaying)
      el.removeEventListener('error', onError)
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('ended', onEnded)
      el.removeEventListener('loadedmetadata', onMeta)
      el.removeEventListener('durationchange', onMeta)
    }
  }, [audioEl, speed])

  // Smooth progress: read the playhead every frame while playing.
  useEffect(() => {
    if (!isPlaying) return
    let raf
    const tick = () => {
      const el = audioRef.current
      if (el) setTime((t) => (t.current === el.currentTime ? t : { ...t, current: el.currentTime }))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isPlaying])

  useEffect(() => {
    const el = audioEl
    if (el) {
      el.defaultPlaybackRate = speed
      el.playbackRate = speed
    }
    try {
      localStorage.setItem(SPEED_KEY, String(speed))
    } catch {
      // storage unavailable — the speed just won't be remembered
    }
  }, [audioEl, speed])

  // Pause if the student leaves the page.
  useEffect(() => () => audioEl?.pause(), [audioEl])

  async function togglePlay(i, track) {
    const el = audioRef.current
    if (!el) return
    if (playingIndex === i) {
      if (el.paused) el.play().catch(() => {})
      else el.pause()
      return
    }
    if (!track.audioUrl) return
    const token = ++loadRef.current
    el.pause() // stop the previous track while the new link is fetched
    setAudioError('')
    setPlayingIndex(i)
    setLoading(true)
    setTime({ current: 0, duration: 0 })
    try {
      // Files in the private R2 bucket need a short-lived signed link first.
      const src = await resolveAudioUrl(track.audioUrl)
      if (token !== loadRef.current) return // another track was picked meanwhile
      el.src = src
      el.playbackRate = speed
      await el.play()
    } catch (err) {
      console.error('Audio play failed', err)
      if (token !== loadRef.current || err?.name === 'AbortError') return
      setPlayingIndex(null)
      setIsPlaying(false)
      setLoading(false)
      setAudioError(err?.message || "Couldn't play this audio.")
    }
  }

  function seek(value) {
    const el = audioRef.current
    if (!el) return
    el.currentTime = value
    setTime((t) => ({ ...t, current: value }))
  }

  if (moduleTreeLoading) {
    return (
      <AppShell>
        <div className="p-5 text-sm text-app-inkFaint">Loading…</div>
        <BottomTabBar />
      </AppShell>
    )
  }

  if (!material) {
    return (
      <AppShell>
        <div className="p-5 text-sm text-app-inkSoft">No module found.</div>
        <BottomTabBar />
      </AppShell>
    )
  }

  const header = (
    <div className="mb-3.5 flex items-center gap-3">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-app-border bg-app-panel2"
      >
        <Icon name="arrow-left-01" size={16} className="text-app-inkSoft" />
      </button>
      <div>
        <div className="font-poppins text-base font-extrabold">Audio Library</div>
        <div className="text-[11.5px] text-app-inkFaint">{material.name}</div>
      </div>
    </div>
  )

  if (activated === false) {
    return (
      <AppShell>
        <div className="px-5 pb-1.5 pt-5.5 pt-[22px]">{header}</div>
        <div className="mx-5 rounded-2xl border border-app-border bg-app-panel px-4 py-6 text-center">
          <Icon name="lock" size={24} className="mx-auto mb-2.5 text-app-inkFaint" />
          <div className="mb-1 text-[14px] font-bold">Module not activated</div>
          <div className="mb-4 text-[12.5px] text-app-inkSoft">
            Activate {material.name} with your code to unlock its Audio Library.
          </div>
          <button
            type="button"
            onClick={() => navigate('/activate')}
            className="rounded-xl bg-primary px-5 py-2.5 text-[13px] font-bold text-white"
          >
            Enter code
          </button>
        </div>
        <BottomTabBar />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <audio ref={setAudioNode} className="hidden" />
      <div className="px-5 pb-1.5 pt-5.5 pt-[22px]">
        {header}

        <div className="flex gap-2 overflow-x-auto pb-1.5">
          {material.units.map((u, i) => {
            const active = i === unitIndex
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setUnitIndex(i)
                  stopPlayback()
                }}
                className={`flex-shrink-0 whitespace-nowrap rounded-pill border px-4 py-2.5 text-[12.5px] font-bold ${
                  active ? 'border-primary bg-primary/[.15] text-primary' : 'border-app-border bg-app-panel2 text-app-inkSoft'
                }`}
              >
                {u.title}
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-5 pb-2 pt-4">
        {audioError && <div className="mb-2.5 text-[12.5px] font-semibold text-danger">{audioError}</div>}
        {tracks.length === 0 && (
          <div className="rounded-2xl border border-app-border bg-app-panel px-3.5 py-5 text-center text-[13px] text-app-inkFaint">
            No dialogue tracks in this unit yet.
          </div>
        )}
        {tracks.map((t, i) => {
          const active = playingIndex === i
          const playing = active && isPlaying
          const total = active && time.duration ? time.duration : parseDurationToSeconds(t.duration)
          const pct = total ? Math.min(100, (time.current / total) * 100) : 0
          return (
            <div
              key={i}
              className={`mb-2.5 rounded-2xl border bg-app-panel px-3.5 py-3 transition-colors ${
                active ? 'border-primary/40' : 'border-app-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => togglePlay(i, t)}
                  disabled={!t.audioUrl}
                  aria-label={playing ? 'Pause' : 'Play'}
                  title={t.audioUrl ? undefined : 'Audio not uploaded yet'}
                  className={`flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[11px] disabled:opacity-40 ${
                    active ? 'bg-primary' : 'bg-app-panel2'
                  }`}
                >
                  <Icon name={playing ? 'pause' : 'play'} size={16} className={active ? 'text-white' : 'text-app-ink'} />
                </button>
                <div className="min-w-0 flex-1 text-center">
                  <div className="mb-0.5 text-[13px] font-bold">{t.titleEn}</div>
                  <div dir="rtl" className="font-amiri text-sm text-app-inkSoft">
                    {t.titleAr}
                  </div>
                </div>
                <div className="flex-shrink-0 text-[11px] tabular-nums text-app-inkFaint">
                  {active ? (loading ? 'Loading…' : `${formatDuration(time.current)} / ${formatDuration(total)}`) : t.duration}
                </div>
              </div>

              {active && (
                <div className="mt-3">
                  <div className="relative h-4">
                    <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-app-panel2">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <div
                      className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow"
                      style={{ left: `${pct}%` }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={total || 1}
                      step={0.1}
                      value={Math.min(time.current, total || 1)}
                      onChange={(e) => seek(Number(e.target.value))}
                      aria-label="Seek"
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <span className="mr-1 text-[11px] font-semibold text-app-inkFaint">Speed</span>
                    {SPEEDS.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setSpeed(v)}
                        className={`rounded-full px-2.5 py-1 text-[11.5px] font-bold tabular-nums ${
                          speed === v
                            ? 'bg-primary text-white'
                            : 'border border-app-border bg-app-panel2 text-app-inkSoft hover:text-app-ink'
                        }`}
                      >
                        {speedLabel(v)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <BottomTabBar />
    </AppShell>
  )
}
