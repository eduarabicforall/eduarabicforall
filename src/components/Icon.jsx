export default function Icon({ name, size = 20, className = '', style = {} }) {
  return (
    <i
      className={`hgi-stroke hgi-${name} ${className}`}
      style={{ fontSize: `${size}px`, lineHeight: 1, ...style }}
    />
  )
}
