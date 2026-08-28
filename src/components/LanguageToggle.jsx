import React from 'react'
import { useTranslation } from 'react-i18next'

export default function LanguageToggle() {
  const { i18n } = useTranslation()
  const current = i18n.language || 'en'

  const toggle = () => {
    i18n.changeLanguage(current === 'en' ? 'ms' : 'en')
  }

  return (
    <button
      onClick={toggle}
      className="px-3 py-1.5 rounded-lg border border-ea-border bg-panel hover:border-primary transition-colors text-sm font-semibold text-ink-soft hover:text-ink"
      title={current === 'en' ? 'Switch to Bahasa Melayu' : 'Tukar ke English'}
    >
      {current === 'en' ? 'BM' : 'EN'}
    </button>
  )
}
