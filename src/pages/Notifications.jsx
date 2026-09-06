import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'

// No notifications table/backend exists yet — this is an honest empty state
// rather than fabricated sample notifications.
export default function Notifications() {
  const navigate = useNavigate()

  return (
    <AppShell>
      <div className="flex items-center gap-3 px-5 pb-1.5 pt-5.5 pt-[22px]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-app-border bg-app-panel2"
        >
          <Icon name="arrow-left-01" size={16} className="text-app-inkSoft" />
        </button>
        <div className="font-sora text-base font-extrabold">Notifications</div>
      </div>

      <div className="px-5 py-10 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-app-panel2">
          <Icon name="notification-01" size={24} className="text-app-inkFaint" />
        </div>
        <div className="mb-1 text-[14px] font-bold">No notifications yet</div>
        <div className="text-[12.5px] text-app-inkSoft">
          We'll let you know here when there's something new — order updates, new modules and more.
        </div>
      </div>
    </AppShell>
  )
}
