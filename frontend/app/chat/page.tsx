'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { Skeleton } from '@/components/Skeleton'
import { Toast } from '@/components/Toast'
import { useAppStore } from '@/lib/store'

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [initialLoading, setInitialLoading] = useState(true)
  const messages = useAppStore((s) => s.messages)
  const sendMessage = useAppStore((s) => s.sendMessage)
  const clearChat = useAppStore((s) => s.clearChat)
  const stopGeneration = useAppStore((s) => s.stopGeneration)
  const isStreaming = useAppStore((s) => s.isStreaming)
  const agentStatus = useAppStore((s) => s.agentStatus)
  const isReconnecting = useAppStore((s) => s.isReconnecting)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInitialLoading(false)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    sendMessage(input)
    setInput('')
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Чат</h1>
        {isReconnecting && <span className="text-xs text-orange-600">Переподключение...</span>}
      </div>
      {agentStatus === 'thinking' && <p className="text-sm text-gray-500">Агент думает...</p>}
      {initialLoading ? (
        <Skeleton lines={6} />
      ) : (
        <div className="max-h-[58vh] space-y-2 overflow-y-auto rounded border p-2">
          {messages.map((m) => (
            <div key={m.id} className="rounded bg-gray-50 p-2 text-sm">
              <b>{m.role}:</b> {m.content}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}
      <form onSubmit={submit} className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 rounded border p-2" />
        <button className="rounded bg-blue-600 px-3 py-2 text-white">Send</button>
      </form>
      <div className="flex gap-2">
        <button className="rounded border px-3 py-2" onClick={stopGeneration} disabled={!isStreaming}>
          Stop
        </button>
        <button className="rounded border px-3 py-2" onClick={clearChat}>
          Очистить
        </button>
      </div>
      <Toast />
    </section>
  )
}
