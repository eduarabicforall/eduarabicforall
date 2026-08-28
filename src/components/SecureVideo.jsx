import React from 'react'

/**
 * SecureVideo — wraps YouTube embed to reduce casual link-sharing.
 *
 * NOTE: This approach only blocks casual/non-technical users.
 * For true domain-locking, use Cloudflare Stream or Vimeo Pro (future phase).
 * Videos should be set as Unlisted on YouTube.
 */
export default function SecureVideo({ videoId, title = '' }) {
  if (!videoId) return null

  const src = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`

  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: '16/9',
        maxWidth: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
      onContextMenu={(e) => e.preventDefault()}
      style-user-select="none"
    >
      <iframe
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          userSelect: 'none',
        }}
      />
      {/* Overlay: covers top strip (YouTube logo/title) and bottom-right corner (Watch on YouTube) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '40%',
          height: '40px',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
