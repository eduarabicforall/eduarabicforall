import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Icon from '../../components/Icon'

export default function AdminAdmins() {
  const [admins, setAdmins] = useState([])
  const [email, setEmail] = useState('')
  const toast = useToast()

  async function load() {
    const { data } = await supabase.from('admin_allowlist').select('*').order('added_at')
    setAdmins(data ?? [])
  }

  useEffect(() => { load() }, [])

  async function addAdmin(e) {
    e.preventDefault()
    const { error } = await supabase.from('admin_allowlist').insert({ email: email.toLowerCase() })
    if (error) return toast(error.message, 'danger')
    setEmail('')
    toast('Admin added')
    load()
  }

  async function removeAdmin(email) {
    await supabase.from('admin_allowlist').delete().eq('email', email)
    toast('Admin removed')
    load()
  }

  return (
    <div>
      <h1 className="font-title font-extrabold text-2xl mb-1">Manage admins</h1>
      <p className="text-app-inkSoft text-sm mb-6">
        Add an email — that person becomes admin automatically the next time they sign up or log in (no manual password).
      </p>

      <form onSubmit={addAdmin} className="flex gap-2 mb-6 max-w-md">
        <Input placeholder="email@example.com" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1" />
        <Button type="submit">Add admin</Button>
      </form>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-app-inkFaint border-b border-app-border">
            <th className="py-2">Email</th><th className="py-2">Added</th><th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {admins.map((a) => (
            <tr key={a.email} className="border-b border-app-border/50">
              <td className="py-2">{a.email}</td>
              <td className="py-2 text-app-inkFaint">{new Date(a.added_at).toLocaleDateString()}</td>
              <td className="py-2 text-right">
                <button onClick={() => removeAdmin(a.email)} className="text-app-danger"><Icon name="delete-02" size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
