import React from 'react'
import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: '💬',
    title: 'AI Ustaz',
    titleAr: 'الذي الذكاء الاصطناعي',
    desc: 'Chat with an AI Arabic teacher. Get instant corrections on grammar, vocabulary, and pronunciation tips.',
    color: 'from-teal-500/20 to-teal-500/5',
    borderColor: 'border-teal-500/20',
    textColor: 'text-teal-400',
    route: '/chat',
  },
  {
    icon: '🎙️',
    title: 'Voice Dialogue',
    titleAr: 'الحوار الصوتي',
    desc: 'Listen to real Arabic conversations from your module. Practise speaking with native dialogues from each unit.',
    color: 'from-violet-500/20 to-violet-500/5',
    borderColor: 'border-violet-500/20',
    textColor: 'text-violet-400',
    route: '/dialogue',
  },
  {
    icon: '📝',
    title: 'Pronunciation Practice',
    titleAr: 'تدريب النطق',
    desc: 'Master Arabic pronunciation one word at a time. Tap to reveal transliteration, track your progress.',
    color: 'from-amber-500/20 to-amber-500/5',
    borderColor: 'border-amber-500/20',
    textColor: 'text-amber-400',
    route: '/practice',
  },
]

const STEPS = [
  { num: '1', text: 'Buy your module book from our store' },
  { num: '2', text: 'Use this web app as your digital companion' },
  { num: '3', text: 'Chat with AI Ustaz for instant feedback' },
  { num: '4', text: 'Practise dialogues and pronunciation daily' },
]

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative px-4 pt-20 pb-24 overflow-hidden">
        <div className="ea-gradient-bg" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-sora font-bold text-ink leading-tight mb-6">
            Learn Arabic with your{' '}
            <span className="text-primary">digital companion</span>
          </h1>
          <p className="text-lg text-ink-soft max-w-2xl mx-auto mb-8 leading-relaxed">
            EduArabic supports your Arabic module books with AI-powered tutoring,
            interactive dialogues, and pronunciation practice — all in one place.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/auth"
              className="px-8 py-3.5 bg-primary text-bg rounded-full text-sm font-semibold hover:bg-primary/90 transition-all hover:scale-[1.02]"
            >
              Start free →
            </Link>
            <a
              href="#features"
              className="px-8 py-3.5 bg-panel border border-ea-border rounded-full text-sm font-medium text-ink-soft hover:text-ink hover:border-primary/30 transition-all"
            >
              See features
            </a>
          </div>
          <p className="text-xs text-ink-faint mt-6">Free to start · Works alongside your module books</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-sora font-bold text-ink mb-3">
              Three tools, one goal
            </h2>
            <p className="text-sm text-ink-faint max-w-lg mx-auto">
              Everything you need to supplement your Arabic module books — from grammar help to speaking practice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <Link
                key={i}
                to={f.route}
                className={`group p-6 bg-panel border ${f.borderColor} rounded-2xl hover:bg-gradient-to-b ${f.color} transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-ink mb-1">{f.title}</h3>
                <p className="text-xs text-ink-faint mb-3" dir="rtl">{f.titleAr}</p>
                <p className="text-sm text-ink-soft leading-relaxed">{f.desc}</p>
                <div className={`mt-4 text-sm font-medium ${f.textColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  Try it →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20 bg-bg-2">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-sora font-bold text-ink text-center mb-12">
            How it works
          </h2>
          <div className="space-y-6">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-start gap-4 p-5 bg-panel border border-ea-border rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                  {s.num}
                </div>
                <p className="text-sm text-ink leading-relaxed pt-2">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-sora font-bold text-ink mb-4">
            Ready to start?
          </h2>
          <p className="text-sm text-ink-faint mb-8">
            Sign up for free and start using your digital companion today.
          </p>
          <Link
            to="/auth"
            className="inline-block px-8 py-3.5 bg-primary text-bg rounded-full text-sm font-semibold hover:bg-primary/90 transition-all hover:scale-[1.02]"
          >
            Get started →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-ea-border">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm font-sora font-bold">
            Edu<span className="text-primary">Arabic</span>
          </div>
          <p className="text-xs text-ink-faint">© 2025 EduArabic for All. Supporting Arabic learners worldwide.</p>
        </div>
      </footer>
    </div>
  )
}
