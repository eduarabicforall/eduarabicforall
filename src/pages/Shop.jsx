import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BottomTabBar from '../components/layout/BottomTabBar'
import Card from '../components/ui/Card'
import Icon from '../components/Icon'

export default function Shop() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    supabase.from('products').select('*').eq('is_active', true).eq('on_sale', true)
      .then(({ data }) => setProducts(data ?? []))
  }, [])

  return (
    <div className="app-frame">
      <header className="px-5 pt-6 pb-4">
        <h1 className="font-title font-extrabold text-2xl">Shop</h1>
        <p className="text-app-inkSoft text-sm">Physical modules, shipped to your door.</p>
      </header>

      <main className="flex-1 px-5 pb-6 grid grid-cols-2 gap-3 overflow-y-auto">
        {products.map((p) => (
          <Link key={p.id} to={`/shop/${p.id}`}>
            <Card className="p-3">
              <div className="aspect-square rounded-xl bg-app-primary/10 mb-2 flex items-center justify-center overflow-hidden">
                {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <Icon name="book-02" size={32} className="text-app-primary" />}
              </div>
              <p className="text-sm font-semibold truncate">{p.name}</p>
              <p className="text-sm font-title font-bold text-app-primary">RM{Number(p.price).toFixed(2)}</p>
            </Card>
          </Link>
        ))}
      </main>

      <BottomTabBar />
    </div>
  )
}
