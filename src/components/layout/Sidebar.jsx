import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageToggle from '../LanguageToggle'

const navItems = [
  { icon: 'dashboard-square-01', labelKey: 'admin.dashboard', label: 'Dashboard', to: '/dashboard' },
  { icon: 'route-01', labelKey: 'dashboard.learning_path', label: 'Learning path', to: '/learning-path' },
  { icon: 'headphones', labelKey: 'dashboard.audio_library', label: 'Audio Library', to: '/audio' },
  { icon: 'calendar-01', labelKey: 'dashboard.my_classes', label: 'My classes', to: '/classes' },
  { icon: 'ai-brain-01', labelKey: 'nav.ai_ustaz', label: 'AI Ustaz', to: '/ai-ustaz' },
  { icon: 'shopping-cart-01', labelKey: 'nav.shop', label: 'Shop', to: '/shop' },
]

export default function Sidebar() {
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
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto p-3.5 rounded-[14px] bg-gradient-to-br from-[rgba(47,196,159,.16)] to-[rgba(47,196,159,.04)] border border-[rgba(47,196,159,.22)]">
        <div className="font-sora font-bold text-sm mb-1">{t('dashboard.upgrade')}</div>
        <p className="text-[12.5px] text-ink-soft mb-3 leading-tight">{t('dashboard.upgrade_desc')}</p>
        <a href="#" className="block text-center py-2 rounded-[10px] bg-primary text-[#04140F] text-[13px] font-bold no-underline hover:opacity-90 transition-opacity">
          {t('dashboard.upgrade_btn')}
        </a>
      </div>

      <div className="flex items-center gap-3 p-2">
        <span className="w-9 h-9 rounded-[10px] bg-panel-2 grid place-items-center text-primary">
          <i className="hgi-stroke hgi-user" style={{ fontSize: '20px' }} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-bold truncate">Ahmad Faiz</div>
          <div className="text-xs text-ink-faint">{t('dashboard.free_plan')}</div>
        </div>
        <LanguageToggle />
      </div>
    </aside>
  )
}
