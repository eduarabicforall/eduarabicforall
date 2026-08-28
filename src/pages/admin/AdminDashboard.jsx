import React from 'react'
import { useTranslation } from 'react-i18next'

const stats = [
  { label: 'Total Users', value: '1,247', icon: 'user-group', color: 'text-primary', bg: 'bg-[rgba(47,196,159,.14)]' },
  { label: 'Total Revenue', value: 'RM8,420', icon: 'flash', color: 'text-gold', bg: 'bg-[rgba(240,180,41,.14)]' },
  { label: 'New Registrations', value: '34', icon: 'user-add-01', color: 'text-violet', bg: 'bg-[rgba(185,167,240,.14)]' },
  { label: 'Upcoming Classes', value: '5', icon: 'calendar-01', color: 'text-primary', bg: 'bg-[rgba(47,196,159,.14)]' },
]

const recentOrders = [
  { user: 'Ahmad Faiz', module: 'Nahw Foundations', amount: 'RM49', status: 'Paid', date: 'Aug 28' },
  { user: 'Siti Nurhaliza', module: 'Complete Arabic Pathway', amount: 'RM199', status: 'Paid', date: 'Aug 27' },
  { user: 'Muhammad Ali', module: 'Muhadathah', amount: 'RM59', status: 'Pending', date: 'Aug 27' },
]

export default function AdminDashboard() {
  const { t } = useTranslation()
  return (
    <div className="p-6 md:p-8">
      <h1 className="font-sora font-extrabold text-2xl tracking-tight mb-6">{t('admin.dashboard')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl p-5 bg-panel border border-ea-border">
            <div className="flex items-center gap-3 mb-3">
              <span className={`w-10 h-10 rounded-[11px] ${s.bg} grid place-items-center ${s.color}`}>
                <i className={`hgi-stroke hgi-${s.icon}`} style={{ fontSize: '20px' }} />
              </span>
              <span className="text-sm text-ink-soft">{s.label}</span>
            </div>
            <div className="font-sora font-extrabold text-2xl">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-panel border border-ea-border overflow-hidden">
        <div className="px-5 py-4 border-b border-ea-border-soft font-sora font-bold text-base">Recent Orders</div>
        {recentOrders.map((o, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-ea-border-soft last:border-0">
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm">{o.user}</div>
              <div className="text-xs text-ink-faint">{o.module} · {o.date}</div>
            </div>
            <span className="font-sora font-bold text-sm">{o.amount}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${o.status === 'Paid' ? 'bg-[rgba(47,196,159,.14)] text-primary' : 'bg-[rgba(240,180,41,.12)] text-gold'}`}>{o.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
