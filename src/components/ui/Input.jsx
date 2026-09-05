export default function Input({ label, className = '', ...props }) {
  return (
    <label className="block text-left">
      {label && <span className="block text-xs text-app-inkSoft mb-1.5">{label}</span>}
      <input
        className={`w-full rounded-xl bg-app-panel2 border border-app-border px-4 py-3 text-sm text-app-ink placeholder:text-app-inkFaint focus:outline-none focus:border-app-primary ${className}`}
        {...props}
      />
    </label>
  )
}
