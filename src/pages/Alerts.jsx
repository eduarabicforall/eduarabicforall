import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/Icon'

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'reminder',
    icon: 'alarm-01',
    color: 'text-teal-400',
    title: 'Daily Practice Reminder',
    desc: 'Don\'t forget your daily Arabic practice!',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    type: 'achievement',
    icon: 'trophy-01',
    color: 'text-amber-400',
    title: '7-Day Streak!',
    desc: 'You\'ve practiced Arabic for 7 days in a row. Keep it up!',
    time: 'Yesterday',
    read: false,
  },
  {
    id: 3,
    type: 'update',
    icon: 'sparkles-01',
    color: 'text-violet-400',
    title: 'New Module Available',
    desc: 'Arabic Communication for Beginners is now live.',
    time: '2 days ago',
    read: true,
  },
  {
    id: 4,
    type: 'reminder',
    icon: 'alarm-01',
    color: 'text-teal-400',
    title: 'Weekly Goal Check',
    desc: 'You\'re 60% towards your weekly pronunciation goal.',
    time: '3 days ago',
    read: true,
  },
  {
    id: 5,
    type: 'ai',
    icon: 'ai-brain-01',
    color: 'text-rose-400',
    title: 'AI Ustaz Tip',
    desc: 'Try asking about إعراب (i\'rab) to improve your grammar.',
    time: '5 days ago',
    read: true,
  },
]

export default function Alerts() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const { user } = useAuth()

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const toggleRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: !n.read } : n)
    )
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-sora font-bold text-ink">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-xs text-ink-faint mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-primary hover:text-primary/80 transition-all font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="space-y-2">
        {notifications.map(n => (
          <button
            key={n.id}
            onClick={() => toggleRead(n.id)}
            className={`w-full flex items-start gap-3 p-4 rounded-xl transition-all text-left ${
              n.read
                ? 'bg-transparent hover:bg-panel'
                : 'bg-panel border border-ea-border hover:border-primary/20'
            }`}
          >
            {/* Unread dot */}
            <div className="flex-shrink-0 mt-1">
              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-primary mb-2" />
              )}
            </div>

            {/* Icon */}
            <div className={`w-9 h-9 rounded-xl bg-panel-2 flex items-center justify-center flex-shrink-0 ${n.color}`}>
              <Icon name={n.icon} size={18} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-ink mb-0.5">{n.title}</div>
              <div className="text-xs text-ink-faint leading-relaxed">{n.desc}</div>
              <div className="text-[10px] text-ink-faint/60 mt-1.5">{n.time}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Empty state */}
      {notifications.length === 0 && (
        <div className="text-center py-16 text-ink-faint flex flex-col items-center gap-3">
          <Icon name="notification-off-01" size={40} />
          <p className="text-sm">No notifications yet</p>
        </div>
      )}
    </div>
  )
}
