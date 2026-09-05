import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Pill from '../../components/ui/Pill'

const FILTERS = ['All', 'Active', 'Inactive']

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [filter, setFilter] = useState('All')
  const [editing, setEditing] = useState(null)
  const toast = useToast()

  async function load() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data ?? [])
  }
  useEffect(() => { load() }, [])

  const filtered = products.filter((p) => filter === 'All' || (filter === 'Active' ? p.is_active : !p.is_active))

  async function toggle(id, field, value) {
    await supabase.from('products').update({ [field]: value }).eq('id', id)
    load()
  }

  async function saveEdit(e) {
    e.preventDefault()
    const { id, name, price, stock, description, image_url } = editing
    const { error } = await supabase.from('products').update({ name, price, stock, description, image_url }).eq('id', id)
    if (error) return toast(error.message, 'danger')
    toast('Product saved')
    setEditing(null)
    load()
  }

  async function uploadImage(file) {
    const path = `products/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('audio').upload(path, file) // shared public bucket
    if (error) return toast(error.message, 'danger')
    const { data } = supabase.storage.from('audio').getPublicUrl(path)
    setEditing((e) => ({ ...e, image_url: data.publicUrl }))
  }

  return (
    <div>
      <h1 className="font-title font-extrabold text-2xl mb-6">Manage products</h1>

      <div className="flex gap-2 mb-4">
        {FILTERS.map((f) => <Pill key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</Pill>)}
      </div>

      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="text-left text-app-inkFaint border-b border-app-border">
            <th className="py-2">Product</th><th>Price</th><th>Stock</th><th>Status</th><th>Sell in-app</th><th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => (
            <tr key={p.id} className="border-b border-app-border/50">
              <td className="py-2">{p.name}</td>
              <td>RM{Number(p.price).toFixed(2)}</td>
              <td>{p.stock}</td>
              <td>
                <button onClick={() => toggle(p.id, 'is_active', !p.is_active)} className={`text-xs rounded-pill px-2 py-1 ${p.is_active ? 'bg-app-primary/15 text-app-primary' : 'bg-app-panel2 text-app-inkFaint'}`}>
                  {p.is_active ? 'Active' : 'Inactive'}
                </button>
              </td>
              <td>
                <button onClick={() => toggle(p.id, 'on_sale', !p.on_sale)} className={`text-xs rounded-pill px-2 py-1 ${p.on_sale ? 'bg-app-primary/15 text-app-primary' : 'bg-app-panel2 text-app-inkFaint'}`}>
                  {p.on_sale ? 'On' : 'Off'}
                </button>
              </td>
              <td><button onClick={() => setEditing(p)} className="text-app-primary text-xs font-semibold">Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <form onSubmit={saveEdit} className="bg-app-panel border border-app-border rounded-card p-5 max-w-md flex flex-col gap-3">
          <p className="font-semibold">Edit product</p>
          <Input label="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
          <Input label="Price (RM)" type="number" step="0.01" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} />
          <Input label="Stock" type="number" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: e.target.value })} />
          <label className="block text-left">
            <span className="block text-xs text-app-inkSoft mb-1.5">Description</span>
            <textarea
              value={editing.description ?? ''}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              className="w-full rounded-xl bg-app-panel2 border border-app-border px-4 py-3 text-sm"
              rows={3}
            />
          </label>
          <label className="block text-left">
            <span className="block text-xs text-app-inkSoft mb-1.5">Image</span>
            <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && uploadImage(e.target.files[0])} />
          </label>
          <div className="flex gap-2 mt-2">
            <Button type="submit">Save changes</Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  )
}
