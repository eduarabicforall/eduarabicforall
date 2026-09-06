import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import Icon from './Icon.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'

// Same primary destinations as BottomTabBar (PRD §6 issue #3 fixed order),
// shown as a persistent sidebar on desktop instead of a bottom tab bar.
// "Modules" replaces the old flat "Grammar" link — it expands to Grammar
// plus whichever modules the student has activated, each going straight to
// that module's Audio Library.
const NAV_ITEMS = [
  { to: '/dashboard', icon: 'home-01', label: 'Home' },
  { to: '/ai-ustaz', icon: 'message-01', label: 'AI Ustaz' },
  { to: '/shop', icon: 'shopping-bag-02', label: 'Shop' },
]

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-[11px] px-3 py-2.5 text-[13.5px] font-semibold ${
    isActive ? 'bg-primary/[.14] text-primary' : 'text-app-inkSoft'
  }`

const subLinkClass = ({ isActive }) =>
  `flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-left text-[12.5px] font-semibold ${
    isActive ? 'bg-app-panel2 text-app-ink' : 'text-app-inkFaint'
  }`

function ModulesNavItem() {
  const { user } = useAuth()
  const location = useLocation()
  const [myModules, setMyModules] = useState([])
  const [open, setOpen] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    let active = true
    supabase
      .from('user_modules')
      .select('modules(slug, name)')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (!active || error) return
        setMyModules(data.filter((row) => row.modules).map((row) => ({ id: row.modules.slug, name: row.modules.name })))
      })
    return () => {
      active = false
    }
  }, [user?.id])

  const isActive = location.pathname.startsWith('/grammar') || location.pathname.startsWith('/audio')

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center gap-3 rounded-[11px] px-3 py-2.5 text-left text-[13.5px] font-semibold ${
          isActive ? 'bg-primary/[.14] text-primary' : 'text-app-inkSoft'
        }`}
      >
        <Icon name="mortarboard-01" size={18} />
        <span className="flex-1">Modules</span>
        <Icon name="arrow-down-01" size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="ml-5 mb-1.5 mt-0.5 flex flex-col gap-px border-l border-app-border pl-3">
          <NavLink to="/grammar" className={subLinkClass}>
            <Icon name="book-02" size={13} className="flex-shrink-0" />
            Grammar
          </NavLink>
          {myModules.map((m) => (
            <NavLink key={m.id} to={`/audio/${m.id}`} className={subLinkClass}>
              <Icon name="headphones" size={13} className="flex-shrink-0" />
              {m.name}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

function Sidebar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col p-3.5">
      <div className="px-2 pb-6 pt-1.5">
        <img src="/logo.png" alt="EduArabic for All" className="h-7 w-auto" />
      </div>

      <NavLink to="/dashboard" className={linkClass}>
        <Icon name="home-01" size={18} />
        Home
      </NavLink>

      <ModulesNavItem />

      {NAV_ITEMS.slice(1).map((item) => (
        <NavLink key={item.to} to={item.to} className={linkClass}>
          <Icon name={item.icon} size={18} />
          {item.label}
        </NavLink>
      ))}

      <div className="flex-1" />

      {user?.role === 'admin' && (
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            `mb-2.5 flex items-center gap-3 rounded-[11px] border px-3 py-2.5 text-[13.5px] font-bold ${
              isActive ? 'border-primary bg-primary text-[#0B2A4A]' : 'border-primary/40 bg-primary/[.14] text-primary'
            }`
          }
        >
          <Icon name="shield-user" size={18} />
          Admin console
        </NavLink>
      )}

      <button
        type="button"
        onClick={() => {
          signOut()
          navigate('/')
        }}
        className="flex items-center gap-2.5 rounded-[11px] border-t border-app-border p-3 text-left"
      >
        <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-app-panel2 text-xs font-bold text-app-ink">
          {(user?.fullName || 'S')[0].toUpperCase()}
        </div>
        <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-app-inkSoft">
          {user?.fullName || 'Student'}
        </span>
        <Icon name="logout-01" size={15} className="flex-shrink-0 text-app-inkFaint" />
      </button>
    </div>
  )
}

// Replaces the old fixed-width PhoneFrame mockup: a persistent sidebar +
// wide content column on desktop, and the same full-width mobile layout
// (with BottomTabBar, rendered per-page as before) below the md breakpoint.
//
// `bare` skips the sidebar entirely — used for pages a signed-out visitor
// can land on (e.g. guest checkout) where the account nav/sign-out block
// would be misleading since there's no account yet.
export default function AppShell({ children, bare = false }) {
  if (bare) {
    return (
      <div className="min-h-screen bg-app-bg text-app-ink">
        <div className="mx-auto flex w-full max-w-2xl flex-col">{children}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-app-bg text-app-ink md:flex">
      <div className="hidden w-[230px] flex-shrink-0 border-r border-app-border md:block">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
      </div>
      <div className="min-h-screen flex-1">
        <div className="mx-auto flex w-full max-w-2xl flex-col">{children}</div>
      </div>
    </div>
  )
}
