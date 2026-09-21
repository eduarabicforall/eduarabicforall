// In-app confirmation dialog. Used instead of window.confirm because native
// dialogs are blocked in some embedded browsers, which makes a destructive
// button look dead (the confirm silently returns false).
export default function ConfirmDialog({ title, children, confirmLabel, busyLabel, busy, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={() => !busy && onCancel()} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[400px] rounded-2xl border border-app-border bg-app-panel p-6 shadow-[0_20px_60px_rgba(0,0,0,.5)]"
      >
        <div className="mb-2 font-poppins text-lg font-extrabold">{title}</div>
        <div className="mb-5 text-[13px] leading-relaxed text-app-inkSoft">{children}</div>
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="rounded-[11px] border border-app-border px-4 py-2.5 text-[13.5px] font-semibold text-app-inkSoft disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="rounded-[11px] bg-danger px-4 py-2.5 text-[13.5px] font-bold text-[#2A0B0B] disabled:opacity-60"
          >
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
