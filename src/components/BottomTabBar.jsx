import TransitionNavLink from './TransitionNavLink.jsx'
import Icon from './Icon.jsx'

// Single fixed tab order used on every screen (PRD §6 issue #3 — the design
// canvas mock used Home/Grammar/AI Ustaz/Shop on some screens and
// Home/Grammar/Shop/AI Ustaz on others).
const TABS = [
  { to: '/dashboard', icon: 'home-01', label: 'Home' },
  { to: '/grammar', icon: 'mortarboard-01', label: 'Grammar' },
  { to: '/ai-ustaz', icon: 'message-01', label: 'AI Ustaz' },
  { to: '/shop', icon: 'shopping-bag-02', label: 'Shop' },
]

export default function BottomTabBar() {
  return (
    <div className="vt-tabbar sticky bottom-0 mt-auto flex items-center justify-around border-t border-app-border bg-[var(--app-bg-translucent)] px-2.5 pb-5 pt-3.5 backdrop-blur-md md:hidden">
      {TABS.map((tab) => (
        <TransitionNavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-app-inkFaint'}`
          }
        >
          <Icon name={tab.icon} size={20} />
          <span className="text-[10.5px] font-semibold">{tab.label}</span>
        </TransitionNavLink>
      ))}
    </div>
  )
}
