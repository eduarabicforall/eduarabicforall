export default function Pill({ active, className = '', children, ...props }) {
  return (
    <button
      className={`rounded-pill px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
        active ? 'bg-app-primary text-app-bg' : 'bg-app-panel text-app-inkSoft border border-app-border'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
