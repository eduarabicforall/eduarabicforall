import Icon from './Icon.jsx'

export default function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-light-ink/[.07] bg-light-ink/[.03]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-5 py-[18px] text-left text-light-ink"
      >
        <span className="text-[14.5px] font-bold">{q}</span>
        <Icon
          name="arrow-down-01"
          size={15}
          className="flex-shrink-0 text-light-inkFaint transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ maxHeight: open ? '240px' : '0px', opacity: open ? 1 : 0 }}
      >
        <div className="px-5 pb-[18px] text-[13.5px] leading-relaxed text-light-inkSoft">{a}</div>
      </div>
    </div>
  )
}
