'use client'

import { useEffect, useState } from 'react'
import Skeleton from '@/components/Skeleton'
import { useStore } from '@/lib/store'

const TEMPLATE_KEY = 'openclaw_prompt_templates'

export default function PromptsPage() {
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [templates, setTemplates] = useState<string[]>([])
  const systemPrompt = useStore((s) => s.systemPrompt)
  const fetchSystemPrompt = useStore((s) => s.fetchSystemPrompt)
  const updateSystemPrompt = useStore((s) => s.updateSystemPrompt)

  useEffect(() => {
    fetchSystemPrompt().finally(() => setLoading(false))
    const raw = localStorage.getItem(TEMPLATE_KEY)
    if (raw) setTemplates(JSON.parse(raw))
  }, [fetchSystemPrompt])

  useEffect(() => {
    setDraft(systemPrompt)
  }, [systemPrompt])

  if (loading) return <Skeleton rows={4} />

  return (
    <section className="space-y-3">
      <h1 className="text-lg font-semibold">System Prompt</h1>
      <textarea className="min-h-52 w-full" value={draft} onChange={(e) => setDraft(e.target.value)} />
      <div className="flex gap-2">
        <button className="bg-slate-200" onClick={() => updateSystemPrompt(draft)}>Save</button>
        <button className="bg-slate-200" onClick={() => setDraft(systemPrompt)}>Reset</button>
        <button className="bg-slate-200" onClick={() => {
          const next = [...templates, draft]
          setTemplates(next)
          localStorage.setItem(TEMPLATE_KEY, JSON.stringify(next))
        }}>Save as template</button>
      </div>
      {templates.length ? (
        <div className="space-y-2">
          <h2 className="font-medium">Templates</h2>
          {templates.map((t, i) => (
            <button key={i} className="block w-full bg-slate-100 text-left" onClick={() => setDraft(t)}>{t.slice(0, 90)}</button>
          ))}
        </div>
      ) : null}
    </section>
  )
}
