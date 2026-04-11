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
    <section className="tma-page" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div>
        <h1 className="tma-title" style={{ fontSize: 22 }}>System prompt</h1>
        <p className="tma-subtitle">Настройка системного поведения агента</p>
      </div>

      <div className="tma-chip-row">
        {templates.map((t, idx) => (
          <button key={idx} className="tma-chip" onClick={() => setValue(t)}>
            {t.slice(0, 36) || `Template ${idx + 1}`}
          </button>
        ))}
        <button
          className="tma-chip"
          onClick={() => {
            const next = [...templates, value]
            setTemplates(next)
            localStorage.setItem(LS_KEY, JSON.stringify(next))
          }}
        >
          + Шаблон
        </button>
      </div>

      <div className="tma-card flex-1" style={{ minHeight: 420, paddingBottom: 72 }}>
        <textarea
          className="h-full min-h-[360px] border-0 bg-transparent p-0"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Введите system prompt..."
        />
        <div className="mt-3 text-right text-sm tma-muted">{value.length} символов</div>
      </div>

      <button className="tma-floating-button" onClick={() => updateSystemPrompt(value)} aria-label="Save">
        ✓
      </button>
    </section>
  )
}
