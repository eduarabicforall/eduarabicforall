import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Icon from '../components/Icon'

export default function Profile() {
  const { user, profile, signOut, refreshProfile } = useAuth()
  const toast = useToast()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)

  async function saveProfile(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id)
    if (!error) {
      await refreshProfile()
      toast('Profile updated')
    }
    setSaving(false)
  }

  async function changePassword(e) {
    e.preventDefault()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (!error) { toast('Password updated'); setNewPassword(''); setShowPassword(false) }
  }

  return (
    <div className="min-h-screen bg-app-bg px-5 py-6 max-w-lg mx-auto">
      <Link to="/dashboard" className="text-app-inkFaint text-sm mb-4 inline-flex items-center gap-1">
        <Icon name="arrow-left-01" size={16} /> Dashboard
      </Link>
      <h1 className="font-title font-extrabold text-2xl mb-6">Profile settings</h1>

      <form onSubmit={saveProfile} className="flex flex-col gap-3 mb-6">
        <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Input label="Email" value={user?.email} disabled />
        <Button type="submit" disabled={saving} className="mt-1">Save changes</Button>
      </form>

      <button onClick={() => setShowPassword((s) => !s)} className="text-sm font-semibold text-app-primary mb-3">
        Change password
      </button>
      {showPassword && (
        <form onSubmit={changePassword} className="flex flex-col gap-3 mb-6">
          <Input label="New password" type="password" minLength={6} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <Button type="submit">Update password</Button>
        </form>
      )}

      <Button variant="danger" onClick={signOut} className="w-full">Log out</Button>
    </div>
  )
}
