import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import Icon from '../components/Icon'

export default function Product() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.from('products').select('*').eq('id', id).single().then(({ data }) => setProduct(data))
  }, [id])

  if (!product) return null

  return (
    <div className="min-h-screen bg-app-bg px-5 py-6 max-w-lg mx-auto">
      <Link to="/shop" className="text-app-inkFaint text-sm mb-4 inline-flex items-center gap-1">
        <Icon name="arrow-left-01" size={16} /> Shop
      </Link>

      <div className="aspect-square rounded-card bg-app-primary/10 mb-4 flex items-center justify-center overflow-hidden">
        {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> : <Icon name="book-02" size={64} className="text-app-primary" />}
      </div>

      <h1 className="font-title font-extrabold text-2xl mb-1">{product.name}</h1>
      <p className="text-app-inkSoft text-sm mb-3">Physical card & book set</p>
      <p className="font-title font-extrabold text-2xl text-app-primary mb-4">RM{Number(product.price).toFixed(2)}</p>
      <p className="text-app-inkSoft text-sm mb-4">{product.description}</p>
      <p className="text-xs text-app-inkFaint mb-6 flex items-center gap-1">
        <Icon name="truck-01" size={16} /> Ships within 3–5 business days
      </p>

      <Button onClick={() => navigate('/checkout', { state: { productId: product.id } })} className="w-full">Buy now</Button>
    </div>
  )
}
