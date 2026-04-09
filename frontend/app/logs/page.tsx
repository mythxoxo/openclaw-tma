'use client'

import { useEffect, useMemo, useState } from 'react'
import Skeleton from '@/components/Skeleton'
import { useStore } from '@/lib/store'

export default function LogsPage() {
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all')
  const logs = useStore((s) => s.logs)
  const fetchLogs = useStore((s) => s.fetchLogs)

  useEffect(() => {
    fetchLogs().finally(() => setLoading(false))
  }, [fetchLogs])

  const filtered = useMemo(() => logs.filter((l) => filter === 'all' || l.level === filter), [logs, filter])

  if (loading) return <Skeleton rows={6} />

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Logs</h1>
        <button className="bg-slate-200" onClick={() => navigator.clipboard.writeText(JSON.stringify(logs, null, 2))}>Скопировать</button>
      </div>
      <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
        <option value="all">all</option>
        <option value="info">info</option>
        <option value="warn">warn</option>
        <option value="error">error</option>
      </select>
      <div className="space-y-2">
        {filtered.map((log, idx) => (
          <div key={`${log.ts}-${idx}`} className="rounded border border-slate-200 p-2 text-sm">
            <span className="mr-2 font-medium">[{log.level}]</span>
            <span>{log.message}</span>
            <div className="text-xs text-slate-500">{new Date(log.ts).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
