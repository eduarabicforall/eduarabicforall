import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../Icon'

const LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#modules', label: 'Modules' },
  { href: '#ai-ustaz', label: 'AI Ustaz' },
  { href: '#reviews', label: 'Reviews' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-light-inkFaint/10">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-4">
        <Link to="/" className="font-title font-extrabold text-lg text-light-ink">
          EduArabic
        </Link>

        <nav className="hidden sm:flex items-center gap-8">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-light-inkSoft hover:text-light-ink">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden sm:flex items-center gap-3">
          <Link to="/auth" className="text-sm font-semibold text-light-ink px-4 py-2">Sign in</Link>
          <Link to="/auth?view=signup" className="text-sm font-semibold bg-app-primary text-white rounded-pill px-5 py-2.5">
            Get started
          </Link>
        </div>

        <button
          className="sm:hidden text-light-ink"
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? 'cancel-01' : 'menu-01'} size={26} />
        </button>
      </div>

      {open && (
        <div className="sm:hidden border-t border-light-inkFaint/10 bg-white px-5 py-4 flex flex-col gap-4">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm font-medium text-light-inkSoft">
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-light-inkFaint/10">
            <Link to="/auth" onClick={() => setOpen(false)} className="text-sm font-semibold text-light-ink">Sign in</Link>
            <Link
              to="/auth?view=signup"
              onClick={() => setOpen(false)}
              className="text-sm font-semibold bg-app-primary text-white rounded-pill px-5 py-2.5 text-center"
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
