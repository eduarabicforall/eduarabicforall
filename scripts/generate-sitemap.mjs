// Writes public/sitemap.xml before every build ("prebuild" in package.json).
// Static pages are always listed; on-sale products are added from Supabase
// (public read) so new products appear without editing anything. If Supabase
// can't be reached the sitemap still contains the static pages.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const SITE = 'https://eduarabicforall.com'
const STATIC = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/shop', priority: '0.9', changefreq: 'weekly' },
  { path: '/about', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact', priority: '0.5', changefreq: 'yearly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { path: '/refund', priority: '0.3', changefreq: 'yearly' },
]

function readEnv() {
  const env = { ...process.env }
  if (existsSync('.env.local')) {
    for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
  return env
}

async function fetchProducts(env) {
  const url = env.VITE_SUPABASE_URL
  const key = env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return []
  const res = await fetch(`${url}/rest/v1/products?select=id,created_at&is_active=eq.true&on_sale=eq.true`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  })
  if (!res.ok) throw new Error(`Supabase responded ${res.status}`)
  return res.json()
}

const today = new Date().toISOString().slice(0, 10)
let products = []
try {
  products = await fetchProducts(readEnv())
} catch (err) {
  console.warn(`[sitemap] could not load products (${err.message}) — writing static pages only`)
}

const urls = [
  ...STATIC.map((u) => ({ loc: `${SITE}${u.path}`, lastmod: today, changefreq: u.changefreq, priority: u.priority })),
  ...products.map((p) => ({
    loc: `${SITE}/product/${p.id}`,
    lastmod: (p.created_at || today).slice(0, 10),
    changefreq: 'weekly',
    priority: '0.8',
  })),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
  )
  .join('\n')}
</urlset>
`
writeFileSync('public/sitemap.xml', xml)
console.log(`[sitemap] wrote ${urls.length} URLs (${products.length} products)`)
