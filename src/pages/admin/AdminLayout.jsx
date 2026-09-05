import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Icon from '../../components/Icon'

const NAV = [
  { to: '/admin', end: true, icon: 'dashboard-square-01', label: 'Dashboard' },
  { to: '/admin/admins', icon: 'user-group', label: 'Manage admins' },
  { to: '/admin/materials', icon: 'book-02', label: 'Manage materials' },
  { to: '/admin/products', icon: 'shopping-bag-01', label: 'Manage products' },
  { to: '/admin/codes', icon: 'qr-code-01', label: 'Activation codes' },
  { to: '/admin/orders', icon: 'package', label: 'Orders' },
  { to: '/admin/ai-console', icon: 'artificial-intelligence-04', label: 'AI console' },
]

export default function AdminLayout() {
  const { signOut } = useAuth()
  return (
    <div className="min-h-screen bg-app-bg flex">
      <aside className="w-[250px] shrink-0 border-r border-app-border flex flex-col">
        <div className="px-5 py-6 font-title font-extrabold text-lg">EduArabic Admin</div>
        <nav className="flex-1 flex flex-col gap-1 px-3">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm ${isActive ? 'bg-app-primary/15 text-app-primary' : 'text-app-inkSoft hover:bg-app-panel'}`
              }
            >
              <Icon name={n.icon} size={18} /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 pb-5 flex flex-col gap-1 border-t border-app-border pt-3">
          <NavLink to="/admin/profile" className={({ isActive }) => `flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm ${isActive ? 'bg-app-primary/15 text-app-primary' : 'text-app-inkSoft hover:bg-app-panel'}`}>
            <Icon name="user-circle" size={18} /> Profile settings
          </NavLink>
          <button onClick={signOut} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-app-danger hover:bg-app-panel text-left">
            <Icon name="logout-01" size={18} /> Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
