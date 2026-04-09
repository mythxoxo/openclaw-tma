'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/Skeleton'
import { useAppStore } from '@/lib/store'

const LS_KEY = 'prompt_templates'

export default function PromptsPage() {
  const { systemPrompt, fetchSystemPrompt, updateSystemPrompt } = useAppStore()
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<string[]>([])

  useEffect(() => {
    fetchSystemPrompt().finally(() => setLoading(false))
    const raw = localStorage.getItem(LS_KEY)
    if (raw) setTemplates(JSON.parse(raw))
  }, [fetchSystemPrompt])

  useEffect(() => {
    setValue(systemPrompt)
  }, [systemPrompt])

  if (loading) return <Skeleton lines={8} />

  return (
    <section className="space-y-3">
      <h1 className="text-xl font-semibold">System prompt</h1>
      <textarea className="min-h-48 w-full rounded border p-2" value={value} onChange={(e) => setValue(e.target.value)} />
      <div className="flex gap-2">
        <button className="rounded bg-blue-600 px-3 py-2 text-white" onClick={() => updateSystemPrompt(value)}>
          Save
        </button>
        <button className="rounded border px-3 py-2" onClick={() => setValue(systemPrompt)}>
          Reset
        </button>
        <button
          className="rounded border px-3 py-2"
          onClick={() => {
            const next = [...templates, value]
            setTemplates(next)
            localStorage.setItem(LS_KEY, JSON.stringify(next))
          }}
        >
          Add template
        </button>
      </div>
      <div className="space-y-2">
        {templates.map((t, idx) => (
          <button key={idx} className="block w-full rounded border p-2 text-left text-sm" onClick={() => setValue(t)}>
            {t.slice(0, 120)}
          </button>
        ))}
      </div>
    </section>
  )
}
