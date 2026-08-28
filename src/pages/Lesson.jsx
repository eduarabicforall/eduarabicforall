import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Sidebar from '../components/layout/Sidebar'
import MobileTabBar from '../components/layout/MobileTabBar'
import SecureVideo from '../components/SecureVideo'

export default function Lesson() {
  const { t } = useTranslation()
  const { id } = useParams()

  const exercises = [
    { q: 'البَيْتُ ____', qDir: 'rtl', options: ['كَبِيرٌ', 'يَكْتُبُ', 'جَمِيلٌ'], answer: 0 },
  ]

  return (
    <div className="flex min-h-screen bg-bg text-ink font-pjs">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="sticky top-0 z-20 backdrop-blur-[14px] bg-[rgba(7,10,20,.72)] border-b border-ea-border-soft py-3 px-6 md:px-8 flex items-center gap-3">
          <Link to="/learning-path" className="text-ink-soft hover:text-ink transition-colors no-underline">
            <i className="hgi-stroke hgi-arrow-left-01" style={{ fontSize: '20px' }} />
          </Link>
          <div>
            <div className="font-sora font-bold text-sm">Nahw Foundations · Unit 3</div>
            <div className="text-xs text-ink-soft">Clip 2 of 5</div>
          </div>
        </div>
        <div className="p-6 md:p-8 pb-24 lg:pb-12 flex flex-col gap-6 max-w-[900px]">
          <SecureVideo videoId="dQw4w9WgXcQ" title="The Nominal Sentence" />
          <div>
            <h1 className="font-sora font-extrabold text-2xl tracking-tight mb-1">The Nominal Sentence</h1>
            <p dir="rtl" className="font-amiri text-2xl text-gold">الجُمْلَةُ الاِسْمِيَّة</p>
            <p className="text-sm text-ink-soft mt-3 leading-relaxed">
              The nominal sentence (al-jumla al-ismiyya) is one of the two main sentence types in Arabic.
              It begins with a noun (mubtada') and is followed by a predicate (khabar).
            </p>
          </div>

          <div className="rounded-2xl bg-panel border border-ea-border p-5">
            <h3 className="font-sora font-bold text-base mb-4">Practice</h3>
            {exercises.map((ex, i) => (
              <div key={i} className="mb-4">
                <div dir={ex.qDir} className="font-amiri text-xl text-ink mb-3">{ex.q}</div>
                <div className="flex gap-2">
                  {ex.options.map((opt, j) => (
                    <button key={j} className="flex-1 text-center py-2.5 rounded-xl border border-ea-border bg-panel-2 text-ink-soft font-semibold text-sm cursor-pointer font-pjs hover:border-primary hover:text-ink transition-colors">
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Link to="/lesson/1" className="flex-1 text-center py-3 rounded-xl border border-ea-border bg-panel text-ink font-bold text-sm no-underline hover:border-ink-faint transition-colors">← Previous</Link>
            <Link to="/lesson/3" className="flex-1 text-center py-3 rounded-xl bg-primary text-[#04140F] font-bold text-sm no-underline hover:opacity-90 transition-opacity">Next →</Link>
          </div>
        </div>
      </main>
      <MobileTabBar />
    </div>
  )
}
