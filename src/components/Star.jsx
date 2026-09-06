// A solid, fully-filled star — the free Hugeicons set only ships an outline
// star, which reads too faint for a rating widget, so this renders a plain
// filled SVG instead and takes color from `className`/`style` like Icon does.
export default function Star({ size = 16, className = '', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      style={style}
    >
      <path d="M10 1.5l2.59 5.25 5.8.84-4.2 4.09 1 5.78L10 14.6l-5.19 2.73 1-5.78-4.2-4.09 5.8-.84L10 1.5z" />
    </svg>
  )
}
