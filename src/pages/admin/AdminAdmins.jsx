import { useState } from 'react'
import { useAdmin } from '../../context/AdminContext.jsx'

export default function AdminAdmins() {
  const { admins, adminsLoading, addAdmin, removeAdmin } = useAdmin()
  const [email, setEmail] = useState('')

  function handleAdd(e) {
    e.preventDefault()
    addAdmin(email)
    setEmail('')
  }

  return (
    <div>
      <h1 className="mb-1.5 font-sora text-2xl font-extrabold">Manage admins</h1>
      <p className="mb-6 text-[12.5px] text-app-inkFaint">
        Adding an email here only grants admin access the next time that person signs up — it does not retroactively
        promote someone who already has an account.
      </p>

      <form onSubmit={handleAdd} className="mb-6 flex flex-col gap-2.5 sm:flex-row">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          type="email"
          className="flex-1 rounded-[11px] border border-app-border bg-app-panel2 px-3.5 py-2.5 text-[13.5px] text-app-ink placeholder:text-app-inkFaint sm:max-w-[340px]"
        />
        <button type="submit" className="rounded-[11px] bg-primary px-5 py-2.5 text-[13.5px] font-bold text-[#0B2A4A]">
          Add admin
        </button>
      </form>

      {adminsLoading ? (
        <div className="text-sm text-app-inkFaint">Loading…</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-app-border bg-app-panel">
          <table className="w-full min-w-[420px] border-collapse">
            <thead>
              <tr className="border-b border-app-border bg-app-panel">
                <th className="px-3.5 py-3.5 text-left text-[11.5px] font-bold tracking-wide text-app-inkFaint">Email</th>
                <th className="px-3.5 py-3.5 text-left text-[11.5px] font-bold tracking-wide text-app-inkFaint">Added</th>
                <th className="px-3.5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.email} className="border-t border-app-border">
                  <td className="px-3.5 py-3.5 text-[13px]">{a.email}</td>
                  <td className="px-3.5 py-3.5 text-[13px] text-app-inkFaint">{a.added}</td>
                  <td className="px-3.5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => removeAdmin(a.email)}
                      className="rounded-lg border border-app-border px-3 py-1.5 text-xs text-app-inkSoft"
                    >
                      Remove
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
