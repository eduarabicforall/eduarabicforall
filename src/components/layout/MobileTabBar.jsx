import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const tabs = [
  { icon: 'home-01', label: 'Home', to: '/dashboard' },
  { icon: 'route-01', label: 'Path', to: '/learning-path' },
  { icon: 'headphones', label: 'Audio', to: '/audio' },
  { icon: 'shopping-cart-01', label: 'Shop', to: '/shop' },
  { icon: 'ai-brain-01', label: 'AI', to: '/ai-ustaz' },
]

export default function MobileTabBar() {
  const location = useLocation()

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:hidden z-40 bg-[rgba(11,16,32,.95)] backdrop-blur-md border-t border-ea-border-soft px-4 py-2.5 flex justify-around">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.to
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className="flex flex-col items-center gap-1 no-underline"
            style={{ color: isActive ? '#2FC49F' : '#6B7488' }}
          >
            <i className={`hgi-stroke hgi-${tab.icon}`} style={{ fontSize: '22px' }} />
            <span className="text-[10px] font-semibold">{tab.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
