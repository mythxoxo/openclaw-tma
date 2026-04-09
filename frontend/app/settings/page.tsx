'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useAppStore } from '@/lib/store'

export default function SettingsPage() {
  const { gatewayUrl, apiToken, setGatewayConfig, connectToGateway, settings, updateAgentConfig } = useAppStore()
  const [url, setUrl] = useState(gatewayUrl || '')
  const [token, setToken] = useState(apiToken || '')

  const onSave = async (e: FormEvent) => {
    e.preventDefault()
    setGatewayConfig(url, token)
    await connectToGateway()
  }

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>
      <form className="space-y-2" onSubmit={onSave}>
        <input className="w-full rounded border p-2" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Gateway URL" />
        <input
          className="w-full rounded border p-2"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="API token"
          type="password"
        />
        <button className="rounded bg-blue-600 px-3 py-2 text-white">Сохранить</button>
      </form>
      <label className="block text-sm">
        Theme
        <select
          className="mt-1 w-full rounded border p-2"
          value={settings.theme}
          onChange={(e) => updateAgentConfig({ theme: e.target.value as 'auto' | 'light' | 'dark' })}
        >
          <option value="auto">Auto</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
      <div className="rounded border p-3 text-sm">
        <p>Версия: 6.0.0</p>
        <Link className="text-blue-600" href="https://github.com/mythxoxo/openclaw-tma" target="_blank">
          GitHub repository
        </Link>
      </div>
      <Link className="text-blue-600" href="/prompts">
        Перейти к system prompt
      </Link>
    </section>
  )
}
