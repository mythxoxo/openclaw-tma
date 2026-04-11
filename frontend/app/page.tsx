'use client'

import { GatewayConnection } from '@/components/GatewayConnection'
import { Toast } from '@/components/Toast'

export default function LoginPage() {
  return (
    <section className="tma-page" style={{ minHeight: 'calc(100vh - 120px)', justifyContent: 'center' }}>
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="text-4xl font-bold">🤖 OpenClaw</div>
        <p className="tma-subtitle">Подключитесь к вашему агенту</p>
      </div>

      <div className="tma-card">
        <GatewayConnection />
      </div>

      <Toast />
    </section>
  )
}
