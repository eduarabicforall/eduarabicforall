import { useEffect, useState } from 'react'
import { useAdmin } from '../../context/AdminContext.jsx'
import { supabase } from '../../lib/supabase.js'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'published', label: 'Published' },
  { id: 'hidden', label: 'Hidden' },
]

export default function AdminReviews() {
  const { showToast } = useAdmin()
  const [reviews, setReviews] = useState(null)
  const [filter, setFilter] = useState('all')

  async function load() {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('id, reviewer_name, rating, comment, is_published, created_at, products(name)')
      .order('created_at', { ascending: false })
    if (error) {
      showToast(error.message || 'Could not load reviews.')
      return
    }
    setReviews(data)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function togglePublished(review) {
    const { error } = await supabase
      .from('product_reviews')
      .update({ is_published: !review.is_published })
      .eq('id', review.id)
    if (error) {
      showToast(error.message || 'Could not update review.')
      return
    }
    load()
  }

  async function removeReview(review) {
    if (!window.confirm('Delete this review permanently?')) return
    const { error } = await supabase.from('product_reviews').delete().eq('id', review.id)
    if (error) {
      showToast(error.message || 'Could not delete review.')
      return
    }
    showToast('Review deleted.')
    load()
  }

  const filtered = reviews?.filter((r) =>
    filter === 'all' ? true : filter === 'published' ? r.is_published : !r.is_published
  )

  return (
    <div>
      <div className="mb-1 text-xs font-bold tracking-wide text-app-inkFaint">MODERATE REVIEWS</div>
      <h1 className="mb-1.5 font-sora text-2xl font-extrabold">Product reviews</h1>
      <p className="mb-6 text-[12.5px] text-app-inkFaint">
        Reviews go live immediately when a customer submits one. Hide a review to remove it from the product page
        without deleting it — the customer can still see and edit their own hidden review.
      </p>

      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-pill border px-3.5 py-1.5 text-xs font-bold ${
              filter === f.id ? 'border-primary/40 bg-primary/[.14] text-primary' : 'border-app-border text-app-inkFaint'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {reviews === null ? (
        <div className="text-sm text-app-inkFaint">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-app-border bg-app-panel/60 p-4 text-[12.5px] text-app-inkSoft">
          No reviews here.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-2xl border border-app-border bg-app-panel p-4">
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <div className="text-[13px] font-bold">
                  {r.reviewer_name} <span className="font-normal text-app-inkFaint">on {r.products?.name || '—'}</span>
                </div>
                <span
                  className={`rounded-pill px-2.5 py-1 text-[11px] font-bold ${
                    r.is_published ? 'bg-primary/[.15] text-primary' : 'bg-app-panel2 text-app-inkFaint'
                  }`}
                >
                  {r.is_published ? 'Published' : 'Hidden'}
                </span>
              </div>
              <div className="mb-2 text-[12px] font-semibold text-gold">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
              <p className="mb-3 text-[12.5px] leading-relaxed text-app-inkSoft">{r.comment}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => togglePublished(r)}
                  className="rounded-lg border border-app-border px-3 py-1.5 text-xs text-app-inkSoft"
                >
                  {r.is_published ? 'Hide' : 'Publish'}
                </button>
                <button
                  type="button"
                  onClick={() => removeReview(r)}
                  className="rounded-lg border border-danger/30 px-3 py-1.5 text-xs text-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
