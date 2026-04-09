'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/Skeleton'
import { useAppStore } from '@/lib/store'

export default function AgentPage() {
  const [models, setModels] = useState<Array<{ id: string; name: string; provider: string }>>([])
  const [loading, setLoading] = useState(true)
  const { agentStatus, settings, fetchAgentStatus, fetchModels, startAgent, stopAgent, restartAgent, updateAgentConfig } =
    useAppStore()

  useEffect(() => {
    Promise.all([fetchAgentStatus(), fetchModels().then(setModels)]).finally(() => setLoading(false))
  }, [fetchAgentStatus, fetchModels])

  if (loading) return <Skeleton lines={7} />

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Agent</h1>
      <p>
        Статус:{' '}
        <span className={agentStatus === 'running' ? 'text-green-600' : agentStatus === 'thinking' ? 'text-yellow-600' : 'text-red-600'}>
          {agentStatus}
        </span>
      </p>
      <div className="flex gap-2">
        <button className="rounded border px-3 py-2" onClick={startAgent}>Start</button>
        <button className="rounded border px-3 py-2" onClick={stopAgent}>Stop</button>
        <button className="rounded border px-3 py-2" onClick={restartAgent}>Restart</button>
      </div>
      <label className="block text-sm">
        Model
        <select
          className="mt-1 w-full rounded border p-2"
          value={settings.model}
          onChange={(e) => updateAgentConfig({ model: e.target.value })}
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.provider})
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Temperature: {settings.temperature}
        <input
          className="w-full"
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={settings.temperature}
          onChange={(e) => updateAgentConfig({ temperature: Number(e.target.value) })}
        />
      </label>
      <label className="block text-sm">
        Max tokens
        <input
          type="number"
          className="mt-1 w-full rounded border p-2"
          value={settings.max_tokens}
          onChange={(e) => updateAgentConfig({ max_tokens: Number(e.target.value) })}
        />
      </label>
    </section>
  )
}
