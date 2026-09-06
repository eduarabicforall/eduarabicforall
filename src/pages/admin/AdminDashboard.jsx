import { MODULE_STATS } from '../../data/adminMock.js'

const STAT_CARDS = [
  { label: 'Total users', value: '4,812' },
  { label: 'Most active module', value: 'Al Quran' },
  { label: 'AI Ustaz messages (30d)', value: '18,204' },
  { label: 'Sales (in-app)', value: 'RM12,430', accent: true },
]

export default function AdminDashboard() {
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div>
      <div className="mb-1 text-xs font-semibold text-app-inkFaint">{today}</div>
      <h1 className="mb-6 font-sora text-2xl font-extrabold">Dashboard</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <div key={card.label} className="rounded-2xl border border-app-border bg-app-panel p-5">
            <div className="mb-2 text-xs font-semibold text-app-inkFaint">{card.label}</div>
            <div className={`font-sora text-[26px] font-extrabold ${card.accent ? 'text-primary' : ''}`}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-app-border bg-app-panel p-5.5 p-[22px]">
        <div className="mb-3.5 text-sm font-bold">Module activations</div>
        {MODULE_STATS.map((m) => (
          <div key={m.name} className="mb-3 flex items-center gap-3">
            <div className="w-[90px] flex-shrink-0 text-[12.5px] text-app-inkSoft sm:w-[130px]">{m.name}</div>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-app-panel2">
              <div className="h-full bg-primary" style={{ width: `${m.pct}%` }} />
            </div>
            <div className="w-[50px] flex-shrink-0 text-right text-xs text-app-inkFaint">{m.count}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
