import { NavLink } from 'react-router-dom'
import Icon from '../Icon'

// Single fixed tab order used everywhere (PRD §6 issue #3 — Dashboard/Grammar
// and AudioLibrary previously used different orders in the design canvas).
const TABS = [
  { to: '/dashboard', icon: 'home-01', label: 'Home' },
  { to: '/grammar', icon: 'book-02', label: 'Grammar' },
  { to: '/ai-ustaz', icon: 'chatting-01', label: 'AI Ustaz' },
  { to: '/shop', icon: 'shopping-bag-01', label: 'Shop' },
]

export default function BottomTabBar() {
  return (
    <nav className="sticky bottom-0 left-0 right-0 bg-app-bg/95 backdrop-blur border-t border-app-border flex">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-medium ${
              isActive ? 'text-app-primary' : 'text-app-inkFaint'
            }`
          }
        >
          <Icon name={tab.icon} size={22} />
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
