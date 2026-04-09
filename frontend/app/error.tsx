'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-3">
      <p>Что-то пошло не так</p>
      <button className="bg-slate-200" onClick={reset}>
        Попробовать снова
      </button>
    </div>
  )
}
