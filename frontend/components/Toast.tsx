'use client'

import { useAppStore } from '@/lib/store'

export function Toast() {
  const toast = useAppStore((s) => s.toast)
  const closeToast = useAppStore((s) => s.closeToast)

  if (!toast) return null

  return (
    <div className="fixed left-4 right-4 top-4 z-[60] rounded bg-red-600 p-3 text-white shadow">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm">{toast.message}</p>
        <div className="flex gap-2">
          {toast.actionLabel && (
            <button
              className="rounded border border-white/40 px-2 py-1 text-xs"
              onClick={() => {
                toast.onAction?.()
                closeToast()
              }}
            >
              {toast.actionLabel}
            </button>
          )}
          <button className="text-xs" onClick={closeToast}>
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
