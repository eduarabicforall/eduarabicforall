import { useEffect, useRef, useState } from 'react'
import { TransitionLink, useTransitionNavigate } from '../components/TransitionNavLink.jsx'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import FaqItem from '../components/FaqItem.jsx'
import PlaceholderBlock from '../components/PlaceholderBlock.jsx'
import Icon from '../components/Icon.jsx'
import { AWARDS, FAQS, HOW_IT_WORKS, REVIEWS } from '../data/landing.js'
import { supabase } from '../lib/supabase.js'

const AWARD_META = {
  gold: { icon: 'medal-01', label: 'Gold Medal', color: '#C99A2E' },
  silver: { icon: 'medal-01', label: 'Silver Medal', color: '#9AA1AC' },
  bronze: { icon: 'medal-01', label: 'Bronze Medal', color: '#B4703A' },
  judging: { icon: 'clock-01', label: 'Under Judging', color: '#5B6472' },
}

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

// A module counts as new for its first 30 days on the shelf (same rule as the Shop).
const NEW_RELEASE_DAYS = 30

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(0)
  const [products, setProducts] = useState([])
  const rootRef = useRef(null)
  const modulesScrollRef = useRef(null)
  const [modulesScroll, setModulesScroll] = useState({ prev: false, next: false })
  const navigate = useTransitionNavigate()

  // Track whether the modules row overflows and which way it can still scroll,
  // so the arrows / edge fades only show when there really are more products
  // to slide to.
  useEffect(() => {
    const el = modulesScrollRef.current
    if (!el) return
    function update() {
      const max = el.scrollWidth - el.clientWidth
      setModulesScroll({ prev: el.scrollLeft > 4, next: max > 4 && el.scrollLeft < max - 4 })
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [products])

  function slideModules(direction) {
    const el = modulesScrollRef.current
    const card = el?.firstElementChild
    if (!el || !card) return
    el.scrollBy({ left: direction * (card.getBoundingClientRect().width + 18), behavior: 'smooth' })
  }

  useEffect(() => {
    supabase
      .from('products')
      .select('id, name, description, price, image_url, created_at')
      .eq('is_active', true)
      .eq('on_sale', true) // "Sell in app" toggle — switched off means hidden from the landing page
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

    })

    return () => {
      document.removeEventListener('click', onAnchorClick)
      mm.revert()
    }
  }, [])

  return (
    <div
      ref={rootRef}
      className="min-h-screen bg-[#F1F6FD] text-light-ink"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 900px 500px at 50% -10%, rgba(61,125,216,.14), transparent 60%)',
      }}
    >
      <Navbar />

      {/* Hero — deep-purple band with a lime accent; layout stays centred */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            'radial-gradient(70% 60% at 50% 105%, rgba(61,125,216,.45) 0%, transparent 70%), radial-gradient(45% 50% at 12% 18%, rgba(61,125,216,.28) 0%, transparent 70%), linear-gradient(160deg, #070A14 0%, #0C1D3D 55%, #12305E 100%)',
        }}
      >
        {/* decorative dots — purely visual */}
        <div aria-hidden="true" className="pointer-events-none absolute left-[6vw] top-24 hidden grid-cols-4 gap-3 opacity-40 md:grid">
          {Array.from({ length: 16 }).map((_, i) => (
            <span key={i} className="h-1 w-1 rounded-full bg-white" />
          ))}
        </div>
        <span aria-hidden="true" className="pointer-events-none absolute right-[12vw] top-20 hidden h-3.5 w-3.5 rounded-full bg-goldBright md:block" />
        <span aria-hidden="true" className="pointer-events-none absolute right-[22vw] top-44 hidden h-2 w-2 rounded-full bg-primary md:block" />

        <div className="relative mx-auto max-w-[1160px] px-[6vw] pb-[72px] pt-14 md:pb-[104px] md:pt-[100px]">
          <div className="text-center">
            <div className="gs-hero-item mb-6 inline-flex max-w-full items-center gap-2.5 rounded-pill border border-white/15 bg-white/[.08] px-4 py-2 text-[11px] font-bold uppercase leading-snug tracking-[.1em] text-white/90 sm:text-[12px] sm:tracking-[.14em]">
              <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-goldBright" /> Physical modules, digital learning
            </div>
            <h1 className="gs-hero-item mb-5 font-poppins text-[40px] font-extrabold leading-[1.06] tracking-tight text-white sm:text-[52px] md:text-[62px]">
              Listen, Speak &amp; <span className="bg-gradient-to-r from-[#FFE27A] via-[#FFC93C] to-[#FFA928] bg-clip-text text-transparent [filter:drop-shadow(0_0_18px_rgba(255,201,60,.35))]">
                Repeat!
              </span>
            </h1>
            <p className="gs-hero-item mx-auto mb-9 max-w-[520px] text-[17px] leading-relaxed text-white/80">
              A new-age way to learn Arabic. With interactive modules powered by AI.
            </p>
            <div className="gs-hero-item flex flex-col items-center gap-3.5 sm:flex-row sm:flex-wrap sm:justify-center">
              <TransitionLink
                to="/auth?view=signup"
                className="relative inline-block w-full max-w-[272px] overflow-hidden rounded-pill bg-primary px-8 py-4 text-center text-[15px] font-bold text-white shadow-[0_10px_30px_rgba(61,125,216,.5)] ring-1 ring-white/20 sm:w-auto sm:max-w-none"
              >
                <span className="relative">Start Now! →</span>
              </TransitionLink>
              <a
                href="#modules"
                className="inline-flex w-full max-w-[272px] items-center justify-center gap-4 rounded-pill bg-gradient-to-r from-[#FFD75E] to-[#FFB92E] py-2 pl-8 pr-2 text-[15px] font-bold text-[#2A1C04] shadow-[0_10px_30px_rgba(255,193,50,.35)] sm:w-auto sm:max-w-none"
              >
                Browse modules
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#0B2A4A] text-white">
                  <Icon name="arrow-right-01" size={18} />
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Innovation awards — a slow ticker of cards, in the same band style as the modules section */}
      <section className="bg-[#F1F6FD] py-10 sm:py-12">
        <p className="mb-6 text-center text-[12.5px] font-bold tracking-[.12em] text-primary-soft">
          RECOGNISED AT INTERNATIONAL INNOVATION COMPETITIONS
        </p>
        <div
          className="overflow-hidden motion-reduce:overflow-x-auto [mask-image:linear-gradient(to_right,transparent,#000_7%,#000_93%,transparent)]"
        >
          <div className="animate-awards-marquee flex w-max py-2 hover:[animation-play-state:paused] motion-reduce:animate-none">
            {[0, 1].map((copy) => (
              <div key={copy} aria-hidden={copy === 1} className={`flex ${copy === 1 ? 'motion-reduce:hidden' : ''}`}>
                {AWARDS.map((award) => {
                  const meta = AWARD_META[award.status]
                  return (
                    <div
                      key={award.name}
                      className="mr-4 flex w-[290px] flex-shrink-0 items-center gap-4 rounded-[20px] border border-primary/15 bg-white px-4 py-4 shadow-[0_6px_20px_rgba(61,125,216,.08)] sm:w-[320px]"
                    >
                      <div className="flex h-14 w-[84px] flex-shrink-0 items-center justify-center rounded-xl bg-[#F1F6FD] p-2">
                        <img src={award.img} alt={award.name} className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <span
                          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide"
                          style={{ color: meta.color, backgroundColor: `${meta.color}22` }}
                        >
                          <Icon name={meta.icon} size={11} /> {meta.label}
                        </span>
                        <div className="mt-1.5 truncate text-[14.5px] font-bold text-[#0B2A4A]">{award.name}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-[1160px] px-[6vw] py-[70px]">
        <h2 className="mb-2.5 text-center font-poppins text-[32px] font-extrabold">
          Four steps to{' '}
          <span className="bg-gradient-to-r from-primary to-violet bg-clip-text text-transparent">fluent!</span>
        </h2>
        <p className="mb-12 text-center text-[15px] text-light-inkSoft">
          No app-only courses. Your module is a real book — the app is what makes it come alive.
        </p>
        <div className="gs-stagger grid grid-cols-2 gap-5 md:grid-cols-4">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.title} className="rounded-[18px] border border-primary/15 bg-white shadow-[0_6px_20px_rgba(61,125,216,.06)] p-[26px_22px]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[11px] bg-primary/[.15]">
                <Icon name={step.icon} size={19} className="text-primary" />
              </div>
              <div className="mb-1.5 font-poppins text-[15px] font-bold">{step.title}</div>
              <div className="text-[13px] leading-[1.55] text-light-inkSoft">{step.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Ustaz — a dark feature panel; the phone in the middle is the slot for the real app mockup */}
      <section id="ai" className="px-[4vw] pb-[70px] sm:px-[5vw]">
        <div
          className="gs-reveal relative mx-auto max-w-[1100px] overflow-hidden rounded-[32px] px-6 py-12 text-center sm:rounded-[40px] md:px-14 md:py-16"
          style={{
            background:
              'radial-gradient(60% 50% at 50% 0%, rgba(61,125,216,.28) 0%, transparent 70%), radial-gradient(50% 40% at 50% 100%, rgba(61,125,216,.22) 0%, transparent 70%), linear-gradient(160deg, #070A14 0%, #0C1D3D 55%, #0A1730 100%)',
          }}
        >
          <div className="mb-5 inline-flex items-center gap-2.5 rounded-pill border border-white/15 bg-white/[.08] px-4 py-2 text-[12px] font-bold uppercase tracking-[.14em] text-white/90">
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-goldBright" /> AI Ustaz
          </div>
          <h2 className="mx-auto mb-4 max-w-[640px] font-poppins text-[28px] font-extrabold leading-[1.15] text-white sm:text-[36px] md:text-[42px]">
            A different Ustaz for{' '}
            <span className="bg-gradient-to-r from-[#FFE27A] via-[#FFC93C] to-[#FFA928] bg-clip-text text-transparent">
              every module
            </span>
          </h2>
          <p className="mx-auto max-w-[560px] text-[15px] leading-[1.7] text-white/75 sm:text-base">
            Ask anything about a topic in your language, then Ai Ustaz will teach you how to use the words and
            sentences in real situations.
          </p>

          {/* PHONE MOCKUP — /Testmockup.png is a temporary placeholder; replace the file (or the src) with the real AI Ustaz mockup. */}
          <img
            src="/Testmockup.png"
            alt="EduArabic for All app preview"
            width={2000}
            height={2000}
            loading="lazy"
            decoding="async"
            className="mx-auto -my-2 mt-6 h-auto w-full max-w-[420px] drop-shadow-[0_24px_40px_rgba(0,0,0,.45)] sm:max-w-[520px] md:max-w-[560px]"
          />

          <div className="mt-10">
            <TransitionLink
              to="/auth?view=signup"
              className="inline-flex items-center justify-center gap-4 rounded-pill bg-gradient-to-r from-[#FFD75E] to-[#FFB92E] py-2 pl-8 pr-2 text-[15px] font-bold text-[#2A1C04] shadow-[0_10px_30px_rgba(255,193,50,.3)]"
            >
              Try AI Ustaz
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#0B2A4A] text-white">
                <Icon name="arrow-right-01" size={18} />
              </span>
            </TransitionLink>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="bg-[#F1F6FD]">
        <div className="mx-auto max-w-[1160px] px-[6vw] py-[70px]">
          <div className="mb-9 flex items-end justify-between gap-4">
            <div>
              <div className="mb-3.5 inline-flex items-center gap-2.5 rounded-pill border border-primary/15 bg-white px-4 py-2 text-[12px] font-bold uppercase tracking-[.14em] text-primary-soft shadow-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-gold/40" /> Featured modules
              </div>
              <h2 className="font-poppins text-[30px] font-extrabold leading-tight text-[#0B2A4A] sm:text-[36px]">
                Our physical{' '}
                <span className="bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">modules</span>
              </h2>
              <p className="mt-2 text-[14.5px] text-light-inkSoft">
                Each one ships with its own audio library and AI Ustaz.
              </p>
            </div>
            {(modulesScroll.prev || modulesScroll.next) && (
              <div className="hidden flex-shrink-0 gap-3 sm:flex">
                <button
                  type="button"
                  aria-label="Previous modules"
                  onClick={() => slideModules(-1)}
                  disabled={!modulesScroll.prev}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary-soft shadow-[0_4px_16px_rgba(61,125,216,.2)] transition-opacity disabled:opacity-40"
                >
                  <Icon name="arrow-left-01" size={18} />
                </button>
                <button
                  type="button"
                  aria-label="Next modules"
                  onClick={() => slideModules(1)}
                  disabled={!modulesScroll.next}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary-soft shadow-[0_4px_16px_rgba(61,125,216,.2)] transition-opacity disabled:opacity-40"
                >
                  <Icon name="arrow-right-01" size={18} />
                </button>
              </div>
            )}
          </div>

          <div
            ref={modulesScrollRef}
            className="gs-stagger scrollbar-none -mx-[6vw] flex snap-x snap-mandatory scroll-pl-[6vw] gap-5 overflow-x-auto px-[6vw] pb-3 pt-1 md:mx-0 md:scroll-pl-0 md:px-0"
          >
            {products.map((mod) => {
              const isNew = Date.now() - new Date(mod.created_at).getTime() < NEW_RELEASE_DAYS * 24 * 60 * 60 * 1000
              return (
                <div
                  key={mod.id}
                  // Auto margins on the first/last card centre a short row (e.g. a
                  // single product) but collapse to 0 once the row overflows, so
                  // it still scrolls from the start.
                  className="flex w-[78vw] flex-shrink-0 snap-start flex-col overflow-hidden rounded-[28px] border border-primary/15 bg-white shadow-[0_10px_30px_rgba(61,125,216,.10)] first:ml-auto last:mr-auto sm:w-[320px] md:w-[336px]"
                >
                  <div className="relative">
                    {mod.image_url ? (
                      <img src={mod.image_url} alt="" className="aspect-[4/3] w-full object-cover" />
                    ) : (
                      <PlaceholderBlock label="module cover" className="aspect-[4/3]" />
                    )}
                    <span className="absolute right-3.5 top-3.5 rounded-pill bg-white px-3.5 py-1.5 text-[12.5px] font-extrabold text-[#0B2A4A] shadow-md">
                      RM{mod.price}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-[11.5px] font-bold uppercase tracking-[.1em] text-primary-soft">
                        Physical module
                      </span>
                      {isNew && (
                        <span className="rounded-[6px] bg-gold px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide text-[#2A1C04]">
                          New
                        </span>
                      )}
                    </div>
                    <div className="mb-1.5 font-poppins text-[18px] font-bold leading-snug text-[#0B2A4A]">{mod.name}</div>
                    <div className="mb-4 line-clamp-2 min-h-[40px] text-[13px] leading-relaxed text-light-inkSoft">
                      {mod.description}
                    </div>
                    <div className="mb-4 mt-auto flex items-center gap-2 border-t border-primary/15 pt-4 text-[12.5px] text-light-inkSoft">
                      <Icon name="headphones" size={15} className="text-primary" />
                      Audio Library + AI Ustaz included
                    </div>
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/product/${mod.id}`)}
                        className="flex-1 rounded-[14px] border border-primary/30 px-3 py-3 text-[13px] font-bold text-primary-soft"
                      >
                        View details
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/checkout?product=${mod.id}`)}
                        className="flex-1 rounded-[14px] bg-gradient-to-r from-[#FFD75E] to-[#FFB92E] px-3 py-3 text-[13px] font-extrabold text-[#2A1C04] shadow-[0_6px_18px_rgba(255,185,46,.4)] transition-transform hover:-translate-y-px"
                      >
                        Buy Now →
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="mx-auto max-w-[1160px] px-[6vw] pb-20">
        <h2 className="mb-10 text-center font-poppins text-[32px] font-extrabold">Students say</h2>
        <div className="gs-stagger scrollbar-none -mx-[6vw] flex snap-x snap-mandatory gap-[18px] overflow-x-auto px-[6vw] pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
          {REVIEWS.map((review) => (
            <div
              key={review.author}
              className="w-[80vw] flex-shrink-0 snap-start rounded-[18px] border border-primary/15 bg-white shadow-[0_6px_20px_rgba(61,125,216,.06)] p-6 sm:w-[320px] md:w-auto md:flex-shrink"
            >
              <p className="mb-3.5 text-sm leading-relaxed text-light-ink">"{review.quote}"</p>
              <div className="text-xs font-semibold text-light-inkFaint">{review.author}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-[800px] px-[6vw] pb-20">
        <h2 className="mb-10 text-center font-poppins text-[32px] font-extrabold">Frequently asked questions</h2>
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
