'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/chat', label: 'Chat' },
  { href: '/agent', label: 'Agent' },
  { href: '/tools', label: 'Tools' },
  { href: '/logs', label: 'Logs' },
  { href: '/settings', label: 'Settings' }
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {items.map((item) => {
          const active = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                className="block p-3 text-center text-xs"
                style={{ color: active ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-hint-color)' }}
                href={item.href}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
