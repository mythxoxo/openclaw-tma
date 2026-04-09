'use client'

import { useEffect, useMemo, useState } from 'react'
import { Skeleton } from '@/components/Skeleton'
import { useAppStore } from '@/lib/store'

export default function LogsPage() {
  const { logs, fetchLogs } = useAppStore()
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs().finally(() => setLoading(false))
  }, [fetchLogs])

  const filtered = useMemo(() => (filter === 'all' ? logs : logs.filter((l) => l.level === filter)), [filter, logs])

  if (loading) return <Skeleton lines={10} />

  return (
    <section className="space-y-3">
      <h1 className="text-xl font-semibold">Logs</h1>
      <div className="flex gap-2">
        {(['all', 'info', 'warn', 'error'] as const).map((level) => (
          <button key={level} className="rounded border px-2 py-1 text-sm" onClick={() => setFilter(level)}>
            {level}
          </button>
        ))}
        <button
          className="ml-auto rounded border px-2 py-1 text-sm"
          onClick={() => navigator.clipboard.writeText(filtered.map((l) => `[${l.level}] ${new Date(l.ts).toISOString()} ${l.message}`).join('\n'))}
        >
          Скопировать
        </button>
      </div>
      <div className="space-y-2">
        {filtered.map((l, i) => (
          <div key={i} className="rounded border p-2 text-sm">
            <b className={l.level === 'error' ? 'text-red-600' : l.level === 'warn' ? 'text-yellow-600' : 'text-blue-600'}>[{l.level}]</b>{' '}
            {new Date(l.ts).toLocaleTimeString()} — {l.message}
          </div>
        ))}
      </div>
    </section>
  )
}
