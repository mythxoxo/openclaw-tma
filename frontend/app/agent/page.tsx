'use client'

import { useEffect, useState } from 'react'
import Skeleton from '@/components/Skeleton'
import { useStore } from '@/lib/store'

export default function AgentPage() {
  const [loading, setLoading] = useState(true)
  const [models, setModels] = useState<Array<{ id: string; name: string; provider: string }>>([])
  const agentStatus = useStore((s) => s.agentStatus)
  const settings = useStore((s) => s.settings)
  const fetchAgentStatus = useStore((s) => s.fetchAgentStatus)
  const fetchModels = useStore((s) => s.fetchModels)
  const startAgent = useStore((s) => s.startAgent)
  const stopAgent = useStore((s) => s.stopAgent)
  const updateAgentConfig = useStore((s) => s.updateAgentConfig)

  useEffect(() => {
    Promise.all([fetchAgentStatus(), fetchModels().then(setModels)]).finally(() => setLoading(false))
  }, [fetchAgentStatus, fetchModels])

  if (loading) return <Skeleton rows={4} />

  return (
    <section className="space-y-4">
      <h1 className="text-lg font-semibold">Agent</h1>
      <p>
        Статус: <span className={agentStatus === 'running' ? 'text-green-600' : 'text-red-600'}>{agentStatus}</span>
      </p>
      <div className="flex gap-2">
        <button className="bg-green-600 text-white" onClick={() => startAgent()}>Start</button>
        <button className="bg-red-600 text-white" onClick={() => stopAgent()}>Stop</button>
        <button className="bg-slate-200" onClick={() => stopAgent().then(startAgent)}>Restart</button>
      </div>
      <div className="space-y-2">
        <label className="block text-sm">Model</label>
        <select value={settings.model} onChange={(e) => updateAgentConfig({ model: e.target.value })}>
          {models.map((m) => (
            <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label className="block text-sm">Temperature: {settings.temperature}</label>
        <input type="range" min={0} max={1} step={0.1} value={settings.temperature} onChange={(e) => updateAgentConfig({ temperature: Number(e.target.value) })} />
      </div>
      <div className="space-y-2">
        <label className="block text-sm">Max tokens</label>
        <input type="number" value={settings.max_tokens} onChange={(e) => updateAgentConfig({ max_tokens: Number(e.target.value) })} />
      </div>
    </section>
  )
}
