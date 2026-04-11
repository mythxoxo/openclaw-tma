'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Skeleton } from '@/components/Skeleton'
import { Toast } from '@/components/Toast'
import { useAppStore } from '@/lib/store'

function ThinkingDots() {
  return (
    <span className="tma-thinking" aria-label="Агент думает">
      <span />
      <span />
      <span />
    </span>
  )
}

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

  const hasMessages = useMemo(() => messages.length > 0, [messages])

  return (
    <section className="tma-chat-shell">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="tma-title" style={{ fontSize: 22 }}>Чат</h1>
          <p className="tma-subtitle">
            {isReconnecting ? 'Переподключение к Gateway…' : 'Диалог с агентом в стиле Telegram'}
          </p>
        </div>
        <div className="flex items-center gap-8">
          {agentStatus === 'thinking' && (
            <div className="flex items-center gap-2 text-sm tma-muted">
              <span>Агент думает</span>
              <ThinkingDots />
            </div>
          )}
          {hasMessages && (
            <button className="tma-chip" onClick={clearChat}>
              Очистить
            </button>
          )}
        </div>
      </div>

      <div className="tma-chat-scroll">
        {initialLoading ? (
          <Skeleton lines={6} />
        ) : (
          <div className="tma-messages-list">
            {messages.map((m) => {
              if (m.role === 'tool_call' || m.role === 'tool_result') {
                return (
                  <div key={m.id} className="tma-message-row tma-message-row-tool">
                    <details className="tma-card tma-collapsible" open={false}>
                      <summary className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span>{m.role === 'tool_call' ? '🔧' : '✅'}</span>
                          <div>
                            <div className="font-semibold">{m.role === 'tool_call' ? 'Вызов инструмента' : 'Результат инструмента'}</div>
                            <div className="text-sm tma-muted">Нажми, чтобы развернуть</div>
                          </div>
                        </div>
                        <span className="tma-muted text-sm">▾</span>
                      </summary>
                      <div className="tma-collapsible-content">{m.content}</div>
                    </details>
                  </div>
                )
              }

              const isUser = m.role === 'user'
              return (
                <div key={m.id} className={`tma-message-row ${isUser ? 'tma-message-row-user' : 'tma-message-row-agent'}`}>
                  <div className={`tma-message-bubble ${isUser ? 'tma-message-user' : 'tma-message-agent'}`}>{m.content}</div>
                </div>
              )
            })}
            {!hasMessages && (
              <div className="tma-card text-center">
                <p className="tma-subtitle">Здесь появится история общения с агентом.</p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="tma-chat-input-wrap">
        <form onSubmit={submit} className="tma-chat-input-card">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Напишите сообщение…"
            rows={1}
            style={{ maxHeight: 140 }}
          />
          <button className="tma-button" style={{ width: 48, minWidth: 48, padding: 0 }} aria-label="Отправить">
            ➜
          </button>
        </form>
        <div className="mt-2 flex justify-end">
          <button className="tma-chip" onClick={stopGeneration} disabled={!isStreaming}>
            Остановить
          </button>
        </div>
      </div>
      <Toast />
    </section>
  )
}
