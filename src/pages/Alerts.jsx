import { Link } from 'react-router-dom'
import Icon from '../components/Icon'

export default function Alerts() {
  return (
    <div className="min-h-screen bg-app-bg px-5 py-6 max-w-lg mx-auto">
      <Link to="/dashboard" className="text-app-inkFaint text-sm mb-4 inline-flex items-center gap-1">
        <Icon name="arrow-left-01" size={16} /> Dashboard
      </Link>
      <h1 className="font-title font-extrabold text-2xl mb-6">Notifications</h1>
      <div className="text-center text-app-inkFaint py-16">
        <Icon name="notification-01" size={40} className="mx-auto mb-3" />
        <p>No notifications yet.</p>
      </div>
    </div>
  )
}
