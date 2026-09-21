import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import Icon from '../../components/Icon.jsx'
import { useAdmin } from '../../context/AdminContext.jsx'
import AdminGrammarMaterial from './AdminGrammarMaterial.jsx'

const trackInputClass =
  'rounded-[9px] border border-app-border bg-app-panel2 px-2.5 py-2 text-[13px] text-app-ink placeholder:text-app-inkFaint'

function formatDuration(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = Math.round(totalSeconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

// Audio (like the Grammar lesson video) is hosted on R2 — admin pastes the
// R2/Worker URL rather than uploading a file through this form directly.
// Duration is never typed by hand — it's read straight off the audio file
// itself once the URL resolves, so it can't drift from the real track length.
// Retries once on failure (transient network hiccups happen), and exposes a
// manual `retry()` for the admin if it still can't read the file.
function useAutoDuration(audioUrl, initialDuration) {
  const [duration, setDuration] = useState(initialDuration || '')
  const [status, setStatus] = useState(initialDuration ? 'done' : 'idle') // idle | detecting | done | error
  const lastProbedUrl = useRef(initialDuration ? audioUrl : null)
  const [retryToken, setRetryToken] = useState(0)

  useEffect(() => {
    const url = audioUrl.trim()
    if (!url) {
      setStatus('idle')
      setDuration('')
      return
    }
    if (url === lastProbedUrl.current && retryToken === 0) return

    setStatus('detecting')
    let cancelled = false
    let attempt = 0

    function tryLoad() {
      const probe = new Audio()
      probe.preload = 'metadata'

      const onLoaded = () => {
        if (cancelled) return
        lastProbedUrl.current = url
        cleanup()
        if (isFinite(probe.duration)) {
          setDuration(formatDuration(probe.duration))
          setStatus('done')
        } else {
          setStatus('error')
        }
      }
      const onError = () => {
        if (cancelled) return
        cleanup()
        attempt += 1
        if (attempt < 2) {
          setTimeout(() => {
            if (!cancelled) tryLoad()
          }, 500)
        } else {
          setStatus('error')
          setDuration('')
        }
      }
      function cleanup() {
        probe.removeEventListener('loadedmetadata', onLoaded)
        probe.removeEventListener('error', onError)
      }

      probe.addEventListener('loadedmetadata', onLoaded)
      probe.addEventListener('error', onError)
      probe.src = url
    }

    tryLoad()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl, retryToken])

  return { duration, status, retry: () => setRetryToken((n) => n + 1) }
}

function DurationBadge({ status, duration, onRetry }) {
  if (status === 'detecting') return <span className="text-app-inkFaint">Detecting…</span>
  if (status === 'error')
    return (
      <button type="button" onClick={onRetry} className="text-danger underline decoration-dotted">
        Retry
      </button>
    )
  if (status === 'done') return <span className="font-bold text-app-ink">{duration}</span>
  return <span className="text-app-inkFaint">—</span>
}

function TrackForm({ initial, onSave, onCancel }) {
  const [titleEn, setTitleEn] = useState(initial?.titleEn || '')
  const [titleAr, setTitleAr] = useState(initial?.titleAr || '')
  const [audioUrl, setAudioUrl] = useState(initial?.audioUrl || '')
  const { duration, status, retry } = useAutoDuration(audioUrl, initial?.duration)

  function submit(e) {
    e.preventDefault()
    if (!titleEn.trim() || !titleAr.trim() || status !== 'done' || !audioUrl.trim()) return
    onSave({ titleEn, titleAr, duration, audioUrl: audioUrl.trim() })
    // Adding a new track (not editing an existing one) clears the form
    // instead of closing it, so the admin can add the next track for this
    // same unit right away without reopening "+ Audio" each time.
    if (!initial) {
      setTitleEn('')
      setTitleAr('')
      setAudioUrl('')
    }
  }

  return (
    <form onSubmit={submit} className="mt-2.5 flex flex-col gap-2 rounded-[11px] border border-primary/[.25] bg-app-panel p-3">
      <label className="block text-xs font-semibold text-app-inkSoft">
        Audio file URL (R2)
        <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
          <input
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
            placeholder="https://audio.eduarabic.my/pemula/unit-1-greetings.mp3"
            className={`min-w-[220px] flex-1 ${trackInputClass}`}
          />
          {audioUrl.trim() && <audio controls src={audioUrl.trim()} className="h-8 max-w-[200px]" />}
        </div>
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={titleEn}
          onChange={(e) => setTitleEn(e.target.value)}
          placeholder="Title (EN) — e.g. Greetings"
          className={`flex-1 ${trackInputClass}`}
        />
        <input
          value={titleAr}
          onChange={(e) => setTitleAr(e.target.value)}
          placeholder="Title (Arabic dialogue) — التحيات"
          dir="rtl"
          className={`flex-1 font-amiri ${trackInputClass}`}
        />
        <div
          className={`flex w-full items-center justify-center sm:w-[110px] ${trackInputClass}`}
          title="Read automatically from the audio file — not editable"
        >
          <DurationBadge status={status} duration={duration} onRetry={retry} />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={status !== 'done'}
          className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-[#0B2A4A] disabled:opacity-50"
        >
          {initial ? 'Save' : 'Add'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-app-border px-3.5 py-1.5 text-xs text-app-inkSoft">
          Cancel
        </button>
      </div>
    </form>
  )
}

function TrackRow({ track, onSave, onRemove }) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <TrackForm
        initial={track}
        onSave={(t) => {
          onSave(t)
          setEditing(false)
        }}
        onCancel={() => setEditing(false)}
      />
    )
  }

  return (
    <div className="flex items-center justify-between gap-3 text-[12.5px]">
      <span className="min-w-0 flex-1 truncate text-app-ink">{track.titleEn}</span>
      <span dir="rtl" className="min-w-0 flex-1 truncate font-amiri text-app-inkSoft">
        {track.titleAr}
      </span>
      <span className="flex-shrink-0 text-app-inkFaint">{track.duration}</span>
      <button type="button" onClick={() => setEditing(true)} className="flex-shrink-0 text-app-inkSoft underline decoration-dotted">
        Edit
      </button>
      <button type="button" onClick={onRemove} className="flex-shrink-0 text-danger">
        Remove
      </button>
    </div>
  )
}

function AudioUnit({ unit, admin }) {
  const [adding, setAdding] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(unit.title)

  function saveTitle() {
    if (titleDraft.trim()) admin.updateUnitTitle(unit.id, titleDraft.trim())
    setEditingTitle(false)
  }

  return (
    <div className="rounded-[13px] border border-app-border bg-app-panel px-4 py-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <Icon name="folder-01" size={16} className="text-app-inkSoft" />

        {editingTitle ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              saveTitle()
            }}
            className="flex min-w-[160px] flex-1 items-center gap-1.5"
          >
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              className="w-full rounded-lg border border-app-border bg-app-panel2 px-2 py-1 text-[13.5px] text-app-ink"
            />
            <button type="submit" className="text-xs font-bold text-primary">
              Save
            </button>
            <button type="button" onClick={() => setEditingTitle(false)} className="text-xs text-app-inkSoft">
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              setTitleDraft(unit.title)
              setEditingTitle(true)
            }}
            className="min-w-[120px] flex-1 text-left text-[13.5px] font-semibold underline decoration-dotted decoration-app-inkFaint"
          >
            {unit.title}
          </button>
        )}

        <div className="text-xs text-app-inkFaint">{unit.tracks.length} dialogue tracks</div>
        <button
          type="button"
          onClick={() => admin.removeUnit(unit.id)}
          className="rounded-lg border border-danger/30 px-3 py-1.5 text-xs text-danger"
        >
          Remove unit
        </button>
      </div>

      {unit.tracks.length > 0 && (
        <div className="mt-3 flex flex-col gap-2 border-t border-app-border pt-3">
          {unit.tracks.map((t) => (
            <TrackRow
              key={t.id}
              track={t}
              onSave={(track) => admin.updateTrack(t.id, track)}
              onRemove={() => admin.removeTrack(t.id)}
            />
          ))}
        </div>
      )}

      {/* This "+ Add audio" affordance stays with the unit's track list
          permanently — every unit can always take another audio track,
          there's no cap and no need to reopen a header toggle each time. */}
      {adding ? (
        <TrackForm
          onSave={(track) => admin.addAudio(unit.id, track)}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-app-border py-2.5 text-xs font-semibold text-app-inkSoft"
        >
          <Icon name="download-01" size={12} className="rotate-180" />
          + Add audio
        </button>
      )}
    </div>
  )
}

export default function AdminMaterials() {
  const { moduleId } = useParams()
  const admin = useAdmin()
  const { moduleTree, addUnit, removeModule } = admin
  const navigate = useNavigate()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (admin.moduleTreeLoading) {
    return <div className="text-sm text-app-inkFaint">Loading materials…</div>
  }

  if (!moduleId) return <Navigate to={`/admin/materials/${moduleTree[0]?.id || 'grammar'}`} replace />

  if (moduleId === 'grammar') return <AdminGrammarMaterial />

  const material = moduleTree.find((m) => m.id === moduleId) || moduleTree[0]

  if (!material) {
    return <div className="text-sm text-app-inkFaint">No modules found.</div>
  }

  const trackCount = material.units.reduce((n, u) => n + u.tracks.length, 0)

  // In-app dialog rather than window.confirm — native dialogs are blocked in
  // some embedded browsers, which made the button look dead.
  async function handleDeleteModule() {
    setDeleting(true)
    const ok = await removeModule(material.dbId)
    setDeleting(false)
    if (ok) {
      setConfirmingDelete(false)
      navigate('/admin/materials', { replace: true })
    }
  }

  return (
    <div>
      <div className="mb-1.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 text-xs font-bold tracking-wide text-app-inkFaint">MANAGE MATERIALS</div>
          <h1 className="flex items-center gap-2.5 font-poppins text-2xl font-extrabold">{material.name}</h1>
          <div className="mt-1 text-[12.5px] text-app-inkFaint">{material.units.length} units</div>
        </div>
        <div className="flex items-center gap-2.5 self-start">
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[11px] border border-danger/40 px-4 py-2.5 text-[13.5px] font-bold text-danger"
          >
            <Icon name="delete-02" size={15} /> Delete module
          </button>
          <button
            type="button"
            onClick={() => addUnit(material.dbId)}
            className="flex-shrink-0 whitespace-nowrap rounded-[11px] bg-primary px-4.5 px-[18px] py-2.5 text-[13.5px] font-bold text-[#0B2A4A]"
          >
            + Add unit
          </button>
        </div>
      </div>

      <div className="mt-5.5 mt-[22px] flex flex-col gap-2">
        {material.units.map((u) => (
          <AudioUnit key={u.id} unit={u} admin={admin} />
        ))}
      </div>

      {confirmingDelete && (
        <ConfirmDialog
          title={`Delete "${material.name}"?`}
          confirmLabel="Delete module"
          busyLabel="Deleting…"
          busy={deleting}
          onConfirm={handleDeleteModule}
          onCancel={() => setConfirmingDelete(false)}
        >
          This permanently removes the module, its {material.units.length} units and {trackCount} audio tracks. This
          cannot be undone.
        </ConfirmDialog>
      )}
    </div>
  )
}
