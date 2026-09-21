import { useEffect, useState } from 'react'
import { useAdmin } from '../../context/AdminContext.jsx'
import { supabase } from '../../lib/supabase.js'

const formatRm = (n) => `RM${n.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

export default function AdminDashboard() {
  const { moduleTree, codes, orders, codesLoading, ordersLoading } = useAdmin()
  const [totalUsers, setTotalUsers] = useState(null)

  useEffect(() => {
    let active = true
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .then(({ count, error }) => {
        if (active) setTotalUsers(error ? undefined : count)
      })
    return () => {
      active = false
    }
  }, [])

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  // Activations come from the per-module code's counter — every successful
  // activate_module_code() bumps it — so it's the same number the
  // Activation codes page shows.
  const moduleStats = moduleTree
    .map((m) => ({
      name: m.name,
      count: codes.find((c) => c.moduleId === m.dbId)?.activatedCount ?? 0,
    }))
    .sort((a, b) => b.count - a.count)
  const maxCount = Math.max(1, ...moduleStats.map((m) => m.count))
  const topModule = moduleStats[0]?.count > 0 ? moduleStats[0].name : '—'

  // Only orders that have actually been paid count as sales — checkout
  // creates orders as "pending" until a payment gateway confirms them.
  const paidOrders = orders.filter((o) => o.payment === 'paid')
  const sales = paidOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0)

  const loadingStats = codesLoading || ordersLoading
  const STAT_CARDS = [
    {
      label: 'Total users',
      value: totalUsers === null ? '…' : totalUsers === undefined ? '—' : totalUsers.toLocaleString('en-MY'),
    },
    { label: 'Most active module', value: loadingStats ? '…' : topModule },
    { label: 'AI Ustaz messages (30d)', value: '—', hint: 'Not tracked yet' },
    {
      label: 'Sales (paid orders)',
      value: loadingStats ? '…' : formatRm(sales),
      hint: loadingStats ? '' : `${paidOrders.length} paid of ${orders.length} orders`,
      accent: true,
    },
  ]

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
            {card.hint && <div className="mt-1 text-[11px] text-app-inkFaint">{card.hint}</div>}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-app-border bg-app-panel p-5.5 p-[22px]">
        <div className="mb-3.5 text-sm font-bold">Module activations</div>
        {codesLoading ? (
          <div className="text-sm text-app-inkFaint">Loading…</div>
        ) : moduleStats.length === 0 ? (
          <div className="text-sm text-app-inkFaint">No modules yet.</div>
        ) : (
          moduleStats.map((m) => (
            <div key={m.name} className="mb-3 flex items-center gap-3">
              <div className="w-[90px] flex-shrink-0 truncate text-[12.5px] text-app-inkSoft sm:w-[130px]">{m.name}</div>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-app-panel2">
                <div className="h-full bg-primary" style={{ width: `${(m.count / maxCount) * 100}%` }} />
              </div>
              <div className="w-[50px] flex-shrink-0 text-right text-xs text-app-inkFaint">{m.count}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
