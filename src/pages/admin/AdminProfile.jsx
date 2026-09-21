import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PasswordInput from '../../components/PasswordInput.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAdmin } from '../../context/AdminContext.jsx'

export default function AdminProfile() {
  const { user, signOut } = useAuth()
  const { showToast } = useAdmin()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState(user?.fullName || 'Admin')
  const [email, setEmail] = useState(user?.email || '')
  const [showChangePassword, setShowChangePassword] = useState(false)

  return (
    <div>
      <h1 className="mb-6 font-poppins text-2xl font-extrabold">Profile settings</h1>

      <div className="flex max-w-[480px] flex-col gap-4 rounded-2xl border border-app-border bg-app-panel p-6">
        <div className="mb-1.5 flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-app-panel2 text-lg font-bold">
            {fullName[0]?.toUpperCase()}
          </div>
          <div>
            <div className="text-[14.5px] font-bold">{fullName}</div>
            <div className="text-xs text-app-inkFaint">Admin</div>
          </div>
        </div>

        <label className="text-xs font-semibold text-app-inkSoft">
          Full name
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1.5 block w-full rounded-[10px] border border-app-border bg-app-panel2 px-3.5 py-2.5 text-[13.5px] text-app-ink"
          />
        </label>
        <label className="text-xs font-semibold text-app-inkSoft">
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 block w-full rounded-[10px] border border-app-border bg-app-panel2 px-3.5 py-2.5 text-[13.5px] text-app-ink"
          />
        </label>
        <button
          type="button"
          onClick={() => showToast('Profile updated.')}
          className="mt-0.5 self-start rounded-[11px] bg-primary px-5.5 px-[22px] py-2.5 text-[13.5px] font-bold text-[#0B2A4A]"
        >
          Save changes
        </button>

        <div className="my-1.5 h-px bg-app-panel2" />

        <button
          type="button"
          onClick={() => setShowChangePassword((v) => !v)}
          className="self-start rounded-[11px] border border-app-border bg-app-panel2 px-5 py-2.5 text-[13px] font-semibold text-app-ink"
        >
          Change password
        </button>

        {showChangePassword && (
          <div className="flex flex-col gap-2.5 rounded-xl border border-app-border bg-app-panel p-3.5">
            <PasswordInput
              placeholder="New password"
              className="rounded-[9px] border border-app-border bg-app-panel2 px-3 py-2.5 text-[13px] text-app-ink placeholder:text-app-inkFaint"
            />
            <PasswordInput
              placeholder="Confirm new password"
              className="rounded-[9px] border border-app-border bg-app-panel2 px-3 py-2.5 text-[13px] text-app-ink placeholder:text-app-inkFaint"
            />
            <button
              type="button"
              onClick={() => {
                setShowChangePassword(false)
                showToast('Password updated.')
              }}
              className="self-start rounded-[9px] bg-primary px-4.5 px-[18px] py-2.5 text-xs font-bold text-[#0B2A4A]"
            >
              Update password
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            signOut()
            navigate('/')
          }}
          className="self-start rounded-[11px] border border-danger/30 px-5 py-2.5 text-[13px] font-semibold text-danger"
        >
          Log out
        </button>
      </div>
    </div>
  )
}
