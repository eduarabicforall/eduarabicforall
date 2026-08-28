import React from 'react'
import { useTranslation } from 'react-i18next'
import Sidebar from '../components/layout/Sidebar'
import MobileTabBar from '../components/layout/MobileTabBar'

const classes = [
  { title: 'Muhadathah — Level 2', tutor: 'with Ustaz Hakim', time: 'Today · 8:30 PM', type: 'group', icon: 'video-01', accent: 'text-primary', tint: 'bg-[rgba(47,196,159,.14)]', joinable: true },
  { title: 'Nahw Q&A session', tutor: 'with Ustazah Aisyah', time: 'Thu · 9:00 PM', type: 'group', icon: 'user-group', accent: 'text-gold', tint: 'bg-[rgba(240,180,41,.14)]', joinable: false },
  { title: 'Qur\'anic Recitation Circle', tutor: 'with Ustaz Rashid', time: 'Fri · 7:00 PM', type: 'group', icon: 'quran-01', accent: 'text-violet', tint: 'bg-[rgba(185,167,240,.14)]', joinable: false },
]

export default function Classes() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen bg-bg text-ink font-pjs">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="sticky top-0 z-20 backdrop-blur-[14px] bg-[rgba(7,10,20,.72)] border-b border-ea-border-soft py-4 px-6 md:px-8">
          <h1 className="font-sora font-extrabold text-xl tracking-tight">{t('dashboard.upcoming_classes')}</h1>
        </div>
        <div className="p-6 md:p-8 pb-24 lg:pb-12 flex flex-col gap-4">
          {classes.map((c, i) => (
            <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-panel border border-ea-border-soft">
              <span className={`w-12 h-12 rounded-[13px] ${c.tint} grid place-items-center ${c.accent}`}>
                <i className={`hgi-stroke hgi-${c.icon}`} style={{ fontSize: '22px' }} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm">{c.title}</div>
                <div className="text-xs text-ink-faint">{c.tutor}</div>
                <div className="flex items-center gap-1.5 text-xs text-ink-soft mt-1 font-semibold">
                  <i className="hgi-stroke hgi-clock-01" style={{ fontSize: '14px' }} /> {c.time}
                </div>
              </div>
              {c.joinable ? (
                <button className="px-4 py-2 rounded-[9px] bg-primary text-[#04140F] text-xs font-bold cursor-pointer font-pjs border-none hover:opacity-90 transition-opacity">
                  {t('dashboard.join_zoom')}
                </button>
              ) : (
                <button className="px-4 py-2 rounded-[9px] bg-panel-2 text-ink text-xs font-bold cursor-pointer font-pjs border border-ea-border hover:border-primary transition-colors">
                  {t('dashboard.remind_me')}
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
      <MobileTabBar />
    </div>
  )
}
