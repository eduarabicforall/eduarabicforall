import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTransitionNavigate } from '../components/TransitionNavLink.jsx'
import AppShell from '../components/AppShell.jsx'
import BottomTabBar from '../components/BottomTabBar.jsx'
import Icon from '../components/Icon.jsx'
import { useModuleTree } from '../context/ModuleTreeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'

export default function AudioLibrary() {
  const { moduleId } = useParams()
  const { moduleTree, loading: moduleTreeLoading } = useModuleTree()
  const { user } = useAuth()
  const material = moduleTree.find((m) => m.id === moduleId) || moduleTree[0]

  const [unitIndex, setUnitIndex] = useState(0)
  const [playingIndex, setPlayingIndex] = useState(null)
  const [activated, setActivated] = useState(null) // null = checking
  const audioRef = useRef(null)
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
    setPlayingIndex(null)
  }, [material?.id])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const onEnded = () => setPlayingIndex(null)
    el.addEventListener('ended', onEnded)
    return () => el.removeEventListener('ended', onEnded)
  }, [])

  function togglePlay(i, track) {
    const el = audioRef.current
    if (playingIndex === i) {
      el?.pause()
      setPlayingIndex(null)
      return
    }
    if (track.audioUrl && el) {
      el.src = track.audioUrl
      el.play().catch(() => {})
    }
    setPlayingIndex(i)
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
      <audio ref={audioRef} className="hidden" />
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
                  setPlayingIndex(null)
                  audioRef.current?.pause()
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
        {tracks.length === 0 && (
          <div className="rounded-2xl border border-app-border bg-app-panel px-3.5 py-5 text-center text-[13px] text-app-inkFaint">
            No dialogue tracks in this unit yet.
          </div>
        )}
        {tracks.map((t, i) => {
          const playing = playingIndex === i
          return (
            <div
              key={i}
              className="mb-2.5 flex items-center gap-3 rounded-2xl border border-app-border bg-app-panel px-3.5 py-3"
            >
              <button
                type="button"
                onClick={() => togglePlay(i, t)}
                disabled={!t.audioUrl}
                title={t.audioUrl ? undefined : 'Audio not uploaded yet'}
                className={`flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[11px] disabled:opacity-40 ${
                  playing ? 'bg-primary' : 'bg-app-panel2'
                }`}
              >
                <Icon name={playing ? 'pause' : 'play'} size={16} className={playing ? 'text-white' : 'text-app-ink'} />
              </button>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 text-[13px] font-bold">{t.titleEn}</div>
                <div dir="rtl" className="mb-1.5 font-amiri text-sm text-app-inkSoft">
                  {t.titleAr}
                </div>
                {playing && (
                  <div className="h-1 overflow-hidden rounded-full bg-app-panel2">
                    <div className="h-full w-[42%] rounded-full bg-primary" />
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 text-[11px] text-app-inkFaint">{t.duration}</div>
            </div>
          )
        })}
      </div>

      <BottomTabBar />
    </AppShell>
  )
}
