'use client'

import { useEffect, useState } from 'react'
import Skeleton from '@/components/Skeleton'
import { useStore } from '@/lib/store'

export default function ToolsPage() {
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState('')
  const tools = useStore((s) => s.tools)
  const fetchTools = useStore((s) => s.fetchTools)
  const client = useStore((s) => s.client)

  useEffect(() => {
    fetchTools().finally(() => setLoading(false))
  }, [fetchTools])

  if (loading) return <Skeleton rows={4} />

  return (
    <section className="space-y-4">
      <h1 className="text-lg font-semibold">Tools</h1>
      {tools.map((tool) => (
        <ToolCard key={tool.name} name={tool.name} description={tool.description} parameters={tool.parameters} onRun={async (input) => {
          const response = await client?.fetch<{ output: string; error: string | null }>('/api/tools/run', {
            method: 'POST',
            body: JSON.stringify({ name: tool.name, input })
          })
          setResult(response?.error ? `Error: ${response.error}` : response?.output || '')
        }} />
      ))}
      {result ? <pre className="rounded bg-slate-100 p-3 text-xs whitespace-pre-wrap">{result}</pre> : null}
    </section>
  )
}

function ToolCard({
  name,
  description,
  parameters,
  onRun
}: {
  name: string
  description: string
  parameters: Record<string, { type: string; required?: boolean; description?: string; default?: unknown }>
  onRun: (input: Record<string, unknown>) => Promise<void>
}) {
  const [values, setValues] = useState<Record<string, string>>({})

  return (
    <div className="space-y-2 rounded-lg border border-slate-200 p-3">
      <h2 className="font-medium">{name}</h2>
      <p className="text-sm text-slate-600">{description}</p>
      {Object.entries(parameters).map(([key, cfg]) => (
        <div key={key}>
          <label className="mb-1 block text-sm">{key} {cfg.required ? '*' : ''}</label>
          <input
            className="w-full"
            placeholder={cfg.description}
            required={cfg.required}
            value={values[key] ?? String(cfg.default ?? '')}
            onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
          />
        </div>
      ))}
      <button className="bg-slate-200" onClick={() => onRun(values)}>Run</button>
    </div>
  )
}
