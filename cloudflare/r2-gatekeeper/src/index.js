// R2 gatekeeper Worker — fronts the private R2 bucket that holds Grammar
// Topic lesson videos (PRD §9). Grammar is free for every signed-in account,
// so the only check needed is "does this Bearer token belong to a real
// Supabase user" (no per-module activation check, unlike audio content).
//
// Routes:
//   POST /issue        { key }              -> { url }  (short-lived token in KV)
//   GET  /media/<key>?token=...             -> streams the R2 object (HTTP Range aware)
//
// Bindings (wrangler.toml): BUCKET (R2), TOKENS (KV), SUPABASE_URL, SUPABASE_ANON_KEY.

function decodeJwtSub(jwt) {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.sub
  } catch {
    return null
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

async function handleIssue(req, env) {
  const auth = req.headers.get('authorization') || ''
  const jwt = auth.replace('Bearer ', '')
  const uid = decodeJwtSub(jwt)
  if (!uid) {
    return new Response(JSON.stringify({ error: 'not_authenticated' }), { status: 401, headers: corsHeaders() })
  }

  // Confirm the JWT is a real, current Supabase session (not just well-formed).
  const check = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${uid}&select=id`, {
    headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${jwt}` },
  })
  const rows = await check.json().catch(() => [])
  if (!Array.isArray(rows) || rows.length === 0) {
    return new Response(JSON.stringify({ error: 'not_authorized' }), { status: 403, headers: corsHeaders() })
  }

  const { key } = await req.json()
  if (!key) {
    return new Response(JSON.stringify({ error: 'missing_key' }), { status: 400, headers: corsHeaders() })
  }

  const token = crypto.randomUUID()
  await env.TOKENS.put(token, key, { expirationTtl: 300 })

  const url = new URL(req.url)
  const mediaUrl = `${url.origin}/media/${encodeURIComponent(key)}?token=${token}`
  return new Response(JSON.stringify({ url: mediaUrl }), { headers: { 'Content-Type': 'application/json', ...corsHeaders() } })
}

async function handleMedia(req, env, key) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  if (!token) return new Response('Unauthorized', { status: 401 })
  const boundKey = await env.TOKENS.get(token)
  if (!boundKey || boundKey !== key) return new Response('Unauthorized', { status: 401 })

  const range = req.headers.get('range')
  const obj = range
    ? await env.BUCKET.get(key, { range: parseRange(range, undefined) })
    : await env.BUCKET.get(key)
  if (!obj) return new Response('Not found', { status: 404 })

  const headers = new Headers()
  obj.writeHttpMetadata(headers)
  headers.set('etag', obj.httpEtag)
  headers.set('accept-ranges', 'bytes')
  Object.entries(corsHeaders()).forEach(([k, v]) => headers.set(k, v))

  if (range && obj.range) {
    const { offset, length } = obj.range
    headers.set('content-range', `bytes ${offset}-${offset + length - 1}/${obj.size}`)
    return new Response(obj.body, { status: 206, headers })
  }
  return new Response(obj.body, { status: 200, headers })
}

function parseRange(header) {
  const match = /bytes=(\d+)-(\d+)?/.exec(header)
  if (!match) return undefined
  const offset = Number(match[1])
  const end = match[2] ? Number(match[2]) : undefined
  return end !== undefined ? { offset, length: end - offset + 1 } : { offset }
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders() })
    const url = new URL(req.url)

    if (req.method === 'POST' && url.pathname === '/issue') return handleIssue(req, env)
    if (req.method === 'GET' && url.pathname.startsWith('/media/')) {
      const key = decodeURIComponent(url.pathname.slice('/media/'.length))
      return handleMedia(req, env, key)
    }
    return new Response('Not found', { status: 404 })
  },
}
