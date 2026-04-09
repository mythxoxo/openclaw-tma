'use client'

import { useEffect, useRef, useState } from 'react'
import Skeleton from '@/components/Skeleton'
import { useStore } from '@/lib/store'

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const messages = useStore((s) => s.messages)
  const isStreaming = useStore((s) => s.isStreaming)
  const agentStatus = useStore((s) => s.agentStatus)
  const isReconnecting = useStore((s) => s.isReconnecting)
  const reconnectAttempts = useStore((s) => s.reconnectAttempts)
  const connectToGateway = useStore((s) => s.connectToGateway)
  const sendMessage = useStore((s) => s.sendMessage)
  const stopGeneration = useStore((s) => s.stopGeneration)
  const clearChat = useStore((s) => s.clearChat)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    connectToGateway().finally(() => setLoading(false))
  }, [connectToGateway])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (loading) return <Skeleton rows={5} />

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Чат</h1>
        <div className="flex gap-2">
          <button className="bg-slate-200" onClick={stopGeneration}>Stop</button>
          <button className="bg-slate-200" onClick={clearChat}>Clear</button>
        </div>
      </div>
      <p className="text-xs text-slate-500">Статус: {agentStatus ?? 'unknown'} {isStreaming ? '· агент думает…' : ''}</p>
      {isReconnecting ? <p className="text-xs text-amber-600">Переподключение... попытка {reconnectAttempts}</p> : null}
      <div className="max-h-[60vh] space-y-2 overflow-auto rounded-lg border border-slate-200 p-3">
        {messages.map((m) => (
          <div key={m.id} className="rounded-md bg-slate-100 p-2 text-sm">
            <div className="mb-1 text-xs uppercase text-slate-500">{m.role}</div>
            <div>{m.content}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!input.trim()) return
          sendMessage(input)
          setInput('')
        }}
      >
        <input className="flex-1" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Введите сообщение" />
        <button style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}>Send</button>
      </form>
    </section>
  )
}
