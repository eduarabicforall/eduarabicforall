import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BottomTabBar from '../components/layout/BottomTabBar'
import Pill from '../components/ui/Pill'
import Icon from '../components/Icon'

export default function AudioLibrary() {
  const { slug } = useParams()
  const [module, setModule] = useState(null)
  const [units, setUnits] = useState([])
  const [activeUnit, setActiveUnit] = useState(null)
  const [tracks, setTracks] = useState([])
  const [playingId, setPlayingId] = useState(null)
  const audioRef = useRef(null)

  useEffect(() => {
    async function load() {
      const { data: mod } = await supabase.from('modules').select('*').eq('slug', slug).single()
      setModule(mod)
      if (!mod) return
      const { data: unitList } = await supabase.from('units').select('*').eq('module_id', mod.id).order('order_index')
      setUnits(unitList ?? [])
      setActiveUnit(unitList?.[0]?.id ?? null)
    }
    load()
  }, [slug])

  useEffect(() => {
    if (!activeUnit) return
    supabase.from('audio_tracks').select('*').eq('unit_id', activeUnit).order('order_index')
      .then(({ data }) => setTracks(data ?? []))
  }, [activeUnit])

  function togglePlay(track) {
    if (playingId === track.id) {
      audioRef.current?.pause()
      setPlayingId(null)
      return
    }
    const { data } = supabase.storage.from('audio').getPublicUrl(track.storage_path)
    if (audioRef.current) {
      audioRef.current.src = data.publicUrl
      audioRef.current.play()
    }
    setPlayingId(track.id)
  }

  return (
    <div className="app-frame">
      <header className="px-5 pt-6 pb-4">
        <Link to="/dashboard" className="text-app-inkFaint text-sm mb-1 inline-flex items-center gap-1">
          <Icon name="arrow-left-01" size={16} /> Audio Library
        </Link>
        <h1 className="font-title font-bold text-xl">{module?.name}</h1>
      </header>

      <div className="flex gap-2 px-5 pb-3 overflow-x-auto">
        {units.map((u, i) => (
          <Pill key={u.id} active={activeUnit === u.id} onClick={() => setActiveUnit(u.id)}>
            Unit {i + 1}
          </Pill>
        ))}
      </div>

      <main className="flex-1 px-5 pb-6 flex flex-col gap-2 overflow-y-auto">
        {tracks.length === 0 && <p className="text-app-inkFaint text-sm mt-4">No tracks in this unit yet.</p>}
        {tracks.map((t) => (
          <div key={t.id} className="flex items-center gap-3 bg-app-panel border border-app-border rounded-card p-3">
            <button
              onClick={() => togglePlay(t)}
              className="w-10 h-10 rounded-full bg-app-primary text-app-bg flex items-center justify-center shrink-0"
            >
              <Icon name={playingId === t.id ? 'pause' : 'play'} size={18} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{t.title_en}</p>
              {t.title_ar && <p className="rtl-ar text-app-inkSoft text-sm truncate">{t.title_ar}</p>}
              {playingId === t.id && <div className="h-1 bg-app-panel2 rounded-pill mt-1"><div className="h-1 bg-app-primary rounded-pill w-1/3" /></div>}
            </div>
            {t.duration && <span className="text-xs text-app-inkFaint">{Math.floor(t.duration / 60)}:{String(t.duration % 60).padStart(2, '0')}</span>}
          </div>
        ))}
      </main>

      <audio ref={audioRef} onEnded={() => setPlayingId(null)} className="hidden" />
      <BottomTabBar />
    </div>
  )
}
