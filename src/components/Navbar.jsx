import { useEffect, useState } from 'react'
import { TransitionLink } from './TransitionNavLink.jsx'
import { NAV_LINKS } from '../data/landing.js'
import Icon from './Icon.jsx'
import { useAuth } from '../context/AuthContext.jsx'

// Icons for the mobile menu, keyed by the section each link points to.
const MENU_ICONS = {
  '#how': 'checkmark-circle-02',
  '#modules': 'shopping-bag-02',
  '#ai': 'sparkles',
  '#reviews': 'star',
}

// Responsive layout:
//   < sm   logo · dashboard (if signed in) · menu button   (Sign in / Sign Up live in the menu)
//   sm–md  logo · Sign in · Sign Up · menu button
//   md+    logo · inline links · Sign in · Sign Up    (menu button hidden)
// Below md the links don't fit on one line, so the menu button opens a
// full-screen sheet: logo + close on top, the links with icons, and the
// account buttons pinned to the bottom.
export default function Navbar() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  // Esc closes the sheet, and the page behind it doesn't scroll while it's open.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open])

  // Close the sheet if the viewport grows past the breakpoint where it's hidden.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = (e) => e.matches && setOpen(false)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const close = () => setOpen(false)

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-light-ink/10 bg-white/90 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 px-[5vw] py-3 sm:py-[18px] md:px-[6vw]">
          <TransitionLink to="/" className="flex-shrink-0">
            <img src="/logo.png" alt="EduArabic for All" className="h-8 w-auto sm:h-9" />
          </TransitionLink>

          <nav className="hidden items-center gap-5 md:flex lg:gap-7" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="whitespace-nowrap text-sm font-medium text-light-inkSoft hover:text-light-ink"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-shrink-0 items-center gap-2 sm:gap-2.5">
            {user ? (
              <TransitionLink
                to="/dashboard"
                aria-label="Go to dashboard"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-light-ink/15 text-light-ink"
              >
                <Icon name="dashboard-square-01" size={18} />
              </TransitionLink>
            ) : (
              <>
                <TransitionLink
                  to="/auth"
                  className="hidden whitespace-nowrap px-3 py-2 text-sm font-semibold text-light-ink sm:block"
                >
                  Sign in
                </TransitionLink>
                <TransitionLink
                  to="/auth?view=signup"
                  className="hidden whitespace-nowrap rounded-xl bg-primary px-[18px] py-2.5 text-sm font-bold text-white sm:block"
                >
                  Sign Up
                </TransitionLink>
              </>
            )}

            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-light-ink/15 text-light-ink md:hidden"
            >
              <Icon name="menu-01" size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu sheet — a sibling of the header (not inside it) because the
          header's backdrop-blur would otherwise trap position:fixed inside it. */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="animate-sheet-in fixed inset-0 z-50 flex flex-col bg-white md:hidden"
        >
          <div className="flex items-center justify-between border-b border-light-ink/10 px-[5vw] py-3">
            <TransitionLink to="/" onClick={close} className="flex-shrink-0">
              <img src="/logo.png" alt="EduArabic for All" className="h-8 w-auto" />
            </TransitionLink>
            <button
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-light-ink/15 text-light-ink"
            >
              <Icon name="cancel-01" size={20} />
            </button>
          </div>

          <nav aria-label="Menu" className="flex-1 overflow-y-auto px-[4vw] py-3">
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault()
                close()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="mb-1 flex items-center gap-3.5 rounded-xl bg-[#F1F6FD] px-4 py-3.5 text-[15px] font-bold text-[#0B2A4A]"
            >
              <Icon name="home-01" size={19} />
              Home
            </a>
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={close}
                className="flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-[15px] font-semibold text-light-inkSoft"
              >
                <Icon name={MENU_ICONS[link.href] || 'folder-01'} size={19} />
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-3 border-t border-light-ink/10 px-[5vw] pb-6 pt-4">
            {user ? (
              <TransitionLink
                to="/dashboard"
                onClick={close}
                className="rounded-pill bg-primary py-3.5 text-center text-[15px] font-bold text-white"
              >
                Go to dashboard
              </TransitionLink>
            ) : (
              <>
                <TransitionLink
                  to="/auth"
                  onClick={close}
                  className="rounded-pill border border-light-ink/15 bg-white py-3.5 text-center text-[15px] font-semibold text-light-ink"
                >
                  Sign in
                </TransitionLink>
                <TransitionLink
                  to="/auth?view=signup"
                  onClick={close}
                  className="rounded-pill bg-primary py-3.5 text-center text-[15px] font-bold text-white shadow-[0_8px_24px_rgba(61,125,216,.3)]"
                >
                  Sign Up
                </TransitionLink>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
