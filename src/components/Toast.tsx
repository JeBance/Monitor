import { useEffect } from 'react'
import './Toast.css'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastProps {
  id: string
  message: string
  type: ToastType
  onClose: (id: string) => void
  duration?: number
}

export default function Toast({ id, message, type, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, duration)
    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">
        {type === 'success' && '✓'}
        {type === 'error' && '⚠'}
        {type === 'info' && 'ℹ'}
        {type === 'warning' && '⚡'}
      </span>
      <span className="toast-message">{message}</span>
      <button onClick={() => onClose(id)} className="toast-close">×</button>
    </div>
  )
}
