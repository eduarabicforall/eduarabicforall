import { Link } from 'react-router-dom'
import { NAV_LINKS } from '../data/landing.js'
import Icon from './Icon.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-20 border-b border-light-ink/10 bg-white/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-[6vw] py-[18px]">
        <Link to="/" className="flex-shrink-0">
          <img src="/logo.png" alt="EduArabic for All" className="h-8 w-auto sm:h-9" />
        </Link>

        <nav className="hidden items-center gap-7 sm:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-light-inkSoft hover:text-light-ink">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {user ? (
            <Link
              to="/dashboard"
              aria-label="Go to dashboard"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-light-ink/15 text-light-ink"
            >
              <Icon name="dashboard-square-01" size={18} />
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                aria-label="Sign in"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-light-ink/15 text-light-ink sm:hidden"
              >
                <Icon name="login-01" size={18} />
              </Link>
              <Link to="/auth" className="hidden px-4 py-2 text-sm font-semibold text-light-ink sm:block">
                Sign in
              </Link>
              <Link
                to="/auth?view=signup"
                className="rounded-xl bg-primary px-4 py-2.5 text-[13.5px] font-bold text-[#0B2A4A] sm:px-[18px] sm:text-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
