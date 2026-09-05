import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import BottomTabBar from '../components/layout/BottomTabBar'
import Card from '../components/ui/Card'
import Icon from '../components/Icon'

export default function Dashboard() {
  const { user, profile, signOut } = useAuth()
  const [modules, setModules] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function load() {
      const { data: userModules } = await supabase
        .from('user_modules')
        .select('module_id, modules(id, name, slug, cover_url)')
        .eq('user_id', user.id)

      const results = []
      for (const um of userModules ?? []) {
        const [{ count: totalTracks }, { data: units }] = await Promise.all([
          supabase.from('audio_tracks').select('id, unit_id, units!inner(module_id)', { count: 'exact', head: true })
            .eq('units.module_id', um.module_id),
          supabase.from('units').select('id').eq('module_id', um.module_id),
        ])
        results.push({
          ...um.modules,
          totalTracks: totalTracks ?? 0,
          totalUnits: units?.length ?? 0,
          // Fasa 1: real audio-completion tracking (per-track "listened" state)
          // isn't modelled yet — show unit count as progress denominator with
          // 0 completed rather than a hardcoded percentage (PRD §6 issue #10).
          doneUnits: 0,
        })
      }
      if (!cancelled) {
        setModules(results)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [user])

  const initials = (profile?.full_name || user?.email || '?').slice(0, 2).toUpperCase()

  return (
    <div className="app-frame">
      <header className="flex items-center justify-between px-5 pt-6 pb-4">
        <div className="relative">
          <button onClick={() => setMenuOpen((o) => !o)} className="w-11 h-11 rounded-full bg-app-primary/20 text-app-primary font-bold flex items-center justify-center">
            {initials}
          </button>
          {menuOpen && (
            <div className="absolute top-14 left-0 bg-app-panel2 border border-app-border rounded-xl overflow-hidden w-48 z-10">
              <Link to="/profile" className="block px-4 py-3 text-sm hover:bg-app-panel">Profile settings</Link>
              <button onClick={signOut} className="w-full text-left px-4 py-3 text-sm text-app-danger hover:bg-app-panel">Log out</button>
            </div>
          )}
        </div>
        <div className="text-center">
          <p className="text-app-inkSoft text-xs">Assalamualaikum,</p>
          <p className="font-semibold">{profile?.full_name || 'Student'}</p>
        </div>
        <Link to="/alerts" className="w-11 h-11 rounded-full bg-app-panel flex items-center justify-center">
          <Icon name="notification-01" />
        </Link>
      </header>

      <main className="flex-1 px-5 pb-6 flex flex-col gap-3 overflow-y-auto">
        <h2 className="text-xs font-bold text-app-inkFaint tracking-wider mt-2">MY MODULES</h2>

        {loading && <p className="text-app-inkFaint text-sm">Loading…</p>}
        {!loading && modules.length === 0 && (
          <p className="text-app-inkFaint text-sm">No modules activated yet — activate one below.</p>
        )}

        {modules.map((m) => {
          const pct = m.totalUnits ? Math.round((m.doneUnits / m.totalUnits) * 100) : 0
          return (
            <Link key={m.id} to={`/audio/${m.slug}`}>
              <Card className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-app-primary/15 flex items-center justify-center shrink-0">
                  <Icon name="book-02" size={26} className="text-app-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{m.name}</p>
                  <div className="h-1.5 bg-app-panel2 rounded-pill mt-2 mb-1">
                    <div className="h-1.5 bg-app-primary rounded-pill" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-app-inkFaint">{pct}% · {m.doneUnits}/{m.totalUnits} units</p>
                </div>
              </Card>
            </Link>
          )
        })}

        <Link to="/activate">
          <Card className="border-dashed flex items-center justify-between">
            <span className="text-sm font-semibold">Activate a new module</span>
            <span className="text-xs bg-app-panel2 rounded-pill px-3 py-1.5">Enter code</span>
          </Card>
        </Link>

        <Link to="/grammar">
          <Card className="border-app-gold/40 bg-app-gold/10 flex items-center justify-between">
            <div>
              <p className="font-semibold text-app-gold">Grammar module</p>
              <p className="text-xs text-app-inkSoft">Free for your account</p>
            </div>
            <Icon name="arrow-right-01" className="text-app-gold" />
          </Card>
        </Link>
      </main>

      <BottomTabBar />
    </div>
  )
}
