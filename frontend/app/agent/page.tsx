'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/Skeleton'
import { useAppStore } from '@/lib/store'

const statusMeta = {
  running: { label: 'Running', color: 'color-mix(in srgb, var(--tg-theme-link-color) 35%, var(--tg-theme-bg-color))' },
  stopped: { label: 'Stopped', color: 'color-mix(in srgb, var(--tg-theme-text-color) 18%, var(--tg-theme-bg-color))' },
  thinking: { label: 'Thinking', color: 'color-mix(in srgb, var(--tg-theme-button-color) 35%, var(--tg-theme-bg-color))' }
} as const

export default function AgentPage() {
  const [models, setModels] = useState<Array<{ id: string; name: string; provider: string }>>([])
  const [loading, setLoading] = useState(true)
  const { agentStatus, settings, fetchAgentStatus, fetchModels, startAgent, stopAgent, restartAgent, updateAgentConfig } = useAppStore()

  useEffect(() => {
    Promise.all([fetchAgentStatus(), fetchModels().then(setModels)]).finally(() => setLoading(false))
  }, [fetchAgentStatus, fetchModels])

  if (loading) return <Skeleton lines={7} />

  const currentStatus = agentStatus || 'stopped'
  const meta = statusMeta[currentStatus]

  return (
    <section className="tma-page">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="tma-title" style={{ fontSize: 22 }}>Agent</h1>
          <p className="tma-subtitle">Управление моделью и состоянием агента</p>
        </div>
        <span className="tma-pill" style={{ background: meta.color, borderColor: 'transparent' }}>
          {meta.label}
        </span>
      </div>

      <div className="tma-card flex items-center justify-between gap-3">
        <button className="tma-icon-button" onClick={startAgent} aria-label="Start">▶</button>
        <button className="tma-icon-button" onClick={stopAgent} aria-label="Stop">■</button>
        <button className="tma-icon-button" onClick={restartAgent} aria-label="Restart">↻</button>
      </div>

      <div className="tma-card flex flex-col gap-3">
        <div>
          <div className="font-semibold">Модель</div>
          <div className="tma-subtitle">Выберите активную модель для агента</div>
        </div>
        <select value={settings.model} onChange={(e) => updateAgentConfig({ model: e.target.value })}>
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.provider})
            </option>
          ))}
        </select>
      </div>

      <div className="tma-card flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Temperature</span>
            <span className="tma-muted">{settings.temperature}</span>
          </div>
          <input
            className="tma-range"
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={settings.temperature}
            onChange={(e) => updateAgentConfig({ temperature: Number(e.target.value) })}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span>Max tokens</span>
          <input
            type="number"
            value={settings.max_tokens}
            onChange={(e) => updateAgentConfig({ max_tokens: Number(e.target.value) })}
          />
        </label>
      </div>
    </section>
  )
}
