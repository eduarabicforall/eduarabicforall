import { useRef, useState } from 'react'
import Icon from './Icon.jsx'

// Stand-in for real Cloudflare R2 upload — not wired yet (per owner's
// decision: R2 gatekeeper is being redone, no point building Supabase
// Storage upload in the meantime). Picks a local file, "uploads" it with a
// fake delay/progress bar so the admin flow feels real, then hands back a
// data: URL so the image actually shows up immediately. Swap the body of
// `fakeUpload` for a real R2 PUT once the worker is back — the calling code
// (an onChange(url) callback) doesn't need to change.
function fakeUpload(file, onProgress) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file.'))
      return
    }
    let pct = 0
    const tick = setInterval(() => {
      pct = Math.min(90, pct + 15 + Math.random() * 15)
      onProgress(Math.round(pct))
    }, 120)

    const reader = new FileReader()
    reader.onload = () => {
      clearInterval(tick)
      onProgress(100)
      setTimeout(() => resolve(reader.result), 150)
    }
    reader.onerror = () => {
      clearInterval(tick)
      reject(new Error('Could not read that file.'))
    }
    reader.readAsDataURL(file)
  })
}

export default function R2MockUpload({ value, onChange, placeholder }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    setUploading(true)
    setProgress(0)
    try {
      const dataUrl = await fakeUpload(file, setProgress)
      onChange(dataUrl)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-[9px] border border-app-border bg-app-panel2 px-2.5 py-2 text-[12.5px] text-app-ink placeholder:text-app-inkFaint"
        />
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex flex-shrink-0 items-center gap-1.5 rounded-[9px] border border-app-border px-3 py-2 text-[11.5px] font-semibold text-app-inkSoft disabled:opacity-50"
        >
          <Icon name="download-01" size={13} className="rotate-180" />
          {uploading ? `${progress}%` : 'Upload'}
        </button>
      </div>
      <div className="text-[10.5px] text-app-inkFaint">
        Mock upload for now — stored as a local preview, not real R2 storage yet.
      </div>
      {error && <div className="text-[11px] font-semibold text-danger">{error}</div>}
    </div>
  )
}
