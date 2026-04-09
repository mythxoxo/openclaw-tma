'use client'

import { create } from 'zustand'
import { GatewayClient } from './gatewayClient'
import type { AgentState, LogEntry, Message, Settings, Tool } from './types'

interface Store {
  gatewayUrl: string | null
  apiToken: string | null
  isConnected: boolean
  isReconnecting: boolean
  reconnectAttempts: number
  connectionError: string | null
  messages: Message[]
  isStreaming: boolean
  agentStatus: AgentState | null
  tools: Tool[]
  logs: LogEntry[]
  systemPrompt: string
  settings: Settings
  toast: { message: string; actionLabel?: string } | null
  client: GatewayClient | null
  setGatewayConfig: (url: string, token: string) => void
  connectToGateway: () => Promise<void>
  disconnectFromGateway: () => void
  sendMessage: (content: string) => void
  stopGeneration: () => void
  clearChat: () => void
  fetchTools: () => Promise<void>
  fetchLogs: () => Promise<void>
  fetchSystemPrompt: () => Promise<void>
  updateSystemPrompt: (prompt: string) => Promise<void>
  fetchAgentStatus: () => Promise<void>
  startAgent: () => Promise<void>
  stopAgent: () => Promise<void>
  updateAgentConfig: (config: Partial<Settings>) => Promise<void>
  fetchModels: () => Promise<Array<{ id: string; name: string; provider: string }>>
  clearToast: () => void
}

const SESSION_KEY = 'openclaw_gateway_config'

export const useStore = create<Store>((set, get) => ({
  gatewayUrl: null,
  apiToken: null,
  isConnected: false,
  isReconnecting: false,
  reconnectAttempts: 0,
  connectionError: null,
  messages: [],
  isStreaming: false,
  agentStatus: null,
  tools: [],
  logs: [],
  systemPrompt: '',
  settings: { model: 'gpt-4o', temperature: 0.7, max_tokens: 4096, theme: 'auto' },
  toast: null,
  client: null,

  setGatewayConfig: (url, token) => {
    const payload = { url, token }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload))
    set({ gatewayUrl: url, apiToken: token, client: new GatewayClient(url, token) })
  },

  connectToGateway: async () => {
    let { gatewayUrl, apiToken, client } = get()
    if ((!gatewayUrl || !apiToken) && typeof window !== 'undefined') {
      const raw = sessionStorage.getItem(SESSION_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        gatewayUrl = parsed.url
        apiToken = parsed.token
        client = new GatewayClient(parsed.url, parsed.token)
        set({ gatewayUrl, apiToken, client })
      }
    }

    if (!client) throw new Error('Gateway config is missing')

    try {
      set({ connectionError: null, isReconnecting: false })
      await client.fetch('/api/status')
      await client.connect()
      set({ isConnected: true, reconnectAttempts: 0, isReconnecting: false })

      client.on('message_chunk', (chunk) => {
        set((state) => {
          const existing = state.messages.find((m) => m.id === chunk.message_id)
          if (existing) {
            return {
              messages: state.messages.map((m) =>
                m.id === chunk.message_id ? { ...m, content: m.content + chunk.content } : m
              )
            }
          }

          return {
            messages: [
              ...state.messages,
              { id: chunk.message_id, role: 'agent', content: chunk.content, ts: Date.now() }
            ]
          }
        })
      })

      client.on('message_done', () => set({ isStreaming: false }))
      client.on('agent_status', (status) => set({ agentStatus: status.state }))
      client.on('log_entry', (log) => set((state) => ({ logs: [...state.logs, log] })))
      client.on('tool_call', (tool) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: tool.call_id,
              role: 'tool_call',
              content: `${tool.name}: ${JSON.stringify(tool.input)}`,
              ts: Date.now()
            }
          ]
        }))
      )
      client.on('tool_result', (result) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: `${result.call_id}-result`,
              role: 'tool_result',
              content: result.error ? `Error: ${result.error}` : result.output,
              ts: Date.now()
            }
          ]
        }))
      )

      client.on('reconnecting', ({ attempt }) =>
        set({ isConnected: false, isReconnecting: true, reconnectAttempts: attempt, toast: { message: 'Переподключение...' } })
      )
      client.on('reconnect_failed', () =>
        set({ isConnected: false, isReconnecting: false, toast: { message: 'Потеряно WS-соединение', actionLabel: 'Повторить' } })
      )
    } catch (error) {
      set({
        isConnected: false,
        connectionError: error instanceof Error ? error.message : 'Connection failed',
        toast: { message: (error instanceof Error && error.message.includes('401')) ? 'Истёк токен (401)' : 'Ошибка подключения к Gateway', actionLabel: 'Повторить' }
      })
      throw error
    }
  },

  disconnectFromGateway: () => {
    get().client?.disconnect()
    set({ isConnected: false, isReconnecting: false })
  },

  sendMessage: (content) => {
    const id = `${Date.now()}-user`
    set((state) => ({
      isStreaming: true,
      messages: [...state.messages, { id, role: 'user', content, ts: Date.now() }]
    }))
    get().client?.sendMessage(content)
  },

  stopGeneration: () => {
    get().client?.stopGeneration()
    set({ isStreaming: false })
  },

  clearChat: () => {
    get().client?.clearContext()
    set({ messages: [] })
  },

  fetchTools: async () => {
    const response = await get().client?.fetch<{ tools: Tool[] }>('/api/tools')
    set({ tools: response?.tools || [] })
  },

  fetchLogs: async () => {
    const response = await get().client?.fetch<{ logs: LogEntry[] }>('/api/logs')
    set({ logs: response?.logs || [] })
  },

  fetchSystemPrompt: async () => {
    const response = await get().client?.fetch<{ content: string }>('/api/prompts/system')
    set({ systemPrompt: response?.content || '' })
  },

  updateSystemPrompt: async (prompt) => {
    try {
      await get().client?.fetch('/api/prompts/system', {
        method: 'PUT',
        body: JSON.stringify({ content: prompt })
      })
      set({ systemPrompt: prompt })
    } catch {
      set({ toast: { message: 'Ошибка сохранения промпта' } })
    }
  },

  fetchAgentStatus: async () => {
    const response = await get().client?.fetch<{
      state: AgentState
      model: string
      temperature: number
      max_tokens: number
    }>('/api/agent/status')
    if (!response) return
    set({
      agentStatus: response.state,
      settings: {
        ...get().settings,
        model: response.model,
        temperature: response.temperature,
        max_tokens: response.max_tokens
      }
    })
  },

  startAgent: async () => {
    await get().client?.fetch('/api/agent/start', { method: 'POST' })
    set({ agentStatus: 'running' })
  },

  stopAgent: async () => {
    await get().client?.fetch('/api/agent/stop', { method: 'POST' })
    set({ agentStatus: 'stopped' })
  },

  updateAgentConfig: async (config) => {
    const merged = { ...get().settings, ...config }
    await get().client?.fetch('/api/agent/config', {
      method: 'PUT',
      body: JSON.stringify(merged)
    })
    set({ settings: merged })
  },

  fetchModels: async () => {
    const response = await get().client?.fetch<{
      models: Array<{ id: string; name: string; provider: string }>
    }>('/api/models')
    return response?.models || []
  },

  clearToast: () => set({ toast: null })
}))
