'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'

export function GatewayConnection() {
  const router = useRouter()
  const setGatewayConfig = useAppStore((s) => s.setGatewayConfig)
  const connectToGateway = useAppStore((s) => s.connectToGateway)
  const [url, setUrl] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      setGatewayConfig(url, token)
      await connectToGateway()
      router.push('/chat')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <input
        required
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full rounded border p-2"
        placeholder="Gateway URL (wss://... или https://...)"
      />
      <input
        required
        value={token}
        onChange={(e) => setToken(e.target.value)}
        className="w-full rounded border p-2"
        placeholder="API Token"
        type="password"
      />
      <button className="w-full rounded bg-blue-600 p-2 text-white" disabled={loading}>
        {loading ? 'Подключение...' : 'Подключиться'}
      </button>
    </form>
  )
}
