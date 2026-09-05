import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, aiMessages30d: 0, salesTotal: 0 })
  const [moduleActivations, setModuleActivations] = useState([])

  useEffect(() => {
    async function load() {
      const [{ count: totalUsers }, { data: modules }, { data: userModules }, { data: usage }, { data: orders }] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('modules').select('id, name'),
        supabase.from('user_modules').select('module_id'),
        supabase.from('ai_usage_log').select('message_count').gte('date', new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)),
        supabase.from('orders').select('total').eq('payment_status', 'paid'),
      ])

      const counts = {}
      for (const um of userModules ?? []) counts[um.module_id] = (counts[um.module_id] ?? 0) + 1
      setModuleActivations((modules ?? []).map((m) => ({ name: m.name, count: counts[m.id] ?? 0 })))

      setStats({
        totalUsers: totalUsers ?? 0,
        aiMessages30d: (usage ?? []).reduce((s, u) => s + u.message_count, 0),
        salesTotal: (orders ?? []).reduce((s, o) => s + Number(o.total), 0),
      })
    }
    load()
  }, [])

  const maxCount = Math.max(1, ...moduleActivations.map((m) => m.count))
  const mostActive = moduleActivations.reduce((a, b) => (b.count > (a?.count ?? -1) ? b : a), null)

  return (
    <div>
      <h1 className="font-title font-extrabold text-2xl mb-6">Dashboard</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card><p className="text-xs text-app-inkFaint mb-1">Total users</p><p className="font-title font-bold text-2xl">{stats.totalUsers}</p></Card>
        <Card><p className="text-xs text-app-inkFaint mb-1">Most active module</p><p className="font-title font-bold text-lg">{mostActive?.name ?? '—'}</p></Card>
        <Card><p className="text-xs text-app-inkFaint mb-1">AI Ustaz messages (30d)</p><p className="font-title font-bold text-2xl">{stats.aiMessages30d}</p></Card>
        <Card><p className="text-xs text-app-inkFaint mb-1">Sales in-app</p><p className="font-title font-bold text-2xl">RM{stats.salesTotal.toFixed(2)}</p></Card>
      </div>

      <Card>
        <p className="font-semibold mb-4">Module activations</p>
        <div className="flex items-end gap-4 h-40">
          {moduleActivations.map((m) => (
            <div key={m.name} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-app-primary rounded-t-lg" style={{ height: `${(m.count / maxCount) * 100}%`, minHeight: 4 }} />
              <p className="text-xs text-app-inkFaint text-center">{m.name}</p>
              <p className="text-xs font-semibold">{m.count}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
