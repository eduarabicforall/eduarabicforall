import { supabase } from './supabase.js'

// Enforces "one signed-in device per account". Each device that signs in
// claims a random id onto its own profiles.session_id row; every open tab
// then polls that same row to make sure it still owns it. When another
// device signs in and overwrites the column, this device's next check
// notices the mismatch and it gets signed out.
const DEVICE_KEY = 'eduarabic-device-session'
export const DEVICE_CHECK_INTERVAL_MS = 25_000

function readDeviceId() {
  try {
    return localStorage.getItem(DEVICE_KEY) || ''
  } catch {
    return ''
  }
}

function writeDeviceId(id) {
  try {
    localStorage.setItem(DEVICE_KEY, id)
  } catch {
    // storage unavailable — enforcement just won't persist across reloads
  }
}

// Called on sign-out so a later sign-in (even on this same browser) starts
// a fresh claim instead of silently reusing the old device id.
export function clearDeviceId() {
  try {
    localStorage.removeItem(DEVICE_KEY)
  } catch {
    // ignore
  }
}

// This browser has no device id yet — first time signing in here, or right
// after a sign-out. Claims the account for this device (which will sign any
// other device out on its next check).
async function claimSession(userId) {
  const id = crypto.randomUUID()
  writeDeviceId(id)
  // Guard against two tabs of the *same* browser both claiming at once
  // (localStorage writes aren't atomic across tabs): give the other tab a
  // moment to write first, then defer to whichever id is stored.
  await new Promise((resolve) => setTimeout(resolve, 50))
  const winner = readDeviceId() || id
  await supabase
    .from('profiles')
    .update({ session_id: winner, session_started_at: new Date().toISOString() })
    .eq('id', userId)
  return winner
}

// Returns:
//   'ok'      — this device still owns the session (or the check failed and
//               we're erring on the side of not signing anyone out)
//   'claimed' — this device just took ownership (first run here, or the
//               account had no session on record yet)
//   'kicked'  — another device has since taken ownership
export async function checkDeviceSession(userId) {
  const localId = readDeviceId()
  const { data, error } = await supabase.from('profiles').select('session_id').eq('id', userId).maybeSingle()
  if (error || !data) return 'ok' // don't sign anyone out over a network hiccup

  if (!localId) {
    await claimSession(userId)
    return 'claimed'
  }
  if (!data.session_id) {
    // Pre-existing session from before this feature shipped — adopt this
    // device as the owner rather than treating it as a conflict.
    await supabase
      .from('profiles')
      .update({ session_id: localId, session_started_at: new Date().toISOString() })
      .eq('id', userId)
    return 'ok'
  }
  return data.session_id === localId ? 'ok' : 'kicked'
}
