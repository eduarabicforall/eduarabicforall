import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const ModuleTreeContext = createContext(null)

export function formatDuration(totalSeconds) {
  if (!totalSeconds && totalSeconds !== 0) return ''
  const m = Math.floor(totalSeconds / 60)
  const s = Math.round(totalSeconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function parseDurationToSeconds(value) {
  const [m, s] = String(value || '0:00').split(':').map((n) => parseInt(n, 10) || 0)
  return m * 60 + s
}

// modules/units are publicly readable; audio_tracks are only readable once
// the current user has activated that module (or is an admin) — enforced by
// Supabase RLS, so a single query naturally returns only what the signed-in
// user is allowed to see. Admin Manage Materials and the student Audio
// Library both read from this same shared store, so edits made in one show
// up in the other immediately.
async function loadModuleTree() {
  const { data: modules, error: modulesError } = await supabase.from('modules').select('id, name, slug').order('name')
  if (modulesError) throw modulesError

  const { data: units, error: unitsError } = await supabase
    .from('units')
    .select('id, module_id, title, order_index')
    .order('order_index')
  if (unitsError) throw unitsError

  const { data: tracks, error: tracksError } = await supabase
    .from('audio_tracks')
    .select('id, unit_id, title_en, title_ar, storage_path, duration, order_index')
    .order('order_index')
  if (tracksError) throw tracksError

  return modules.map((m) => ({
    id: m.slug,
    dbId: m.id,
    name: m.name,
    units: units
      .filter((u) => u.module_id === m.id)
      .map((u) => ({
        id: u.id,
        title: u.title,
        tracks: tracks
          .filter((t) => t.unit_id === u.id)
          .map((t) => ({
            id: t.id,
            titleEn: t.title_en,
            titleAr: t.title_ar || '',
            duration: formatDuration(t.duration),
            audioUrl: t.storage_path,
          })),
      })),
  }))
}

export function ModuleTreeProvider({ children }) {
  const [moduleTree, setModuleTree] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const tree = await loadModuleTree()
    setModuleTree(tree)
    return tree
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    loadModuleTree()
      .then((tree) => {
        if (active) setModuleTree(tree)
      })
      .catch((err) => console.error('Failed to load module tree', err))
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  async function addModule(name) {
    const base =
      name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'module'
    // Product names repeat often (e.g. every new product starts out named
    // "New product"), so the slug always gets a unique suffix rather than
    // relying on the name alone — `modules.slug` has a unique constraint.
    const slug = `${base}-${Date.now().toString(36)}`
    const { data, error } = await supabase
      .from('modules')
      .insert({ name: name.trim(), slug })
      .select('id, slug')
      .single()
    if (error) throw error
    await refresh()
    return data
  }

  // `.select()` so a delete blocked by RLS (0 rows, no error) is reported
  // instead of looking like it worked.
  async function removeModule(moduleDbId) {
    const { data, error } = await supabase.from('modules').delete().eq('id', moduleDbId).select('id')
    if (error) throw error
    if (!data?.length) throw new Error('Module was not deleted — check your permissions.')
    await refresh()
  }

  async function addUnit(moduleDbId) {
    const { data: existing } = await supabase.from('units').select('id').eq('module_id', moduleDbId)
    const orderIndex = existing?.length || 0
    const { error } = await supabase
      .from('units')
      .insert({ module_id: moduleDbId, title: `Unit ${orderIndex + 1}`, order_index: orderIndex })
    if (error) throw error
    await refresh()
  }

  async function updateUnitTitle(unitId, title) {
    const { error } = await supabase.from('units').update({ title }).eq('id', unitId)
    if (error) throw error
    await refresh()
  }

  async function removeUnit(unitId) {
    const { error } = await supabase.from('units').delete().eq('id', unitId)
    if (error) throw error
    await refresh()
  }

  async function addAudio(unitId, track) {
    const { data: existing } = await supabase.from('audio_tracks').select('id').eq('unit_id', unitId)
    const orderIndex = existing?.length || 0
    const { error } = await supabase.from('audio_tracks').insert({
      unit_id: unitId,
      title_en: track.titleEn,
      title_ar: track.titleAr,
      storage_path: track.audioUrl,
      duration: parseDurationToSeconds(track.duration),
      order_index: orderIndex,
    })
    if (error) throw error
    await refresh()
  }

  async function updateTrack(trackId, track) {
    const { error } = await supabase
      .from('audio_tracks')
      .update({
        title_en: track.titleEn,
        title_ar: track.titleAr,
        storage_path: track.audioUrl,
        duration: parseDurationToSeconds(track.duration),
      })
      .eq('id', trackId)
    if (error) throw error
    await refresh()
  }

  async function removeTrack(trackId) {
    const { error } = await supabase.from('audio_tracks').delete().eq('id', trackId)
    if (error) throw error
    await refresh()
  }

  return (
    <ModuleTreeContext.Provider
      value={{
        moduleTree,
        loading,
        refresh,
        addModule,
        removeModule,
        addUnit,
        addAudio,
        updateUnitTitle,
        removeUnit,
        updateTrack,
        removeTrack,
      }}
    >
      {children}
    </ModuleTreeContext.Provider>
  )
}

export function useModuleTree() {
  const ctx = useContext(ModuleTreeContext)
  if (!ctx) throw new Error('useModuleTree must be used within ModuleTreeProvider')
  return ctx
}
