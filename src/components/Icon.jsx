import React from 'react'

/**
 * Icon component using Hugeicons (hgi-stroke-rounded CDN).
 *
 * Usage:
 *   <Icon name="ai-brain-01" size={20} className="text-primary" />
 *
 * Browse all icons at: https://hugeicons.com/icon-collections
 */
export default function Icon({ name, size = 20, className = '', style = {} }) {
  return (
    <i
      className={`hgi-stroke hgi-${name} ${className}`}
      style={{ fontSize: `${size}px`, lineHeight: 1, ...style }}
    />
  )
}
