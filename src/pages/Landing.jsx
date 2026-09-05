import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import Navbar from '../components/layout/Navbar'
import Icon from '../components/Icon'

const MODULES = [
  { name: 'Bahasa Arab Pemula', units: 4, price: 39.90 },
  { name: 'Arab Tujuan Kerjaya', units: 4, price: 59.90 },
  { name: 'Bahasa Arab Al Quran', units: 6, price: 97.90 },
  { name: 'Anakku Berbahasa Arab', units: 4, price: 27.90 },
]

const FEATURES = [
  { icon: 'book-02', title: 'Free Grammar module', desc: 'Video lessons + interactive quizzes, free for every account.' },
  { icon: 'headphones-01', title: 'Audio Library', desc: 'Listen and repeat native pronunciation, unit by unit.' },
  { icon: 'chatting-01', title: 'AI Ustaz per module', desc: 'A dedicated AI teacher persona for every module you own.' },
  { icon: 'flash-01', title: 'Instant activation', desc: 'Scan the QR, enter your code, start learning right away.' },
]

const STEPS = [
  { title: 'Get a module', desc: 'Order online or from a reseller — physical book & card set.' },
  { title: 'Scan the QR', desc: 'Each module ships with a unique QR code.' },
  { title: 'Enter your code', desc: 'Activate digital access in seconds.' },
  { title: 'Learn', desc: 'Audio Library + AI Ustaz unlock instantly.' },
]

const REVIEWS = [
  { name: 'Aisyah', text: 'The AI Ustaz feels like having a personal tutor available anytime.' },
  { name: 'Hafiz', text: 'My kids love the Anakku module — simple and fun.' },
  { name: 'Nurul', text: 'Grammar module alone is worth signing up for.' },
]

const FAQ = [
  { q: 'How does module activation work?', a: 'Every physical module includes a unique activation code. Enter it in the app to unlock the Audio Library and AI Ustaz for that module.' },
  { q: 'Is the Grammar module really free?', a: 'Yes — Grammar (6 topics, video + quizzes) is free for every registered account, no module purchase required.' },
  { q: 'Can I use the app without buying a module?', a: 'Yes, you can register and use the free Grammar module. Audio Library and AI Ustaz require an activated module.' },
  { q: 'How long does shipping take?', a: 'Physical modules ship within 3–5 business days.' },
  { q: 'What payment methods are supported?', a: 'We support Bayarcash and ToyyibPay at checkout.' },
  { q: 'Can I use one code on multiple accounts?', a: 'No, each activation code can only be used once.' },
  { q: 'Is there a mobile app?', a: 'EduArabic for All is a mobile-first web app — no separate app store install needed.' },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-light-inkFaint/10 py-4">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between text-left font-semibold text-light-ink">
        {q}
        <Icon name={open ? 'minus-sign' : 'add-01'} size={18} />
      </button>
      {open && <p className="text-light-inkSoft text-sm mt-2">{a}</p>}
    </div>
  )
}

export default function Landing() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    gsap.from('.gs-hero', { opacity: 0, y: 24, stagger: 0.1, duration: 0.6, ease: 'power2.out' })
  }, [])

  return (
    <div className="bg-light-bg text-light-ink">
      <Navbar />

      <section className="max-w-6xl mx-auto px-5 pt-16 pb-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="gs-hero inline-block bg-app-primary/10 text-app-primary text-xs font-semibold rounded-pill px-3 py-1.5 mb-4">
            Physical modules, digital learning
          </span>
          <h1 className="gs-hero font-title font-extrabold text-4xl sm:text-5xl leading-tight mb-4">
            Listen, Speak &amp; Repeat!
          </h1>
          <p className="gs-hero text-light-inkSoft text-lg mb-6">
            Learn Arabic with physical modules that unlock a digital Audio Library and your own AI Ustaz.
          </p>
          <div className="gs-hero flex gap-3 mb-8">
            <Link to="/auth?view=signup" className="bg-app-primary text-white rounded-pill px-6 py-3 font-semibold">Start Now!</Link>
            <a href="#modules" className="border border-light-inkFaint/20 rounded-pill px-6 py-3 font-semibold">Browse modules</a>
          </div>
          <div className="gs-hero flex flex-wrap gap-4 text-sm text-light-inkSoft">
            <span className="flex items-center gap-1"><Icon name="checkmark-badge-01" className="text-app-primary" /> Endorsed by Arabic Specialists</span>
            <span className="flex items-center gap-1"><Icon name="checkmark-badge-01" className="text-app-primary" /> AI Integrated</span>
            <span className="flex items-center gap-1"><Icon name="checkmark-badge-01" className="text-app-primary" /> Audio Support</span>
          </div>
        </div>
        <div className="gs-hero relative aspect-square bg-app-primary/5 rounded-card flex items-center justify-center">
          <Icon name="book-02" size={120} className="text-app-primary/40" />
          <div className="absolute bottom-4 left-4 bg-white shadow-lg rounded-card px-4 py-3 flex items-center gap-2">
            <Icon name="chatting-01" className="text-app-violet" />
            <span className="text-sm font-semibold">AI Ustaz Module</span>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-light-inkFaint/5 py-16">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="font-title font-extrabold text-3xl text-center mb-10">How it works</h2>
          <div className="grid sm:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-app-primary text-white flex items-center justify-center font-bold mb-3">{i + 1}</div>
                <h3 className="font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-light-inkSoft">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ai-ustaz" className="max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div className="bg-app-bg text-app-ink rounded-card p-5 max-w-sm mx-auto">
          <div className="flex items-center gap-2 mb-4 text-app-violet font-semibold text-sm">
            <Icon name="chatting-01" /> Ustaz Hakim · Al Quran module
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <div className="self-start bg-app-panel2 rounded-2xl px-4 py-2 max-w-[80%]">Assalamualaikum Ustaz, apa maksud "بِسْمِ اللَّهِ"?</div>
            <div className="self-end bg-app-primary/20 rounded-2xl px-4 py-2 max-w-[80%]">"Dengan nama Allah" — permulaan setiap perkara yang baik.</div>
          </div>
        </div>
        <div>
          <h2 className="font-title font-extrabold text-3xl mb-3">A different Ustaz for every module</h2>
          <p className="text-light-inkSoft">Each module has its own AI Ustaz persona, tuned to that module's content — ask anything, anytime.</p>
        </div>
      </section>

      <section id="modules" className="bg-light-inkFaint/5 py-16">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="font-title font-extrabold text-3xl text-center mb-10">Modules</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
            {MODULES.map((m) => (
              <div key={m.name} className="bg-white rounded-card p-5 shadow-sm">
                <div className="aspect-square bg-app-primary/10 rounded-xl mb-3 flex items-center justify-center">
                  <Icon name="book-02" size={40} className="text-app-primary" />
                </div>
                <h3 className="font-semibold mb-1">{m.name}</h3>
                <p className="text-xs text-light-inkSoft mb-3">{m.units} units</p>
                <p className="font-title font-bold mb-3">RM{m.price.toFixed(2)}</p>
                <div className="flex gap-2">
                  <Link to="/shop" className="flex-1 text-center text-sm font-semibold border border-light-inkFaint/20 rounded-pill py-2">Add to Cart</Link>
                  <Link to="/shop" className="flex-1 text-center text-sm font-semibold bg-app-primary text-white rounded-pill py-2">Buy Now</Link>
                </div>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-card p-5">
                <Icon name={f.icon} size={28} className="text-app-primary mb-3" />
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-light-inkSoft">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" className="max-w-6xl mx-auto px-5 py-16">
        <h2 className="font-title font-extrabold text-3xl text-center mb-10">Reviews</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {REVIEWS.map((r) => (
            <div key={r.name} className="bg-light-inkFaint/5 rounded-card p-5">
              <p className="text-sm text-light-ink mb-3">"{r.text}"</p>
              <p className="text-sm font-semibold text-light-inkSoft">— {r.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-light-inkFaint/5 py-16">
        <div className="max-w-3xl mx-auto px-5">
          <h2 className="font-title font-extrabold text-3xl text-center mb-8">FAQ</h2>
          {FAQ.map((f) => <FaqItem key={f.q} {...f} />)}
        </div>
      </section>

      <footer className="py-10 text-center text-sm text-light-inkSoft">
        <p className="font-title font-bold text-light-ink mb-2">EduArabic for All</p>
        <p>© {new Date().getFullYear()} EduArabic for All. All rights reserved.</p>
      </footer>
    </div>
  )
}
