// Signs a user out after 15 minutes with no interaction on this device.
// Elapsed time is measured against a real wall-clock timestamp in
// localStorage (not a running JS timer), so it still fires correctly even
// after the tab was backgrounded and the browser throttled its timers.
const LAST_ACTIVE_KEY = 'eduarabic-last-active'
export const IDLE_LIMIT_MS = 15 * 60 * 1000

const CHECK_INTERVAL_MS = 15_000
const WRITE_THROTTLE_MS = 5_000
const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart']

function markActive() {
  try {
    localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()))
  } catch {
    // storage unavailable — the timeout just won't survive a reload
  }
}

function readLastActive() {
  try {
    const v = Number(localStorage.getItem(LAST_ACTIVE_KEY))
    return v || Date.now()
  } catch {
    return Date.now()
  }
}

// Wires activity listeners for this tab and calls `onIdle` once the device
// has been untouched for IDLE_LIMIT_MS. Returns a cleanup function.
export function startIdleWatch(onIdle) {
  markActive()
  let lastWrite = 0

  function onActivity() {
    const now = Date.now()
    if (now - lastWrite < WRITE_THROTTLE_MS) return
    lastWrite = now
    markActive()
  }
  ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, onActivity, { passive: true }))

  function check() {
    if (Date.now() - readLastActive() > IDLE_LIMIT_MS) onIdle()
  }
  function onVisibilityChange() {
    if (document.visibilityState !== 'visible') return
    markActive() // opening/returning to the tab counts as touching the device
    check()
  }
  document.addEventListener('visibilitychange', onVisibilityChange)
  const interval = setInterval(check, CHECK_INTERVAL_MS)

  return () => {
    ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, onActivity))
    document.removeEventListener('visibilitychange', onVisibilityChange)
    clearInterval(interval)
  }
}
