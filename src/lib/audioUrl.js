import { supabase } from './supabase.js'

const WORKER_URL = import.meta.env.VITE_AUDIO_WORKER_URL

// Audio lives in a private R2 bucket. A track's stored value is either a full
// https URL (used as-is, e.g. older entries) or an R2 path such as
// "Bahasa Arab Pemula/Unit 1/track.mp3". For a path we ask the audio Worker
// for a short-lived signed link; it only hands one out to an admin or to a
// student who activated the track's module.
const cache = new Map() // key -> { url, expires (unix seconds) }

export class AudioAccessError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code
  }
}

const MESSAGES = {
  not_found: 'That file is not in the R2 bucket — check the path.',
  not_authorized: "You don't have access to this audio.",
  not_authenticated: 'Please sign in again.',
  invalid_key: 'Enter the file path inside the bucket.',
}

export function isDirectUrl(value) {
  return /^https?:\/\//i.test(String(value || '').trim())
}

export async function resolveAudioUrl(value) {
  const key = String(value || '').trim()
  if (!key) return ''
  if (isDirectUrl(key)) return key
  if (!WORKER_URL) throw new AudioAccessError('not_configured', 'Audio server is not configured.')

  const hit = cache.get(key)
  if (hit && hit.expires - 60 > Date.now() / 1000) return hit.url

  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new AudioAccessError('not_authenticated', MESSAGES.not_authenticated)

  let res
  try {
    res = await fetch(`${WORKER_URL}/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ key }),
    })
  } catch {
    throw new AudioAccessError('network', "Couldn't reach the audio server.")
  }
  const body = await res.json().catch(() => ({}))
  if (!res.ok || !body.url) {
    const code = body.error || 'failed'
    throw new AudioAccessError(code, MESSAGES[code] || "Couldn't load this audio.")
  }
  cache.set(key, { url: body.url, expires: body.expires })
  return body.url
}
