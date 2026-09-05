import { useEffect, useState } from 'react'
import { getSecureVideoUrl } from '../lib/r2'

/**
 * Video embed for Grammar Topic lessons. Never receives a raw R2 URL —
 * fetches a short-lived signed URL from the R2 Worker gatekeeper first.
 * Overlay blocks right-click "save video as" (not real DRM, matches PRD §9
 * note — acceptable for fasa 1).
 */
export default function SecureVideo({ r2Key }) {
  const [url, setUrl] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!r2Key) return
    getSecureVideoUrl(r2Key).then(setUrl).catch((e) => setError(e.message))
  }, [r2Key])

  return (
    <div className="relative w-full aspect-video rounded-card overflow-hidden bg-app-panel border border-app-border">
      {url ? (
        <video
          src={url}
          controls
          className="w-full h-full object-cover"
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-app-inkFaint text-sm">
          {error ? 'Video unavailable' : 'Loading video…'}
        </div>
      )}
    </div>
  )
}
