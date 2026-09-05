import { Fragment, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Pill from '../../components/ui/Pill'
import Badge from '../../components/ui/Badge'

const FILTERS = ['All', 'Pending', 'Shipped', 'Delivered']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('All')
  const [expanded, setExpanded] = useState(null)
  const [items, setItems] = useState({})

  async function load() {
    const { data } = await supabase.from('orders').select('*, profiles(full_name, email)').order('created_at', { ascending: false })
    setOrders(data ?? [])
  }
  useEffect(() => { load() }, [])

  async function toggleExpand(order) {
    if (expanded === order.id) return setExpanded(null)
    setExpanded(order.id)
    if (!items[order.id]) {
      const { data } = await supabase.from('order_items').select('*, products(name)').eq('order_id', order.id)
      setItems((i) => ({ ...i, [order.id]: data ?? [] }))
    }
  }

  async function updateShipping(id, status) {
    await supabase.from('orders').update({ shipping_status: status }).eq('id', id)
    load()
  }

  const filtered = orders.filter((o) => filter === 'All' || o.shipping_status === filter.toLowerCase())

  return (
    <div>
      <h1 className="font-title font-extrabold text-2xl mb-6">Orders</h1>
      <div className="flex gap-2 mb-4">
        {FILTERS.map((f) => <Pill key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</Pill>)}
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-app-inkFaint border-b border-app-border">
            <th className="py-2">Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Shipping</th><th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((o) => (
            <Fragment key={o.id}>
              <tr className="border-b border-app-border/50">
                <td className="py-2 font-mono text-xs">{o.id.slice(0, 8)}</td>
                <td>{o.profiles?.full_name ?? o.profiles?.email}</td>
                <td>RM{Number(o.total).toFixed(2)}</td>
                <td><Badge tone={o.payment_status === 'paid' ? 'primary' : 'default'}>{o.payment_status}</Badge></td>
                <td>
                  <select value={o.shipping_status} onChange={(e) => updateShipping(o.id, e.target.value)} className="bg-app-panel2 border border-app-border rounded-pill text-xs px-2 py-1">
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </td>
                <td className="text-right"><button onClick={() => toggleExpand(o)} className="text-app-primary text-xs font-semibold">{expanded === o.id ? 'Hide' : 'View'}</button></td>
              </tr>
              {expanded === o.id && (
                <tr className="bg-app-panel/50">
                  <td colSpan={6} className="p-4">
                    <p className="text-xs text-app-inkFaint mb-2">Shipping address</p>
                    <p className="text-sm mb-3">{o.shipping_address?.fullName} · {o.shipping_address?.phone} · {o.shipping_address?.address}</p>
                    <p className="text-xs text-app-inkFaint mb-2">Items</p>
                    {(items[o.id] ?? []).map((it) => (
                      <p key={it.id} className="text-sm">{it.products?.name} × {it.quantity} — RM{Number(it.price).toFixed(2)}</p>
                    ))}
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
