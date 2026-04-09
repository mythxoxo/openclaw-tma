'use client'

import { GatewayConnection } from '@/components/GatewayConnection'
import { Toast } from '@/components/Toast'

export default function LoginPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">OpenClaw TMA</h1>
      <p className="text-sm text-gray-600">Введите URL вашего Gateway и API токен.</p>
      <GatewayConnection />
      <Toast />
    </div>
  )
}
