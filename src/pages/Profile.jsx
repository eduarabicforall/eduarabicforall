import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import PasswordInput from '../components/PasswordInput.jsx'
import Star from '../components/Star.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'

function initials(name) {
  return (name || 'S')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function Profile() {
  const { user, signOut, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [savingName, setSavingName] = useState(false)
  const [nameMessage, setNameMessage] = useState('')

  const [showChangePassword, setShowChangePassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  async function saveName(e) {
    e.preventDefault()
    if (!fullName.trim()) return
    setSavingName(true)
    setNameMessage('')
    const { error } = await supabase.from('profiles').update({ full_name: fullName.trim() }).eq('id', user.id)
    setSavingName(false)
    if (error) {
      setNameMessage(error.message)
      return
    }
    await refreshUser()
    setNameMessage('Saved.')
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
    setShowChangePassword(false)
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <AppShell>
      <div className="flex items-center gap-3 px-5 pb-1.5 pt-5.5 pt-[22px]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-app-border bg-app-panel2"
        >
          <Icon name="arrow-left-01" size={16} className="text-app-inkSoft" />
        </button>
        <div className="font-poppins text-base font-extrabold">Profile settings</div>
      </div>

      <div className="flex flex-col gap-4 px-5 py-4">
        <div className="flex items-center gap-3.5 rounded-2xl border border-app-border bg-app-panel p-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-soft font-poppins text-base font-extrabold text-[#0B2A4A]">
            {initials(user?.fullName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14.5px] font-bold">{user?.fullName}</div>
            <div className="truncate text-xs text-app-inkFaint">{user?.email}</div>
          </div>
        </div>

        <form onSubmit={saveName} className="flex flex-col gap-2.5 rounded-2xl border border-app-border bg-app-panel p-4">
          <label className="text-xs font-semibold text-app-inkSoft">
            Full name
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1.5 block w-full rounded-[10px] border border-app-border bg-app-panel2 px-3.5 py-2.5 text-[13.5px] text-app-ink"
            />
          </label>
          {nameMessage && <div className="text-[12px] font-semibold text-primary">{nameMessage}</div>}
          <button
            type="submit"
            disabled={savingName}
            className="self-start rounded-[10px] bg-primary px-5 py-2.5 text-[13px] font-bold text-[#0B2A4A] disabled:opacity-60"
          >
            {savingName ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate('/my-reviews')}
          className="flex items-center gap-3 rounded-2xl border border-app-border bg-app-panel p-4 text-left"
        >
          <Star size={18} className="text-gold" />
          <div className="min-w-0 flex-1 text-[13.5px] font-bold">My reviews</div>
          <Icon name="arrow-right-01" size={16} className="text-app-inkFaint" />
        </button>

        {user?.role === 'admin' && (
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="flex items-center gap-3 rounded-2xl border border-primary/[.25] bg-primary/[.06] p-4 text-left"
          >
            <Icon name="shield-user" size={18} className="text-primary" />
            <div className="min-w-0 flex-1 text-[13.5px] font-bold text-primary">Admin console</div>
            <Icon name="arrow-right-01" size={16} className="text-primary" />
          </button>
        )}

        <div className="rounded-2xl border border-app-border bg-app-panel p-4">
          {!showChangePassword ? (
            <button
              type="button"
              onClick={() => setShowChangePassword(true)}
              className="self-start rounded-[10px] border border-app-border bg-app-panel2 px-5 py-2.5 text-[13px] font-semibold text-app-ink"
            >
              Change password
            </button>
          ) : (
            <form onSubmit={updatePassword} className="flex flex-col gap-2.5">
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="rounded-[9px] border border-app-border bg-app-panel2 px-3 py-2.5 text-[13px] text-app-ink placeholder:text-app-inkFaint"
              />
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="rounded-[9px] border border-app-border bg-app-panel2 px-3 py-2.5 text-[13px] text-app-ink placeholder:text-app-inkFaint"
              />
              {passwordError && <div className="text-[12px] font-semibold text-danger">{passwordError}</div>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="rounded-[9px] bg-primary px-4.5 px-[18px] py-2.5 text-xs font-bold text-[#0B2A4A] disabled:opacity-60"
                >
                  {savingPassword ? 'Updating…' : 'Update password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false)
                    setPasswordError('')
                  }}
                  className="rounded-[9px] border border-app-border px-4.5 px-[18px] py-2.5 text-xs text-app-inkSoft"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

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
    </AppShell>
  )
}
