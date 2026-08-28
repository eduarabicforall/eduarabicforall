import React from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'

const FEATURES = [
  {
    icon: 'ai-brain-01',
    iconColor: 'text-teal-400',
    title: 'AI Chat',
    desc: 'Chat with an AI Arabic teacher for instant grammar and vocabulary help.',
    route: '/chat',
    color: 'bg-teal-500/10 border-teal-500/20',
  },
  {
    icon: 'headphones',
    iconColor: 'text-violet-400',
    title: 'Voice Dialogue',
    desc: 'Listen to and practise real Arabic conversations from your module.',
    route: '/dialogue',
    color: 'bg-violet-500/10 border-violet-500/20',
  },
  {
    icon: 'mic-01',
    iconColor: 'text-amber-400',
    title: 'Pronunciation',
    desc: 'Master Arabic pronunciation one word at a time with tap-to-reveal.',
    route: '/practice',
    color: 'bg-amber-500/10 border-amber-500/20',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="w-20 h-20 bg-primary/15 rounded-3xl flex items-center justify-center text-primary mb-6">
          <Icon name="book-open-01" size={36} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-sora font-bold text-ink leading-tight mb-4">
          Learn Arabic<br />
          <span className="text-primary">with confidence</span>
        </h1>
        <p className="text-sm text-ink-faint max-w-xs mb-8 leading-relaxed">
          Your digital companion for Arabic module books — AI tutoring, dialogues, and pronunciation practice.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            to="/auth"
            className="flex items-center justify-center gap-2 py-3.5 bg-primary text-bg rounded-2xl font-semibold text-sm text-center hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            Get started free <Icon name="arrow-right-01" size={18} />
          </Link>
          <Link
            to="/login"
            className="py-3.5 bg-panel border border-ea-border text-ink rounded-2xl font-medium text-sm text-center hover:bg-panel-2 active:scale-[0.98] transition-all"
          >
            I already have an account
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-5 pb-12">
        <div className="max-w-sm mx-auto space-y-3">
          {FEATURES.map((f, i) => (
            <Link
              key={i}
              to={f.route}
              className={`flex items-center gap-4 p-4 ${f.color} border rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all`}
            >
              <div className={`flex-shrink-0 ${f.iconColor}`}>
                <Icon name={f.icon} size={28} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">{f.title}</h3>
                <p className="text-xs text-ink-faint leading-relaxed">{f.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
