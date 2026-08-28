import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageToggle from '../LanguageToggle'
import { useCart } from '../../context/CartContext'
import { scrollToId } from '../../lib/utils'

export default function Navbar() {
  const { t } = useTranslation()
  const { count } = useCart()

  const navLinks = [
    { label: t('nav.features'), href: '#features' },
    { label: t('nav.pricing'), href: '#pricing' },
    { to: '/shop', label: t('nav.shop') },
    { label: t('nav.reviews'), href: '#reviews' },
  ]

  return (
    <header className="sticky top-0 z-40 backdrop-blur-[14px] bg-[rgba(7,10,20,.72)] border-b border-ea-border-soft">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-7 py-3 flex items-center gap-6 md:gap-[26px]">
        <Link to="/" className="flex items-center shrink-0">
          <div className="h-[38px] sm:h-[42px] flex items-center">
            <span className="font-sora font-extrabold text-xl sm:text-2xl text-ink tracking-tight">
              Edu<span className="text-primary">Arabic</span>
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex gap-0.5 ms-[18px]">
          {navLinks.map((link) => (
            link.to ? (
              <Link
                key={link.to}
                to={link.to}
                className="px-3.5 py-2 rounded-[9px] text-sm font-medium text-ink-soft hover:text-ink hover:bg-panel-2 transition-colors no-underline"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                onClick={scrollToId(link.href.replace('#', ''))}
                className="px-3.5 py-2 rounded-[9px] text-sm font-medium text-ink-soft hover:text-ink hover:bg-panel-2 transition-colors"
              >
                {link.label}
              </a>
            )
          ))}
        </nav>

        <div className="flex items-center gap-2.5 ms-auto">
          <LanguageToggle />
          <Link to="/shop" className="relative w-[40px] h-[40px] rounded-[11px] border border-ea-border bg-panel grid place-items-center text-ink-soft hover:text-primary hover:border-primary/40 transition-colors no-underline">
            <i className="hgi-stroke hgi-shopping-cart-01" style={{ fontSize: '20px' }} />
            {count > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-[#1a1400] text-[10px] font-extrabold grid place-items-center">{count}</span>}
          </Link>
          <Link to="/auth" className="hidden sm:inline-flex px-5 py-2.5 rounded-[11px] bg-ink text-[#0A0E1A] text-sm font-bold hover:opacity-90 transition-opacity">
            {t('nav.signin')}
          </Link>
        </div>
      </div>
    </header>
  )
}
