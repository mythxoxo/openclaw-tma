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
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <input required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="wss://your-server.com" />
      <input required value={token} onChange={(e) => setToken(e.target.value)} placeholder="Ваш API токен" type="password" />
      <button className="tma-button w-full" disabled={loading}>
        {loading ? 'Подключение...' : 'Подключиться'}
      </button>
    </form>
  )
}
