'use client'

import { useEffect } from 'react'

interface ToastProps {
  message: string
  actionLabel?: string
  onAction?: () => void
  onClose: () => void
}

export default function Toast({ message, actionLabel, onAction, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed left-4 right-4 top-4 z-50 rounded-xl bg-red-600 p-3 text-white shadow">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm">{message}</p>
        <div className="flex gap-2">
          {actionLabel && onAction ? (
            <button className="bg-white/20 text-white" onClick={onAction}>
              {actionLabel}
            </button>
          ) : null}
          <button className="bg-white/20 text-white" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
