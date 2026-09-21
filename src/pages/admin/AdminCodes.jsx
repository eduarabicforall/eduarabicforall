import Icon from '../../components/Icon.jsx'
import { useAdmin } from '../../context/AdminContext.jsx'

// One code per module — every physical copy of that module's book carries
// the same printed code, reused by every buyer (a family can share one
// book and each activate it on their own account). So this page lists one
// row per module rather than a batch-generated list of many codes.
export default function AdminCodes() {
  const { codes, codesLoading, moduleTree, setModuleCode, toggleCode, exportCodesCsv } = useAdmin()

  const rows = moduleTree.map((m) => ({
    module: m,
    code: codes.find((c) => c.moduleId === m.dbId) || null,
  }))

  return (
    <div>
      <div className="mb-1.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-poppins text-2xl font-extrabold">Activation codes</h1>
        <button
          type="button"
          onClick={exportCodesCsv}
          className="flex items-center justify-center gap-1.5 self-start rounded-[10px] border border-app-border px-4 py-2.5 text-[12.5px] text-app-inkSoft"
        >
          <Icon name="download-01" size={14} /> Export CSV
        </button>
      </div>
      <p className="mb-6 text-[12.5px] text-app-inkFaint">
        Each module has one code, printed in every physical copy of that book — anyone who buys it can activate it on
        their own account. Regenerating a code replaces it immediately, so only do that if a code has leaked.
      </p>

      {codesLoading ? (
        <div className="text-sm text-app-inkFaint">Loading…</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-app-border bg-app-panel">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="border-b border-app-border bg-app-panel">
                {['Module', 'Code', 'Activated count', 'Status', ''].map((h) => (
                  <th key={h} className="px-3.5 py-3.5 text-left text-[11.5px] font-bold tracking-wide text-app-inkFaint">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ module, code }) => (
                <tr key={module.dbId} className="border-t border-app-border">
                  <td className="px-3.5 py-3.5 text-[13px] font-semibold">{module.name}</td>
                  <td className="px-3.5 py-3.5 font-poppins text-[13px] font-bold tracking-wide">
                    {code ? code.code : <span className="font-sans font-normal text-app-inkFaint">No code yet</span>}
                  </td>
                  <td className="px-3.5 py-3.5 text-[13px] text-app-inkSoft">{code?.activatedCount ?? '—'}</td>
                  <td className="px-3.5 py-3.5">
                    {code && (
                      <span
                        className={`rounded-pill px-2.5 py-1 text-[11px] font-bold ${
                          code.status === 'active' ? 'bg-primary/[.15] text-primary' : 'bg-app-panel2 text-app-inkFaint'
                        }`}
                      >
                        {code.status === 'active' ? 'Active' : 'Disabled'}
                      </span>
                    )}
                  </td>
                  <td className="px-3.5 py-3.5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setModuleCode(module.dbId)}
                        className="rounded-lg border border-app-border px-3 py-1.5 text-xs text-app-inkSoft"
                      >
                        {code ? 'Regenerate' : 'Generate code'}
                      </button>
                      {code && (
                        <button
                          type="button"
                          onClick={() => toggleCode(code.id, code.status)}
                          className="rounded-lg border border-app-border px-3 py-1.5 text-xs text-app-inkSoft"
                        >
                          {code.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
                      )}
                    </div>
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
