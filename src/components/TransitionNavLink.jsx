import { useLayoutEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

// Page-to-page cross-fades using the View Transitions API.
// BrowserRouter (declarative mode) has no built-in support for it, so
// navigation is wrapped by hand: the browser snapshots the old page, we
// navigate and wait until React has actually committed the new route, then it
// animates old → new (see the ::view-transition rules in index.css).
// Falls back to a plain instant navigation where the API is missing, for
// reduced-motion users, and when the target is the page we're already on.

// Resolved by <ViewTransitionGate/> once the new location has been committed.
let resolvePendingTransition = null

// Mount once inside the Router. Router updates run in a React transition, so
// flushSync can't be used to force the commit inside the transition callback —
// instead the callback awaits this gate.
export function ViewTransitionGate() {
  const location = useLocation()
  useLayoutEffect(() => {
    resolvePendingTransition?.()
    resolvePendingTransition = null
  }, [location])
  return null
}

const canTransition = () =>
  !!document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Drop-in replacement for useNavigate(): same signature — a path, a delta
// like -1, and the usual { replace, state } options — but the route change is
// wrapped in a view transition.
export function useTransitionNavigate() {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()

  return function transitionNavigate(to, options) {
    const isDelta = typeof to === 'number'
    const historyIdx = window.history.state?.idx ?? 0
    const noOp = isDelta ? historyIdx + to < 0 : typeof to !== 'string' || to === pathname + search
    if (noOp || !canTransition()) {
      navigate(to, options)
      return
    }
    document.startViewTransition(
      () =>
        new Promise((resolve) => {
          resolvePendingTransition = resolve
          navigate(to, options)
          // Safety net so a navigation that never commits can't freeze the page.
          setTimeout(resolve, 500)
        }),
    )
  }
}

function useLinkClick(to, onClick) {
  const navigate = useTransitionNavigate()
  return function handleClick(e) {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (typeof to !== 'string' || !canTransition()) return
    e.preventDefault()
    navigate(to)
  }
}

export function TransitionLink({ to, onClick, ...props }) {
  const handleClick = useLinkClick(to, onClick)
  return <Link to={to} onClick={handleClick} {...props} />
}

export default function TransitionNavLink({ to, onClick, ...props }) {
  const handleClick = useLinkClick(to, onClick)
  return <NavLink to={to} onClick={handleClick} {...props} />
}
