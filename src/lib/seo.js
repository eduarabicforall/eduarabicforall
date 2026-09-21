import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export const SITE_URL = 'https://eduarabicforall.com'
export const SITE_NAME = 'EduArabic for All'
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`

// Title + description for every public route. The static <head> in index.html
// carries the home-page copy for crawlers that don't run JavaScript; this table
// keeps the tab title and shared-link tags right as visitors navigate.
const HOME = {
  title: 'EduArabic for All | Learn Arabic with Modules & AI Ustaz',
  description:
    'Physical Arabic modules with audio lessons and a dedicated AI Ustaz for every module. Listen, speak and repeat — a new-age way to learn Arabic, made in Malaysia.',
}

const ROUTE_META = {
  '/': HOME,
  '/shop': {
    title: 'Shop Arabic Learning Modules | EduArabic for All',
    description:
      'Browse physical Arabic modules with audio lessons and a dedicated AI Ustaz. Each module ships with an activation code that unlocks its digital content.',
  },
  '/about': {
    title: 'About Us | EduArabic for All',
    description:
      'EduArabic for All builds physical Arabic modules brought to life by audio lessons and an AI Ustaz, developed with Arabic language educators in Malaysia.',
  },
  '/contact': {
    title: 'Contact Us | EduArabic for All',
    description: 'Questions about an order, an activation code or our modules? Get in touch with the EduArabic for All team.',
  },
  '/terms': {
    title: 'Terms & Conditions | EduArabic for All',
    description: 'The terms that apply when you buy or use EduArabic for All modules, audio lessons and AI Ustaz.',
  },
  '/privacy': {
    title: 'Privacy Policy | EduArabic for All',
    description: 'How EduArabic for All collects, uses and protects your personal information.',
  },
  '/refund': {
    title: 'Refund Policy | EduArabic for All',
    description: 'Our refund and return policy for physical modules and activation codes.',
  },
}

// Anything not listed above (account, learning, checkout, admin pages and unknown
// URLs) is treated as private/transactional and kept out of search results —
// robots.txt also disallows most of these paths.

function upsert(selector, create, attrs) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement(create)
    document.head.appendChild(el)
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
  return el
}

// Writes a page's SEO tags into <head>: title, description, canonical, robots
// and the Open Graph / Twitter tags.
export function applyMeta({ title, description, path, image = DEFAULT_IMAGE, noindex = false, type = 'website' }) {
  const url = `${SITE_URL}${path === '/' ? '/' : path}`
  document.title = title
  upsert('meta[name="description"]', 'meta', { name: 'description', content: description })
  upsert('link[rel="canonical"]', 'link', { rel: 'canonical', href: url })
  upsert('meta[name="robots"]', 'meta', {
    name: 'robots',
    content: noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
  })
  const og = { 'og:title': title, 'og:description': description, 'og:url': url, 'og:image': image, 'og:type': type }
  Object.entries(og).forEach(([property, content]) =>
    upsert(`meta[property="${property}"]`, 'meta', { property, content }),
  )
  const tw = { 'twitter:title': title, 'twitter:description': description, 'twitter:image': image }
  Object.entries(tw).forEach(([name, content]) => upsert(`meta[name="${name}"]`, 'meta', { name, content }))
}

// Mount once inside the Router — sets the tags for the current route.
export function RouteMeta() {
  const { pathname } = useLocation()
  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname
    const known = ROUTE_META[path]
    if (known) {
      applyMeta({ ...known, path })
    } else if (path.startsWith('/product/')) {
      // Placeholder until the product loads — Product.jsx then sets the real title/description.
      applyMeta({ ...ROUTE_META['/shop'], title: `Arabic Module | ${SITE_NAME}`, path })
    } else {
      // Private areas and unknown URLs: keep out of search results.
      applyMeta({ title: SITE_NAME, description: HOME.description, path, noindex: true })
    }
  }, [pathname])
  return null
}

// For pages whose tags depend on loaded data (e.g. a product): call with the
// values once they're known. Runs after RouteMeta, so it wins.
export function usePageMeta(meta) {
  const key = meta ? JSON.stringify(meta) : ''
  useEffect(() => {
    if (meta) applyMeta(meta)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}

// JSON-LD block that lives only while the calling page is mounted.
export function useJsonLd(data) {
  const key = data ? JSON.stringify(data) : ''
  useEffect(() => {
    if (!data) return
    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.text = key
    document.head.appendChild(el)
    return () => el.remove()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}
