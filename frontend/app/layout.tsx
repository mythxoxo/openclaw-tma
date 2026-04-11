'use client'

import '@/app/globals.css'
import { useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import { Providers } from '@/components/Providers'
import { BottomNav } from '@/components/BottomNav'

function applyTheme() {
  const root = document.documentElement
  const params = WebApp.themeParams

  root.style.setProperty('--tg-theme-bg-color', params.bg_color || '#ffffff')
  root.style.setProperty('--tg-theme-text-color', params.text_color || '#111827')
  root.style.setProperty('--tg-theme-hint-color', params.hint_color || '#6b7280')
  root.style.setProperty('--tg-theme-link-color', params.link_color || '#2563eb')
  root.style.setProperty('--tg-theme-button-color', params.button_color || '#3b82f6')
  root.style.setProperty('--tg-theme-button-text-color', params.button_text_color || '#ffffff')
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    WebApp.ready()
    WebApp.expand()
    applyTheme()

    const userId = WebApp.initDataUnsafe?.user?.id
    const initData = WebApp.initData

    if (userId) {
      sessionStorage.setItem('tg_user_id', String(userId))
    }

    if (initData) {
      sessionStorage.setItem('tg_init_data', initData)
    }

    WebApp.onEvent('themeChanged', applyTheme)
    return () => WebApp.offEvent('themeChanged', applyTheme)
  }, [])

  return (
    <html lang="ru">
      <body>
        <Providers>
          <main className="tma-shell">{children}</main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  )
}
