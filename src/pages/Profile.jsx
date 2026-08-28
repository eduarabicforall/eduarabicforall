import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'

export default function Profile() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Learner'
  const userEmail = user?.email || ''
  const userRole = profile?.role || 'user'

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const settings = [
    { icon: 'user-02', label: 'Edit Profile', desc: 'Update your name and avatar' },
    { icon: 'bell-01', label: 'Notifications', desc: 'Manage alert preferences', route: '/alerts' },
    { icon: 'translate-01', label: 'Language', desc: 'Arabic' },
    { icon: 'moon-01', label: 'Appearance', desc: 'Dark mode' },
    { icon: 'lock-01', label: 'Privacy', desc: 'Password and security' },
    { icon: 'help-circle-01', label: 'Help & Support', desc: 'FAQ and contact us' },
  ]

  if (userRole === 'admin') {
    settings.push({ icon: 'settings-02', label: 'Admin Panel', desc: 'Manage modules and users', route: '/admin' })
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-8">
      {/* Profile Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary mb-4">
          {userName[0]?.toUpperCase()}
        </div>
        <h1 className="text-xl font-sora font-bold text-ink mb-1">{userName}</h1>
        <p className="text-sm text-ink-faint mb-1">{userEmail}</p>
        {userRole === 'admin' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary/15 text-primary text-xs font-medium rounded-full mt-2">
            <Icon name="shield-01" size={12} /> Admin
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Words', value: '124' },
          { label: 'Streak', value: '7d' },
          { label: 'XP', value: '1,240' },
        ].map(stat => (
          <div key={stat.label} className="bg-panel border border-ea-border rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-ink">{stat.value}</div>
            <div className="text-xs text-ink-faint">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Settings List */}
      <div className="space-y-1">
        {settings.map((item, i) => (
          <button
            key={i}
            onClick={() => item.route && navigate(item.route)}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-panel transition-all text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-panel-2 flex items-center justify-center text-ink-faint">
              <Icon name={item.icon} size={18} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-ink">{item.label}</div>
              <div className="text-xs text-ink-faint">{item.desc}</div>
            </div>
            <Icon name="arrow-right-01" size={16} className="text-ink-faint" />
          </button>
        ))}
      </div>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="w-full mt-8 flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
      >
        <Icon name="logout-01" size={18} />
        Sign out
      </button>
    </div>
  )
}
