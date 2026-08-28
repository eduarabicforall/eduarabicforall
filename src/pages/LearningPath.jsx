import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Sidebar from '../components/layout/Sidebar'
import MobileTabBar from '../components/layout/MobileTabBar'

export default function LearningPath() {
  const { t } = useTranslation()
  const modules = [
    { name: 'Nahw Foundations', nameAr: 'أساسيات النحو', progress: 40, active: true },
    { name: 'Sarf Essentials', nameAr: 'علم الصرف', progress: 0, active: false },
    { name: 'Muhadathah', nameAr: 'المحادثة اليومية', progress: 0, active: false },
    { name: 'Qur\'anic Arabic', nameAr: 'لغة القرآن', progress: 0, active: false },
    { name: 'Balaghah', nameAr: 'مدخل إلى البلاغة', progress: 0, active: false },
  ]

  const units = [
    { name: 'The Nominal Sentence', nameAr: 'الجُمْلَةُ الاِسْمِيَّة', progress: 40, state: 'active' },
    { name: 'The Verbal Sentence', nameAr: 'الجُمْلَةُ الفِعْلِيَّة', progress: 0, state: 'locked' },
    { name: 'Pronouns & Demonstratives', nameAr: 'الضَّمَائِر', progress: 0, state: 'locked' },
    { name: 'Prepositions & Adverbs', nameAr: 'حُرُوف الجَرّ', progress: 0, state: 'locked' },
  ]

  return (
    <div className="flex min-h-screen bg-bg text-ink font-pjs">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="sticky top-0 z-20 backdrop-blur-[14px] bg-[rgba(7,10,20,.72)] border-b border-ea-border-soft py-4 px-6 md:px-8">
          <h1 className="font-sora font-extrabold text-xl tracking-tight">{t('dashboard.learning_path')}</h1>
        </div>
        <div className="p-6 md:p-8 pb-24 lg:pb-12 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {modules.map((m) => (
              <div key={m.name} className={`rounded-2xl p-5 border transition-colors cursor-pointer ${m.active ? 'bg-[rgba(47,196,159,.06)] border-primary' : 'bg-panel border-ea-border-soft hover:border-ea-border'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sora font-bold text-base">{m.name}</span>
                  {m.active && <span className="text-xs bg-primary text-[#04140F] px-2 py-0.5 rounded-full font-bold">Active</span>}
                </div>
                <div dir="rtl" className="font-amiri text-lg text-ink-soft mb-3">{m.nameAr}</div>
                {m.progress > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-ink-faint mb-1"><span>{m.progress}%</span><span>{m.active ? 'In progress' : ''}</span></div>
                    <div className="h-2 rounded-full bg-panel-2 overflow-hidden"><span className="block h-full bg-primary rounded-full" style={{ width: `${m.progress}%` }} /></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-6 bg-panel border border-ea-border">
            <h2 className="font-sora font-bold text-lg mb-1">Nahw Foundations · Units</h2>
            <p className="text-sm text-ink-soft mb-5">Start from the beginning — each unit unlocks after the previous one.</p>
            <div className="flex flex-col gap-3">
              {units.map((u, i) => (
                <div key={u.name} className={`flex items-center gap-4 p-4 rounded-xl border ${u.state === 'active' ? 'bg-[rgba(240,180,41,.08)] border-[rgba(240,180,41,.35)]' : 'bg-panel border-ea-border-soft'}`}>
                  <span className={`w-10 h-10 rounded-[10px] grid place-items-center font-sora font-bold text-sm ${u.state === 'active' ? 'bg-gold text-[#1a1400]' : 'bg-panel-2 text-ink-faint'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="font-bold text-sm">{u.name}</div>
                    <div dir="rtl" className="font-amiri text-base text-ink-soft">{u.nameAr}</div>
                  </div>
                  {u.state === 'active' ? (
                    <Link to="/lesson/1" className="px-3.5 py-1.5 rounded-lg bg-primary text-[#04140F] text-xs font-bold no-underline">Continue</Link>
                  ) : (
                    <i className="hgi-stroke hgi-lock text-ink-faint" style={{ fontSize: '18px' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <MobileTabBar />
    </div>
  )
}
