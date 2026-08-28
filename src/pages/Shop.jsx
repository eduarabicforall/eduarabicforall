import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PRODUCTS } from '../data/products'
import { useCart } from '../context/CartContext'
import { gsap, ScrollTrigger } from '../hooks/useGsap'

const CATS = ['All', 'Nahw', 'Sarf', 'Conversation', 'Qur\'an', 'Balaghah', 'Bundle']

export default function Shop() {
  const { t } = useTranslation()
  const { addItem, removeItem, cartProducts, total, count } = useCart()
  const [view, setView] = useState('catalog')
  const [activeId, setActiveId] = useState(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [paid, setPaid] = useState(false)
  const [payMethod, setPayMethod] = useState('fpx')
  const [payRef, setPayRef] = useState('')

  const gridRef = useRef(null)
  const cartBadgeRef = useRef(null)
  const productRef = useRef(null)
  const checkoutRef = useRef(null)
  const successRef = useRef(null)

  const q = query.trim().toLowerCase()
  const visible = PRODUCTS.filter(p =>
    (filter === 'All' || p.category === filter) &&
    (!q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
  )
  const active = PRODUCTS.find(p => p.id === activeId) || PRODUCTS[0]

  const subtotal = total.toFixed(2)
  const methods = [
    { id: 'fpx', label: t('shop.fpx'), desc: t('shop.fpx_desc'), icon: 'bank' },
    { id: 'duitnow', label: t('shop.duitnow'), desc: t('shop.duitnow_desc'), icon: 'qr-code' },
    { id: 'card', label: t('shop.card'), desc: t('shop.card_desc'), icon: 'credit-card' },
  ]

  // Animate product grid on filter change
  useEffect(() => {
    if (view !== 'catalog') return
    const grid = gridRef.current
    if (!grid) return
    const cards = grid.children
    if (!cards.length) return
    gsap.set(cards, { opacity: 0, y: 25, scale: 0.97 })
    gsap.to(cards, { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.08, ease: 'power3.out' })
  }, [view, filter, query])

  // Animate product detail entrance
  useEffect(() => {
    if (view !== 'product' || !productRef.current) return
    gsap.from(productRef.current, { opacity: 0, x: 30, duration: 0.5, ease: 'power3.out' })
  }, [view, activeId])

  // Animate checkout entrance
  useEffect(() => {
    if (view !== 'checkout' || !checkoutRef.current) return
    const items = checkoutRef.current.querySelectorAll(':scope > div')
    gsap.from(items, { opacity: 0, y: 20, duration: 0.5, stagger: 0.1, ease: 'power3.out' })
  }, [view])

  // Animate success state
  useEffect(() => {
    if (!paid || !successRef.current) return
    gsap.from(successRef.current, { opacity: 0, scale: 0.8, duration: 0.6, ease: 'back.out(1.5)' })
  }, [paid])

  // Cart badge bounce
  const animateBadge = useCallback(() => {
    if (!cartBadgeRef.current) return
    gsap.fromTo(cartBadgeRef.current,
      { scale: 1 },
      { scale: 1.4, duration: 0.15, ease: 'power2.out', yoyo: true, repeat: 1 }
    )
  }, [])

  const handleAddItem = useCallback((id, e) => {
    if (e) e.stopPropagation()
    addItem(id)
    animateBadge()
  }, [addItem, animateBadge])

  const goProduct = (id) => { setActiveId(id); setView('product') }
  const goCheckout = () => setView('checkout')
  const goCatalog = () => { setView('catalog'); setFilter('All'); setQuery('') }
  const payNow = () => { setPaid(true); setPayRef(Math.random().toString(36).slice(2, 8).toUpperCase()) }

  return (
    <div className="relative min-h-screen bg-bg text-ink font-pjs">
      <div className="ea-gradient-bg-shop" />
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-[14px] bg-[rgba(7,10,20,.72)] border-b border-ea-border-soft">
          <div className="max-w-[1160px] mx-auto px-5 sm:px-7 py-3 flex items-center gap-6">
            <Link to="/" className="flex items-center shrink-0 no-underline">
              <span className="font-sora font-extrabold text-xl text-ink tracking-tight">
                Edu<span className="text-primary">Arabic</span>
              </span>
            </Link>
            <nav className="hidden md:flex gap-0.5 ms-3.5">
              <Link to="/" className="px-3.5 py-2 rounded-[9px] text-sm font-medium text-ink-soft hover:text-ink hover:bg-panel-2 transition-colors no-underline">{t('nav.home')}</Link>
              <button onClick={goCatalog} className="px-3.5 py-2 rounded-[9px] text-sm font-semibold text-ink bg-panel-2 border-none cursor-pointer font-pjs">{t('nav.shop')}</button>
              <Link to="/dashboard" className="px-3.5 py-2 rounded-[9px] text-sm font-medium text-ink-soft hover:text-ink hover:bg-panel-2 transition-colors no-underline">{t('nav.my_learning')}</Link>
            </nav>
            <div className="ms-auto flex items-center gap-2.5">
              <button onClick={goCheckout} className="relative w-[42px] h-[42px] rounded-[12px] border border-ea-border bg-panel text-ink cursor-pointer grid place-items-center hover:border-primary hover:text-primary transition-colors">
                <i className="hgi-stroke hgi-shopping-cart-01" style={{ fontSize: '21px' }} />
                {count > 0 && <span ref={cartBadgeRef} className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-gold text-[#1a1400] text-[11px] font-extrabold grid place-items-center">{count}</span>}
              </button>
              <Link to="/auth" className="px-4 py-2.5 rounded-[11px] bg-ink text-[#0A0E1A] text-sm font-bold no-underline hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">{t('nav.signin')}</Link>
            </div>
          </div>
        </header>

        <div className="max-w-[1160px] mx-auto px-5 sm:px-7 py-11 pb-[70px]">
          {/* Catalog */}
          {view === 'catalog' && (
            <>
              <div className="mb-7">
                <h1 className="font-sora font-extrabold text-3xl sm:text-[42px] tracking-tight mb-2">{t('shop.title')}</h1>
                <p className="text-base text-ink-soft max-w-[560px]">{t('shop.description')}</p>
              </div>
              <div className="flex items-center gap-3 mb-7 flex-wrap">
                <div className="flex-1 min-w-[220px] flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-panel border border-ea-border focus-within:border-primary transition-colors duration-200">
                  <i className="hgi-stroke hgi-search-01" style={{ fontSize: '19px', color: '#6B7488' }} />
                  <input placeholder={t('shop.search_placeholder')} value={query} onChange={e => setQuery(e.target.value)} className="flex-1 bg-transparent border-none text-ink text-[14.5px] font-pjs outline-none" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {CATS.map(c => (
                    <button key={c} onClick={() => setFilter(c)} className={`px-4 py-2.5 rounded-[11px] border font-semibold text-[13.5px] cursor-pointer font-pjs transition-all duration-200 hover:scale-[1.04] active:scale-[0.96] ${filter === c ? 'bg-primary text-[#04140F] border-primary' : 'bg-panel text-ink-soft border-ea-border'}`}>{c}</button>
                  ))}
                </div>
              </div>
              {visible.length === 0 ? (
                <div className="text-center py-16 text-ink-faint">
                  <i className="hgi-stroke hgi-search-remove" style={{ fontSize: '40px' }} />
                  <div className="mt-3 text-[15px]">{t('shop.no_results')}</div>
                </div>
              ) : (
                <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {visible.map(p => (
                    <div key={p.id} onClick={() => goProduct(p.id)} className="group cursor-pointer rounded-ea bg-panel border border-ea-border overflow-hidden flex flex-col hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(47,196,159,.1)] hover:border-primary transition-all duration-300">
                      <div className="aspect-[16/10] relative overflow-hidden" style={{ background: p.cover, display: 'grid', placeItems: 'center' }}>
                        <i className={`hgi-stroke hgi-${p.icon} transition-transform duration-500 group-hover:scale-110`} style={{ fontSize: '46px', color: 'rgba(255,255,255,.9)' }} />
                        <span className="absolute top-3 left-3 px-2.5 py-1.5 rounded-[8px] bg-[rgba(7,10,20,.55)] backdrop-blur-md text-[11px] font-bold tracking-[.05em] uppercase text-white">{p.level}</span>
                        {p.badge && <span className="absolute top-3 right-3 px-2.5 py-1.5 rounded-[8px] bg-gold text-[#1a1400] text-[11px] font-extrabold">{p.badge}</span>}
                      </div>
                      <div className="p-[18px] pt-4 flex flex-col flex-1">
                        <div className="text-[11.5px] font-bold text-primary tracking-[.06em] uppercase mb-1.5">{p.category}</div>
                        <div className="font-sora font-bold text-[17px] leading-tight mb-1">{p.title}</div>
                        <div dir="rtl" className="font-amiri text-base text-ink-soft mb-2.5">{p.titleAr}</div>
                        <p className="text-[13px] text-ink-soft leading-relaxed mb-4">{p.blurb}</p>
                        <div className="mt-auto flex items-center gap-3.5 text-[12.5px] text-ink-faint mb-3.5">
                          <span className="inline-flex items-center gap-1.5"><i className="hgi-stroke hgi-play-circle" style={{ fontSize: '15px' }} /> {t('shop.lessons', { count: p.lessons })}</span>
                          <span className="inline-flex items-center gap-1.5"><i className="hgi-stroke hgi-clock-01" style={{ fontSize: '15px' }} /> {p.hours}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="font-sora font-extrabold text-[22px]">RM{p.price}</span>
                            {p.oldPrice > 0 && <span className="text-[13px] text-ink-faint line-through">RM{p.oldPrice}</span>}
                          </div>
                          <button onClick={(e) => handleAddItem(p.id, e)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-primary text-[#04140F] font-bold text-[13px] border-none cursor-pointer font-pjs hover:scale-[1.06] active:scale-[0.95] transition-all duration-200">
                            <i className="hgi-stroke hgi-add-01" style={{ fontSize: '16px' }} /> Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Product Detail */}
          {view === 'product' && active && (
            <>
              <button onClick={goCatalog} className="group inline-flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] border border-ea-border bg-panel text-ink-soft text-[13.5px] font-semibold cursor-pointer font-pjs hover:text-ink transition-colors mb-6">
                <i className="hgi-stroke hgi-arrow-left-01 transition-transform duration-200 group-hover:-translate-x-1" style={{ fontSize: '17px' }} /> {t('shop.back_to_shop')}
              </button>
              <div ref={productRef} className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-10 items-start">
                <div>
                  <div className="aspect-[16/11] rounded-[20px] relative flex items-center justify-center mb-4 overflow-hidden" style={{ background: active.cover }}>
                    <i className={`hgi-stroke hgi-${active.icon}`} style={{ fontSize: '70px', color: 'rgba(255,255,255,.92)' }} />
                    <span className="absolute bottom-3.5 left-3.5 px-3 py-1.5 rounded-[9px] bg-[rgba(7,10,20,.55)] backdrop-blur-md text-xs font-bold text-white">{active.level} · {active.lessons} lessons</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {active.highlights.map((h, i) => (
                      <div key={i} className="group p-4 rounded-[13px] bg-panel border border-ea-border-soft text-center hover:border-primary/30 transition-colors duration-200">
                        <i className={`hgi-stroke hgi-${h.icon} group-hover:scale-110 transition-transform duration-200`} style={{ fontSize: '22px', color: '#2FC49F' }} />
                        <div className="text-[12.5px] text-ink-soft mt-2 leading-tight">{h.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-primary tracking-[.08em] uppercase mb-2.5">{active.category}</div>
                  <h1 className="font-sora font-extrabold text-[34px] tracking-tight leading-tight mb-1.5">{active.title}</h1>
                  <p dir="rtl" className="font-amiri text-[22px] text-gold mb-4.5">{active.titleAr}</p>
                  <p className="text-[15.5px] text-ink-soft leading-relaxed mb-5">{active.desc}</p>
                  <div className="flex items-baseline gap-2.5 mb-5">
                    <span className="font-sora font-extrabold text-[40px]">RM{active.price}</span>
                    {active.oldPrice > 0 && <span className="text-[17px] text-ink-faint line-through">RM{active.oldPrice}</span>}
                    <span className="text-[13.5px] text-ink-soft">{t('shop.one_time')}</span>
                  </div>
                  <div className="flex gap-3 mb-6">
                    <button onClick={() => { addItem(active.id); goCheckout() }} className="flex-1 py-4 rounded-[13px] bg-primary text-[#04140F] font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border-none cursor-pointer font-pjs">{t('dashboard.buy_now')}</button>
                    <button onClick={() => handleAddItem(active.id)} className="px-5 py-4 rounded-[13px] border border-ea-border bg-panel text-ink font-bold text-base hover:border-primary hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer font-pjs inline-flex items-center gap-2">
                      <i className="hgi-stroke hgi-shopping-cart-add-01" style={{ fontSize: '19px' }} /> {t('dashboard.add_to_cart')}
                    </button>
                  </div>
                  <div className="rounded-[15px] bg-panel border border-ea-border p-5">
                    <div className="font-sora font-bold text-[15px] mb-3.5">{t('shop.what_inside')}</div>
                    <div className="flex flex-col gap-[11px]">
                      {active.curriculum.map((c, i) => (
                        <div key={i} className="flex gap-2.5 text-sm text-ink-soft leading-normal">
                          <i className="hgi-stroke hgi-tick-02 shrink-0 mt-0.5" style={{ fontSize: '18px', color: '#2FC49F' }} /><span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Checkout */}
          {view === 'checkout' && (
            <>
              <button onClick={goCatalog} className="group inline-flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] border border-ea-border bg-panel text-ink-soft text-[13.5px] font-semibold cursor-pointer font-pjs hover:text-ink transition-colors mb-5">
                <i className="hgi-stroke hgi-arrow-left-01 transition-transform duration-200 group-hover:-translate-x-1" style={{ fontSize: '17px' }} /> {t('shop.continue_shopping')}
              </button>
              <h1 className="font-sora font-extrabold text-[34px] tracking-tight mb-6">{t('shop.checkout_title')}</h1>

              {count === 0 && !paid && (
                <div className="text-center py-[70px] rounded-[18px] bg-panel border border-dashed border-ea-border">
                  <i className="hgi-stroke hgi-shopping-cart-01" style={{ fontSize: '48px', color: '#6B7488' }} />
                  <div className="font-sora font-bold text-[19px] mt-3.5 mb-1.5">{t('shop.empty_cart')}</div>
                  <p className="text-[14.5px] text-ink-soft mb-5">{t('shop.empty_cart_desc')}</p>
                  <button onClick={goCatalog} className="px-6 py-3 rounded-xl bg-primary text-[#04140F] font-bold text-[15px] border-none cursor-pointer font-pjs hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">{t('shop.go_to_shop')}</button>
                </div>
              )}

              {paid && (
                <div ref={successRef} className="text-center py-16 rounded-[18px] bg-[rgba(47,196,159,.07)] border border-[rgba(47,196,159,.25)]">
                  <span className="w-[76px] h-[76px] rounded-full bg-[rgba(47,196,159,.16)] inline-grid place-items-center text-primary ea-pulse-glow">
                    <i className="hgi-stroke hgi-checkmark-circle-02" style={{ fontSize: '42px' }} />
                  </span>
                  <div className="font-sora font-extrabold text-[26px] mt-4.5 mb-1.5">{t('shop.payment_success')}</div>
                  <p className="text-[15px] text-ink-soft mb-2">{t('shop.receipt_sent')}</p>
                  <p className="text-[13px] text-ink-faint mb-6">{t('shop.receipt_ref', { ref: payRef, method: methods.find(m => m.id === payMethod)?.label })}</p>
                  <Link to="/dashboard" className="inline-block px-6 py-3 rounded-xl bg-primary text-[#04140F] font-bold text-[15px] no-underline hover:scale-[1.03] active:scale-[0.98] transition-all duration-200">{t('shop.start_learning')}</Link>
                </div>
              )}

              {count > 0 && !paid && (
                <div ref={checkoutRef} className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6 items-start">
                  <div className="flex flex-col gap-5">
                    {/* Cart items */}
                    <div className="rounded-2xl bg-panel border border-ea-border p-2">
                      {cartProducts.map(p => (
                        <div key={p.id} className="flex items-center gap-4 p-3.5 group/item">
                          <span className="w-[60px] h-[60px] shrink-0 rounded-[12px] grid place-items-center group-hover/item:scale-105 transition-transform duration-200" style={{ background: p.cover }}>
                            <i className={`hgi-stroke hgi-${p.icon}`} style={{ fontSize: '26px', color: 'rgba(255,255,255,.9)' }} />
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-[14.5px]">{p.title}</div>
                            <div className="text-[12.5px] text-ink-faint">{p.category} · {p.level}</div>
                          </div>
                          <span className="font-sora font-bold text-base">RM{p.price}</span>
                          <button onClick={() => removeItem(p.id)} className="w-[34px] h-[34px] rounded-[9px] border border-ea-border bg-transparent text-ink-faint cursor-pointer grid place-items-center hover:text-[#F06A6A] hover:border-[rgba(240,106,106,.4)] hover:scale-110 transition-all duration-200">
                            <i className="hgi-stroke hgi-delete-02" style={{ fontSize: '17px' }} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Details form */}
                    <div className="rounded-2xl bg-panel border border-ea-border p-5">
                      <div className="font-sora font-bold text-base mb-4">{t('shop.your_details')}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <div className="text-[12.5px] font-semibold text-ink-soft mb-1.5">Full name</div>
                          <input placeholder="Ahmad Faiz" className="w-full px-3.5 py-3 rounded-[11px] bg-[rgba(255,255,255,.03)] border border-ea-border text-ink text-sm font-pjs focus:border-primary focus:outline-none transition-colors duration-200" />
                        </div>
                        <div>
                          <div className="text-[12.5px] font-semibold text-ink-soft mb-1.5">Email</div>
                          <input placeholder="you@email.com" className="w-full px-3.5 py-3 rounded-[11px] bg-[rgba(255,255,255,.03)] border border-ea-border text-ink text-sm font-pjs focus:border-primary focus:outline-none transition-colors duration-200" />
                        </div>
                        <div>
                          <div className="text-[12.5px] font-semibold text-ink-soft mb-1.5">Phone</div>
                          <input placeholder="01X-XXX XXXX" className="w-full px-3.5 py-3 rounded-[11px] bg-[rgba(255,255,255,.03)] border border-ea-border text-ink text-sm font-pjs focus:border-primary focus:outline-none transition-colors duration-200" />
                        </div>
                      </div>
                    </div>

                    {/* Payment method */}
                    <div className="rounded-2xl bg-panel border border-ea-border p-5">
                      <div className="font-sora font-bold text-base mb-1">{t('shop.payment_method')}</div>
                      <p className="text-[12.5px] text-ink-faint mb-4">{t('shop.secured_by')}</p>
                      <div className="flex flex-col gap-2.5">
                        {methods.map(m => (
                          <button key={m.id} onClick={() => setPayMethod(m.id)} className={`flex items-center gap-3.5 p-4 rounded-xl border text-left w-full cursor-pointer font-pjs transition-all duration-200 hover:scale-[1.01] ${payMethod === m.id ? 'bg-[rgba(47,196,159,.07)] border-primary shadow-[0_0_20px_rgba(47,196,159,.08)]' : 'bg-panel border-ea-border'}`}>
                            <span className="w-10 h-10 rounded-[10px] bg-panel-2 grid place-items-center text-ink-soft">
                              <i className={`hgi-stroke hgi-${m.icon}`} style={{ fontSize: '21px' }} />
                            </span>
                            <div className="flex-1"><div className="font-bold text-[14.5px] text-ink">{m.label}</div><div className="text-[12.5px] text-ink-faint">{m.desc}</div></div>
                            <span className="w-5 h-5 rounded-full border-2 grid place-items-center transition-colors duration-200" style={{ borderColor: payMethod === m.id ? '#2FC49F' : '#6B7488' }}>
                              <span className="w-2.5 h-2.5 rounded-full transition-colors duration-200" style={{ background: payMethod === m.id ? '#2FC49F' : 'transparent' }} />
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Order summary */}
                  <div className="sticky top-24 rounded-2xl bg-panel border border-ea-border p-6">
                    <div className="font-sora font-bold text-base mb-4.5">{t('shop.order_summary')}</div>
                    <div className="flex flex-col gap-2.5 mb-4">
                      {cartProducts.map(p => (
                        <div key={p.id} className="flex justify-between text-[13.5px] text-ink-soft gap-3">
                          <span className="min-w-0">{p.title}</span>
                          <span className="shrink-0 text-ink">RM{p.price}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-[13.5px] text-ink-soft py-3 border-t border-ea-border-soft">
                      <span>{t('shop.subtotal')}</span><span>RM{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-[13.5px] text-ink-soft pb-3.5">
                      <span>{t('shop.processing_fee')}</span><span>RM0.00</span>
                    </div>
                    <div className="flex justify-between items-baseline py-3.5 border-t border-ea-border">
                      <span className="font-bold text-[15px]">Total</span>
                      <span className="font-sora font-extrabold text-[26px]">RM{subtotal}</span>
                    </div>
                    <button onClick={payNow} className="w-full py-4 rounded-[13px] bg-primary text-[#04140F] font-bold text-base mt-1.5 border-none cursor-pointer font-pjs inline-flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                      <i className="hgi-stroke hgi-shield-01" style={{ fontSize: '19px' }} /> {t('shop.pay_btn', { amount: subtotal })}
                    </button>
                    <div className="text-center text-xs text-ink-faint mt-3.5 leading-relaxed">{t('shop.redirect_note')}</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
