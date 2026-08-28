import React, { useState } from 'react'
import { MODULES } from '../../data/modules'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'modules', label: 'Modules', icon: '📚' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'users', label: 'Users', icon: '👥' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-sora font-bold text-ink mb-1">⚙️ Admin Panel</h1>
        <p className="text-sm text-ink-faint">Manage modules, view analytics, and configure payments</p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-bg'
                : 'bg-panel border border-ea-border text-ink-soft hover:text-ink hover:bg-white/5'
            }`}
          >
            <span className="mr-1.5">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'modules' && <ModulesTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
      {activeTab === 'payments' && <PaymentsTab />}
      {activeTab === 'users' && <UsersTab />}
    </div>
  )
}

/* ─── Overview Tab ─── */
function OverviewTab() {
  const stats = [
    { label: 'Total Students', value: '128', change: '+12 this week', color: 'primary' },
    { label: 'Active Learners', value: '84', change: '66% of total', color: 'primary' },
    { label: 'Modules Published', value: MODULES.length.toString(), change: `${MODULES.reduce((a, m) => a + m.units.length, 0)} units total`, color: 'primary' },
    { label: 'Revenue (this month)', value: 'RM 3,240', change: '+18% vs last month', color: 'gold' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-panel border border-ea-border rounded-2xl p-4">
            <div className="text-xs text-ink-faint mb-1">{s.label}</div>
            <div className={`text-2xl font-bold text-${s.color}`}>{s.value}</div>
            <div className="text-xs text-ink-faint mt-1">{s.change}</div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="bg-panel border border-ea-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-ink mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { user: 'Ahmad', action: 'Completed Unit 3 in Nahw Foundations', time: '2 min ago' },
            { user: 'Fatimah', action: 'Started Arabic Communication module', time: '15 min ago' },
            { user: 'Omar', action: 'Scored 90% on pronunciation practice', time: '1 hr ago' },
            { user: 'Aisyah', action: 'Asked AI Ustaz about verb forms', time: '2 hr ago' },
            { user: 'Hakim', action: 'Enrolled in Muhadathah module', time: '3 hr ago' },
          ].map((a, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-ea-border/50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                  {a.user[0]}
                </div>
                <div>
                  <div className="text-sm text-ink"><span className="font-medium">{a.user}</span> {a.action}</div>
                </div>
              </div>
              <span className="text-xs text-ink-faint flex-shrink-0 ml-4">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Modules Tab ─── */
function ModulesTab() {
  const [editingModule, setEditingModule] = useState(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">All Modules</h3>
        <button className="px-4 py-2 bg-primary text-bg rounded-xl text-sm font-medium hover:bg-primary/90 transition-all">
          + Add Module
        </button>
      </div>

      {MODULES.map(mod => (
        <div key={mod.id} className="bg-panel border border-ea-border rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg"
                style={{ background: mod.cover }}
              >
                📚
              </div>
              <div>
                <h4 className="text-sm font-semibold text-ink">{mod.title}</h4>
                <p className="text-xs text-ink-faint">{mod.units.length} units · {mod.level}</p>
                <p className="text-xs text-ink-faint mt-0.5" dir="rtl">{mod.titleAr}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingModule(editingModule === mod.id ? null : mod.id)}
                className="px-3 py-1.5 bg-panel-2 border border-ea-border rounded-lg text-xs text-ink-soft hover:text-ink transition-all"
              >
                {editingModule === mod.id ? 'Close' : 'Edit'}
              </button>
            </div>
          </div>

          {/* Units list */}
          <div className="mt-4 space-y-2">
            {mod.units.map(unit => (
              <div key={unit.id} className="flex items-center justify-between px-4 py-2.5 bg-bg-2 rounded-xl">
                <div>
                  <span className="text-sm text-ink">{unit.title}</span>
                  <span className="text-xs text-ink-faint ml-2" dir="rtl">{unit.titleAr}</span>
                </div>
                <div className="flex gap-2 text-xs text-ink-faint">
                  <span>{unit.dialogues.length} dialogues</span>
                  <span>·</span>
                  <span>{unit.pronunciation.length} words</span>
                </div>
              </div>
            ))}
          </div>

          {/* Edit panel */}
          {editingModule === mod.id && (
            <div className="mt-4 p-4 bg-bg-2 rounded-xl border border-ea-border space-y-3">
              <h5 className="text-xs font-medium text-ink-faint uppercase">Edit Module</h5>
              <input
                type="text"
                defaultValue={mod.title}
                className="w-full px-3 py-2 bg-panel border border-ea-border rounded-xl text-sm text-ink"
                placeholder="Module title"
              />
              <input
                type="text"
                defaultValue={mod.titleAr}
                className="w-full px-3 py-2 bg-panel border border-ea-border rounded-xl text-sm text-ink"
                placeholder="Arabic title"
                dir="rtl"
              />
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-primary text-bg rounded-xl text-sm font-medium">
                  Save Changes
                </button>
                <button className="px-4 py-2 bg-panel border border-ea-border rounded-xl text-sm text-ink-soft hover:text-ink">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ─── Analytics Tab ─── */
function AnalyticsTab() {
  const weekData = [
    { day: 'Mon', users: 42 },
    { day: 'Tue', users: 58 },
    { day: 'Wed', users: 65 },
    { day: 'Thu', users: 71 },
    { day: 'Fri', users: 45 },
    { day: 'Sat', users: 82 },
    { day: 'Sun', users: 76 },
  ]
  const maxUsers = Math.max(...weekData.map(d => d.users))

  return (
    <div className="space-y-6">
      {/* Weekly activity chart */}
      <div className="bg-panel border border-ea-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-ink mb-4">Weekly Active Learners</h3>
        <div className="flex items-end gap-3 h-48">
          {weekData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="text-xs text-ink-faint">{d.users}</div>
              <div
                className="w-full bg-primary/30 rounded-t-lg transition-all"
                style={{ height: `${(d.users / maxUsers) * 100}%`, minHeight: '8px' }}
              />
              <div className="text-xs text-ink-faint">{d.day}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Module completion stats */}
      <div className="bg-panel border border-ea-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-ink mb-4">Module Completion Rate</h3>
        <div className="space-y-3">
          {MODULES.map(mod => {
            const pct = Math.floor(Math.random() * 40 + 40)
            return (
              <div key={mod.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-ink">{mod.title}</span>
                  <span className="text-ink-faint">{pct}%</span>
                </div>
                <div className="w-full h-2 bg-panel-2 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top features */}
      <div className="bg-panel border border-ea-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-ink mb-4">Most Used Features</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { feature: 'AI Chat', count: '342 conversations', pct: 85 },
            { feature: 'Dialogue', count: '186 sessions', pct: 62 },
            { feature: 'Practice', count: '274 sessions', pct: 78 },
          ].map((f, i) => (
            <div key={i} className="text-center p-4 bg-bg-2 rounded-xl">
              <div className="text-2xl font-bold text-primary">{f.pct}%</div>
              <div className="text-sm text-ink mt-1">{f.feature}</div>
              <div className="text-xs text-ink-faint mt-0.5">{f.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Payments Tab ─── */
function PaymentsTab() {
  const [gateway, setGateway] = useState('fpx')

  return (
    <div className="space-y-6">
      {/* Payment gateway config */}
      <div className="bg-panel border border-ea-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-ink mb-4">Payment Gateway</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { id: 'fpx', label: 'FPX', desc: 'Online banking' },
            { id: 'duitnow', label: 'DuitNow QR', desc: 'QR payment' },
            { id: 'card', label: 'Credit Card', desc: 'Visa / Mastercard' },
          ].map(g => (
            <button
              key={g.id}
              onClick={() => setGateway(g.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                gateway === g.id
                  ? 'border-primary bg-primary/10'
                  : 'border-ea-border bg-bg-2 hover:border-primary/30'
              }`}
            >
              <div className="text-sm font-medium text-ink">{g.label}</div>
              <div className="text-xs text-ink-faint">{g.desc}</div>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-ink-faint mb-1 block">API Key</label>
            <input
              type="password"
              placeholder="Enter payment gateway API key"
              className="w-full px-3 py-2 bg-bg-2 border border-ea-border rounded-xl text-sm text-ink"
            />
          </div>
          <div>
            <label className="text-xs text-ink-faint mb-1 block">Merchant ID</label>
            <input
              type="text"
              placeholder="Enter merchant ID"
              className="w-full px-3 py-2 bg-bg-2 border border-ea-border rounded-xl text-sm text-ink"
            />
          </div>
          <button className="px-4 py-2 bg-primary text-bg rounded-xl text-sm font-medium hover:bg-primary/90 transition-all">
            Save Configuration
          </button>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-panel border border-ea-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-ink mb-4">Module Pricing</h3>
        <div className="space-y-3">
          {MODULES.map(mod => (
            <div key={mod.id} className="flex items-center justify-between px-4 py-3 bg-bg-2 rounded-xl">
              <div>
                <div className="text-sm text-ink">{mod.title}</div>
                <div className="text-xs text-ink-faint">{mod.level} · {mod.units.length} units</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-ink-faint">RM</span>
                  <input
                    type="number"
                    defaultValue={mod.id === 'bundle' ? 199 : (mod.id === 'comm1' ? 39 : mod.id === 'nahw1' ? 49 : mod.id === 'sarf1' ? 45 : 59)}
                    className="w-20 px-2 py-1 bg-panel border border-ea-border rounded-lg text-sm text-ink text-right"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-panel border border-ea-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-ink mb-4">Recent Transactions</h3>
        <div className="space-y-2">
          {[
            { user: 'Ahmad', module: 'Nahw Foundations', amount: 'RM 49', method: 'FPX', status: 'paid', time: '2 hr ago' },
            { user: 'Fatimah', module: 'Arabic Communication', amount: 'RM 39', method: 'Card', status: 'paid', time: '5 hr ago' },
            { user: 'Omar', module: 'Complete Pathway', amount: 'RM 199', method: 'DuitNow', status: 'pending', time: '1 day ago' },
          ].map((t, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 bg-bg-2 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                  {t.user[0]}
                </div>
                <div>
                  <div className="text-sm text-ink">{t.user}</div>
                  <div className="text-xs text-ink-faint">{t.module}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-ink">{t.amount}</div>
                <div className="text-xs text-ink-faint">{t.method} · {t.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Users Tab ─── */
function UsersTab() {
  return (
    <div className="bg-panel border border-ea-border rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-ink mb-4">Registered Users</h3>
      <div className="space-y-2">
        {[
          { name: 'Ahmad', email: 'ahmad@eduarabic.com', role: 'admin', plan: 'Pro', joined: 'Aug 1' },
          { name: 'Fatimah', email: 'fatimah@gmail.com', role: 'user', plan: 'Free', joined: 'Aug 5' },
          { name: 'Omar', email: 'omar@gmail.com', role: 'user', plan: 'Plus', joined: 'Aug 10' },
          { name: 'Aisyah', email: 'aisyah@gmail.com', role: 'user', plan: 'Free', joined: 'Aug 12' },
          { name: 'Hakim', email: 'hakim@gmail.com', role: 'user', plan: 'Pro', joined: 'Aug 15' },
        ].map((u, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 bg-bg-2 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                {u.name[0]}
              </div>
              <div>
                <div className="text-sm text-ink">{u.name}</div>
                <div className="text-xs text-ink-faint">{u.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {u.role === 'admin' && (
                <span className="px-2 py-0.5 bg-gold/15 text-gold text-xs rounded-full font-medium">Admin</span>
              )}
              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                u.plan === 'Pro' ? 'bg-primary/15 text-primary'
                : u.plan === 'Plus' ? 'bg-violet/15 text-violet'
                : 'bg-panel-2 text-ink-faint'
              }`}>
                {u.plan}
              </span>
              <span className="text-xs text-ink-faint">{u.joined}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
