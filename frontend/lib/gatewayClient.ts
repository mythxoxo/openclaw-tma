import { AgentState, LogEntry } from '@/lib/types'

type EventMap = {
  message_chunk: { content: string; message_id: string }
  message_done: { message_id: string }
  tool_call: { name: string; input: object; call_id: string }
  tool_result: { call_id: string; output: string; error?: string }
  agent_status: { state: AgentState }
  log_entry: LogEntry
  pong: Record<string, never>
}

type EventHandler<T> = (payload: T) => void

export class GatewayClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private pongTimeout: ReturnType<typeof setTimeout> | null = null
  private shouldReconnect = true
  private listeners: Partial<Record<keyof EventMap, Array<EventHandler<unknown>>>> = {}

  constructor(
    private readonly baseURL: string,
    private readonly token: string,
    private readonly callbacks?: {
      onReconnectState?: (isReconnecting: boolean) => void
      onReconnectFailed?: () => void
    }
  ) {}

  on<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>) {
    const handlers = (this.listeners[event] || []) as Array<EventHandler<EventMap[K]>>
    handlers.push(handler)
    this.listeners[event] = handlers as Array<EventHandler<unknown>>
  }

  private emit<K extends keyof EventMap>(event: K, payload: EventMap[K]) {
    const handlers = (this.listeners[event] || []) as Array<EventHandler<EventMap[K]>>
    handlers.forEach((h) => h(payload))
  }

  async connect(): Promise<void> {
    this.shouldReconnect = true
    const wsURL = this.toWsUrl(this.baseURL)

    await new Promise<void>((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${wsURL}?token=${encodeURIComponent(this.token)}`)
      } catch (error) {
        reject(error)
        return
      }

      const onOpen = () => {
        this.reconnectAttempts = 0
        this.callbacks?.onReconnectState?.(false)
        this.startHeartbeat()
        resolve()
      }

      const onError = () => reject(new Error('WebSocket connection failed'))

      this.ws?.addEventListener('open', onOpen, { once: true })
      this.ws?.addEventListener('error', onError, { once: true })

      this.ws?.addEventListener('message', (event) => {
        const parsed = JSON.parse(event.data as string)
        const type = parsed.type as keyof EventMap
        if (type in this.listeners) {
          this.emit(type, parsed.data)
        }
      })

      this.ws?.addEventListener('close', () => {
        this.stopHeartbeat()
        if (this.shouldReconnect) {
          this.scheduleReconnect()
        }
      })
    })
  }

  disconnect() {
    this.shouldReconnect = false
    this.stopHeartbeat()
    this.ws?.close()
    this.ws = null
  }

  sendMessage(content: string) {
    this.ws?.send(JSON.stringify({ type: 'user_message', data: { content } }))
  }

  stopGeneration() {
    this.ws?.send(JSON.stringify({ type: 'stop_generation' }))
  }

  clearContext() {
    this.ws?.send(JSON.stringify({ type: 'clear_context' }))
  }

  async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseURL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
        ...(options?.headers || {})
      }
    })

    if (res.status === 401) {
      throw new Error('401')
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    return (await res.json()) as T
  }

  private toWsUrl(url: string) {
    if (url.startsWith('wss://') || url.startsWith('ws://')) return url
    if (url.startsWith('https://')) return url.replace('https://', 'wss://')
    if (url.startsWith('http://')) return url.replace('http://', 'ws://')
    return `wss://${url}`
  }

  private scheduleReconnect() {
    this.callbacks?.onReconnectState?.(true)
    if (this.reconnectAttempts >= 5) {
      this.callbacks?.onReconnectFailed?.()
      return
    }

    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000)
    this.reconnectAttempts += 1

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => this.scheduleReconnect())
    }, delay)
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      this.ws?.send(JSON.stringify({ type: 'ping' }))
      this.pongTimeout = setTimeout(() => {
        this.ws?.close()
      }, 10000)
    }, 30000)

    this.on('pong', () => {
      if (this.pongTimeout) {
        clearTimeout(this.pongTimeout)
      }
    })
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer)
    if (this.pongTimeout) clearTimeout(this.pongTimeout)
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
  }
}
