const tones = {
  default: 'bg-app-panel2 text-app-inkSoft',
  primary: 'bg-app-primary/15 text-app-primary',
  gold: 'bg-app-gold/15 text-app-gold',
  danger: 'bg-app-danger/15 text-app-danger',
}

export default function Badge({ tone = 'default', className = '', children }) {
  return (
    <span className={`inline-flex items-center rounded-pill px-3 py-1 text-xs font-semibold ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}
