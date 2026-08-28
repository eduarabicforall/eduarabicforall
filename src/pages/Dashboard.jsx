import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import Icon from '../components/Icon'

const LESSONS = [
  {
    id: 'chat',
    title: 'AI Chat',
    icon: 'ai-brain-01',
    color: 'from-teal-500/20 to-teal-500/5',
    border: 'border-teal-500/20',
    iconColor: 'text-teal-400',
    progress: 65,
    route: '/chat',
  },
  {
    id: 'dialogue',
    title: 'Dialogue',
    icon: 'headphones',
    color: 'from-violet-500/20 to-violet-500/5',
    border: 'border-violet-500/20',
    iconColor: 'text-violet-400',
    progress: 42,
    route: '/dialogue',
  },
  {
    id: 'practice',
    title: 'Pronunciation',
    icon: 'mic-01',
    color: 'from-amber-500/20 to-amber-500/5',
    border: 'border-amber-500/20',
    iconColor: 'text-amber-400',
    progress: 28,
    route: '/practice',
  },
  {
    id: 'grammar',
    title: 'Grammar',
    icon: 'book-02',
    color: 'from-rose-500/20 to-rose-500/5',
    border: 'border-rose-500/20',
    iconColor: 'text-rose-400',
    progress: 53,
    route: '/chat',
  },
]

const TABS = [
  { id: 'learn', label: 'Learn', icon: 'book-open-01', route: '/dashboard' },
  { id: 'practice', label: 'Practice', icon: 'target-01', route: '/practice' },
  { id: 'notifications', label: 'Alerts', icon: 'notification-01', route: '/dashboard' },
  { id: 'profile', label: 'Profile', icon: 'user', route: '/dashboard' },
]

export default function Dashboard() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [lang, setLang] = useState('Arabic')
  const [langOpen, setLangOpen] = useState(false)

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Learner'
  const langs = ['Arabic', 'English', 'Malay']

  return (
    <div className="min-h-screen bg-bg pb-24">
      <div className="max-w-lg mx-auto px-5 pt-6">
        {/* Header: Language selector + Avatar */}
        <div className="flex items-center justify-between mb-8">
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-panel border border-ea-border rounded-xl text-sm text-ink hover:bg-panel-2 transition-all"
            >
              <Icon name="translate-01" size={16} className="text-ink-faint" />
              {lang}
              <Icon name="arrow-down-01" size={14} className={`text-ink-faint transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </button>
            {langOpen && (
              <div className="absolute top-full mt-2 left-0 bg-bg-2 border border-ea-border rounded-xl overflow-hidden shadow-xl z-10 min-w-[120px]">
                {langs.map(l => (
                  <button
                    key={l}
                    onClick={() => { setLang(l); setLangOpen(false) }}
                    className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-panel transition-all ${
                      l === lang ? 'text-primary' : 'text-ink-soft'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
            {userName[0]?.toUpperCase()}
          </div>
        </div>

        {/* Greeting */}
        <div className="mb-8">
          <p className="text-sm text-ink-faint mb-1">Hello {userName.split(' ')[0]},</p>
          <h1 className="text-2xl font-sora font-bold text-ink">
            Continue your <span className="text-primary">{lang}</span> journey!
          </h1>
        </div>

        {/* Your Lessons */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-ink">Your Lessons</h2>
            <div className="flex gap-1.5">
              <button className="w-7 h-7 rounded-lg bg-panel flex items-center justify-center text-ink-faint">
                <Icon name="grid-01" size={14} />
              </button>
              <button className="w-7 h-7 rounded-lg bg-panel flex items-center justify-center text-ink-faint">
                <Icon name="list-03" size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {LESSONS.map(lesson => (
              <Link
                key={lesson.id}
                to={lesson.route}
                className={`p-4 bg-gradient-to-br ${lesson.color} border ${lesson.border} rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all`}
              >
                <div className={`${lesson.iconColor} mb-3`}>
                  <Icon name={lesson.icon} size={28} />
                </div>
                <h3 className="text-sm font-semibold text-ink mb-0.5">{lesson.title}</h3>
                <p className="text-xs text-ink-faint mb-3">You completed {lesson.progress}%</p>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-700"
                    style={{ width: `${lesson.progress}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-2/90 backdrop-blur-xl border-t border-ea-border z-50">
        <div className="max-w-lg mx-auto flex">
          {TABS.map(tab => {
            const isActive = location.pathname === tab.route && tab.id === 'learn'
            return (
              <Link
                key={tab.id}
                to={tab.route}
                className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-all ${
                  isActive ? 'text-primary' : 'text-ink-faint hover:text-ink-soft'
                }`}
              >
                <Icon name={tab.icon} size={22} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
