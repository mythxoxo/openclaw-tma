import GatewayConnection from '@/components/GatewayConnection'

export default function HomePage() {
  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">OpenClaw TMA</h1>
      <p className="text-sm text-slate-500">Введите URL вашего Gateway и API токен.</p>
      <GatewayConnection />
    </section>
  )
}
