import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import PhoneMockup from '../components/PhoneMockup'
import { scrollToId } from '../lib/utils'
import { gsap, ScrollTrigger, useScrollReveal, useStaggerReveal } from '../hooks/useGsap'

export default function Landing() {
  const { t } = useTranslation()

  // Refs for GSAP animations
  const heroRef = useRef(null)
  const heroTitleRef = useRef(null)
  const heroSubtitleRef = useRef(null)
  const heroDescRef = useRef(null)
  const heroBtnsRef = useRef(null)
  const heroStoreRef = useRef(null)
  const heroRatingRef = useRef(null)
  const heroPhonesRef = useRef(null)
  const featuresTitleRef = useScrollReveal()
  const featuresGridRef = useRef(null)
  const pricingTitleRef = useScrollReveal()
  const pricingCardsRef = useRef(null)
  const compareRef = useScrollReveal()
  const reviewsTitleRef = useScrollReveal()
  const reviewsGridRef = useRef(null)
  const ctaRef = useRef(null)
  const ctaTitleRef = useScrollReveal()
  const stepLeftRef = useRef(null)
  const stepRightRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance animation
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      heroTl
        .from(heroTitleRef.current, { opacity: 0, y: 50, duration: 0.9 })
        .from(heroSubtitleRef.current, { opacity: 0, y: 30, duration: 0.6 }, '-=0.4')
        .from(heroDescRef.current, { opacity: 0, y: 30, duration: 0.6 }, '-=0.3')
        .from(heroBtnsRef.current, { opacity: 0, y: 20, scale: 0.95, duration: 0.5 }, '-=0.2')
        .from(heroStoreRef.current, { opacity: 0, y: 20, duration: 0.5 }, '-=0.2')
        .from(heroRatingRef.current, { opacity: 0, y: 15, duration: 0.5 }, '-=0.2')

      // Hero phones entrance
      if (heroPhonesRef.current) {
        const phones = heroPhonesRef.current.children
        gsap.from(phones[0], { opacity: 0, x: -80, rotation: -15, duration: 1, ease: 'power3.out', delay: 0.3 })
        gsap.from(phones[1], { opacity: 0, x: 80, rotation: 15, duration: 1, ease: 'power3.out', delay: 0.3 })
        gsap.from(phones[2], { opacity: 0, y: 100, scale: 0.8, duration: 1.1, ease: 'elastic.out(1, 0.6)', delay: 0.5 })
      }

      // Features steps stagger
      if (stepLeftRef.current) {
        const leftSteps = stepLeftRef.current.children
        gsap.set(leftSteps, { opacity: 0, x: -40 })
        ScrollTrigger.create({
          trigger: stepLeftRef.current,
          start: 'top 85%',
          once: true,
          onEnter: () => gsap.to(leftSteps, { opacity: 1, x: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out' }),
        })
      }
      if (stepRightRef.current) {
        const rightSteps = stepRightRef.current.children
        gsap.set(rightSteps, { opacity: 0, x: 40 })
        ScrollTrigger.create({
          trigger: stepRightRef.current,
          start: 'top 85%',
          once: true,
          onEnter: () => gsap.to(rightSteps, { opacity: 1, x: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out' }),
        })
      }

      // Pricing cards
      if (pricingCardsRef.current) {
        const cards = pricingCardsRef.current.children
        gsap.set(cards, { opacity: 0, y: 50, scale: 0.95 })
        ScrollTrigger.create({
          trigger: pricingCardsRef.current,
          start: 'top 85%',
          once: true,
          onEnter: () => gsap.to(cards, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.18, ease: 'power3.out' }),
        })
      }

      // Reviews cards
      if (reviewsGridRef.current) {
        const cards = reviewsGridRef.current.children
        gsap.set(cards, { opacity: 0, y: 40, rotationX: 8 })
        ScrollTrigger.create({
          trigger: reviewsGridRef.current,
          start: 'top 85%',
          once: true,
          onEnter: () => gsap.to(cards, { opacity: 1, y: 0, rotationX: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out' }),
        })
      }

      // CTA section
      if (ctaRef.current) {
        gsap.set(ctaRef.current, { opacity: 0, y: 40, scale: 0.97 })
        ScrollTrigger.create({
          trigger: ctaRef.current,
          start: 'top 88%',
          once: true,
          onEnter: () => gsap.to(ctaRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }),
        })
      }

      // Floating phone continuous animation
      gsap.to('.ea-float-phone', {
        y: -12,
        duration: 2.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })
    })

    return () => ctx.revert()
  }, [])

  const storeBtns = [
    { icon: 'smart-phone-01', small: t('hero.download_on'), big: t('hero.app_store') },
    { icon: 'play-store', small: t('hero.get_it_on'), big: t('hero.google_play') },
  ]

  const stepsLeft = [
    { n: '1', title: t('features.step1_title'), desc: t('features.step1_desc'), tag: t('features.most_used'), showTag: true },
    { n: '2', title: t('features.step2_title'), desc: t('features.step2_desc') },
    { n: '3', title: t('features.step3_title'), desc: t('features.step3_desc') },
    { n: '4', title: t('features.step4_title'), desc: t('features.step4_desc') },
  ]

  const stepsRight = [
    { n: '5', title: t('features.step5_title'), desc: t('features.step5_desc') },
    { n: '6', title: t('features.step6_title'), desc: t('features.step6_desc') },
    { n: '7', title: t('features.step7_title'), desc: t('features.step7_desc') },
    { n: '8', title: t('features.step8_title'), desc: t('features.step8_desc') },
    { n: '9', title: t('features.step9_title'), desc: t('features.step9_desc') },
  ]

  const plans = [
    { name: t('pricing.free'), tag: t('pricing.starter'), price: t('pricing.rm0'), unit: t('pricing.forever'), note: t('pricing.free_note'), cardBg: 'bg-panel', cardBd: 'border-ea-border-soft', badge: '', cta: t('pricing.start_free_btn'), ctaBg: 'bg-panel-2', ctaColor: 'text-ink', ctaBd: 'border-ea-border', features: ['Foundation modules + unit map', 'Full free Audio Library', 'AI Ustaz — basic daily quota', '1 exercise per unit', 'Daily streak & XP', '100% ad-free'] },
    { name: t('pricing.plus'), tag: t('pricing.everyday'), price: t('pricing.rm490'), unit: t('pricing.per_month'), note: t('pricing.plus_note'), cardBg: 'bg-[rgba(47,196,159,.06)]', cardBd: 'border-primary', badge: t('pricing.most_popular'), badgeBg: 'bg-gold', badgeColor: 'text-[#1a1400]', promo: true, cta: t('pricing.choose_plus'), ctaBg: 'bg-primary', ctaColor: 'text-[#04140F]', ctaBd: 'border-primary', features: ['Everything in Free', 'All modules unlocked (nahw, sarf, muhadathah)', 'AI Ustaz 10× quota + deep corrections', 'Unlimited exercises & quizzes', 'Weekly group classes', 'Offline audio downloads', 'Module completion certificates'] },
    { name: t('pricing.pro'), tag: t('pricing.all_access'), price: t('pricing.rm1090'), unit: t('pricing.per_month'), note: t('pricing.pro_note'), cardBg: 'bg-panel', cardBd: 'border-ea-border', badge: t('pricing.best_for_exams'), badgeBg: 'bg-panel-2', badgeColor: 'text-ink', promo: true, cta: t('pricing.choose_pro'), ctaBg: 'bg-ink', ctaColor: 'text-[#0A0E1A]', ctaBd: 'border-ink', features: ['Everything in Plus', 'AI Ustaz 50× quota — fastest model', '1-on-1 classes with an ustaz', 'Personalised study plan', 'Priority sessions & class slots', 'Unlimited Arabic writing review', 'Priority support'] },
  ]

  const reviews = [
    { text: 'AI Ustaz genuinely helped me fix my Arabic sentences. It feels like having a teacher available 24/7.', name: 'MojoMichie' },
    { text: 'The modules are so well organised — short clips, then practice. I actually look forward to studying now. Brilliant app.', name: 'kuzo_' },
    { text: 'The free audio library alone is worth it. Great for students starting Arabic from zero.', name: 'nuraaazz' },
  ]

  return (
    <div className="relative min-h-screen bg-bg text-ink font-pjs overflow-x-hidden">
      <div className="ea-gradient-bg" />
      <div className="relative z-10">
        <Navbar />

        {/* Hero */}
        <section ref={heroRef} className="max-w-[1200px] mx-auto px-5 sm:px-7 py-20 md:py-[84px] pb-14 md:pb-[60px] grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-10 items-center">
          <div>
            <h1 ref={heroTitleRef} className="font-sora font-extrabold text-5xl sm:text-6xl md:text-[76px] leading-[.98] tracking-tight mb-5">
              {t('hero.title')}<span className="text-primary">.</span>
            </h1>
            <p ref={heroSubtitleRef} className="font-sora font-bold text-xl sm:text-[26px] tracking-tight mb-2">{t('hero.subtitle')}</p>
            <p ref={heroDescRef} className="text-[17px] leading-relaxed text-ink-soft max-w-[470px] mb-7">{t('hero.description')}</p>
            <div ref={heroBtnsRef} className="flex flex-wrap gap-3 mb-4">
              <Link to="/auth" className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-ink text-[#0A0E1A] font-bold text-base hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 no-underline">
                {t('hero.start_free')} <i className="hgi-stroke hgi-arrow-right-01 transition-transform duration-200 group-hover:translate-x-1" style={{ fontSize: '20px' }} />
              </Link>
              <a href="#pricing" className="group inline-flex items-center px-6 py-3.5 rounded-xl bg-panel text-ink font-bold text-base border border-ea-border hover:border-primary hover:bg-[rgba(47,196,159,.06)] transition-all duration-200 no-underline">
                {t('hero.view_pricing')}
              </a>
            </div>
            <div ref={heroStoreRef} className="flex flex-wrap gap-3 mb-6">
              {storeBtns.map((b) => (
                <a key={b.big} href="#" className="group inline-flex items-center gap-2.5 px-5 py-[11px] rounded-xl bg-black border border-ea-border hover:border-[#444] hover:scale-[1.02] transition-all duration-200 no-underline">
                  <i className={`hgi-stroke hgi-${b.icon}`} style={{ fontSize: '26px', color: '#fff' }} />
                  <span className="flex flex-col leading-tight">
                    <span className="text-[10px] text-ink-soft uppercase tracking-[.08em]">{b.small}</span>
                    <span className="text-base font-bold text-white">{b.big}</span>
                  </span>
                </a>
              ))}
            </div>
            <div ref={heroRatingRef} className="flex items-center gap-3 text-ink-soft text-sm font-medium">
              <span className="text-gold tracking-[2px] text-[15px]">★★★★★</span>
              {t('hero.rating_loved')} · {t('hero.rating_education')} · {t('hero.rating_age')} · {t('hero.rating_free')}
            </div>
          </div>

          <div ref={heroPhonesRef} className="relative h-[420px] sm:h-[620px] hidden md:block">
            <div className="absolute top-[62px] left-[3%] w-[232px] opacity-50 saturate-[.7] hover:opacity-70 hover:saturate-100 transition-all duration-500" style={{ transform: 'rotate(-7deg)' }}>
              <PhoneMockup variant="sand" screen="home" />
            </div>
            <div className="absolute top-[62px] right-[3%] w-[232px] opacity-50 saturate-[.7] hover:opacity-70 hover:saturate-100 transition-all duration-500" style={{ transform: 'rotate(7deg)' }}>
              <PhoneMockup variant="crimson" screen="home" />
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[268px] z-2 ea-float-phone">
              <PhoneMockup variant="teal" screen="home" />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-[1200px] mx-auto px-5 sm:px-7 py-[70px]">
          <div ref={featuresTitleRef} className="text-center max-w-[680px] mx-auto mb-14">
            <h2 className="font-sora font-extrabold text-3xl sm:text-[46px] tracking-tight mb-3.5">{t('features.title')}</h2>
            <p className="text-[17px] leading-relaxed text-ink-soft">{t('features.description')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-center">
            <div ref={stepLeftRef} className="flex flex-col gap-3.5">
              {stepsLeft.map((s) => (
                <div key={s.n} className="group flex gap-4 p-5 rounded-2xl bg-panel-2 border border-ea-border hover:border-primary/40 hover:bg-[rgba(47,196,159,.04)] transition-all duration-300 cursor-default">
                  <span className="w-[34px] h-[34px] shrink-0 rounded-[10px] bg-panel-2 grid place-items-center font-sora font-bold text-[15px] text-primary group-hover:bg-primary group-hover:text-[#04140F] transition-all duration-300">{s.n}</span>
                  <div>
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="font-sora font-bold text-[17px]">{s.title}</span>
                      {s.showTag && (
                        <span className="ms-0.5 px-2.5 py-[3px] rounded-full bg-[rgba(47,196,159,.15)] text-primary text-[10px] font-bold tracking-[.08em] uppercase">{s.tag}</span>
                      )}
                    </div>
                    <p className="text-sm leading-normal text-ink-soft">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="w-[250px] md:w-[270px] mx-auto hidden md:block ea-float-phone">
              <PhoneMockup variant="teal" screen="lesson" />
            </div>
            <div ref={stepRightRef} className="flex flex-col gap-3.5">
              {stepsRight.map((s) => (
                <div key={s.n} className="group flex gap-4 p-5 rounded-2xl bg-panel border border-ea-border-soft hover:border-primary/40 hover:bg-[rgba(47,196,159,.04)] transition-all duration-300 cursor-default">
                  <span className="w-[34px] h-[34px] shrink-0 rounded-[10px] bg-panel-2 grid place-items-center font-sora font-bold text-[15px] text-ink-faint group-hover:bg-primary group-hover:text-[#04140F] transition-all duration-300">{s.n}</span>
                  <div>
                    <div className="font-sora font-bold text-[17px] mb-1.5">{s.title}</div>
                    <p className="text-sm leading-normal text-ink-soft">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="max-w-[1200px] mx-auto px-5 sm:px-7 py-[70px]">
          <div ref={pricingTitleRef} className="text-center max-w-[640px] mx-auto mb-7">
            <span className="text-xs font-bold tracking-[.22em] uppercase text-ink-faint">{t('pricing.label')}</span>
            <h2 className="font-sora font-extrabold text-3xl sm:text-[46px] tracking-tight mt-3 mb-3.5">{t('pricing.title')}</h2>
            <p className="text-[17px] leading-relaxed text-ink-soft">{t('pricing.description')}</p>
          </div>
          <div className="max-w-[900px] mx-auto mb-8 px-6 py-4 rounded-[14px] bg-[rgba(47,196,159,.08)] border border-[rgba(47,196,159,.22)] text-center text-[15px]">
            <span className="text-primary font-bold">{t('pricing.promo_label')}</span> <span className="text-ink-soft">{t('pricing.promo_text')}</span>
          </div>
          <div ref={pricingCardsRef} className="max-w-[900px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {plans.map((p) => (
              <div key={p.name} className={`group relative rounded-ea p-7 ${p.cardBg} border ${p.cardBd} hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(47,196,159,.12)] transition-all duration-300`}>
                {p.badge && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full ${p.badgeBg} ${p.badgeColor} text-xs font-bold whitespace-nowrap`}>{p.badge}</span>
                )}
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="font-sora font-bold text-xl">{p.name}</span>
                  <span className="text-[11px] font-bold tracking-[.12em] uppercase text-ink-faint">{p.tag}</span>
                  {p.promo && <span className="ms-auto px-2.5 py-1 rounded-full border border-[rgba(47,196,159,.4)] text-primary text-[10px] font-bold tracking-[.1em]">{t('pricing.web_promo')}</span>}
                </div>
                <div className="flex items-baseline gap-2 mt-3.5 mb-1.5">
                  <span className="font-sora font-extrabold text-[44px] tracking-tight">{p.price}</span>
                  <span className="text-[15px] text-ink-soft">{p.unit}</span>
                </div>
                <p className="text-sm leading-normal text-ink-soft mb-5 min-h-[42px]">{p.note}</p>
                <a href="#" className={`block text-center py-3 rounded-xl font-bold text-[15px] mb-6 no-underline ${p.ctaBg} ${p.ctaColor} border ${p.ctaBd} hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200`}>{p.cta}</a>
                <div className="flex flex-col gap-3">
                  {p.features.map((f) => (
                    <div key={f} className="flex gap-2.5 text-sm leading-normal text-ink-soft">
                      <i className="hgi-stroke hgi-tick-02 shrink-0 mt-0.5" style={{ fontSize: '19px', color: '#2FC49F' }} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Compare Plans */}
        <section ref={compareRef} className="max-w-[1120px] mx-auto px-5 sm:px-7 py-10 pb-[70px]">
          <div className="text-center max-w-[640px] mx-auto mb-11">
            <span className="text-xs font-bold tracking-[.22em] uppercase text-ink-faint">{t('compare.label')}</span>
            <h2 className="font-sora font-extrabold text-3xl sm:text-[40px] tracking-tight mt-3">{t('compare.title')}</h2>
          </div>
          <div className="rounded-ea border border-ea-border bg-panel overflow-hidden overflow-x-auto">
            <div className="grid grid-cols-4 min-w-[600px] py-6 px-7 border-b border-ea-border-soft items-end">
              <span className="text-xs font-bold tracking-[.14em] uppercase text-ink-faint">{t('compare.feature')}</span>
              <div className="text-center"><div className="font-sora font-bold text-[17px]">{t('pricing.free')}</div><div className="text-xs text-ink-faint">RM0 forever</div></div>
              <div className="text-center relative py-3.5 px-2.5 rounded-[14px] bg-panel-2 border border-primary">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gold text-[#1a1400] text-[10px] font-bold whitespace-nowrap">★ {t('pricing.most_popular')}</span>
                <div className="font-sora font-bold text-[17px]">{t('pricing.plus')}</div><div className="text-xs text-ink-faint">RM4.90 / mo</div>
              </div>
              <div className="text-center"><div className="font-sora font-bold text-[17px]">{t('pricing.pro')}</div><div className="text-xs text-ink-faint">RM10.90 / mo</div></div>
            </div>
            {[
              { name: t('compare.modules_learning'), rows: [
                { feature: 'Unit map & video clips', desc: 'Node path with a short clip per concept.', cells: ['Limited', 'All modules', 'All modules'] },
                { feature: 'Exercises & quizzes', desc: 'Spaced-repetition questions for recall.', cells: ['1 / unit', 'Unlimited', 'Unlimited'] },
              ]},
              { name: t('compare.ai_ustaz_group'), rows: [
                { feature: 'Arabic correction', desc: 'Checks grammar, morphology & spelling.', cells: ['Basic', 'In-depth', 'In-depth+'] },
                { feature: 'Monthly AI quota', desc: 'Number of AI Ustaz interactions.', cells: ['Small quota', '10× more', '50× · fastest'] },
              ]},
              { name: t('compare.classes_audio'), rows: [
                { feature: 'Live classes', desc: 'Zoom/Meet sessions with an ustaz.', cells: [false, 'Group', '1-on-1'] },
                { feature: 'Offline audio', desc: 'Download podcasts & recitation.', cells: [false, true, true] },
              ]},
            ].map((g) => (
              <div key={g.name}>
                <div className="px-7 pt-5 pb-1.5 text-xs font-bold tracking-[.14em] uppercase text-ink-faint min-w-[600px]">{g.name}</div>
                {g.rows.map((r) => (
                  <div key={r.feature} className="grid grid-cols-4 min-w-[600px] py-4 px-7 border-t border-ea-border-soft items-center hover:bg-[rgba(47,196,159,.03)] transition-colors duration-200">
                    <div className="pe-5"><div className="font-semibold text-[15px] mb-0.5">{r.feature}</div><div className="text-[13px] text-ink-faint leading-tight">{r.desc}</div></div>
                    {r.cells.map((c, i) => (
                      <div key={i} className="text-center">
                        {c === true && <i className="hgi-stroke hgi-tick-02" style={{ fontSize: '22px', color: '#2FC49F' }} />}
                        {c === false && <i className="hgi-stroke hgi-cancel-01" style={{ fontSize: '20px', color: '#6B7488' }} />}
                        {typeof c === 'string' && <span className="inline-block px-3 py-1.5 rounded-full bg-panel-2 text-[12px] font-semibold text-ink">{c}</span>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section id="reviews" className="max-w-[1120px] mx-auto px-5 sm:px-7 py-10 pb-20">
          <div ref={reviewsTitleRef} className="text-center mb-11">
            <h2 className="font-sora font-extrabold text-3xl sm:text-[46px] tracking-tight mb-3">{t('reviews.title')}</h2>
            <div className="inline-flex items-center gap-2.5 text-ink-soft text-[15px]">
              <span className="text-gold tracking-[2px] text-lg">★★★★★</span> {t('reviews.rating')}
            </div>
          </div>
          <div ref={reviewsGridRef} className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {reviews.map((r) => (
              <div key={r.name} className="group rounded-ea p-7 bg-panel border border-ea-border-soft hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(47,196,159,.08)] transition-all duration-300">
                <i className="hgi-stroke hgi-quote-down mb-3 block group-hover:text-primary transition-colors duration-300" style={{ fontSize: '34px', color: '#6B7488' }} />
                <p className="text-[15px] leading-relaxed text-ink mb-4.5">{r.text}</p>
                <div className="text-sm text-ink-faint font-medium">— {r.name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section ref={ctaRef} className="max-w-[900px] mx-auto px-5 sm:px-7 py-[60px] pb-[90px] text-center">
          <h2 ref={ctaTitleRef} className="font-sora font-extrabold text-4xl sm:text-[56px] tracking-tight leading-[1.02] mb-2">
            {t('cta.title1')} <span className="bg-gradient-to-r from-primary to-[#7FE3CC] bg-clip-text text-transparent">{t('cta.title2')}</span>
          </h2>
          <p className="text-[17px] text-ink-soft mb-7">{t('cta.subtitle')}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {storeBtns.map((b) => (
              <a key={b.big} href="#" className="group inline-flex items-center gap-2.5 px-[22px] py-3 rounded-xl bg-black border border-ea-border hover:border-[#444] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 no-underline">
                <i className={`hgi-stroke hgi-${b.icon}`} style={{ fontSize: '26px', color: '#fff' }} />
                <span className="flex flex-col leading-tight">
                  <span className="text-[10px] text-ink-soft uppercase tracking-[.08em]">{b.small}</span>
                  <span className="text-base font-bold text-white">{b.big}</span>
                </span>
              </a>
            ))}
            <a href="#pricing" className="group inline-flex items-center px-6 py-3.5 rounded-xl bg-panel border border-ea-border font-bold text-[15px] no-underline text-ink hover:border-primary hover:bg-[rgba(47,196,159,.06)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              {t('pricing.see_plans')}
            </a>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
