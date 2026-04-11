'use client'

import Link from 'next/link'
import { FormEvent, useMemo, useState } from 'react'
import { useAppStore } from '@/lib/store'

function maskValue(value: string | null) {
  if (!value) return 'Не задано'
  if (value.length <= 8) return '•'.repeat(value.length)
  return `${value.slice(0, 4)}••••${value.slice(-4)}`
}

export default function SettingsPage() {
  const { gatewayUrl, apiToken, setGatewayConfig, connectToGateway, settings, updateAgentConfig } = useAppStore()
  const [url, setUrl] = useState(gatewayUrl || '')
  const [token, setToken] = useState(apiToken || '')
  const [editing, setEditing] = useState<'url' | 'token' | null>(null)

  const maskedUrl = useMemo(() => maskValue(gatewayUrl), [gatewayUrl])
  const maskedToken = useMemo(() => maskValue(apiToken), [apiToken])

  const onSave = async (e: FormEvent) => {
    e.preventDefault()
    setGatewayConfig(url, token)
    await connectToGateway()
    setEditing(null)
  }

  return (
    <section className="tma-page">
      <div>
        <h1 className="tma-title" style={{ fontSize: 22 }}>Settings</h1>
        <p className="tma-subtitle">Параметры подключения и интерфейса</p>
      </div>

      <div className="tma-section-group">
        <button className="tma-section-row text-left" onClick={() => setEditing(editing === 'url' ? null : 'url')}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold">Gateway URL</div>
              <div className="tma-subtitle">{maskedUrl}</div>
            </div>
            <span className="tma-muted">Изменить</span>
          </div>
        </button>
        {editing === 'url' && (
          <form className="tma-section-row flex flex-col gap-3" onSubmit={onSave}>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Gateway URL" />
            <button className="tma-button self-start px-4">Сохранить</button>
          </form>
        )}

        <button className="tma-section-row text-left" onClick={() => setEditing(editing === 'token' ? null : 'token')}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold">API token</div>
              <div className="tma-subtitle">{maskedToken}</div>
            </div>
            <span className="tma-muted">Изменить</span>
          </div>
        </button>
        {editing === 'token' && (
          <form className="tma-section-row flex flex-col gap-3" onSubmit={onSave}>
            <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="API token" type="password" />
            <button className="tma-button self-start px-4">Сохранить</button>
          </form>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="font-semibold">Theme</div>
        <div className="tma-segmented">
          {(['auto', 'light', 'dark'] as const).map((mode) => (
            <button
              key={mode}
              className={`tma-segment ${settings.theme === mode ? 'tma-segment-active' : ''}`}
              onClick={() => updateAgentConfig({ theme: mode })}
            >
              {mode === 'auto' ? 'Auto' : mode === 'light' ? 'Light' : 'Dark'}
            </button>
          ))}
        </div>
      </div>

      <div className="tma-card flex flex-col gap-2 text-sm">
        <div>Версия: 6.0.0</div>
        <Link href="https://github.com/mythxoxo/openclaw-tma" target="_blank">
          Репозиторий проекта
        </Link>
        <Link href="/prompts">Открыть system prompt</Link>
      </div>
    </section>
  )
}
