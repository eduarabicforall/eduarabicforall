import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import FaqItem from '../components/FaqItem.jsx'
import PlaceholderBlock from '../components/PlaceholderBlock.jsx'
import Icon from '../components/Icon.jsx'
import { APP_FEATURES, AWARDS, FAQS, HOW_IT_WORKS, REVIEWS } from '../data/landing.js'
import { supabase } from '../lib/supabase.js'

const AWARD_META = {
  gold: { icon: 'medal-01', label: 'Gold Medal', color: '#C99A2E' },
  silver: { icon: 'medal-01', label: 'Silver Medal', color: '#9AA1AC' },
  bronze: { icon: 'medal-01', label: 'Bronze Medal', color: '#B4703A' },
  judging: { icon: 'clock-01', label: 'Under Judging', color: '#5B6472' },
}

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(0)
  const [products, setProducts] = useState([])
  const rootRef = useRef(null)
  const awardsScrollRef = useRef(null)
  const navigate = useNavigate()

  // Continuously drift the awards row sideways on mobile, where it's an
  // overflowing slider — a slow, steady crawl rather than a jump every few
  // seconds. On wider screens the row already fits without scrolling, so
  // this is a harmless no-op there (scrollWidth <= clientWidth). Pauses
  // while the visitor is actually touching/dragging it themselves.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = awardsScrollRef.current
    if (!el) return
    let rafId
    let paused = false
    const pxPerFrame = 0.35

    function step() {
      if (!paused) {
        const maxScroll = el.scrollWidth - el.clientWidth
        if (maxScroll > 0) {
          el.scrollLeft = el.scrollLeft >= maxScroll - 1 ? 0 : el.scrollLeft + pxPerFrame
        }
      }
      rafId = requestAnimationFrame(step)
    }
    rafId = requestAnimationFrame(step)

    const pause = () => {
      paused = true
    }
    const resume = () => {
      setTimeout(() => {
        paused = false
      }, 2000)
    }
    el.addEventListener('pointerdown', pause)
    el.addEventListener('pointerup', resume)
    el.addEventListener('pointerleave', resume)

    return () => {
      cancelAnimationFrame(rafId)
      el.removeEventListener('pointerdown', pause)
      el.removeEventListener('pointerup', resume)
      el.removeEventListener('pointerleave', resume)
    }
  }, [])

  useEffect(() => {
    supabase
      .from('products')
      .select('id, name, description, price, image_url')
      .eq('is_active', true)
      .order('created_at')
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load products', error)
          return
        }
        setProducts(data)
      })
  }, [])

  useEffect(() => {
    const onAnchorClick = (e) => {
      const a = e.target.closest('a[href^="#"]')
      if (!a) return
      const id = a.getAttribute('href').slice(1)
      const target = id && document.getElementById(id)
      if (!target) return
      e.preventDefault()
      gsap.to(window, { duration: 0.9, ease: 'power2.inOut', scrollTo: { y: target, offsetY: 70 } })
    }
    document.addEventListener('click', onAnchorClick)

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set('.gs-hero-item', { opacity: 0, y: 24 })
      gsap.to('.gs-hero-item', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.12, delay: 0.1 })

      gsap.utils.toArray('.gs-stagger').forEach((el) => {
        gsap.from(el.children, {
          opacity: 0,
          y: 28,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 85%' },
        })
      })
      gsap.utils.toArray('.gs-reveal').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 28,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        })
      })

      gsap.to('.gs-float', { y: -6, duration: 1.4, ease: 'sine.inOut', repeat: -1, yoyo: true })
      gsap.to('.gs-shine', { left: '140%', duration: 1.8, ease: 'power1.inOut', repeat: -1, repeatDelay: 1.4 })
    })

    return () => {
      document.removeEventListener('click', onAnchorClick)
      mm.revert()
    }
  }, [])

  return (
    <div
      ref={rootRef}
      className="min-h-screen bg-light-bg text-light-ink"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 900px 500px at 50% -10%, rgba(61,125,216,.14), transparent 60%)',
      }}
    >
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-[1160px] px-[6vw] pb-[60px] pt-10 md:pt-[90px]">
        <div className="text-center">
          <div className="gs-hero-item mb-[22px] inline-flex items-center gap-2 rounded-pill border border-light-ink/10 bg-light-ink/[.045] px-3.5 py-[7px] text-[13px] font-semibold text-light-inkSoft">
            <Icon name="qr-code" size={15} className="animate-pulse text-primary" /> Physical modules, digital learning
          </div>
          <h1 className="gs-hero-item mb-5 font-sora text-[52px] font-extrabold leading-[1.06] tracking-tight">
            Listen, Speak &amp;{' '}
            <span className="bg-gradient-to-r from-primary to-violet bg-clip-text text-transparent">Repeat!</span>
          </h1>
          <p className="gs-hero-item mx-auto mb-8 max-w-[480px] text-[17px] leading-relaxed text-light-inkSoft">
            A new-age way to learn Arabic. With interactive modules powered by AI.
          </p>
          <div className="gs-hero-item flex flex-col items-center gap-3.5 sm:flex-row sm:flex-wrap sm:justify-center">
            <Link
              to="/auth?view=signup"
              className="gs-float relative inline-block w-full max-w-[340px] overflow-hidden rounded-[13px] bg-primary px-[26px] py-[15px] text-center text-[15px] font-bold text-[#0B2A4A] shadow-[0_8px_24px_rgba(61,125,216,.35)] sm:w-auto sm:max-w-none"
            >
              <span
                className="gs-shine absolute top-0 h-full w-2/5"
                style={{
                  left: '-60%',
                  background: 'linear-gradient(115deg, transparent, rgba(255,255,255,.55), transparent)',
                }}
              />
              <span className="relative">Start Now!</span>
            </Link>
            <a
              href="#modules"
              className="inline-flex w-full max-w-[340px] items-center justify-center gap-2 rounded-[13px] border border-light-ink/10 bg-light-ink/[.045] px-[26px] py-[15px] text-[15px] font-semibold text-light-ink sm:w-auto sm:max-w-none"
            >
              <Icon name="shopping-bag-02" size={16} /> Browse modules
            </a>
          </div>
        </div>
      </section>

      {/* Innovation awards */}
      <section className="mx-auto max-w-[1160px] px-[6vw] pb-10 sm:pb-16">
        <p className="mb-7 text-center text-[12.5px] font-bold tracking-wide text-light-inkFaint">
          RECOGNISED AT INTERNATIONAL INNOVATION COMPETITIONS
        </p>
        <div
          ref={awardsScrollRef}
          className="gs-stagger scrollbar-none -mx-[6vw] flex gap-4 overflow-x-auto px-[6vw] pt-4 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 sm:pt-0"
        >
          {AWARDS.map((award) => {
            const meta = AWARD_META[award.status]
            return (
              <div
                key={award.name}
                className="relative w-[62vw] flex-shrink-0 rounded-2xl border border-light-ink/[.08] bg-light-ink/[.03] px-4 pb-4 pt-6 sm:w-[220px]"
              >
                <div className="flex h-[52px] items-center justify-center">
                  <img src={award.img} alt={award.name} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="mt-3 text-center text-[11px] font-bold" style={{ color: meta.color }}>
                  {meta.label}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-[1160px] px-[6vw] py-[70px]">
        <h2 className="mb-2.5 text-center font-sora text-[32px] font-extrabold">
          Four steps to{' '}
          <span className="bg-gradient-to-r from-primary to-violet bg-clip-text text-transparent">fluent!</span>
        </h2>
        <p className="mb-12 text-center text-[15px] text-light-inkSoft">
          No app-only courses. Your module is a real book — the app is what makes it come alive.
        </p>
        <div className="gs-stagger grid grid-cols-2 gap-5 md:grid-cols-4">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.title} className="rounded-[18px] border border-light-ink/[.07] bg-light-ink/[.03] p-[26px_22px]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[11px] bg-primary/[.15]">
                <Icon name={step.icon} size={19} className="text-primary" />
              </div>
              <div className="mb-1.5 font-sora text-[15px] font-bold">{step.title}</div>
              <div className="text-[13px] leading-[1.55] text-light-inkSoft">{step.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Ustaz */}
      <section id="ai" className="mx-auto grid max-w-[1160px] items-center gap-14 px-[6vw] pb-[70px] md:grid-cols-[.9fr_1.1fr]">
        <div
          className="gs-reveal rounded-[24px] border border-violet/20 p-7"
          style={{ background: 'linear-gradient(180deg, rgba(185,167,240,.08), transparent)' }}
        >
          <div className="mb-[18px] flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-violet/[.18]">
              <Icon name="sparkles" size={16} className="text-violet" />
            </div>
            <div className="text-sm font-bold">Ustaz Hakim · Al Quran module</div>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="max-w-[80%] self-end rounded-[14px_14px_4px_14px] bg-primary/[.16] px-3.5 py-2.5 text-[13px]">
              why is وَ sometimes an oath particle?
            </div>
            <div className="max-w-[85%] self-start rounded-[14px_14px_14px_4px] bg-light-ink/[.045] px-3.5 py-2.5 text-[13px] text-light-ink">
              Great catch — in Surah al-Fajr, وَ before اللَّيْل is a particle of oath (qasam), not a conjunction.
              Let's look at unit 6...
            </div>
          </div>
        </div>
        <div className="gs-reveal">
          <div className="mb-[18px] inline-flex items-center gap-2 rounded-pill border border-violet/25 bg-violet/[.12] px-3.5 py-1.5 text-xs font-bold text-violet">
            AI USTAZ
          </div>
          <h2 className="mb-3.5 font-sora text-[30px] font-extrabold leading-[1.15]">
            A different Ustaz for every module
          </h2>
          <p className="text-[15px] leading-[1.65] text-light-inkSoft">
            Ask anything about a topic in your language, then Ai Ustaz will teach you how to use the words and
            sentences in real situations.
          </p>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="mx-auto max-w-[1160px] px-[6vw] pb-[70px]">
        <h2 className="mb-2.5 text-center font-sora text-[32px] font-extrabold">Our physical modules</h2>
        <p className="mb-11 text-center text-[15px] text-light-inkSoft">
          Each one ships with its own audio library and AI Ustaz.
        </p>
        <div className="gs-stagger scrollbar-none -mx-[6vw] flex snap-x snap-mandatory gap-[18px] overflow-x-auto px-[6vw] pb-2 md:mx-0 md:px-0">
          {products.map((mod) => (
            <div
              key={mod.id}
              className="w-[68vw] flex-shrink-0 snap-start overflow-hidden rounded-[18px] border border-light-ink/[.07] bg-light-ink/[.03] sm:w-[260px] md:w-[calc(50%-9px)]"
            >
              {mod.image_url ? (
                <img src={mod.image_url} alt="" className="aspect-square w-full object-cover" />
              ) : (
                <PlaceholderBlock label="module cover" className="aspect-square" />
              )}
              <div className="p-4">
                <div className="mb-1 text-sm font-bold">{mod.name}</div>
                <div className="mb-2.5 truncate text-xs text-light-inkFaint">{mod.description}</div>
                <div className="font-sora text-base font-extrabold text-primary">RM{mod.price}</div>
                <div className="mt-3.5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/product/${mod.id}`)}
                    className="flex-1 rounded-[10px] border border-light-ink/10 bg-light-ink/[.045] px-2.5 py-2.5 text-[12.5px] font-bold text-light-ink"
                  >
                    View details
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/checkout?product=${mod.id}`)}
                    className="flex-1 rounded-[10px] bg-primary px-2.5 py-2.5 text-[12.5px] font-bold text-[#0B2A4A]"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <h3 className="mb-6 text-center font-sora text-xl font-extrabold">App features</h3>
          <div className="gs-stagger grid grid-cols-2 gap-4 md:grid-cols-4">
            {APP_FEATURES.map((feat) => (
              <div key={feat.title} className="rounded-2xl border border-light-ink/[.07] bg-light-ink/[.03] p-5">
                <Icon name={feat.icon} size={22} className={`animate-medal-glow ${feat.color}`} />
                <div className="mb-1 mt-3 text-[13.5px] font-bold">{feat.title}</div>
                <div className="text-[12.5px] leading-relaxed text-light-inkSoft">{feat.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="mx-auto max-w-[1160px] px-[6vw] pb-20">
        <h2 className="mb-10 text-center font-sora text-[32px] font-extrabold">Students say</h2>
        <div className="gs-stagger scrollbar-none -mx-[6vw] flex snap-x snap-mandatory gap-[18px] overflow-x-auto px-[6vw] pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
          {REVIEWS.map((review) => (
            <div
              key={review.author}
              className="w-[80vw] flex-shrink-0 snap-start rounded-[18px] border border-light-ink/[.07] bg-light-ink/[.03] p-6 sm:w-[320px] md:w-auto md:flex-shrink"
            >
              <p className="mb-3.5 text-sm leading-relaxed text-light-ink">"{review.quote}"</p>
              <div className="text-xs font-semibold text-light-inkFaint">{review.author}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-[800px] px-[6vw] pb-20">
        <h2 className="mb-10 text-center font-sora text-[32px] font-extrabold">Frequently asked questions</h2>
        <div className="gs-stagger flex flex-col gap-2.5">
          {FAQS.map((faq, i) => (
            <FaqItem
              key={faq.q}
              q={faq.q}
              a={faq.a}
              open={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
