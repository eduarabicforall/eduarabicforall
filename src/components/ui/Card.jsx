export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-app-panel border border-app-border rounded-card p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
