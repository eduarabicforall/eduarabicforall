import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const SHIPPING = 6

export default function Checkout() {
  const { state } = useLocation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [provider, setProvider] = useState('bayarcash')
  const [form, setForm] = useState({ fullName: '', phone: '', address: '' })
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    if (!state?.productId) return navigate('/shop')
    supabase.from('products').select('*').eq('id', state.productId).single().then(({ data }) => setProduct(data))
  }, [state])

  if (!product) return null
  const total = Number(product.price) + SHIPPING

  async function placeOrder(e) {
    e.preventDefault()
    setPlacing(true)
    const { data: order, error } = await supabase.from('orders').insert({
      user_id: user.id,
      total,
      payment_provider: provider,
      shipping_address: form,
    }).select().single()

    if (!error) {
      await supabase.from('order_items').insert({ order_id: order.id, product_id: product.id, quantity: 1, price: product.price })
      // Redirect to the chosen gateway's checkout — actual redirect/session
      // creation happens in a Supabase Edge Function (bayarcash/toyyibpay),
      // stubbed here until real gateway keys are configured.
      navigate('/checkout/done', { state: { orderId: order.id } })
    }
    setPlacing(false)
  }

  return (
    <div className="min-h-screen bg-app-bg px-5 py-6 max-w-lg mx-auto">
      <h1 className="font-title font-extrabold text-2xl mb-5">Checkout</h1>

      <div className="bg-app-panel border border-app-border rounded-card p-4 mb-4 flex items-center justify-between">
        <span className="text-sm">{product.name}</span>
        <span className="text-sm font-semibold">RM{Number(product.price).toFixed(2)}</span>
      </div>

      <form onSubmit={placeOrder} className="flex flex-col gap-3">
        <Input label="Full name" required value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
        <Input label="Phone" required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        <Input label="Address" required value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />

        <p className="text-xs text-app-inkSoft mt-2 mb-1">Payment method</p>
        <div className="flex gap-3">
          {['bayarcash', 'toyyibpay'].map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => setProvider(p)}
              className={`flex-1 rounded-xl py-3 border text-sm font-semibold capitalize ${provider === p ? 'bg-app-primary/20 border-app-primary' : 'border-app-border bg-app-panel2'}`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="border-t border-app-border mt-4 pt-4 flex flex-col gap-1 text-sm">
          <div className="flex justify-between"><span className="text-app-inkSoft">Subtotal</span><span>RM{Number(product.price).toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-app-inkSoft">Shipping</span><span>RM{SHIPPING.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-base mt-1"><span>Total</span><span>RM{total.toFixed(2)}</span></div>
        </div>

        <Button type="submit" disabled={placing} className="w-full mt-3">{placing ? 'Placing order…' : 'Place order'}</Button>
      </form>
    </div>
  )
}
