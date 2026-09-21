import { useEffect, useState } from 'react'
import { useAdmin } from '../../context/AdminContext.jsx'
import { supabase } from '../../lib/supabase.js'

const emptyDraft = { code: '', percentOff: '' }

export default function AdminDiscounts() {
  const { showToast } = useAdmin()
  const [codes, setCodes] = useState(null)
  const [draft, setDraft] = useState(emptyDraft)
  const [creating, setCreating] = useState(false)

  async function load() {
    const { data, error } = await supabase
      .from('discount_codes')
      .select('id, code, percent_off, is_active, created_at')
      .order('created_at', { ascending: false })
    if (error) {
      showToast(error.message || 'Could not load discount codes.')
      return
    }
    setCodes(data)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    const code = draft.code.trim().toUpperCase()
    const percentOff = parseFloat(draft.percentOff)
    if (!code || !percentOff || percentOff <= 0 || percentOff > 100) {
      showToast('Enter a code and a percentage between 1 and 100.')
      return
    }
    setCreating(true)
    const { error } = await supabase.from('discount_codes').insert({ code, percent_off: percentOff })
    setCreating(false)
    if (error) {
      showToast(error.code === '23505' ? 'That code already exists.' : error.message || 'Could not create code.')
      return
    }
    showToast('Discount code created.')
    setDraft(emptyDraft)
    load()
  }

  async function toggleActive(dc) {
    const { error } = await supabase.from('discount_codes').update({ is_active: !dc.is_active }).eq('id', dc.id)
    if (error) {
      showToast(error.message || 'Could not update code.')
      return
    }
    load()
  }

  return (
    <div>
      <div className="mb-1 text-xs font-bold tracking-wide text-app-inkFaint">MANAGE DISCOUNT CODES</div>
      <h1 className="mb-1.5 font-poppins text-2xl font-extrabold">Discount codes</h1>
      <p className="mb-6 text-[12.5px] text-app-inkFaint">
        Codes apply a percentage off a single item's price at checkout. Deactivating a code stops new orders from
        using it — it doesn't affect orders already placed.
      </p>

      <form onSubmit={handleCreate} className="mb-6 flex flex-col gap-2.5 sm:flex-row">
        <input
          value={draft.code}
          onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))}
          placeholder="CODE (e.g. RAYA10)"
          className="rounded-[11px] border border-app-border bg-app-panel2 px-3.5 py-2.5 text-[13.5px] text-app-ink placeholder:text-app-inkFaint sm:max-w-[220px]"
        />
        <input
          value={draft.percentOff}
          onChange={(e) => setDraft((d) => ({ ...d, percentOff: e.target.value }))}
          placeholder="% off (e.g. 10)"
          inputMode="numeric"
          className="rounded-[11px] border border-app-border bg-app-panel2 px-3.5 py-2.5 text-[13.5px] text-app-ink placeholder:text-app-inkFaint sm:max-w-[160px]"
        />
        <button
          type="submit"
          disabled={creating}
          className="rounded-[11px] bg-primary px-5 py-2.5 text-[13.5px] font-bold text-white disabled:opacity-60"
        >
          {creating ? 'Creating…' : '+ New code'}
        </button>
      </form>

      {codes === null ? (
        <div className="text-sm text-app-inkFaint">Loading…</div>
      ) : codes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-app-border bg-app-panel/60 p-4 text-[12.5px] text-app-inkSoft">
          No discount codes yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-app-border bg-app-panel">
          <table className="w-full min-w-[520px] border-collapse">
            <thead>
              <tr className="border-b border-app-border bg-app-panel">
                {['Code', '% off', 'Status', 'Created', ''].map((h) => (
                  <th key={h} className="px-3.5 py-3.5 text-left text-[11.5px] font-bold tracking-wide text-app-inkFaint">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {codes.map((dc) => (
                <tr key={dc.id} className="border-t border-app-border">
                  <td className="px-3.5 py-3.5 text-[13px] font-bold">{dc.code}</td>
                  <td className="px-3.5 py-3.5 text-[13px]">{dc.percent_off}%</td>
                  <td className="px-3.5 py-3.5">
                    <span
                      className={`rounded-pill px-2.5 py-1 text-[11px] font-bold ${
                        dc.is_active ? 'bg-primary/[.15] text-primary' : 'bg-app-panel2 text-app-inkFaint'
                      }`}
                    >
                      {dc.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-3.5 py-3.5 text-[13px] text-app-inkFaint">
                    {new Date(dc.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-3.5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => toggleActive(dc)}
                      className="rounded-lg border border-app-border px-3 py-1.5 text-xs text-app-inkSoft"
                    >
                      {dc.is_active ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
