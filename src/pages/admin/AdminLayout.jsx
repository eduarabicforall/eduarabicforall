import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import Icon from '../../components/Icon.jsx'
import Toast from '../../components/Toast.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAdmin } from '../../context/AdminContext.jsx'
import { ORDER_FILTERS } from '../../data/adminMock.js'

// "Manage materials" sub-items are built from the live `moduleTree` inside
// SidebarContent (not a static list) — every module in the database shows
// up here, including one just created for a brand-new product.
const NAV_ITEMS = [
  { to: '/admin', end: true, icon: 'dashboard-square-01', label: 'Dashboard' },
  { to: '/admin/admins', icon: 'shield-user', label: 'Manage admins' },
  { to: '/admin/materials', icon: 'book-02', label: 'Manage materials' },
  { to: '/admin/products', icon: 'shopping-bag-02', label: 'Manage products' },
  { to: '/admin/codes', icon: 'key-01', label: 'Activation codes' },
  { to: '/admin/discounts', icon: 'discount-01', label: 'Discount codes' },
  { to: '/admin/reviews', icon: 'star', label: 'Reviews' },
  {
    to: '/admin/orders',
    icon: 'package',
    label: 'Orders',
    subItems: ORDER_FILTERS.map((f) => ({
      to: f.id === 'all' ? '/admin/orders' : `/admin/orders/${f.id}`,
      label: f.label,
      end: f.id === 'all',
    })),
  },
  { to: '/admin/ai', icon: 'sparkles', label: 'AI console' },
]

const linkClass = ({ isActive }) =>
  `mb-0.5 flex w-full items-center gap-2.5 rounded-[11px] px-3 py-2.5 text-left text-[13.5px] font-semibold ${
    isActive ? 'bg-primary/[.14] text-primary' : 'text-app-inkSoft'
  }`

const subLinkClass = ({ isActive }) =>
  `flex items-center gap-2 rounded-[9px] px-2.5 py-2 text-left text-[12.5px] font-semibold ${
    isActive ? 'bg-app-panel2 text-app-ink' : 'text-app-inkFaint'
  }`

function SidebarContent({ user, onNavigate }) {
  const { moduleTree, products } = useAdmin()
  // Grammar has no row in `modules` at all (it's routed by the fixed
  // "grammar" slug, not a DB module) so it's pinned here rather than coming
  // from moduleTree. Every other module only shows once it has a matching
  // *active* product — a module for a disabled/draft product would otherwise
  // clutter this list before it's actually ready to sell.
  const materialsSubItems = [
    { to: '/admin/materials/grammar', label: 'Grammar module' },
    ...moduleTree
      .filter((m) => products.some((p) => p.moduleId === m.dbId && p.active))
      .map((m) => ({ to: `/admin/materials/${m.id}`, label: m.name })),
  ]

  return (
    <div className="flex h-full flex-col p-3.5">
      <div className="flex items-center gap-2 px-2 pb-5.5 pb-[22px] pt-1.5">
        <img src="/logo.png" alt="EduArabic for All" className="h-6 w-auto" />
        <span className="text-[11px] font-bold text-app-inkFaint">Admin</span>
      </div>

      {NAV_ITEMS.map((item) => {
        const subItems = item.to === '/admin/materials' ? materialsSubItems : item.subItems
        return (
          <div key={item.to}>
            <NavLink to={item.to} end={item.end} className={linkClass} onClick={onNavigate}>
              <Icon name={item.icon} size={17} />
              {item.label}
            </NavLink>
            {subItems && (
              <div className="ml-5 mb-1.5 flex flex-col gap-px border-l border-app-border pl-3">
                {subItems.map((sub) => (
                  <NavLink key={sub.to} to={sub.to} end={sub.end} className={subLinkClass} onClick={onNavigate}>
                    <Icon name="folder-01" size={13} className="flex-shrink-0" />
                    {sub.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <div className="flex-1" />

      <NavLink
        to="/dashboard"
        onClick={onNavigate}
        className="mb-2.5 flex items-center gap-3 rounded-[11px] border border-primary/40 bg-primary/[.14] px-3 py-2.5 text-[13px] font-bold text-primary"
      >
        <Icon name="home-01" size={17} />
        Switch to student view
      </NavLink>

      <NavLink
        to="/admin/profile"
        onClick={onNavigate}
        className={({ isActive }) =>
          `mt-2.5 flex items-center gap-2.5 rounded-[11px] border-t border-app-border p-3 ${
            isActive ? 'bg-primary/[.14] text-primary' : 'text-app-ink'
          }`
        }
      >
        <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-app-panel2 text-xs font-bold">
          {(user?.fullName || 'A')[0].toUpperCase()}
        </div>
        <div className="text-[12.5px] font-semibold">{user?.fullName || 'Admin'} (admin)</div>
      </NavLink>
    </div>
  )
}

export default function AdminLayout() {
  const { user } = useAuth()
  const { toast } = useAdmin()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  const activeLabel =
    NAV_ITEMS.find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)))
      ?.label ||
    (location.pathname.startsWith('/admin/profile') ? 'Profile settings' : 'Admin')

  return (
    <div className="min-h-screen bg-app-bg text-app-ink md:grid md:h-screen md:grid-cols-[250px_1fr] md:overflow-hidden">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-app-border px-4 py-3.5 md:hidden">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="EduArabic for All" className="h-5 w-auto" />
          <span className="font-sora text-sm font-extrabold">{activeLabel}</span>
        </div>
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setDrawerOpen((o) => !o)}
          className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-app-border bg-app-panel2"
        >
          <Icon name={drawerOpen ? 'cancel-01' : 'menu-01'} size={20} />
        </button>
      </div>

      {/* Desktop sidebar — its own scroll region, stays put while content scrolls */}
      <div className="hidden border-r border-app-border md:block md:h-screen md:overflow-y-auto">
        <SidebarContent user={user} />
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[270px] max-w-[80vw] border-r border-app-border bg-app-bg shadow-[0_0_40px_rgba(0,0,0,.5)]">
            <SidebarContent user={user} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="overflow-x-auto px-4 py-5 md:h-screen md:overflow-y-auto md:px-10 md:py-[30px]">
        <Outlet />
      </div>

      <Toast message={toast} />
    </div>
  )
}
