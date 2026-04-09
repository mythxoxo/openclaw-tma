import type { AgentState, LogEntry } from './types'

type EventMap = {
  message_chunk: { content: string; message_id: string }
  message_done: { message_id: string }
  tool_call: { name: string; input: object; call_id: string }
  tool_result: { call_id: string; output: string; error?: string }
  agent_status: { state: AgentState }
  log_entry: LogEntry
  pong: Record<string, never>
  reconnecting: { attempt: number }
  reconnect_failed: { attempts: number }
}

type Handler<T> = (payload: T) => void

export class GatewayClient {
  private baseURL: string
  private token: string
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null
  private pongTimeout: ReturnType<typeof setTimeout> | null = null
  private handlers = new Map<keyof EventMap, Set<Handler<unknown>>>()

  constructor(baseURL: string, token: string) {
    this.baseURL = baseURL.replace(/\/$/, '')
    this.token = token
  }

  on<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>) {
    const set = this.handlers.get(event) || new Set<Handler<unknown>>()
    set.add(handler as Handler<unknown>)
    this.handlers.set(event, set)

    return () => {
      const current = this.handlers.get(event)
      current?.delete(handler as Handler<unknown>)
    }
  }

  private emit<K extends keyof EventMap>(event: K, payload: EventMap[K]) {
    this.handlers.get(event)?.forEach((h) => h(payload))
  }

  private getWsUrl() {
    if (this.baseURL.startsWith('https://')) {
      return `${this.baseURL.replace('https://', 'wss://')}?token=${encodeURIComponent(this.token)}`
    }
    if (this.baseURL.startsWith('http://')) {
      return `${this.baseURL.replace('http://', 'ws://')}?token=${encodeURIComponent(this.token)}`
    }
    return `${this.baseURL}?token=${encodeURIComponent(this.token)}`
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.getWsUrl())
      } catch (error) {
        reject(error)
        return
      }

      this.ws.onopen = () => {
        this.reconnectAttempts = 0
        this.startHeartbeat()
        resolve()
      }

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data?.event === 'pong') {
          this.clearPongTimeout()
          this.emit('pong', {})
          return
        }

        if (data?.event && data?.payload) {
          this.emit(data.event as keyof EventMap, data.payload)
        }
      }

      this.ws.onclose = () => {
        this.cleanupHeartbeat()
        this.reconnect()
      }

      this.ws.onerror = () => {
        reject(new Error('WebSocket connection failed'))
      }
    })
  }

  disconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout)
    this.cleanupHeartbeat()
    this.ws?.close()
    this.ws = null
  }

  private reconnect() {
    const delays = [1000, 2000, 4000, 8000, 16000, 30000]
    const delay = delays[Math.min(this.reconnectAttempts, delays.length - 1)]
    this.reconnectAttempts += 1
    this.emit('reconnecting', { attempt: this.reconnectAttempts })

    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch(() => {
        if (this.reconnectAttempts < 5) {
          this.reconnect()
          return
        }
        this.emit('reconnect_failed', { attempts: this.reconnectAttempts })
      })
    }, delay)
  }

  private startHeartbeat() {
    this.cleanupHeartbeat()
    this.heartbeatInterval = setInterval(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
      this.ws.send(JSON.stringify({ event: 'ping' }))
      this.clearPongTimeout()
      this.pongTimeout = setTimeout(() => {
        this.ws?.close()
      }, 10000)
    }, 30000)
  }

  private clearPongTimeout() {
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout)
      this.pongTimeout = null
    }
  }

  private cleanupHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval)
    this.heartbeatInterval = null
    this.clearPongTimeout()
  }

  private send(event: string, payload: Record<string, unknown> = {}) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    this.ws.send(JSON.stringify({ event, payload }))
  }

  sendMessage(content: string) {
    this.send('user_message', { content })
  }

  stopGeneration() {
    this.send('stop_generation')
  }

  clearContext() {
    this.send('clear_context')
  }

  async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseURL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
        ...(options.headers || {})
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('401 Unauthorized')
      }
      throw new Error(`Gateway error ${response.status}`)
    }

    return response.json() as Promise<T>
  }
}
