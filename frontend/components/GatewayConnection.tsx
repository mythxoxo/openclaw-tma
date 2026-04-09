'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

export default function GatewayConnection() {
  const router = useRouter()
  const [url, setUrl] = useState(process.env.NEXT_PUBLIC_DEFAULT_GATEWAY_URL || '')
  const [token, setToken] = useState('')
  const setGatewayConfig = useStore((s) => s.setGatewayConfig)
  const connectToGateway = useStore((s) => s.connectToGateway)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setGatewayConfig(url, token)
    try {
      await connectToGateway()
      router.push('/chat')
    } catch {
      // toast via store
    }
  }

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div>
        <label className="mb-1 block text-sm">Gateway URL</label>
        <input
          className="w-full"
          placeholder="wss://192.168.1.100:8080"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm">API Token</label>
        <input
          className="w-full"
          placeholder="your-token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
        />
      </div>
      <button className="w-full" style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }} type="submit">
        Подключиться
      </button>
    </form>
  )
}
