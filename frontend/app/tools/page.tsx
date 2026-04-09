'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Skeleton } from '@/components/Skeleton'
import { useAppStore } from '@/lib/store'

export default function ToolsPage() {
  const { tools, fetchTools, runTool } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<string>('')
  const [formValues, setFormValues] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchTools().finally(() => setLoading(false))
  }, [fetchTools])

  const submitTool = async (e: FormEvent, toolName: string) => {
    e.preventDefault()
    const payload = Object.fromEntries(Object.entries(formValues).filter(([k]) => k.startsWith(`${toolName}.`)).map(([k, v]) => [k.replace(`${toolName}.`, ''), v]))
    const res = await runTool(toolName, payload)
    setResult(res.error ? `Ошибка: ${res.error}` : res.output)
  }

  if (loading) return <Skeleton lines={8} />

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Tools</h1>
      {tools.map((tool) => (
        <form key={tool.name} className="space-y-2 rounded border p-3" onSubmit={(e) => submitTool(e, tool.name)}>
          <h2 className="font-semibold">{tool.name}</h2>
          <p className="text-sm text-gray-600">{tool.description}</p>
          {Object.entries(tool.parameters).map(([name, config]) => (
            <label key={name} className="block text-sm">
              {name} {config.required ? '*' : ''}
              <input
                required={Boolean(config.required)}
                className="mt-1 w-full rounded border p-2"
                placeholder={config.description}
                value={formValues[`${tool.name}.${name}`] || ''}
                onChange={(e) => setFormValues((s) => ({ ...s, [`${tool.name}.${name}`]: e.target.value }))}
              />
            </label>
          ))}
          <button className="rounded bg-blue-600 px-3 py-2 text-white">Run</button>
        </form>
      ))}
      {result && <pre className="whitespace-pre-wrap rounded border p-2 text-sm">{result}</pre>}
    </section>
  )
}
