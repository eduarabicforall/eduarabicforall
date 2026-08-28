import React from 'react'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  const cols = [
    { title: t('footer.product'), links: ['Features', 'Pricing', 'Shop', 'Audio Library', 'AI Ustaz', 'Classes'] },
    { title: t('footer.company'), links: ['About us', 'Contact', 'Blog', 'Careers'] },
    { title: t('footer.legal'), links: ['Terms & Conditions', 'Privacy Policy', 'Refund Policy'] },
  ]

  return (
    <footer className="border-t border-ea-border-soft bg-[rgba(7,10,20,.6)]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-7 py-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-8 md:gap-8">
        <div>
          <div className="flex items-center mb-3.5">
            <span className="font-sora font-extrabold text-xl text-ink tracking-tight">
              Edu<span className="text-primary">Arabic</span>
            </span>
          </div>
          <p className="text-sm text-ink-faint leading-relaxed max-w-[260px]">
            {t('footer.tagline')}
          </p>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <div className="text-xs font-bold tracking-[.14em] uppercase text-ink-faint mb-4">{col.title}</div>
            <div className="flex flex-col gap-3">
              {col.links.map((l) => (
                <a key={l} href="#" className="text-sm text-ink-soft hover:text-ink transition-colors no-underline">{l}</a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="max-w-[1200px] mx-auto px-5 sm:px-7 py-5 border-t border-ea-border-soft flex flex-wrap justify-between gap-3 text-[13px] text-ink-faint">
        <span>{t('footer.copyright')}</span>
        <span>{t('footer.made_in')}</span>
      </div>
    </footer>
  )
}
