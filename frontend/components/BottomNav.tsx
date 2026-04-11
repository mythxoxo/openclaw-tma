'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/chat', label: 'Chat', icon: '💬' },
  { href: '/agent', label: 'Agent', icon: '🤖' },
  { href: '/tools', label: 'Tools', icon: '🧰' },
  { href: '/logs', label: 'Logs', icon: '📜' },
  { href: '/settings', label: 'Settings', icon: '⚙️' }
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="tma-bottom-nav">
      <div className="tma-bottom-nav-inner">
        {items.map((item) => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className={`tma-nav-item ${active ? 'tma-nav-item-active' : ''}`}>
              <span aria-hidden="true">{item.icon}</span>
              <span className="text-[11px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
