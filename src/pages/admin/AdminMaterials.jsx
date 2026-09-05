import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Pill from '../../components/ui/Pill'

export default function AdminMaterials() {
  const [modules, setModules] = useState([])
  const [activeModuleId, setActiveModuleId] = useState(null)
  const [units, setUnits] = useState([])
  const [newUnitTitle, setNewUnitTitle] = useState('')
  const [uploading, setUploading] = useState(null)
  const toast = useToast()

  useEffect(() => {
    supabase.from('modules').select('*').order('name').then(({ data }) => {
      setModules(data ?? [])
      setActiveModuleId(data?.[0]?.id ?? null)
    })
  }, [])

  async function loadUnits(moduleId) {
    const { data: unitList } = await supabase.from('units').select('*, audio_tracks(id)').eq('module_id', moduleId).order('order_index')
    setUnits(unitList ?? [])
  }

  useEffect(() => { if (activeModuleId) loadUnits(activeModuleId) }, [activeModuleId])

  const activeModule = modules.find((m) => m.id === activeModuleId)

  async function addUnit(e) {
    e.preventDefault()
    if (!newUnitTitle.trim()) return
    await supabase.from('units').insert({ module_id: activeModuleId, title: newUnitTitle, order_index: units.length })
    setNewUnitTitle('')
    loadUnits(activeModuleId)
    toast('Unit added')
  }

  async function uploadAudio(unitId, file) {
    setUploading(unitId)
    const path = `${activeModuleId}/${unitId}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('audio').upload(path, file)
    if (error) {
      toast(error.message, 'danger')
    } else {
      await supabase.from('audio_tracks').insert({
        unit_id: unitId,
        title_en: file.name.replace(/\.[^.]+$/, ''),
        storage_path: path,
      })
      toast('Audio uploaded')
      loadUnits(activeModuleId)
    }
    setUploading(null)
  }

  return (
    <div>
      <h1 className="font-title font-extrabold text-2xl mb-6">Manage materials</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {modules.map((m) => (
          <Pill key={m.id} active={activeModuleId === m.id} onClick={() => setActiveModuleId(m.id)}>{m.name}</Pill>
        ))}
      </div>

      {activeModule && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-semibold text-lg">{activeModule.name}</h2>
            {activeModule.is_grammar_free && <Badge tone="gold">FREE</Badge>}
            <span className="text-xs text-app-inkFaint">{units.length} units</span>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            {units.map((u) => (
              <Card key={u.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{u.title}</p>
                  <p className="text-xs text-app-inkFaint">{u.audio_tracks?.length ?? 0} audio tracks</p>
                </div>
                <label className="text-sm font-semibold text-app-primary cursor-pointer">
                  {uploading === u.id ? 'Uploading…' : '+ Audio'}
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    disabled={uploading === u.id}
                    onChange={(e) => e.target.files[0] && uploadAudio(u.id, e.target.files[0])}
                  />
                </label>
              </Card>
            ))}
          </div>

          <form onSubmit={addUnit} className="flex gap-2 max-w-md">
            <Input placeholder="New unit title" value={newUnitTitle} onChange={(e) => setNewUnitTitle(e.target.value)} className="flex-1" />
            <Button type="submit">+ Add unit</Button>
          </form>
        </>
      )}
    </div>
  )
}
