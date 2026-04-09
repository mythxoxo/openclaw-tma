'use client'

import { create } from 'zustand'
import { GatewayClient } from '@/lib/gatewayClient'
import { AgentState, LogEntry, Message, Settings, Tool } from '@/lib/types'

interface Store {
  gatewayUrl: string | null
  apiToken: string | null
  isConnected: boolean
  isReconnecting: boolean
  connectionError: string | null
  messages: Message[]
  isStreaming: boolean
  agentStatus: AgentState | null
  tools: Tool[]
  logs: LogEntry[]
  systemPrompt: string
  settings: Settings
  toast: { message: string; actionLabel?: string; onAction?: () => void } | null
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
  restartAgent: () => Promise<void>
  updateAgentConfig: (config: Partial<Settings>) => Promise<void>
  fetchModels: () => Promise<Array<{ id: string; name: string; provider: string }>>
  runTool: (name: string, input: Record<string, unknown>) => Promise<{ output: string; error: string | null }>
  setToast: (message: string, actionLabel?: string, onAction?: () => void) => void
  closeToast: () => void
}

const sessionUrl = typeof window !== 'undefined' ? sessionStorage.getItem('gatewayUrl') : null
const sessionToken = typeof window !== 'undefined' ? sessionStorage.getItem('apiToken') : null

export const useAppStore = create<Store>((set, get) => ({
  gatewayUrl: sessionUrl,
  apiToken: sessionToken,
  isConnected: false,
  isReconnecting: false,
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
    sessionStorage.setItem('gatewayUrl', url)
    sessionStorage.setItem('apiToken', token)
    set({ gatewayUrl: url, apiToken: token })
  },

  connectToGateway: async () => {
    const { gatewayUrl, apiToken } = get()
    if (!gatewayUrl || !apiToken) throw new Error('Gateway URL and token are required')

    const client = new GatewayClient(gatewayUrl, apiToken, {
      onReconnectState: (isReconnecting) => set({ isReconnecting }),
      onReconnectFailed: () =>
        get().setToast('Не удалось переподключиться к WebSocket', 'Повторить', () => {
          get().connectToGateway()
        })
    })

    try {
      await client.fetch('/api/status')
      await client.connect()

      client.on('message_chunk', (chunk) => {
        const messages = [...get().messages]
        const last = messages[messages.length - 1]
        if (last && last.id === chunk.message_id) {
          last.content += chunk.content
        } else {
          messages.push({ id: chunk.message_id, role: 'agent', content: chunk.content, ts: Date.now() })
        }
        set({ messages, isStreaming: true })
      })

      client.on('message_done', () => set({ isStreaming: false }))

      client.on('tool_call', (tool) => {
        set({
          messages: [
            ...get().messages,
            { id: tool.call_id, role: 'tool_call', content: `${tool.name}: ${JSON.stringify(tool.input)}`, ts: Date.now() }
          ]
        })
      })

      client.on('tool_result', (result) => {
        set({
          messages: [
            ...get().messages,
            {
              id: `${result.call_id}-result`,
              role: 'tool_result',
              content: result.error ? `Ошибка: ${result.error}` : result.output,
              ts: Date.now()
            }
          ]
        })
      })

      client.on('agent_status', (status) => set({ agentStatus: status.state }))
      client.on('log_entry', (log) => set({ logs: [log, ...get().logs] }))

      set({ isConnected: true, connectionError: null, client })
    } catch (error) {
      set({ connectionError: 'Ошибка подключения', isConnected: false })
      get().setToast(error instanceof Error && error.message === '401' ? 'Токен истёк (401)' : 'Ошибка подключения к Gateway')
      throw error
    }
  },

  disconnectFromGateway: () => {
    get().client?.disconnect()
    set({ isConnected: false, client: null })
  },

  sendMessage: (content) => {
    const id = crypto.randomUUID()
    set({ messages: [...get().messages, { id, role: 'user', content, ts: Date.now() }], isStreaming: true })
    get().client?.sendMessage(content)
  },

  stopGeneration: () => get().client?.stopGeneration(),

  clearChat: () => {
    get().client?.clearContext()
    set({ messages: [] })
  },

  fetchTools: async () => {
    const res = await get().client?.fetch<{ tools: Tool[] }>('/api/tools')
    if (res) set({ tools: res.tools })
  },

  fetchLogs: async () => {
    const res = await get().client?.fetch<{ logs: LogEntry[] }>('/api/logs')
    if (res) set({ logs: res.logs })
  },

  fetchSystemPrompt: async () => {
    const res = await get().client?.fetch<{ content: string }>('/api/prompts/system')
    if (res) set({ systemPrompt: res.content })
  },

  updateSystemPrompt: async (prompt) => {
    try {
      await get().client?.fetch('/api/prompts/system', {
        method: 'PUT',
        body: JSON.stringify({ content: prompt })
      })
      set({ systemPrompt: prompt })
    } catch {
      get().setToast('Ошибка сохранения промпта')
    }
  },

  fetchAgentStatus: async () => {
    const res = await get().client?.fetch<{
      state: AgentState
      model: string
      temperature: number
      max_tokens: number
    }>('/api/agent/status')

    if (res) {
      set({
        agentStatus: res.state,
        settings: { ...get().settings, model: res.model, temperature: res.temperature, max_tokens: res.max_tokens }
      })
    }
  },

  startAgent: async () => {
    await get().client?.fetch('/api/agent/start', { method: 'POST' })
    set({ agentStatus: 'running' })
  },

  stopAgent: async () => {
    await get().client?.fetch('/api/agent/stop', { method: 'POST' })
    set({ agentStatus: 'stopped' })
  },

  restartAgent: async () => {
    await get().stopAgent()
    await get().startAgent()
  },

  updateAgentConfig: async (config) => {
    const merged = { ...get().settings, ...config }
    await get().client?.fetch('/api/agent/config', { method: 'PUT', body: JSON.stringify(merged) })
    set({ settings: merged })
  },

  fetchModels: async () => {
    const res = await get().client?.fetch<{ models: Array<{ id: string; name: string; provider: string }> }>('/api/models')
    return res?.models || []
  },

  runTool: async (name, input) => {
    return (
      (await get().client?.fetch<{ output: string; error: string | null }>('/api/tools/run', {
        method: 'POST',
        body: JSON.stringify({ name, input })
      })) || { output: '', error: 'Gateway client unavailable' }
    )
  },

  setToast: (message, actionLabel, onAction) => set({ toast: { message, actionLabel, onAction } }),
  closeToast: () => set({ toast: null })
}))
