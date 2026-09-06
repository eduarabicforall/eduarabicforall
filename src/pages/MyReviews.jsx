import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import Star from '../components/Star.jsx'
import PlaceholderBlock from '../components/PlaceholderBlock.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'

function StarPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="p-0.5">
          <Star size={22} className={n <= value ? 'text-gold' : 'text-app-inkFaint/40'} />
        </button>
      ))}
    </div>
  )
}

function ReviewCard({ product, review, userId, fullName, onSaved }) {
  const [editing, setEditing] = useState(!review)
  const [rating, setRating] = useState(review?.rating || 5)
  const [comment, setComment] = useState(review?.comment || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save(e) {
    e.preventDefault()
    if (!comment.trim()) {
      setError('Please write a short comment.')
      return
    }
    setError('')
    setSaving(true)
    try {
      if (review) {
        const { error: err } = await supabase
          .from('product_reviews')
          .update({ rating, comment: comment.trim() })
          .eq('id', review.id)
        if (err) throw err
      } else {
        const { error: err } = await supabase.from('product_reviews').insert({
          product_id: product.id,
          user_id: userId,
          reviewer_name: fullName,
          rating,
          comment: comment.trim(),
        })
        if (err) throw err
      }
      setEditing(false)
      onSaved()
    } catch (err) {
      setError(err.message || 'Could not save your review.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-app-border bg-app-panel p-4">
      <div className="mb-3 flex items-center gap-3">
        {product.image_url ? (
          <img src={product.image_url} alt="" className="h-11 w-11 flex-shrink-0 rounded-[11px] object-cover" />
        ) : (
          <PlaceholderBlock variant="dark" label="" className="h-11 w-11 flex-shrink-0 rounded-[11px]" />
        )}
        <div className="min-w-0 flex-1 text-[13.5px] font-bold">{product.name}</div>
      </div>

      {!editing && review ? (
        <>
          <div className="mb-1.5 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={16} className={n <= review.rating ? 'text-gold' : 'text-app-inkFaint/40'} />
            ))}
          </div>
          <p className="mb-2.5 text-[12.5px] leading-relaxed text-app-inkSoft">{review.comment}</p>
          <button type="button" onClick={() => setEditing(true)} className="text-[12px] font-bold text-primary">
            Edit your review
          </button>
        </>
      ) : (
        <form onSubmit={save} className="flex flex-col gap-2.5">
          <StarPicker value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share what you think about this module…"
            rows={3}
            className="resize-none rounded-[11px] border border-app-border bg-app-panel2 px-3.5 py-3 text-[13px] text-app-ink placeholder:text-app-inkFaint"
          />
          {error && <div className="text-[12px] font-semibold text-danger">{error}</div>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-[10px] bg-primary px-4.5 px-[18px] py-2.5 text-xs font-bold text-[#0B2A4A] disabled:opacity-60"
            >
              {saving ? 'Saving…' : review ? 'Save changes' : 'Submit review'}
            </button>
            {review && (
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setRating(review.rating)
                  setComment(review.comment)
                  setError('')
                }}
                className="rounded-[10px] border border-app-border px-4.5 px-[18px] py-2.5 text-xs text-app-inkSoft"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}

export default function MyReviews() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState(null)
  const [reviews, setReviews] = useState({})

  async function load() {
    const { data: items, error: itemsErr } = await supabase
      .from('order_items')
      .select('product_id, products(id, name, image_url), orders!inner(user_id)')
      .eq('orders.user_id', user.id)

    if (itemsErr) {
      console.error('Failed to load purchased products', itemsErr)
      setProducts([])
      return
    }

    const seen = new Map()
    for (const item of items) {
      if (item.products && !seen.has(item.products.id)) seen.set(item.products.id, item.products)
    }
    const purchased = [...seen.values()]
    setProducts(purchased)

    if (purchased.length) {
      const { data: myReviews } = await supabase
        .from('product_reviews')
        .select('id, product_id, rating, comment')
        .eq('user_id', user.id)
      const map = {}
      myReviews?.forEach((r) => {
        map[r.product_id] = r
      })
      setReviews(map)
    }
  }

  useEffect(() => {
    if (user) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return (
    <AppShell>
      <div className="flex items-center gap-3 px-5 pb-1.5 pt-5.5 pt-[22px]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-app-border bg-app-panel2"
        >
          <Icon name="arrow-left-01" size={16} className="text-app-inkSoft" />
        </button>
        <div className="font-sora text-base font-extrabold">My reviews</div>
      </div>

      <div className="flex flex-col gap-3.5 px-5 py-4">
        {products === null && <div className="text-[12.5px] text-app-inkFaint">Loading…</div>}
        {products?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-app-border bg-app-panel/60 p-4 text-[12.5px] text-app-inkSoft">
            You can review a module once you've bought it.
          </div>
        )}
        {products?.map((product) => (
          <ReviewCard
            key={product.id}
            product={product}
            review={reviews[product.id]}
            userId={user.id}
            fullName={user.fullName}
            onSaved={load}
          />
        ))}
      </div>
    </AppShell>
  )
}
