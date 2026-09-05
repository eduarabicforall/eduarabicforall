const variants = {
  primary: 'bg-app-primary text-app-bg hover:brightness-110',
  ghost: 'bg-app-panel text-app-ink border border-app-border hover:bg-app-panel2',
  gold: 'bg-app-gold text-app-bg hover:brightness-110',
  danger: 'bg-app-danger text-white hover:brightness-110',
  outline: 'bg-transparent border border-app-border text-app-ink hover:bg-app-panel',
}

export default function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-pill px-5 py-3 font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
