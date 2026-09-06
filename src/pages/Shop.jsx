import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import BottomTabBar from '../components/BottomTabBar.jsx'
import Icon from '../components/Icon.jsx'
import PlaceholderBlock from '../components/PlaceholderBlock.jsx'
import { supabase } from '../lib/supabase.js'

const TABS = [
  { id: 'all', label: 'All Product' },
  { id: 'new', label: 'New Release' },
]

// A product counts as a "new release" for its first 30 days on the shelf —
// there's no separate flag for it, so this is derived from created_at.
const NEW_RELEASE_DAYS = 30

export default function Shop() {
  const navigate = useNavigate()
  const [products, setProducts] = useState(null)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    supabase
      .from('products')
      .select('id, name, description, price, image_url, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load products', error)
          setProducts([])
          return
        }
        setProducts(data)
      })
  }, [])

  const isNewRelease = (p) => Date.now() - new Date(p.created_at).getTime() < NEW_RELEASE_DAYS * 24 * 60 * 60 * 1000
  const visibleProducts = products?.filter((p) => tab === 'all' || isNewRelease(p))

  return (
    <AppShell>
      <div
        className="px-5 pb-4.5 pb-[18px] pt-6.5 pt-[26px]"
        style={{ background: 'linear-gradient(180deg, rgba(61,125,216,.10), transparent)' }}
      >
        <div className="mb-2.5 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-primary/[.15]">
            <Icon name="shopping-bag-02" size={18} className="text-primary" />
          </div>
          <div className="font-sora text-xl font-extrabold">Shop</div>
        </div>
        <div className="text-[12.5px] text-app-inkSoft">Physical modules, delivered to your door.</div>
      </div>

      <div className="flex gap-2 px-5 pt-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-pill border px-3.5 py-1.5 text-xs font-bold ${
              tab === t.id ? 'border-primary/40 bg-primary/[.14] text-primary' : 'border-app-border text-app-inkFaint'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 px-5 pt-4">
        {products === null && <div className="col-span-2 text-[12.5px] text-app-inkFaint">Loading…</div>}
        {products?.length === 0 && (
          <div className="col-span-2 rounded-2xl border border-dashed border-app-border bg-app-panel/60 p-4 text-[12.5px] text-app-inkSoft">
            No products available right now.
          </div>
        )}
        {products && visibleProducts.length === 0 && (
          <div className="col-span-2 rounded-2xl border border-dashed border-app-border bg-app-panel/60 p-4 text-[12.5px] text-app-inkSoft">
            No new releases in the last {NEW_RELEASE_DAYS} days.
          </div>
        )}
        {visibleProducts?.map((p) => (
          <div key={p.id} className="flex flex-col overflow-hidden rounded-2xl border border-app-border bg-app-panel">
            <button type="button" onClick={() => navigate(`/product/${p.id}`)} className="block text-left">
              {p.image_url ? (
                <img src={p.image_url} alt="" className="aspect-square w-full object-cover" />
              ) : (
                <PlaceholderBlock variant="dark" label="" className="aspect-square w-full rounded-none" />
              )}
              <div className="p-3">
                <div className="mb-1 line-clamp-1 text-[13px] font-bold">{p.name}</div>
                <div className="mb-2 line-clamp-2 text-[11px] leading-snug text-app-inkFaint">{p.description}</div>
                <div className="font-sora text-sm font-extrabold text-primary">RM{p.price}</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => navigate(`/checkout?product=${p.id}`)}
              className="mx-3 mb-3 mt-1 rounded-[10px] bg-primary py-2 text-[12.5px] font-bold text-[#0B2A4A]"
            >
              Buy
            </button>
          </div>
        ))}
      </div>

      <BottomTabBar />
    </AppShell>
  )
}
