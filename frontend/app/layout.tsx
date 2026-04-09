'use client'

import './globals.css'
import { useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import Toast from '@/components/Toast'
import Providers from './providers'
import { usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const toast = useStore((s) => s.toast)
  const clearToast = useStore((s) => s.clearToast)
  const connectToGateway = useStore((s) => s.connectToGateway)

  useEffect(() => {
    const initTelegram = async () => {
      const module = await import('@twa-dev/sdk')
      const webApp = module.default
      webApp.ready()
      webApp.expand()

      const root = document.documentElement
      const applyTheme = () => {
        const params = webApp.themeParams
        root.style.setProperty('--tg-theme-bg-color', params.bg_color || '#ffffff')
        root.style.setProperty('--tg-theme-text-color', params.text_color || '#111827')
        root.style.setProperty('--tg-theme-hint-color', params.hint_color || '#6b7280')
        root.style.setProperty('--tg-theme-link-color', params.link_color || '#2563eb')
        root.style.setProperty('--tg-theme-button-color', params.button_color || '#2563eb')
        root.style.setProperty('--tg-theme-button-text-color', params.button_text_color || '#ffffff')
      }

      applyTheme()
      const initData = webApp.initData
      const userId = webApp.initDataUnsafe?.user?.id
      console.debug('Telegram initData available:', Boolean(initData), 'userId:', userId)
      webApp.onEvent('themeChanged', applyTheme)

      return () => webApp.offEvent('themeChanged', applyTheme)
    }

    const cleanup = initTelegram()
    return () => {
      cleanup.then((fn) => fn?.())
    }
  }, [])

  return (
    <>
      <main className="mx-auto min-h-screen max-w-xl p-4 pb-24">{children}</main>
      {pathname !== '/' ? <BottomNav /> : null}
      {toast ? (
        <Toast
          message={toast.message}
          actionLabel={toast.actionLabel}
          onAction={toast.actionLabel === 'Повторить' ? connectToGateway : undefined}
          onClose={clearToast}
        />
      ) : null}
    </>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Providers>
          <LayoutContent>{children}</LayoutContent>
        </Providers>
      </body>
    </html>
  )
}
