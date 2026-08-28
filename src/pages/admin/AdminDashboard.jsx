import React, { useState } from 'react'
import { MODULES } from '../../data/modules'
import { Link } from 'react-router-dom'
import Icon from '../../components/Icon'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard-circle-01' },
    { id: 'modules', label: 'Modules', icon: 'book-02' },
    { id: 'analytics', label: 'Analytics', icon: 'chart-line-data-01' },
    { id: 'payments', label: 'Payments', icon: 'credit-card-01' },
    { id: 'users', label: 'Users', icon: 'users-01' },
  ]

  return (
    <div className="min-h-screen bg-bg pb-8">
      <div className="max-w-lg mx-auto px-5 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-sora font-bold text-ink flex items-center gap-2">
              <Icon name="settings-02" size={22} className="text-primary" /> Admin Panel
            </h1>
            <p className="text-xs text-ink-faint">Manage modules & analytics</p>
          </div>
          <Link to="/dashboard" className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
            <Icon name="arrow-left-01" size={14} /> Back
          </Link>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2 -mx-5 px-5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-bg'
                  : 'bg-panel border border-ea-border text-ink-soft hover:text-ink'
              }`}
            >
              <Icon name={tab.icon} size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'modules' && <ModulesTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'payments' && <PaymentsTab />}
        {activeTab === 'users' && <UsersTab />}
      </div>
    </div>
  )
}

function OverviewTab() {
  const stats = [
    { label: 'Students', value: '128', icon: 'users-01', color: 'text-primary' },
    { label: 'Active', value: '84', icon: 'flash-01', color: 'text-primary' },
    { label: 'Modules', value: '3', icon: 'book-02', color: 'text-primary' },
    { label: 'Revenue', value: 'RM3.2k', icon: 'money-01', color: 'text-gold' },
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="p-4 bg-panel border border-ea-border rounded-2xl">
            <div className={`mb-2 ${s.color}`}><Icon name={s.icon} size={22} /></div>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-ink-faint mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-panel border border-ea-border rounded-2xl">
        <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-1.5">
          <Icon name="clock-01" size={16} className="text-ink-faint" /> Recent Activity
        </h3>
        <div className="space-y-2.5">
          {[
            { user: 'Ahmad', action: 'Completed Unit 3', time: '2m ago', icon: 'check-circle-01', color: 'text-primary' },
            { user: 'Fatimah', action: 'Started module', time: '15m ago', icon: 'book-open-01', color: 'text-violet-400' },
            { user: 'Omar', action: 'Scored 90% practice', time: '1h ago', icon: 'target-01', color: 'text-amber-400' },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-ea-border/50 last:border-0">
              <Icon name={a.icon} size={18} className={a.color} />
              <div className="flex-1 min-w-0">
                <span className="text-sm text-ink font-medium">{a.user}</span>
                <span className="text-sm text-ink-faint ml-1">{a.action}</span>
              </div>
              <span className="text-xs text-ink-faint flex-shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ModulesTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink flex items-center gap-1.5">
          <Icon name="book-02" size={16} className="text-ink-faint" /> All Modules
        </h3>
        <button className="flex items-center gap-1 px-3 py-1.5 bg-primary text-bg rounded-xl text-xs font-medium">
          <Icon name="add-01" size={14} /> Add
        </button>
      </div>

      {MODULES.map(mod => (
        <div key={mod.id} className="p-4 bg-panel border border-ea-border rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: mod.cover }}>
              <Icon name="book-02" size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-ink truncate">{mod.title}</h4>
              <p className="text-xs text-ink-faint">{mod.units.length} units · {mod.level}</p>
            </div>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-panel-2 border border-ea-border rounded-lg text-xs text-ink-soft">
              <Icon name="edit-01" size={12} /> Edit
            </button>
          </div>
          <div className="mt-3 space-y-1.5">
            {mod.units.map(unit => (
              <div key={unit.id} className="flex items-center justify-between px-3 py-2 bg-bg-2 rounded-xl">
                <span className="text-xs text-ink">{unit.title}</span>
                <span className="text-[10px] text-ink-faint flex items-center gap-1">
                  <Icon name="chat-message-01" size={10} /> {unit.dialogues.length}
                  <Icon name="mic-01" size={10} className="ml-1" /> {unit.pronunciation.length}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

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
    <div className="space-y-4">
      <div className="p-4 bg-panel border border-ea-border rounded-2xl">
        <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-1.5">
          <Icon name="chart-line-data-01" size={16} className="text-ink-faint" /> Weekly Learners
        </h3>
        <div className="flex items-end gap-2 h-36">
          {weekData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="text-[10px] text-ink-faint">{d.users}</div>
              <div
                className="w-full bg-primary/30 rounded-t-md transition-all"
                style={{ height: `${(d.users / maxUsers) * 100}%`, minHeight: '4px' }}
              />
              <div className="text-[10px] text-ink-faint">{d.day}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-panel border border-ea-border rounded-2xl">
        <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-1.5">
          <Icon name="pie-chart-01" size={16} className="text-ink-faint" /> Feature Usage
        </h3>
        <div className="space-y-2.5">
          {[
            { name: 'AI Chat', pct: 85, icon: 'ai-brain-01' },
            { name: 'Practice', pct: 78, icon: 'mic-01' },
            { name: 'Dialogue', pct: 62, icon: 'headphones' },
          ].map((f, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-ink flex items-center gap-1.5">
                  <Icon name={f.icon} size={12} className="text-ink-faint" /> {f.name}
                </span>
                <span className="text-ink-faint">{f.pct}%</span>
              </div>
              <div className="w-full h-1.5 bg-panel-2 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${f.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PaymentsTab() {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-panel border border-ea-border rounded-2xl">
        <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-1.5">
          <Icon name="credit-card-01" size={16} className="text-ink-faint" /> Payment Gateway
        </h3>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { id: 'fpx', label: 'FPX', icon: 'bank-01' },
            { id: 'duitnow', label: 'DuitNow QR', icon: 'qr-code-01' },
            { id: 'card', label: 'Card', icon: 'credit-card-01' },
          ].map(g => (
            <button key={g.id} className="flex flex-col items-center gap-1.5 p-3 bg-bg-2 rounded-xl text-center text-xs text-ink border border-ea-border hover:border-primary/30 transition-all">
              <Icon name={g.icon} size={20} className="text-ink-faint" /> {g.label}
            </button>
          ))}
        </div>
        <input placeholder="API Key" className="w-full px-3 py-2.5 bg-bg-2 border border-ea-border rounded-xl text-sm text-ink mb-2" />
        <input placeholder="Merchant ID" className="w-full px-3 py-2.5 bg-bg-2 border border-ea-border rounded-xl text-sm text-ink mb-3" />
        <button className="w-full py-2.5 bg-primary text-bg rounded-xl text-sm font-medium flex items-center justify-center gap-1.5">
          <Icon name="tick-02" size={16} /> Save
        </button>
      </div>

      <div className="p-4 bg-panel border border-ea-border rounded-2xl">
        <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-1.5">
          <Icon name="money-01" size={16} className="text-ink-faint" /> Module Pricing
        </h3>
        {MODULES.map(mod => (
          <div key={mod.id} className="flex items-center justify-between py-2.5 border-b border-ea-border/50 last:border-0">
            <div className="text-sm text-ink truncate flex-1 mr-3">{mod.title}</div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-ink-faint">RM</span>
              <input type="number" defaultValue={mod.id === 'comm1' ? 39 : mod.id === 'nahw1' ? 49 : 45}
                className="w-16 px-2 py-1 bg-panel border border-ea-border rounded-lg text-xs text-ink text-right" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function UsersTab() {
  const users = [
    { name: 'Ahmad', email: 'ahmad@test.com', role: 'admin' },
    { name: 'Fatimah', email: 'fatimah@gmail.com', role: 'user' },
    { name: 'Omar', email: 'omar@gmail.com', role: 'user' },
  ]

  return (
    <div className="p-4 bg-panel border border-ea-border rounded-2xl">
      <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-1.5">
        <Icon name="users-01" size={16} className="text-ink-faint" /> Users
      </h3>
      <div className="space-y-2">
        {users.map((u, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5 border-b border-ea-border/50 last:border-0">
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
              <Icon name="user" size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-ink">{u.name}</div>
              <div className="text-[10px] text-ink-faint truncate">{u.email}</div>
            </div>
            {u.role === 'admin' && (
              <span className="px-2 py-0.5 bg-gold/15 text-gold text-[10px] rounded-full font-medium flex items-center gap-1">
                <Icon name="shield-01" size={10} /> Admin
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
