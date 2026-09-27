// Gatekeeper for the private R2 bucket that holds module audio.
//
//   POST /sign   { key }   Authorization: Bearer <Supabase access token>
//        -> { url, expires }   a short-lived signed link to the file
//   GET  /a/<key>?exp=..&sig=..
//        -> streams the R2 object (HTTP Range aware, so seeking works)
//
// Who may get a link for `key`:
//   - an admin (any file that exists in the bucket), or
//   - a signed-in student whose Supabase row-level security lets them see an
//     audio_tracks row with storage_path = key, i.e. they activated that module.
// Supabase does that check for us: we query with the caller's own token.
//
// Bindings: AUDIO (R2), SIGNING_SECRET (secret), SUPABASE_URL, SUPABASE_ANON_KEY.

const LINK_TTL_SECONDS = 60 * 60

const enc = new TextEncoder()

function allowedOrigin(origin) {
  if (!origin) return null
  if (origin === 'https://eduarabicforall.com' || origin === 'https://www.eduarabicforall.com') return origin
  if (/^https:\/\/([a-z0-9-]+\.)?eduarabicforall\.pages\.dev$/.test(origin)) return origin
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return origin
  return null
}

function corsHeaders(req) {
  const origin = allowedOrigin(req.headers.get('Origin'))
  const h = { Vary: 'Origin' }
  if (origin) {
    h['Access-Control-Allow-Origin'] = origin
    h['Access-Control-Allow-Methods'] = 'GET, HEAD, POST, OPTIONS'
    h['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, Range'
    h['Access-Control-Expose-Headers'] = 'Content-Range, Accept-Ranges, Content-Length'
  }
  return h
}

function json(req, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...corsHeaders(req) },
  })
}

function b64url(bytes) {
  let s = ''
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlToBytes(str) {
  const s = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4)
  const bin = atob(s)
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

function hmacKey(env, usage) {
  return crypto.subtle.importKey('raw', enc.encode(env.SIGNING_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, [usage])
}

async function sign(env, key, exp) {
  const mac = await crypto.subtle.sign('HMAC', await hmacKey(env, 'sign'), enc.encode(`${key}\n${exp}`))
  return b64url(mac)
}

async function verify(env, key, exp, sig) {
  try {
    return await crypto.subtle.verify('HMAC', await hmacKey(env, 'verify'), b64urlToBytes(sig), enc.encode(`${key}\n${exp}`))
  } catch {
    return false
  }
}

// Keys are plain bucket paths like "Bahasa Arab Pemula/Unit 1/track.mp3".
function cleanKey(raw) {
  if (typeof raw !== 'string') return null
  const key = raw.trim().replace(/^\/+/, '')
  if (!key || key.length > 500 || key.includes('..') || key.includes('\\')) return null
  return key
}

async function supabase(env, path, jwt) {
  const res = await fetch(`${env.SUPABASE_URL}${path}`, {
    headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${jwt}` },
  })
  return res
}

async function handleSign(req, env) {
  const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')
  if (!jwt) return json(req, { error: 'not_authenticated' }, 401)

  const body = await req.json().catch(() => null)
  const key = cleanKey(body?.key)
  if (!key) return json(req, { error: 'invalid_key' }, 400)

  const userRes = await supabase(env, '/auth/v1/user', jwt)
  if (!userRes.ok) return json(req, { error: 'not_authenticated' }, 401)
  const user = await userRes.json()

  const profileRes = await supabase(env, `/rest/v1/profiles?id=eq.${user.id}&select=role`, jwt)
  const profile = profileRes.ok ? (await profileRes.json())[0] : null
  const isAdmin = profile?.role === 'admin'

  if (!isAdmin) {
    // RLS only returns this row if the caller has activated the track's module.
    const trackRes = await supabase(
      env,
      `/rest/v1/audio_tracks?storage_path=eq.${encodeURIComponent(key)}&select=id&limit=1`,
      jwt,
    )
    const tracks = trackRes.ok ? await trackRes.json() : []
    if (!Array.isArray(tracks) || tracks.length === 0) return json(req, { error: 'not_authorized' }, 403)
  }

  if (!(await env.AUDIO.head(key))) return json(req, { error: 'not_found' }, 404)

  const exp = Math.floor(Date.now() / 1000) + LINK_TTL_SECONDS
  const sig = await sign(env, key, exp)
  const url = `${new URL(req.url).origin}/a/${encodeURIComponent(key)}?exp=${exp}&sig=${sig}`
  return json(req, { url, expires: exp })
}

async function handleFile(req, env, url) {
  const key = cleanKey(decodeURIComponent(url.pathname.slice('/a/'.length)))
  const exp = Number(url.searchParams.get('exp'))
  const sig = url.searchParams.get('sig')
  if (!key || !exp || !sig || exp < Date.now() / 1000 || !(await verify(env, key, exp, sig))) {
    return new Response('Forbidden', { status: 403, headers: corsHeaders(req) })
  }

  const object = await env.AUDIO.get(key, { range: req.headers, onlyIf: req.headers })
  if (!object) return new Response('Not found', { status: 404, headers: corsHeaders(req) })

  const headers = new Headers(corsHeaders(req))
  object.writeHttpMetadata(headers)
  if (!headers.get('Content-Type')) headers.set('Content-Type', 'audio/mpeg')
  headers.set('ETag', object.httpEtag)
  headers.set('Accept-Ranges', 'bytes')
  headers.set('Cache-Control', 'private, max-age=3600')

  if (!('body' in object)) return new Response(null, { status: 304, headers }) // conditional request matched

  let status = 200
  if (req.headers.has('Range') && object.range) {
    const r = object.range
    const offset = 'suffix' in r ? object.size - r.suffix : (r.offset ?? 0)
    const length = 'suffix' in r ? r.suffix : (r.length ?? object.size - offset)
    headers.set('Content-Range', `bytes ${offset}-${offset + length - 1}/${object.size}`)
    headers.set('Content-Length', String(length))
    status = 206
  } else {
    headers.set('Content-Length', String(object.size))
  }
  return new Response(req.method === 'HEAD' ? null : object.body, { status, headers })
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url)
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(req) })
    if (req.method === 'POST' && url.pathname === '/sign') return handleSign(req, env)
    if ((req.method === 'GET' || req.method === 'HEAD') && url.pathname.startsWith('/a/')) return handleFile(req, env, url)
    return new Response('Not found', { status: 404 })
  },
}
