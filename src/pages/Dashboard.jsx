import { useEffect, useLayoutEffect, useState } from 'react'
import { useTransitionNavigate } from '../components/TransitionNavLink.jsx'
import gsap from 'gsap'
import AppShell from '../components/AppShell.jsx'
import BottomTabBar from '../components/BottomTabBar.jsx'
import Icon from '../components/Icon.jsx'
import PlaceholderBlock from '../components/PlaceholderBlock.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useModuleTree } from '../context/ModuleTreeContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { supabase } from '../lib/supabase.js'

function initials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function Dashboard() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { moduleTree } = useModuleTree()
  const [myModules, setMyModules] = useState(null) // null = loading
  const navigate = useTransitionNavigate()
  const name = user?.fullName || 'Student'

  useEffect(() => {
    if (!user?.id) return
    let active = true
    supabase
      .from('user_modules')
      .select('module_id, modules(slug, name)')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          console.error('Failed to load activated modules', error)
          setMyModules([])
          return
        }
        setMyModules(data.map((row) => ({ id: row.modules.slug, name: row.modules.name })))
      })
    return () => {
      active = false
    }
  }, [user?.id])

  // Entrance motion — layout effects so elements are hidden before first paint
  // (no flash), reverted on unmount. Skipped for reduced-motion users.
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.from('.gs-dash-head', { opacity: 0, y: -14, duration: 0.5, ease: 'power2.out' })
      gsap.from('.gs-dash-static', {
        opacity: 0,
        y: 22,
        duration: 0.55,
        ease: 'power2.out',
        stagger: 0.09,
        delay: 0.12,
      })
    })
    return () => ctx.revert()
  }, [])

  // Module cards arrive asynchronously, so they get their own reveal once the
  // list has loaded.
  useLayoutEffect(() => {
    if (myModules === null || !myModules.length) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.from('.gs-dash-module', { opacity: 0, y: 18, scale: 0.98, duration: 0.5, ease: 'power3.out', stagger: 0.08 })
    })
    return () => ctx.revert()
  }, [myModules])

  function unitCountFor(slug) {
    return moduleTree.find((m) => m.id === slug)?.units.length || 0
  }

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <AppShell>
      <div
        className="gs-dash-head flex items-center justify-between px-5 pb-4.5 pt-5.5 pt-[22px] pb-[18px]"
        style={{ background: 'linear-gradient(180deg, rgba(61,125,216,.10), transparent)' }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-soft font-poppins text-[17px] font-extrabold text-[#0B2A4A]"
          >
            {initials(name)}
          </button>

          <div>
            <div className="mb-0.5 text-[10.5px] font-semibold text-app-inkFaint">{today}</div>
            <div className="font-poppins text-[19px] font-extrabold">{name}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-app-border bg-app-panel2"
          >
            <Icon name={theme === 'dark' ? 'sun-01' : 'moon-02'} size={18} className="text-app-inkSoft" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/notifications')}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-app-border bg-app-panel2"
          >
            <Icon name="notification-01" size={18} className="text-app-inkSoft" />
          </button>
        </div>
      </div>

      <div className="px-5 pb-2 pt-3.5">
        <div className="gs-dash-static mb-3 text-[13px] font-bold tracking-wide text-app-inkSoft">MY MODULES</div>

        {myModules === null && <div className="mb-3 text-[12.5px] text-app-inkFaint">Loading your modules…</div>}

        {myModules?.length === 0 && (
          <div className="mb-3 rounded-2xl border border-dashed border-app-border bg-app-panel/60 p-4 text-[12.5px] text-app-inkSoft">
            No modules activated yet. Activate one below to unlock its Audio Library.
          </div>
        )}

        {myModules?.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => navigate(`/audio/${m.id}`)}
            className="gs-dash-module mb-3 flex w-full items-center gap-3.5 rounded-2xl border border-app-border bg-app-panel p-4 text-left"
          >
            <PlaceholderBlock variant="dark" label="" className="h-[52px] w-[52px] flex-shrink-0 rounded-[13px]" />
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 text-sm font-bold">{m.name}</div>
              <div className="text-[11px] text-app-inkFaint">{unitCountFor(m.id)} units available</div>
            </div>
            <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] bg-primary/[.12]">
              <Icon name="arrow-right-01" size={16} className="text-primary" />
            </div>
          </button>
        ))}

        <div className="gs-dash-static my-4.5 my-[18px] rounded-2xl border-[1.5px] border-dashed border-primary/[.35] bg-primary/[.05] px-4.5 py-5.5 px-[18px] py-[22px] text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/[.15]">
            <Icon name="qr-code" size={22} className="text-primary" />
          </div>
          <div className="mb-1 text-[15px] font-bold">Activate a new module</div>
          <div className="mb-4 text-[12.5px] text-app-inkSoft">Scan the QR in your module or enter its code.</div>
          <button
            type="button"
            onClick={() => navigate('/activate')}
            className="rounded-xl bg-primary px-[22px] py-3 text-sm font-bold text-[#0B2A4A]"
          >
            Enter code
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate('/grammar')}
          className="gs-dash-static mt-3.5 flex w-full items-center gap-3 rounded-2xl border border-gold/[.22] bg-gold/[.08] px-4 py-3.5 text-left"
        >
          <Icon name="mortarboard-01" size={20} className="text-gold" />
          <div className="flex-1">
            <div className="text-[13px] font-bold">Grammar module</div>
            <div className="text-[11.5px] text-app-inkSoft">Free for your account</div>
          </div>
          <Icon name="arrow-right-01" size={16} className="text-gold" />
        </button>
      </div>

      <BottomTabBar />
    </AppShell>
  )
}
