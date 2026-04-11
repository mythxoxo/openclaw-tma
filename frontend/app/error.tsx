'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="tma-page" style={{ minHeight: '40vh', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <div className="tma-card flex flex-col items-center gap-4">
        <p style={{ margin: 0 }}>Что-то пошло не так</p>
        <button className="tma-button px-4" onClick={reset}>
          Попробовать снова
        </button>
      </div>
    </div>
  )
}
