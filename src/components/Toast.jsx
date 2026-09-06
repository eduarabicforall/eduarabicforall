import Icon from './Icon.jsx'

export default function Toast({ message }) {
  if (!message) return null
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-primary/[.35] bg-app-surface px-5 py-3.5 text-sm font-semibold text-app-ink shadow-[0_12px_30px_rgba(0,0,0,.45)]">
      <Icon name="checkmark-circle-02" size={16} className="text-primary" />
      {message}
    </div>
  )
}
