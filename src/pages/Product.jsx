import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTransitionNavigate } from '../components/TransitionNavLink.jsx'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import Star from '../components/Star.jsx'
import PlaceholderBlock from '../components/PlaceholderBlock.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { DEFAULT_IMAGE, SITE_NAME, SITE_URL, useJsonLd, usePageMeta } from '../lib/seo.js'
import { supabase } from '../lib/supabase.js'

function Stars({ value, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= Math.round(value) ? 'text-gold' : 'text-app-inkFaint/40'}
        />
      ))}
    </div>
  )
}

export default function Product() {
  const { productId } = useParams()
  const navigate = useTransitionNavigate()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState(null)
  const [activeImage, setActiveImage] = useState(0)
  const galleryRef = useRef(null)

  useEffect(() => {
    supabase
      .from('products')
      .select('id, name, description, price, image_url, image_urls, included')
      .eq('id', productId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load product', error)
          return
        }
        setProduct(data)
        setActiveImage(0)
      })

    supabase
      .from('product_reviews')
      .select('id, reviewer_name, rating, comment, created_at')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load reviews', error)
          setReviews([])
          return
        }
        setReviews(data)
      })
  }, [productId])

  // Signed-out visitors usually arrive from the landing page, so "back" returns
  // to wherever they came from (or the landing page on a direct link) instead
  // of forcing them into the shop.
  function goBack() {
    if (user) navigate('/shop')
    else if (window.history.state?.idx > 0) navigate(-1)
    else navigate('/')
  }

  // SEO: the tab title / shared-link tags and Product structured data come from
  // the loaded product (must be called before the early return below).
  const seoUrl = product ? `${SITE_URL}/product/${product.id}` : ''
  const seoImages = product ? [product.image_url, ...(product.image_urls || [])].filter(Boolean) : []
  const seoDescription = product
    ? (product.description || `${product.name} — a physical Arabic module with audio lessons and a dedicated AI Ustaz.`).slice(0, 155)
    : ''
  usePageMeta(
    product
      ? {
          title: `${product.name} | ${SITE_NAME}`,
          description: seoDescription,
          path: `/product/${product.id}`,
          image: seoImages[0] || DEFAULT_IMAGE,
        }
      : null,
  )
  const ratingCount = reviews?.length || 0
  useJsonLd(
    product
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: seoDescription,
          image: seoImages.length ? seoImages : [DEFAULT_IMAGE],
          sku: product.id,
          brand: { '@type': 'Brand', name: SITE_NAME },
          offers: {
            '@type': 'Offer',
            url: seoUrl,
            priceCurrency: 'MYR',
            price: Number(product.price).toFixed(2),
            availability: 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition',
          },
          ...(ratingCount > 0 && {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: (reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount).toFixed(1),
              reviewCount: ratingCount,
            },
          }),
        }
      : null,
  )

  if (!product) {
    return (
      <AppShell bare={!user}>
        <div className="p-5 text-sm text-app-inkFaint">Loading…</div>
      </AppShell>
    )
  }

  // The photos sit in a scroll-snap row, so they swipe natively on touch; the
  // arrows and thumbnails scroll the same row, and scrolling updates the active thumbnail.
  function goToImage(i) {
    const el = galleryRef.current
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
    setActiveImage(i)
  }

  function onGalleryScroll(e) {
    const el = e.currentTarget
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (i !== activeImage) setActiveImage(i)
  }

  const gallery = [product.image_url, ...(product.image_urls || [])].filter(Boolean)
  const reviewCount = reviews?.length || 0
  const avgRating = reviewCount
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0

  return (
    <AppShell bare={!user}>
      {!user && (
        <div className="flex items-center px-5 pt-5.5 pt-[22px]">
          <img src="/logo.png" alt="EduArabic for All" className="h-7 w-auto" />
        </div>
      )}
      <div className="flex items-center gap-3 px-5 pb-1.5 pt-5.5 pt-[22px]">
        <button
          type="button"
          onClick={goBack}
          className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-app-border bg-app-panel2"
        >
          <Icon name="arrow-left-01" size={16} className="text-app-inkSoft" />
        </button>
        <div className="font-poppins text-base font-extrabold">Product</div>
      </div>

      <div className="px-5 pb-5 pt-3.5">
        {gallery.length > 1 ? (
          <div className="relative mb-2.5">
            <div
              ref={galleryRef}
              onScroll={onGalleryScroll}
              className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto rounded-2xl"
            >
              {gallery.map((url, i) => (
                <img
                  key={url + i}
                  src={url}
                  alt={`${product.name} — photo ${i + 1} of ${gallery.length}`}
                  draggable={false}
                  className="aspect-[18/25] max-h-[75vh] w-full flex-shrink-0 snap-center bg-app-panel2 object-contain"
                />
              ))}
            </div>
            {activeImage > 0 && (
              <button
                type="button"
                onClick={() => goToImage(activeImage - 1)}
                aria-label="Previous photo"
                className="absolute left-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur"
              >
                <Icon name="arrow-left-01" size={16} />
              </button>
            )}
            {activeImage < gallery.length - 1 && (
              <button
                type="button"
                onClick={() => goToImage(activeImage + 1)}
                aria-label="Next photo"
                className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur"
              >
                <Icon name="arrow-right-01" size={16} />
              </button>
            )}
            <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
              {activeImage + 1} / {gallery.length}
            </div>
          </div>
        ) : gallery.length === 1 ? (
          <img src={gallery[0]} alt={product.name} className="mb-4.5 mb-[18px] aspect-square w-full rounded-2xl bg-app-panel2 object-contain" />
        ) : (
          <PlaceholderBlock variant="dark" label="product photo" className="mb-4.5 mb-[18px] aspect-square rounded-2xl" />
        )}
        {gallery.length > 1 && (
          <div className="mb-4.5 mb-[18px] flex gap-2 overflow-x-auto">
            {gallery.map((url, i) => (
              <button
                key={url + i}
                type="button"
                onClick={() => goToImage(i)}
                className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-[10px] border-2 ${
                  i === activeImage ? 'border-primary' : 'border-transparent'
                }`}
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
        <div className="mb-1 font-poppins text-[19px] font-extrabold">{product.name}</div>

        {reviewCount > 0 && (
          <button
            type="button"
            onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
            className="mb-2.5 flex items-center gap-2"
          >
            <Stars value={avgRating} />
            <span className="text-[12.5px] font-bold text-app-ink">{avgRating.toFixed(1)}</span>
            <span className="text-[12px] text-app-inkFaint underline">
              ({reviewCount} review{reviewCount === 1 ? '' : 's'})
            </span>
          </button>
        )}

        <div className="mb-4 font-poppins text-[22px] font-extrabold text-primary">RM{product.price}</div>
        <p className="mb-4 whitespace-pre-line text-[13.5px] leading-relaxed text-app-inkSoft">
          {product.description ||
            'Includes the printed module and a unique activation code that unlocks the matching Audio Library and AI Ustaz once scanned or entered in the app.'}
        </p>
        {product.included?.length > 0 && (
          <div className="mb-5">
            <div className="mb-2.5 font-poppins text-[14px] font-extrabold">What's included</div>
            <ul className="flex flex-col gap-2">
              {product.included.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-[13.5px] font-semibold leading-snug">
                  <Icon name="checkmark-circle-02" size={18} className="mt-px flex-shrink-0 text-primary" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mb-5 flex gap-2.5 rounded-2xl border border-primary/[.18] bg-primary/[.06] px-3.5 py-3">
          <Icon name="truck" size={18} className="text-primary" />
          <div className="text-xs text-app-inkSoft">Ships within 3–5 business days across Malaysia.</div>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/checkout?product=${product.id}`)}
          className="w-full rounded-[13px] bg-primary py-[15px] text-[15px] font-bold text-white"
        >
          Buy now
        </button>

        <div id="reviews" className="mt-8 border-t border-app-border pt-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="font-poppins text-base font-extrabold">Reviews</div>
            {reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <Stars value={avgRating} size={15} />
                <span className="text-[13px] font-bold text-app-ink">{avgRating.toFixed(1)} / 5</span>
              </div>
            )}
          </div>

          {reviews === null && <div className="text-[12.5px] text-app-inkFaint">Loading reviews…</div>}
          {reviews?.length === 0 && (
            <div className="rounded-2xl border border-dashed border-app-border bg-app-panel/60 p-4 text-[12.5px] text-app-inkSoft">
              No reviews yet for this module.
            </div>
          )}

          <div className="flex flex-col gap-3.5">
            {reviews?.map((r) => (
              <div key={r.id} className="rounded-2xl border border-app-border bg-app-panel p-3.5">
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="text-[13px] font-bold">{r.reviewer_name}</div>
                  <Stars value={r.rating} />
                </div>
                <p className="text-[12.5px] leading-relaxed text-app-inkSoft">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
