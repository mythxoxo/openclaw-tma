'use client'

import { useAppStore } from '@/lib/store'

export function Toast() {
  const toast = useAppStore((s) => s.toast)
  const closeToast = useAppStore((s) => s.closeToast)

  if (!toast) return null

  return (
    <div className="tma-toast">
      <div className="tma-card" style={{ padding: 12 }}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm" style={{ margin: 0 }}>{toast.message}</p>
          <div className="flex items-center gap-2">
            {toast.actionLabel && (
              <button
                className="tma-chip"
                onClick={() => {
                  toast.onAction?.()
                  closeToast()
                }}
              >
                {toast.actionLabel}
              </button>
            )}
            <button className="tma-icon-button" style={{ width: 36, height: 36 }} onClick={closeToast}>
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
