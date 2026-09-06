import { useState } from 'react'
import Icon from './Icon.jsx'

// A plain <input type="password"> with a show/hide eye toggle. Accepts the
// same props as a normal input (value, onChange, placeholder, className,
// etc.) — `className` styles the input itself, the wrapper is just a
// relative positioning container so the toggle can sit inside it.
export default function PasswordInput({ className = '', wrapperClassName = '', ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={`relative ${wrapperClassName}`}>
      <input {...props} type={visible ? 'text' : 'password'} className={`w-full pr-10 ${className}`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-app-inkFaint"
      >
        <Icon name={visible ? 'eye-off' : 'eye'} size={16} />
      </button>
    </div>
  )
}
