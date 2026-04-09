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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/90 backdrop-blur" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <ul className="mx-auto grid max-w-4xl grid-cols-5">
        {items.map((item) => {
          const active = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex flex-col items-center justify-center py-2 text-xs"
                style={{ color: active ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-hint-color)' }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
