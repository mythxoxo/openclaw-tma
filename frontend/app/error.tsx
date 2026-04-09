'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <p>Что-то пошло не так</p>
      <button className="rounded bg-blue-600 px-4 py-2 text-white" onClick={reset}>
        Попробовать снова
      </button>
    </div>
  )
}
