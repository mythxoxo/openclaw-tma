'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Skeleton } from '@/components/Skeleton'
import { useAppStore } from '@/lib/store'

export default function ToolsPage() {
  const { tools, fetchTools, runTool } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<string>('')
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [openTool, setOpenTool] = useState<string | null>(null)

  useEffect(() => {
    fetchTools().finally(() => setLoading(false))
  }, [fetchTools])

  const submitTool = async (e: FormEvent, toolName: string) => {
    e.preventDefault()
    const payload = Object.fromEntries(
      Object.entries(formValues)
        .filter(([k]) => k.startsWith(`${toolName}.`))
        .map(([k, v]) => [k.replace(`${toolName}.`, ''), v])
    )
    const res = await runTool(toolName, payload)
    setResult(res.error ? `Ошибка: ${res.error}` : res.output)
  }

  if (loading) return <Skeleton lines={8} />

  return (
    <section className="tma-page">
      <div>
        <h1 className="tma-title" style={{ fontSize: 22 }}>Tools</h1>
        <p className="tma-subtitle">Запускайте доступные инструменты прямо из TMA</p>
      </div>

      {tools.map((tool) => {
        const expanded = openTool === tool.name
        return (
          <div key={tool.name} className="tma-card flex flex-col gap-3">
            <button className="flex items-start justify-between gap-3 text-left" onClick={() => setOpenTool(expanded ? null : tool.name)}>
              <div>
                <div className="font-semibold">{tool.name}</div>
                <div className="tma-subtitle">{tool.description}</div>
              </div>
              <span className="tma-muted">{expanded ? '−' : '+'}</span>
            </button>

            {expanded && (
              <form className="flex flex-col gap-3" onSubmit={(e) => submitTool(e, tool.name)}>
                {Object.entries(tool.parameters).map(([name, config]) => (
                  <label key={name} className="flex flex-col gap-2 text-sm">
                    <span>
                      {name} {config.required ? '*' : ''}
                    </span>
                    <input
                      required={Boolean(config.required)}
                      placeholder={config.description}
                      value={formValues[`${tool.name}.${name}`] || ''}
                      onChange={(e) => setFormValues((s) => ({ ...s, [`${tool.name}.${name}`]: e.target.value }))}
                    />
                  </label>
                ))}
                <button className="tma-button self-start px-4">Run</button>
              </form>
            )}
          </div>
        )
      })}

      {result && (
        <div className="tma-card">
          <div className="font-semibold">Результат</div>
          <pre className="mt-3 whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}
    </section>
  )
}
