import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Sidebar from '../components/layout/Sidebar'
import MobileTabBar from '../components/layout/MobileTabBar'
import { gsap, ScrollTrigger } from '../hooks/useGsap'

export default function Dashboard() {
  const { t } = useTranslation()
  const contentRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stagger all direct dashboard cards
      const cards = contentRef.current?.querySelectorAll(':scope > div, :scope > div > div')
      if (cards?.length) {
        gsap.set(cards, { opacity: 0, y: 30 })
        gsap.to(cards, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.2 })
      }

      // Animate learning path nodes
      const nodes = contentRef.current?.querySelectorAll('[class*="flex items-center gap-4 py-2"]')
      if (nodes?.length) {
        gsap.set(nodes, { opacity: 0, x: -20 })
        ScrollTrigger.create({
          trigger: nodes[0],
          start: 'top 90%',
          once: true,
          onEnter: () => gsap.to(nodes, { opacity: 1, x: 0, duration: 0.5, stagger: 0.12, ease: 'power3.out' }),
        })
      }

      // Animate weekly goal days
      const days = contentRef.current?.querySelectorAll('[class*="aspect-square"]')
      if (days?.length) {
        gsap.set(days, { opacity: 0, scale: 0.5, rotation: -10 })
        gsap.to(days, { opacity: 1, scale: 1, rotation: 0, duration: 0.4, stagger: 0.08, ease: 'back.out(2)', delay: 0.5 })
      }

      // Animate progress bar
      const bar = contentRef.current?.querySelector('[class*="h-full w-\\[40\\%\\]"]')
      if (bar) {
        gsap.from(bar, { width: '0%', duration: 1.2, ease: 'power2.out', delay: 0.8 })
      }

      // Animate XP counter
      const xpEl = contentRef.current?.querySelector('[class*="font-bold text-sm"]')
      if (xpEl) {
        const obj = { val: 0 }
        gsap.to(obj, {
          val: 1240, duration: 1.5, ease: 'power2.out', delay: 0.5,
          onUpdate: () => { if (xpEl) xpEl.textContent = Math.round(obj.val).toLocaleString() },
        })
      }

      // Streak fire pulse
      const fire = contentRef.current?.querySelector('[class*="hgi-fire"]')
      if (fire) {
        gsap.to(fire, { scale: 1.2, duration: 0.3, ease: 'power2.out', yoyo: true, repeat: 3, delay: 1 })
      }
    })
    return () => ctx.revert()
  }, [])

  const week = [
    { label: 'M', done: true }, { label: 'T', done: true }, { label: 'W', done: true },
    { label: 'T', done: true }, { label: 'F', done: true }, { label: 'S', today: true },
    { label: 'S', done: false },
  ]

  const path = [
    { icon: 'play-circle', title: 'What is a nominal sentence?', kind: 'Clip', meta: 'Watched · 3 min', state: 'done' },
    { icon: 'play', title: 'Mubtada & Khabar', kind: 'Clip', meta: 'In progress · 2 min left', state: 'active' },
    { icon: 'quiz-01', title: 'Practice: build the sentence', kind: 'Exercise', meta: 'Locked · 8 questions', state: 'locked' },
    { icon: 'headphones', title: 'Podcast: sentences in speech', kind: 'Audio', meta: 'Locked · 6 min', state: 'locked' },
    { icon: 'medal-01', title: 'Unit 3 checkpoint', kind: 'Test', meta: 'Locked', state: 'locked' },
  ]

  const classes = [
    { title: 'Muhadathah — Level 2', tutor: 'with Ustaz Hakim', time: 'Today · 8:30 PM', icon: 'video-01', accent: 'text-primary', tint: 'bg-[rgba(47,196,159,.14)]', btnBg: 'bg-primary', btnColor: 'text-[#04140F]', btnLabel: t('dashboard.join_zoom') },
    { title: 'Nahw Q&A session', tutor: 'with Ustazah Aisyah', time: 'Thu · 9:00 PM', icon: 'user-group', accent: 'text-gold', tint: 'bg-[rgba(240,180,41,.14)]', btnBg: 'bg-panel-2', btnColor: 'text-ink', btnLabel: t('dashboard.remind_me') },
  ]

  const getNodeStyle = (state) => {
    if (state === 'done') return { nodeBg: 'bg-[rgba(47,196,159,.15)]', nodeBd: 'border-primary', nodeFg: 'text-primary', rowBg: 'bg-panel', rowBd: 'border-ea-border-soft', titleColor: 'text-ink', chevColor: 'text-primary', icon: 'checkmark-circle-01' }
    if (state === 'active') return { nodeBg: 'bg-gold', nodeBd: 'border-gold', nodeFg: 'text-[#1a1400]', rowBg: 'bg-[rgba(240,180,41,.08)]', rowBd: 'border-[rgba(240,180,41,.35)]', titleColor: 'text-ink', chevColor: 'text-gold', icon: 'arrow-right-01' }
    return { nodeBg: 'bg-panel-2', nodeBd: 'border-ea-border-soft', nodeFg: 'text-ink-faint', rowBg: 'bg-transparent', rowBd: 'border-ea-border-soft', titleColor: 'text-ink-soft', chevColor: 'text-ink-faint', icon: 'lock' }
  }

  return (
    <div className="flex min-h-screen bg-bg text-ink font-pjs">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <div className="sticky top-0 z-20 backdrop-blur-[14px] bg-[rgba(7,10,20,.72)] border-b border-ea-border-soft py-4 px-6 md:px-8 flex items-center gap-5">
          <div>
            <div className="font-sora font-extrabold text-lg md:text-[21px] tracking-tight">{t('dashboard.greeting', { name: 'Ahmad' })}</div>
            <div className="text-[13.5px] text-ink-soft">{t('dashboard.streak_msg', { count: 12 })}</div>
          </div>
          <div className="ms-auto flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-[11px] bg-panel border border-ea-border hover:border-gold/40 transition-colors duration-200">
              <i className="hgi-stroke hgi-fire" style={{ fontSize: '19px', color: '#F0B429' }} />
              <span className="font-bold text-sm">12</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-[11px] bg-panel border border-ea-border hover:border-primary/40 transition-colors duration-200">
              <i className="hgi-stroke hgi-flash" style={{ fontSize: '19px', color: '#2FC49F' }} />
              <span className="font-bold text-sm">{t('dashboard.xp', { count: '1,240' })}</span>
            </div>
            <span className="w-[42px] h-[42px] rounded-[12px] bg-panel-2 grid place-items-center text-ink-soft hover:bg-panel hover:text-primary transition-colors duration-200 cursor-pointer">
              <i className="hgi-stroke hgi-notification-01" style={{ fontSize: '21px' }} />
            </span>
          </div>
        </div>

        {/* Content */}
        <div ref={contentRef} className="p-6 md:p-8 pb-24 lg:pb-12 flex flex-col gap-6">
          {/* Continue learning + Weekly goal */}
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-5">
            <div className="relative rounded-[22px] p-7 bg-gradient-to-br from-[#17756A] to-[#0C3A33] overflow-hidden group hover:shadow-[0_12px_40px_rgba(47,196,159,.15)] transition-shadow duration-300">
              <div className="absolute -top-10 -right-7 w-[180px] h-[180px] rounded-full bg-[rgba(47,196,159,.25)] blur-[20px] group-hover:blur-[30px] transition-all duration-500" />
              <div className="relative">
                <span className="inline-block px-3 py-1.5 rounded-full bg-[rgba(255,255,255,.16)] text-[11px] font-bold tracking-[.08em] uppercase mb-4">{t('dashboard.continue_learning')}</span>
                <div className="flex gap-[7px] mb-3">
                  <span className="text-[11px] font-bold text-white bg-[rgba(255,255,255,.16)] px-2.5 py-1 rounded-[7px]">NAHW · Unit 3</span>
                  <span className="text-[11px] font-bold bg-gold px-2.5 py-1 rounded-[7px] text-[#1a1400]">Clip 2 of 5</span>
                </div>
                <h2 className="font-sora font-extrabold text-[30px] tracking-tight text-white mb-1">The Nominal Sentence</h2>
                <p dir="rtl" className="font-amiri text-[22px] text-[rgba(255,255,255,.82)] mb-5">الجُمْلَةُ الاِسْمِيَّة</p>
                <div className="flex items-center gap-4">
                  <Link to="/lesson/1" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#0C3A33] font-bold text-[15px] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 no-underline">
                    <i className="hgi-stroke hgi-play" style={{ fontSize: '20px' }} /> {t('dashboard.resume_lesson')}
                  </Link>
                  <div className="text-[rgba(255,255,255,.85)] text-[13px]">
                    <span className="font-bold">40%</span> {t('dashboard.through_unit', { pct: 40 }).replace(/40%/, '').trim()}
                  </div>
                </div>
                <div className="mt-5 h-2 rounded-full bg-[rgba(255,255,255,.18)] overflow-hidden">
                  <span className="block h-full w-[40%] bg-gold rounded-full" />
                </div>
              </div>
            </div>

            <div className="rounded-[22px] p-6 bg-panel border border-ea-border hover:border-primary/20 transition-colors duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="font-sora font-bold text-base">{t('dashboard.weekly_goal')}</span>
                <span className="text-xs text-ink-faint font-semibold">{t('dashboard.days', { count: 5 })}</span>
              </div>
              <div className="flex justify-between gap-1.5 mb-5">
                {week.map((d, i) => {
                  const isDone = d.done
                  const isToday = d.today
                  return (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1 group/day cursor-default">
                      <span className={`w-full aspect-square rounded-[11px] grid place-items-center border transition-all duration-200 group-hover/day:scale-110 ${
                        isDone ? 'bg-[rgba(47,196,159,.16)] text-primary border-[rgba(47,196,159,.3)]'
                        : isToday ? 'bg-[rgba(240,180,41,.16)] text-gold border-gold animate-pulse'
                        : 'bg-panel-2 text-ink-faint border-ea-border-soft'
                      }`}>
                        <i className={`hgi-stroke hgi-${isDone ? 'tick-02' : isToday ? 'flash' : 'lock'}`} style={{ fontSize: '18px' }} />
                      </span>
                      <span className="text-[11px] text-ink-faint font-semibold">{d.label}</span>
                    </div>
                  )
                })}
              </div>
              <div className="p-3.5 rounded-[13px] bg-panel-2 flex items-center gap-3 hover:bg-[rgba(240,180,41,.06)] transition-colors duration-200 cursor-default">
                <span className="w-[38px] h-[38px] rounded-[10px] bg-[rgba(240,180,41,.16)] grid place-items-center text-gold">
                  <i className="hgi-stroke hgi-award-01" style={{ fontSize: '21px' }} />
                </span>
                <div>
                  <div className="text-[13.5px] font-bold">{t('dashboard.badge_title')}</div>
                  <div className="text-[12.5px] text-ink-faint">{t('dashboard.badge_desc')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Learning path + Classes */}
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-5 items-start">
            <div className="rounded-[22px] p-6 bg-panel border border-ea-border">
              <div className="flex items-center justify-between mb-1">
                <span className="font-sora font-bold text-[17px]">{t('dashboard.learning_path')}</span>
                <Link to="/learning-path" className="text-sm text-primary font-semibold no-underline hover:opacity-80 transition-opacity">{t('dashboard.view_full_map')}</Link>
              </div>
              <p className="text-[13.5px] text-ink-soft mb-5">Nahw · Unit 3 — Nominal Sentences</p>
              <div className="relative ps-2">
                {path.map((node, i) => {
                  const ns = getNodeStyle(node.state)
                  const last = i === path.length - 1
                  return (
                    <div key={i} className="flex items-center gap-4 py-2.5 relative group/node cursor-default">
                      <div className="relative z-10 shrink-0">
                        <span className={`w-[52px] h-[52px] rounded-2xl grid place-items-center border-2 ${ns.nodeBg} ${ns.nodeBd} ${ns.nodeFg} transition-transform duration-200 group-hover/node:scale-110`}>
                          <i className={`hgi-stroke hgi-${node.icon}`} style={{ fontSize: '25px' }} />
                        </span>
                        {!last && <span className="absolute left-1/2 top-[52px] -translate-x-1/2 w-[3px] h-6 bg-ea-border-soft" />}
                      </div>
                      <div className={`flex-1 flex items-center justify-between px-4 py-3.5 rounded-[13px] ${ns.rowBg} border ${ns.rowBd} transition-all duration-200 group-hover/node:border-primary/30`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-[14.5px] ${ns.titleColor}`}>{node.title}</span>
                            <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
                              color: node.state === 'done' ? '#2FC49F' : node.state === 'active' ? '#1a1400' : '#6B7488',
                              background: node.state === 'done' ? 'rgba(47,196,159,.12)' : node.state === 'active' ? '#F0B429' : 'rgba(255,255,255,.06)',
                            }}>{node.kind}</span>
                          </div>
                          <div className="text-[12.5px] text-ink-faint mt-0.5">{node.meta}</div>
                        </div>
                        <i className={`hgi-stroke hgi-${ns.icon}`} style={{ fontSize: '22px' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="rounded-[22px] p-6 bg-panel border border-ea-border">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sora font-bold text-base">{t('dashboard.upcoming_classes')}</span>
                  <Link to="/classes" className="text-sm text-primary font-semibold no-underline hover:opacity-80 transition-opacity">{t('dashboard.schedule')}</Link>
                </div>
                <div className="flex flex-col gap-3">
                  {classes.map((c, i) => (
                    <div key={i} className="p-4 rounded-[14px] bg-panel-2 border border-ea-border-soft hover:border-primary/30 transition-all duration-200 group/class">
                      <div className="flex items-center gap-2.5 mb-3">
                        <span className={`w-10 h-10 rounded-[11px] ${c.tint} grid place-items-center ${c.accent} group-hover/class:scale-110 transition-transform duration-200`}>
                          <i className={`hgi-stroke hgi-${c.icon}`} style={{ fontSize: '21px' }} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm">{c.title}</div>
                          <div className="text-[12.5px] text-ink-faint">{c.tutor}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-soft font-semibold">
                          <i className="hgi-stroke hgi-clock-01" style={{ fontSize: '16px' }} /> {c.time}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-[9px] ${c.btnBg} ${c.btnColor} text-[12.5px] font-bold hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer`}>{c.btnLabel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Link to="/ai-ustaz" className="group text-decoration-none rounded-[22px] p-5 bg-gradient-to-br from-[rgba(120,80,220,.16)] to-[rgba(47,196,159,.08)] border border-[rgba(120,110,220,.25)] flex items-center gap-4 hover:border-[rgba(120,110,220,.5)] hover:shadow-[0_8px_30px_rgba(120,80,220,.1)] transition-all duration-300 no-underline">
                <span className="w-12 h-12 rounded-[13px] bg-[rgba(255,255,255,.08)] grid place-items-center text-violet group-hover:scale-110 transition-transform duration-300">
                  <i className="hgi-stroke hgi-ai-brain-01" style={{ fontSize: '25px' }} />
                </span>
                <div className="flex-1">
                  <div className="font-sora font-bold text-[15.5px] text-ink">{t('dashboard.ask_ai')}</div>
                  <div className="text-[13px] text-ink-soft">{t('dashboard.ask_ai_desc')}</div>
                </div>
                <i className="hgi-stroke hgi-arrow-right-01 transition-transform duration-200 group-hover:translate-x-1" style={{ fontSize: '22px', color: '#A2AABD' }} />
              </Link>
            </div>
          </div>
        </div>
      </main>
      <MobileTabBar />
    </div>
  )
}
