import { useState } from 'react'
import { TransitionLink } from '../../components/TransitionNavLink.jsx'
import { PRODUCT_FILTERS } from '../../data/adminMock.js'
import { useAdmin } from '../../context/AdminContext.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import R2MockUpload from '../../components/R2MockUpload.jsx'

// PRD §6 issue #6: admin product form now includes an image URL + description,
// missing from the original design canvas mock (name/price/stock only). Image
// is a pasted URL (R2/CDN) rather than a file upload, matching how audio and
// video are handled elsewhere in Admin.
const emptyDraft = { name: '', moduleId: '', price: '', stock: '', description: '', includedText: '', imageUrl: '', imageUrls: [] }

export default function AdminProducts() {
  const { products, productsLoading, addProduct, updateProduct, deleteProduct, showToast, moduleTree } = useAdmin()
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(emptyDraft)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const filtered = products.filter((p) => filter === 'all' || (filter === 'active' ? p.active : !p.active))

  // A product with no matching entry in Manage Materials has nothing to
  // actually unlock when a customer activates it — flag that instead of
  // hiding it.
  function materialFor(moduleDbId) {
    return moduleTree.find((m) => m.dbId === moduleDbId)
  }

  function startEdit(p) {
    setEditingId(p.id)
    setDraft({
      name: p.name,
      moduleId: p.moduleId || '',
      price: p.price,
      stock: p.stock,
      description: p.description || '',
      includedText: (p.included || []).join('\n'),
      imageUrl: p.imageUrl || '',
      imageUrls: p.imageUrls || [],
    })
  }

  function saveEdit() {
    const { includedText, ...rest } = draft
    updateProduct(editingId, {
      ...rest,
      imageUrls: draft.imageUrls.map((u) => u.trim()).filter(Boolean),
      included: includedText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 8),
    })
    setEditingId(null)
    setDraft(emptyDraft)
    showToast('Product saved.')
  }

  const editingProduct = products.find((p) => p.id === editingId)
  const moduleShared =
    editingProduct?.moduleId && products.some((p) => p.id !== editingId && p.moduleId === editingProduct.moduleId)

  async function handleDeleteProduct() {
    setDeleting(true)
    const ok = await deleteProduct(editingId)
    setDeleting(false)
    if (ok) {
      setConfirmingDelete(false)
      setEditingId(null)
      setDraft(emptyDraft)
    }
  }

  return (
    <div>
      <div className="mb-1.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 text-xs font-bold tracking-wide text-app-inkFaint">MANAGE PRODUCTS</div>
          <h1 className="font-poppins text-2xl font-extrabold">
            {PRODUCT_FILTERS.find((f) => f.id === filter)?.label}
          </h1>
        </div>
        <button
          type="button"
          onClick={addProduct}
          className="self-start rounded-[11px] bg-primary px-4.5 px-[18px] py-2.5 text-[13.5px] font-bold text-white"
        >
          + New product
        </button>
      </div>

      <div className="mb-4 mt-3 flex gap-2">
        {PRODUCT_FILTERS.map((f) => (
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

      {productsLoading ? (
        <div className="text-sm text-app-inkFaint">Loading…</div>
      ) : (
      <div className="overflow-x-auto rounded-2xl border border-app-border bg-app-panel">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="border-b border-app-border bg-app-panel">
              {['Product', 'Module', 'Price', 'Stock', 'Status', 'Sell in app', ''].map((h) => (
                <th key={h} className="px-3.5 py-3.5 text-left text-[11.5px] font-bold tracking-wide text-app-inkFaint">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-app-border">
                <td className="px-3.5 py-3.5 text-[13px] font-semibold">{p.name}</td>
                <td className="px-3.5 py-3.5 text-[13px]">
                  <span className="text-app-inkSoft">{p.module}</span>
                  {!materialFor(p.moduleId) && (
                    <span className="ml-1.5 rounded-pill bg-danger/[.15] px-2 py-0.5 text-[10px] font-bold text-danger" title="No matching entry in Manage Materials">
                      unlinked
                    </span>
                  )}
                </td>
                <td className="px-3.5 py-3.5 text-[13px]">RM{p.price}</td>
                <td className="px-3.5 py-3.5 text-[13px] text-app-inkSoft">{p.stock}</td>
                <td className="px-3.5 py-3.5">
                  <button
                    type="button"
                    onClick={() => updateProduct(p.id, { active: !p.active })}
                    className={`rounded-pill px-2.5 py-1 text-[11px] font-bold ${
                      p.active ? 'bg-primary/[.15] text-primary' : 'bg-app-panel2 text-app-inkFaint'
                    }`}
                  >
                    {p.active ? 'Active' : 'Tidak Aktif'}
                  </button>
                </td>
                <td className="px-3.5 py-3.5">
                  <button
                    type="button"
                    onClick={() => updateProduct(p.id, { onSale: !p.onSale })}
                    className={`relative h-[22px] w-[38px] rounded-pill ${p.onSale ? 'bg-primary' : 'bg-app-border'}`}
                  >
                    <div
                      className="absolute top-[3px] h-4 w-4 rounded-full bg-white transition-all"
                      style={{ left: p.onSale ? '19px' : '3px' }}
                    />
                  </button>
                </td>
                <td className="px-3.5 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => startEdit(p)}
                    className="rounded-lg border border-app-border px-3 py-1.5 text-xs text-app-inkSoft"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {editingId !== null && (
        <div className="mt-4.5 mt-[18px] max-w-[440px] rounded-[14px] border border-primary/[.25] bg-app-panel p-4.5 p-[18px]">
          <div className="mb-3 text-[13.5px] font-bold">Edit product</div>

          <label className="mb-2.5 block text-xs font-semibold text-app-inkSoft">
            Image URL (R2/CDN)
            <div className="mt-1.5 flex items-center gap-3">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-app-border bg-app-panel2">
                {draft.imageUrl ? (
                  <img src={draft.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[10px] text-app-inkFaint">No image</span>
                )}
              </div>
              <R2MockUpload
                value={draft.imageUrl}
                onChange={(url) => setDraft((d) => ({ ...d, imageUrl: url }))}
                placeholder="https://images.eduarabic.my/pemula-cover.jpg"
              />
            </div>
          </label>

          <div className="mb-2.5 block text-xs font-semibold text-app-inkSoft">
            Additional preview images (product page gallery)
            <div className="mt-1.5 flex flex-col gap-2">
              {draft.imageUrls.map((url, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-[9px] border border-app-border bg-app-panel2">
                    {url ? (
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[9px] text-app-inkFaint">—</span>
                    )}
                  </div>
                  <R2MockUpload
                    value={url}
                    onChange={(newUrl) =>
                      setDraft((d) => ({
                        ...d,
                        imageUrls: d.imageUrls.map((u, j) => (j === i ? newUrl : u)),
                      }))
                    }
                    placeholder="https://images.eduarabic.my/pemula-2.jpg"
                  />
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, imageUrls: d.imageUrls.filter((_, j) => j !== i) }))}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] border border-app-border text-app-inkFaint"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setDraft((d) => ({ ...d, imageUrls: [...d.imageUrls, ''] }))}
                className="self-start rounded-[9px] border border-app-border px-3 py-1.5 text-[11.5px] font-semibold text-app-inkSoft"
              >
                + Add image
              </button>
            </div>
          </div>

          <label className="mb-2.5 block text-xs font-semibold text-app-inkSoft">
            Name
            <input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              className="mt-1 block w-full rounded-[9px] border border-app-border bg-app-panel2 px-2.5 py-2 text-[13px] text-app-ink"
            />
          </label>

          <label className="mb-2.5 block text-xs font-semibold text-app-inkSoft">
            Module (Manage Materials)
            <select
              value={draft.moduleId}
              onChange={(e) => setDraft((d) => ({ ...d, moduleId: e.target.value }))}
              className="mt-1 block w-full rounded-[9px] border border-app-border bg-app-panel2 px-2.5 py-2 text-[13px] text-app-ink"
            >
              {moduleTree.map((m) => (
                <option key={m.dbId} value={m.dbId}>
                  {m.name}
                </option>
              ))}
            </select>
            <TransitionLink
              to={`/admin/materials/${moduleTree.find((m) => m.dbId === draft.moduleId)?.id || ''}`}
              className="mt-1 inline-block text-[11px] font-semibold text-primary"
            >
              Manage this module's materials →
            </TransitionLink>
          </label>

          <label className="mb-3.5 block text-xs font-semibold text-app-inkSoft">
            Description
            <textarea
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              rows={3}
              className="mt-1 block w-full resize-none rounded-[9px] border border-app-border bg-app-panel2 px-2.5 py-2 text-[13px] text-app-ink"
            />
          </label>

          <label className="mb-3.5 block text-xs font-semibold text-app-inkSoft">
            What's included (shown at checkout)
            <textarea
              value={draft.includedText}
              onChange={(e) => setDraft((d) => ({ ...d, includedText: e.target.value }))}
              rows={4}
              placeholder={'One line per point, e.g.\nInteractive physical book with illustrated dialogues\nAudio Library for self-paced learning'}
              className="mt-1 block w-full resize-none rounded-[9px] border border-app-border bg-app-panel2 px-2.5 py-2 text-[13px] text-app-ink placeholder:text-app-inkFaint"
            />
            <span className="mt-1 block text-[11px] font-normal text-app-inkFaint">
              Each line becomes a ✓ point. Leave empty to show the standard list.
            </span>
          </label>

          <div className="mb-3.5 flex gap-2.5">
            <label className="flex-1 text-xs font-semibold text-app-inkSoft">
              Price (RM)
              <input
                value={draft.price}
                onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
                className="mt-1 block w-full rounded-[9px] border border-app-border bg-app-panel2 px-2.5 py-2 text-[13px] text-app-ink"
              />
            </label>
            <label className="flex-1 text-xs font-semibold text-app-inkSoft">
              Stock
              <input
                value={draft.stock}
                onChange={(e) => setDraft((d) => ({ ...d, stock: e.target.value }))}
                className="mt-1 block w-full rounded-[9px] border border-app-border bg-app-panel2 px-2.5 py-2 text-[13px] text-app-ink"
              />
            </label>
          </div>

          <div className="flex gap-2.5">
            <button type="button" onClick={saveEdit} className="rounded-[9px] bg-primary px-4.5 px-[18px] py-2.5 text-xs font-bold text-white">
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="rounded-[9px] border border-app-border px-4.5 px-[18px] py-2.5 text-xs text-app-inkSoft"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="ml-auto rounded-[9px] border border-danger/40 px-4 py-2.5 text-xs font-semibold text-danger"
            >
              Delete product
            </button>
          </div>
        </div>
      )}
      {confirmingDelete && editingProduct && (
        <ConfirmDialog
          title={`Delete "${editingProduct.name}"?`}
          confirmLabel="Delete product"
          busyLabel="Deleting…"
          busy={deleting}
          onConfirm={handleDeleteProduct}
          onCancel={() => setConfirmingDelete(false)}
        >
          {editingProduct.moduleId && !moduleShared
            ? `This permanently removes the product and its module "${editingProduct.module}" from Manage Materials, including its units and audio tracks. This cannot be undone.`
            : 'This permanently removes the product. Its module stays, because another product still uses it. This cannot be undone.'}
        </ConfirmDialog>
      )}
    </div>
  )
}
