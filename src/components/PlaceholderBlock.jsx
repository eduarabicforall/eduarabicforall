export default function PlaceholderBlock({ label = '', className = '', style = {}, variant = 'light' }) {
  const pattern =
    variant === 'dark'
      ? 'bg-[repeating-linear-gradient(45deg,rgba(255,255,255,.06)_0_6px,rgba(255,255,255,.02)_6px_12px)]'
      : 'bg-[repeating-linear-gradient(45deg,rgba(20,22,28,.045)_0_10px,rgba(20,22,28,.02)_10px_20px)]'
  const textColor = variant === 'dark' ? 'text-app-inkFaint' : 'text-light-inkFaint'

  return (
    <div className={`flex items-center justify-center ${pattern} ${className}`} style={style}>
      {label && <span className={`px-4 text-center font-mono text-[11px] ${textColor}`}>{label}</span>}
    </div>
  )
}
