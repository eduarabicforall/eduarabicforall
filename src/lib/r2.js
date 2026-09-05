import { supabase } from './supabase'

const WORKER_URL = import.meta.env.VITE_R2_WORKER_URL

/**
 * Ask the Cloudflare Worker gatekeeper for a short-lived, signed URL to a
 * video stored in the private R2 bucket. Never construct/expose the raw R2
 * URL on the client — see supabase/functions & the R2 Worker for the token
 * flow (issue -> media, HTTP Range streaming).
 */
export async function getSecureVideoUrl(r2Key) {
  if (!WORKER_URL) {
    throw new Error('VITE_R2_WORKER_URL is not configured yet')
  }
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(`${WORKER_URL}/issue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token ?? ''}`,
    },
    body: JSON.stringify({ key: r2Key }),
  })
  if (!res.ok) throw new Error('Failed to issue video token')
  const { url } = await res.json()
  return url
}
