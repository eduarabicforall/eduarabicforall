import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const navItems = [
  { icon: 'dashboard-square-01', label: 'admin.dashboard', to: '/admin' },
  { icon: 'user-group', label: 'admin.users', to: '/admin/users' },
  { icon: 'book-open-01', label: 'admin.modules', to: '/admin/modules' },
  { icon: 'video-01', label: 'admin.videos', to: '/admin/videos' },
  { icon: 'calendar-01', label: 'admin.classes', to: '/admin/classes' },
  { icon: 'shopping-cart-01', label: 'admin.orders', to: '/admin/orders' },
]

export default function AdminSidebar() {
  const { t } = useTranslation()
  const location = useLocation()

  return (
    <aside className="hidden lg:flex w-[250px] shrink-0 border-e border-ea-border-soft py-5 px-4 flex-col gap-6 sticky top-0 h-screen bg-[rgba(11,16,32,.5)]">
      <div className="px-2">
        <Link to="/" className="block">
          <span className="font-sora font-extrabold text-lg text-ink tracking-tight">
            Edu<span className="text-primary">Arabic</span>
          </span>
        </Link>
        <div className="text-xs text-primary font-bold tracking-[.14em] uppercase mt-1">{t('admin.admin_panel')}</div>
      </div>

      <nav className="flex flex-col gap-[3px]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[11px] text-[14.5px] font-semibold transition-colors no-underline ${
                isActive ? 'bg-panel-2 text-ink' : 'text-ink-soft hover:bg-panel-2'
              }`}
            >
              <i className={`hgi-stroke hgi-${item.icon}`} style={{ fontSize: '21px' }} />
              {t(item.label)}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto">
        <Link to="/dashboard" className="flex items-center gap-3 px-3.5 py-2.5 rounded-[11px] text-[14.5px] font-semibold text-ink-soft hover:bg-panel-2 transition-colors no-underline">
          <i className="hgi-stroke hgi-arrow-left-01" style={{ fontSize: '21px' }} />
          Back to app
        </Link>
      </div>
    </aside>
  )
}
