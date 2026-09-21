import { useState } from 'react'
import { useTransitionNavigate } from '../../components/TransitionNavLink.jsx'
import PasswordInput from '../../components/PasswordInput.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAdmin } from '../../context/AdminContext.jsx'
import { supabase } from '../../lib/supabase.js'

export default function AdminProfile() {
  const { user, signOut, refreshUser } = useAuth()
  const { showToast } = useAdmin()
  const navigate = useTransitionNavigate()
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  async function saveProfile(e) {
    e.preventDefault()
    const name = fullName.trim()
    const newEmail = email.trim().toLowerCase()
    if (!name || !newEmail) return
    const nameChanged = name !== user.fullName
    const emailChanged = newEmail !== user.email.toLowerCase()

    setSavingProfile(true)
    if (nameChanged) {
      const { error } = await supabase.from('profiles').update({ full_name: name }).eq('id', user.id)
      if (error) {
        setSavingProfile(false)
        showToast(error.message || 'Could not update profile.')
        return
      }
      await refreshUser()
    }
    if (emailChanged) {
      // Supabase emails a confirmation link; the login email only changes once it's opened.
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      if (error) {
        setSavingProfile(false)
        showToast(error.message || 'Could not change email.')
        return
      }
      setPendingEmail(newEmail)
      setEmail(user.email)
    }
    setSavingProfile(false)
    showToast(emailChanged ? 'Confirmation sent — check your inbox.' : 'Profile updated.')
  }

  function closePasswordForm() {
    setShowChangePassword(false)
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError('')
  }

  async function updatePassword(e) {
    e.preventDefault()
    setPasswordError('')
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPassword(false)
    if (error) {
      setPasswordError(error.message)
      return
    }
    closePasswordForm()
    showToast('Password updated.')
  }

  return (
    <div className="mx-auto max-w-[480px]">
      <h1 className="mb-6 font-poppins text-2xl font-extrabold">Profile settings</h1>

      <div className="flex flex-col gap-4 rounded-2xl border border-app-border bg-app-panel p-6">
        <div className="mb-1.5 flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-app-panel2 text-lg font-bold">
            {(user?.fullName || 'A')[0].toUpperCase()}
          </div>
          <div>
            <div className="text-[14.5px] font-bold">{user?.fullName}</div>
            <div className="text-xs text-app-inkFaint">Admin</div>
          </div>
        </div>

        <form onSubmit={saveProfile} className="flex flex-col gap-4">
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
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 block w-full rounded-[10px] border border-app-border bg-app-panel2 px-3.5 py-2.5 text-[13.5px] text-app-ink"
            />
          </label>
          {pendingEmail && (
            <div className="rounded-[10px] border border-primary/[.25] bg-primary/[.06] px-3.5 py-2.5 text-[12px] leading-relaxed text-app-inkSoft">
              We sent a confirmation link to <span className="font-semibold text-app-ink">{pendingEmail}</span> (and to
              your current address if asked). Your login email changes once you open it — until then, keep signing in
              with {user?.email}.
            </div>
          )}
          <button
            type="submit"
            disabled={
              savingProfile ||
              !fullName.trim() ||
              !email.trim() ||
              (fullName.trim() === user?.fullName && email.trim().toLowerCase() === user?.email?.toLowerCase())
            }
            className="mt-0.5 self-start rounded-[11px] bg-primary px-5.5 px-[22px] py-2.5 text-[13.5px] font-bold text-white disabled:opacity-60"
          >
            {savingProfile ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        <div className="my-1.5 h-px bg-app-panel2" />

        <button
          type="button"
          onClick={() => (showChangePassword ? closePasswordForm() : setShowChangePassword(true))}
          className="self-start rounded-[11px] border border-app-border bg-app-panel2 px-5 py-2.5 text-[13px] font-semibold text-app-ink"
        >
          Change password
        </button>

        {showChangePassword && (
          <form onSubmit={updatePassword} className="flex flex-col gap-2.5 rounded-xl border border-app-border bg-app-panel p-3.5">
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="New password (min. 8 characters)"
              className="rounded-[9px] border border-app-border bg-app-panel2 px-3 py-2.5 text-[13px] text-app-ink placeholder:text-app-inkFaint"
            />
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Confirm new password"
              className="rounded-[9px] border border-app-border bg-app-panel2 px-3 py-2.5 text-[13px] text-app-ink placeholder:text-app-inkFaint"
            />
            {passwordError && <div className="text-[12px] font-semibold text-danger">{passwordError}</div>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="rounded-[9px] bg-primary px-4.5 px-[18px] py-2.5 text-xs font-bold text-white disabled:opacity-60"
              >
                {savingPassword ? 'Updating…' : 'Update password'}
              </button>
              <button
                type="button"
                onClick={closePasswordForm}
                className="rounded-[9px] border border-app-border px-4.5 px-[18px] py-2.5 text-xs text-app-inkSoft"
              >
                Cancel
              </button>
            </div>
          </form>
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
