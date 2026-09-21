import { useEffect, useState } from 'react'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import Icon from '../../components/Icon.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAdmin } from '../../context/AdminContext.jsx'
import { functionErrorCode } from '../../lib/functionError.js'
import { supabase } from '../../lib/supabase.js'

const ERROR_TEXT = {
  cannot_target_self: "You can't do that to your own account.",
  cannot_target_admin: "Admin accounts can't be changed here.",
  password_too_short: 'The password must be at least 8 characters.',
  password_too_long: 'The password is too long (max 72 characters).',
  not_authorized: "You don't have permission to do that.",
  user_not_found: 'That user no longer exists.',
}

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

// Letters and digits only, minus look-alikes (0/O, 1/l/I), so it's easy to read out.
function generatePassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const bytes = crypto.getRandomValues(new Uint32Array(length))
  return Array.from(bytes, (n) => chars[n % chars.length]).join('')
}

function SetPasswordDialog({ target, onClose, showToast }) {
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null) // the password that was set, shown once
  const [copied, setCopied] = useState(false)

  async function save(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const { error: err } = await supabase.functions.invoke('admin-users', {
      body: { action: 'set_password', user_id: target.id, password },
    })
    setBusy(false)
    if (err) {
      const code = await functionErrorCode(err)
      setError(ERROR_TEXT[code] || "Couldn't set the password — please try again.")
      return
    }
    setDone(password)
    showToast('Password updated.')
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(done)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={() => !busy && onClose()} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[400px] rounded-2xl border border-app-border bg-app-surface p-6 shadow-[0_20px_60px_rgba(0,0,0,.5)]"
      >
        <div className="mb-1 font-poppins text-lg font-extrabold">Set password</div>
        <div className="mb-4 truncate text-[12.5px] text-app-inkFaint">{target.email}</div>

        {done ? (
          <>
            <div className="mb-2 text-[13px] text-app-inkSoft">
              The new password is below. Share it with the user securely — it won't be shown again.
            </div>
            <div className="mb-4 flex items-center gap-2 rounded-[11px] border border-app-border bg-app-panel2 px-3.5 py-2.5">
              <code className="flex-1 select-all break-all text-[14px] font-semibold">{done}</code>
              <button
                type="button"
                onClick={copy}
                className="flex-shrink-0 rounded-lg border border-app-border px-2.5 py-1 text-[11.5px] font-bold text-app-inkSoft"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-[11px] bg-primary px-5 py-2.5 text-[13.5px] font-bold text-white"
              >
                Done
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={save}>
            <label className="mb-1 block text-xs font-semibold text-app-inkSoft" htmlFor="new-password">
              New password (min. 8 characters)
            </label>
            <div className="mb-2 flex gap-2">
              <input
                id="new-password"
                type={visible ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                autoFocus
                className="min-w-0 flex-1 rounded-[11px] border border-app-border bg-app-panel2 px-3.5 py-2.5 text-[13.5px] text-app-ink"
              />
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? 'Hide password' : 'Show password'}
                className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[11px] border border-app-border text-app-inkSoft"
              >
                <Icon name={visible ? 'eye-off' : 'eye'} size={16} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setPassword(generatePassword())
                setVisible(true)
              }}
              className="mb-4 text-[12px] font-bold text-primary"
            >
              Generate a strong password
            </button>
            {error && <div className="mb-3 text-[12px] font-semibold text-danger">{error}</div>}
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                disabled={busy}
                onClick={onClose}
                className="rounded-[11px] border border-app-border px-4 py-2.5 text-[13.5px] font-semibold text-app-inkSoft disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy || password.length < 8}
                className="rounded-[11px] bg-primary px-4 py-2.5 text-[13.5px] font-bold text-white disabled:opacity-60"
              >
                {busy ? 'Saving…' : 'Set password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function AdminUsers() {
  const { user: me } = useAuth()
  const { showToast } = useAdmin()
  const [users, setUsers] = useState(null) // null = loading
  const [loadError, setLoadError] = useState('')
  const [query, setQuery] = useState('')
  const [passwordFor, setPasswordFor] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [roleChange, setRoleChange] = useState(null) // { user, role }
  const [roleBusy, setRoleBusy] = useState(false)

  async function load() {
    setLoadError('')
    const { data, error } = await supabase.functions.invoke('admin-users', { body: { action: 'list' } })
    if (error || !data?.users) {
      console.error('Failed to load users', error)
      setLoadError("Couldn't load users. Make sure the admin-users function is deployed.")
      setUsers([])
      return
    }
    setUsers(data.users)
  }

  useEffect(() => {
    load()
  }, [])

  async function confirmDelete() {
    setDeleteBusy(true)
    const { error } = await supabase.functions.invoke('admin-users', {
      body: { action: 'delete', user_id: deleting.id },
    })
    setDeleteBusy(false)
    if (error) {
      const code = await functionErrorCode(error)
      showToast(ERROR_TEXT[code] || "Couldn't delete that user.")
      return
    }
    setUsers((list) => list.filter((u) => u.id !== deleting.id))
    setDeleting(null)
    showToast('User deleted.')
  }

  async function confirmRoleChange() {
    const { user: target, role } = roleChange
    setRoleBusy(true)
    const { error } = await supabase.functions.invoke('admin-users', {
      body: { action: 'set_role', user_id: target.id, role },
    })
    setRoleBusy(false)
    if (error) {
      const code = await functionErrorCode(error)
      showToast(ERROR_TEXT[code] || "Couldn't change that user's role.")
      return
    }
    setUsers((list) => list.map((u) => (u.id === target.id ? { ...u, role } : u)))
    setRoleChange(null)
    showToast(role === 'admin' ? `${target.email} is now an admin.` : `${target.email} is no longer an admin.`)
  }

  const needle = query.trim().toLowerCase()
  const visible = (users || []).filter(
    (u) => !needle || u.email.toLowerCase().includes(needle) || u.full_name.toLowerCase().includes(needle),
  )

  return (
    <div>
      <h1 className="mb-1.5 font-poppins text-2xl font-extrabold">Users</h1>
      <p className="mb-5 text-[12.5px] text-app-inkFaint">
        {users ? `${users.length} accounts. ` : ''}Set a new password for a student, delete their account, or make them
        an admin. Admin accounts can only be demoted here — their password and account can't be changed.
      </p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or email…"
        className="mb-4 w-full rounded-[11px] border border-app-border bg-app-panel2 px-3.5 py-2.5 text-[13.5px] text-app-ink placeholder:text-app-inkFaint sm:max-w-[340px]"
      />

      {loadError && <div className="mb-3 text-[12.5px] font-semibold text-danger">{loadError}</div>}

      {users === null ? (
        <div className="text-sm text-app-inkFaint">Loading…</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-app-border bg-app-panel">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-app-border">
                {['User', 'Role', 'Joined', 'Last sign-in', 'Modules', 'Orders', ''].map((h) => (
                  <th key={h} className="px-3.5 py-3.5 text-left text-[11.5px] font-bold tracking-wide text-app-inkFaint">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((u) => {
                const isAdminRow = u.role === 'admin'
                return (
                  <tr key={u.id} className="border-t border-app-border">
                    <td className="px-3.5 py-3">
                      <div className="text-[13px] font-semibold">{u.full_name || '—'}</div>
                      <div className="text-[12px] text-app-inkFaint">{u.email}</div>
                    </td>
                    <td className="px-3.5 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${
                          isAdminRow ? 'bg-primary/10 text-primary' : 'bg-app-panel2 text-app-inkSoft'
                        }`}
                      >
                        {isAdminRow ? 'Admin' : 'Student'}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-[12.5px] text-app-inkFaint">{formatDate(u.created_at)}</td>
                    <td className="px-3.5 py-3 text-[12.5px] text-app-inkFaint">{formatDate(u.last_sign_in_at)}</td>
                    <td className="px-3.5 py-3 text-[13px]">{u.modules}</td>
                    <td className="px-3.5 py-3 text-[13px]">{u.orders}</td>
                    <td className="px-3.5 py-3 text-right">
                      {u.id === me?.id ? (
                        <span className="text-[11.5px] text-app-inkFaint">You</span>
                      ) : isAdminRow ? (
                        <button
                          type="button"
                          onClick={() => setRoleChange({ user: u, role: 'student' })}
                          className="whitespace-nowrap rounded-lg border border-app-border px-3 py-1.5 text-xs font-semibold text-app-inkSoft"
                        >
                          Remove admin
                        </button>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setRoleChange({ user: u, role: 'admin' })}
                            className="whitespace-nowrap rounded-lg border border-app-border px-3 py-1.5 text-xs font-semibold text-app-inkSoft"
                          >
                            Make admin
                          </button>
                          <button
                            type="button"
                            onClick={() => setPasswordFor(u)}
                            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-app-border px-3 py-1.5 text-xs font-semibold text-app-inkSoft"
                          >
                            <Icon name="key-01" size={13} /> Set password
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(u)}
                            aria-label={`Delete ${u.email}`}
                            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-danger/40 text-danger"
                          >
                            <Icon name="delete-02" size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3.5 py-6 text-center text-[12.5px] text-app-inkFaint">
                    {users.length === 0 ? 'No users yet.' : 'No matches.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {passwordFor && (
        <SetPasswordDialog target={passwordFor} onClose={() => setPasswordFor(null)} showToast={showToast} />
      )}

      {roleChange && (
        <ConfirmDialog
          title={roleChange.role === 'admin' ? 'Make this user an admin?' : 'Remove admin access?'}
          confirmLabel={roleChange.role === 'admin' ? 'Make admin' : 'Remove admin'}
          busyLabel="Saving…"
          busy={roleBusy}
          onConfirm={confirmRoleChange}
          onCancel={() => setRoleChange(null)}
        >
          {roleChange.role === 'admin'
            ? `${roleChange.user.email} will get full access to this admin panel, including the ability to manage other users and see all orders.`
            : `${roleChange.user.email} will become a regular student and lose access to the admin panel.`}
        </ConfirmDialog>
      )}

      {deleting && (
        <ConfirmDialog
          title={`Delete ${deleting.full_name || deleting.email}?`}
          confirmLabel="Delete user"
          busyLabel="Deleting…"
          busy={deleteBusy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        >
          This permanently removes the account ({deleting.email}) and everything tied to it: {deleting.modules} activated
          module{deleting.modules === 1 ? '' : 's'}, {deleting.orders} order{deleting.orders === 1 ? '' : 's'}, their
          reviews, saved vocab and AI Ustaz chats. Orders are removed from your sales figures too. This cannot be undone.
        </ConfirmDialog>
      )}
    </div>
  )
}
