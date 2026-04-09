'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'

export default function SettingsPage() {
  const gatewayUrl = useStore((s) => s.gatewayUrl) || ''
  const apiToken = useStore((s) => s.apiToken) || ''
  const settings = useStore((s) => s.settings)
  const setGatewayConfig = useStore((s) => s.setGatewayConfig)
  const [url, setUrl] = useState(gatewayUrl)
  const [token, setToken] = useState(apiToken)

  return (
    <section className="space-y-4">
      <h1 className="text-lg font-semibold">Settings</h1>
      <div className="space-y-2">
        <label className="block text-sm">Gateway URL</label>
        <input className="w-full" value={url} onChange={(e) => setUrl(e.target.value)} />
        <label className="block text-sm">API Token</label>
        <input className="w-full" value={token} onChange={(e) => setToken(e.target.value)} />
        <button className="bg-slate-200" onClick={() => setGatewayConfig(url, token)}>Save Gateway</button>
      </div>
      <div className="space-y-2">
        <label className="block text-sm">Theme</label>
        <select
          value={settings.theme}
          onChange={async (e) => {
            const theme = e.target.value as 'auto' | 'light' | 'dark'
            document.documentElement.dataset.theme = theme
            if (theme !== 'auto') {
              const module = await import('@twa-dev/sdk')
              module.default.setHeaderColor(theme === 'dark' ? '#000000' : '#ffffff')
            }
          }}
        >
          <option value="auto">auto</option>
          <option value="light">light</option>
          <option value="dark">dark</option>
        </select>
      </div>
      <div className="rounded border border-slate-200 p-3 text-sm">
        <p>Version: v6.0</p>
        <a className="text-blue-600 underline" href="https://github.com/mythxoxo/openclaw-tma" target="_blank">Repository</a>
      </div>
    </section>
  )
}
