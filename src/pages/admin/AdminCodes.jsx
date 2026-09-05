import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function AdminCodes() {
  const [modules, setModules] = useState([])
  const [moduleId, setModuleId] = useState('')
  const [quantity, setQuantity] = useState(10)
  const [codes, setCodes] = useState([])
  const toast = useToast()

  async function load() {
    const { data: mods } = await supabase.from('modules').select('*').order('name')
    setModules(mods ?? [])
    setModuleId((prev) => prev || mods?.[0]?.id || '')
    const { data } = await supabase.from('module_codes').select('*, modules(name)').order('created_at', { ascending: false })
    setCodes(data ?? [])
  }
  useEffect(() => { load() }, [])

  async function generate(e) {
    e.preventDefault()
    const { error } = await supabase.rpc('generate_module_codes', { p_module_id: moduleId, p_quantity: Number(quantity) })
    if (error) return toast(error.message, 'danger')
    toast('Codes generated')
    load()
  }

  function exportCsv() {
    const rows = [['Code', 'Module', 'Batch', 'Activated', 'Status'], ...codes.map((c) => [c.code, c.modules?.name, c.batch_id, c.activated_count, c.status])]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'activation-codes.csv'
    a.click()
    toast('CSV exported')
  }

  async function toggleStatus(id, status) {
    await supabase.from('module_codes').update({ status: status === 'active' ? 'disabled' : 'active' }).eq('id', id)
    load()
  }

  return (
    <div>
      <h1 className="font-title font-extrabold text-2xl mb-6">Activation codes</h1>

      <form onSubmit={generate} className="flex items-end gap-3 mb-6">
        <label className="block">
          <span className="block text-xs text-app-inkSoft mb-1.5">Module</span>
          <select value={moduleId} onChange={(e) => setModuleId(e.target.value)} className="rounded-xl bg-app-panel2 border border-app-border px-4 py-3 text-sm">
            {modules.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </label>
        <Input label="Quantity" type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <Button type="submit">Generate batch</Button>
        <Button type="button" variant="ghost" onClick={exportCsv}>Export CSV</Button>
      </form>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-app-inkFaint border-b border-app-border">
            <th className="py-2">Code</th><th>Module</th><th>Activated</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          {codes.map((c) => (
            <tr key={c.id} className="border-b border-app-border/50">
              <td className="py-2 font-mono">{c.code}</td>
              <td>{c.modules?.name}</td>
              <td>{c.activated_count}</td>
              <td>{c.status}</td>
              <td className="text-right">
                <button onClick={() => toggleStatus(c.id, c.status)} className="text-app-primary text-xs font-semibold">
                  {c.status === 'active' ? 'Disable' : 'Enable'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
