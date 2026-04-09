export type AgentState = 'running' | 'stopped' | 'thinking'

export interface Message {
  id: string
  role: 'user' | 'agent' | 'tool_call' | 'tool_result'
  content: string
  ts: number
}

export interface Tool {
  name: string
  description: string
  parameters: Record<
    string,
    { type: string; required?: boolean; description?: string; default?: unknown }
  >
}

export interface LogEntry {
  level: 'info' | 'warn' | 'error'
  message: string
  ts: number
}

export interface Settings {
  model: string
  temperature: number
  max_tokens: number
  theme: 'auto' | 'light' | 'dark'
}
