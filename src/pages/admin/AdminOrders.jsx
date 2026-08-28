import React from 'react'
import { useTranslation } from 'react-i18next'

export default function AdminOrders() {
  const { t } = useTranslation()
  return (
    <div className="p-6 md:p-8">
      <h1 className="font-sora font-extrabold text-2xl tracking-tight mb-6">AdminOrders</h1>
      <div className="rounded-2xl bg-panel border border-ea-border p-8 text-center">
        <i className="hgi-stroke hgi-construction" style={{ fontSize: '48px', color: '#6B7488' }} />
        <div className="font-sora font-bold text-lg mt-4 mb-2">Coming Soon</div>
        <p className="text-sm text-ink-soft">This admin page will be connected to Supabase in Phase 3.</p>
      </div>
    </div>
  )
}
