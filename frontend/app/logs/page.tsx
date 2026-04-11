'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Skeleton } from '@/components/Skeleton'
import { useAppStore } from '@/lib/store'

const dotColor = {
  info: 'color-mix(in srgb, var(--tg-theme-link-color) 65%, var(--tg-theme-bg-color))',
  warn: 'color-mix(in srgb, var(--tg-theme-button-color) 65%, var(--tg-theme-bg-color))',
  error: 'color-mix(in srgb, var(--tg-theme-text-color) 45%, var(--tg-theme-bg-color))'
} as const

export default function LogsPage() {
  const { logs, fetchLogs } = useAppStore()
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchLogs().finally(() => setLoading(false))
  }, [fetchLogs])

  const filtered = useMemo(() => (filter === 'all' ? logs : logs.filter((l) => l.level === filter)), [filter, logs])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [filtered])

  if (loading) return <Skeleton lines={10} />

  return (
    <section className="tma-page">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="tma-title" style={{ fontSize: 22 }}>Logs</h1>
          <p className="tma-subtitle">Живой журнал событий агента</p>
        </div>
        <button
          className="tma-chip"
          onClick={() => navigator.clipboard.writeText(filtered.map((l) => `[${l.level}] ${new Date(l.ts).toISOString()} ${l.message}`).join('\n'))}
        >
          Скопировать
        </button>
      </div>

      <div className="tma-chip-row">
        {(['all', 'info', 'warn', 'error'] as const).map((level) => (
          <button key={level} className={`tma-chip ${filter === level ? 'tma-chip-active' : ''}`} onClick={() => setFilter(level)}>
            {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>

      <div className="tma-card tma-logs-list">
        {filtered.map((l, i) => (
          <div key={i} className="flex items-start gap-3 text-sm">
            <span
              aria-hidden="true"
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                marginTop: 5,
                background: dotColor[l.level]
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="mb-1 text-xs tma-muted">{new Date(l.ts).toLocaleTimeString()}</div>
              <div>{l.message}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </section>
  )
}
