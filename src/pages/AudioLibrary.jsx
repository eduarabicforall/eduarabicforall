import React from 'react'
import { useTranslation } from 'react-i18next'
import Sidebar from '../components/layout/Sidebar'
import MobileTabBar from '../components/layout/MobileTabBar'

const audios = [
  { title: 'Daily Arabic Podcast', ep: 'Ep. 12', duration: '6 min', free: true, icon: 'headphones' },
  { title: 'Tajweed Recitation', ep: 'Ep. 8', duration: '12 min', free: true, icon: 'quran-01' },
  { title: 'Vocabulary Builder', ep: 'Ep. 15', duration: '5 min', free: true, icon: 'book-open-01' },
  { title: 'Grammar in Context', ep: 'Ep. 6', duration: '8 min', free: false, icon: 'language-square' },
  { title: 'Advanced Nahw Lecture', ep: 'Ep. 3', duration: '18 min', free: false, icon: 'book-02' },
  { title: 'Conversational Practice', ep: 'Ep. 10', duration: '7 min', free: false, icon: 'bubble-chat' },
]

export default function AudioLibrary() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen bg-bg text-ink font-pjs">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="sticky top-0 z-20 backdrop-blur-[14px] bg-[rgba(7,10,20,.72)] border-b border-ea-border-soft py-4 px-6 md:px-8">
          <h1 className="font-sora font-extrabold text-xl tracking-tight">Audio Library</h1>
        </div>
        <div className="p-6 md:p-8 pb-24 lg:pb-12 flex flex-col gap-4">
          {audios.map((a, i) => (
            <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${a.free ? 'bg-panel border-ea-border-soft hover:border-primary' : 'bg-panel border-ea-border-soft opacity-60'}`}>
              <span className={`w-12 h-12 rounded-[13px] grid place-items-center ${a.free ? 'bg-[rgba(47,196,159,.14)] text-primary' : 'bg-panel-2 text-ink-faint'}`}>
                <i className={`hgi-stroke hgi-${a.icon}`} style={{ fontSize: '22px' }} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm">{a.title}</div>
                <div className="text-xs text-ink-faint">{a.ep} · {a.duration}</div>
              </div>
              {a.free ? (
                <button className="w-10 h-10 rounded-[11px] bg-primary text-[#04140F] grid place-items-center border-none cursor-pointer hover:opacity-90 transition-opacity">
                  <i className="hgi-stroke hgi-play-circle" style={{ fontSize: '22px' }} />
                </button>
              ) : (
                <span className="text-xs text-ink-faint font-semibold px-2.5 py-1 rounded-full bg-panel-2">
                  <i className="hgi-stroke hgi-lock me-1" style={{ fontSize: '14px' }} /> Plus
                </span>
              )}
            </div>
          ))}
        </div>
      </main>
      <MobileTabBar />
    </div>
  )
}
