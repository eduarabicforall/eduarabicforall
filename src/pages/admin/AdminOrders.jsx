import { Fragment, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ORDER_FILTERS } from '../../data/adminMock.js'
import { useAdmin } from '../../context/AdminContext.jsx'

export default function AdminOrders() {
  const { orders, ordersLoading, updateOrderShipping } = useAdmin()
  const { status } = useParams()
  const filter = status || 'all'
  const [expandedId, setExpandedId] = useState(null)

  const filtered = orders.filter((o) => filter === 'all' || o.ship === filter)

  return (
    <div>
      <div className="mb-1 text-xs font-bold tracking-wide text-app-inkFaint">ORDERS</div>
      <h1 className="mb-6 font-sora text-2xl font-extrabold">{ORDER_FILTERS.find((f) => f.id === filter)?.label}</h1>

      {ordersLoading ? (
        <div className="text-sm text-app-inkFaint">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-app-border bg-app-panel/60 p-5 text-[12.5px] text-app-inkSoft">
          No orders yet.
        </div>
      ) : (
      <div className="overflow-x-auto rounded-2xl border border-app-border bg-app-panel">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr className="border-b border-app-border bg-app-panel">
              {['Order', 'Customer', 'Total', 'Payment', 'Shipping', ''].map((h) => (
                <th key={h} className="px-3.5 py-3.5 text-left text-[11.5px] font-bold tracking-wide text-app-inkFaint">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <Fragment key={o.id}>
                <tr className="border-t border-app-border">
                  <td className="px-3.5 py-3.5 font-sora text-[13px] font-bold" title={o.id}>
                    #{o.id.slice(0, 8)}
                  </td>
                  <td className="px-3.5 py-3.5 text-[13px] text-app-inkSoft">{o.customer}</td>
                  <td className="px-3.5 py-3.5 text-[13px]">RM{o.total}</td>
                  <td className="px-3.5 py-3.5">
                    <span
                      className={`rounded-pill px-2.5 py-1 text-[11px] font-bold ${
                        o.payment === 'paid' ? 'bg-primary/[.15] text-primary' : 'bg-gold/[.15] text-gold'
                      }`}
                    >
                      {o.payment === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-3.5 py-3.5">
                    <select
                      value={o.ship}
                      onChange={(e) => updateOrderShipping(o.id, e.target.value)}
                      className="rounded-lg border border-app-border bg-app-panel2 px-2.5 py-1.5 text-xs text-app-ink"
                    >
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
                  <td className="px-3.5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                      className="rounded-lg border border-app-border px-3 py-1.5 text-xs text-app-inkSoft"
                    >
                      {expandedId === o.id ? 'Hide' : 'View'}
                    </button>
                  </td>
                </tr>
                {expandedId === o.id && (
                  <tr className="border-t border-app-border bg-app-panel">
                    <td colSpan={6} className="px-3.5 py-3.5">
                      <div className="text-[12.5px] leading-relaxed text-app-inkSoft">
                        <strong className="text-app-ink">Shipping address:</strong> {o.address}
                        <br />
                        <strong className="text-app-ink">Items:</strong> {o.itemsLabel}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  )
}
