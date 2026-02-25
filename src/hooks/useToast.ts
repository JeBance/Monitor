import { useCallback } from 'react'
import { useToastStore } from '../store/toastStore'

export function useToast() {
  const addToast = useToastStore(state => state.addToast)
  const removeToast = useToastStore(state => state.removeToast)

  const success = useCallback((message: string) => {
    addToast({ message, type: 'success' })
  }, [addToast])

  const error = useCallback((message: string) => {
    addToast({ message, type: 'error' })
  }, [addToast])

  const info = useCallback((message: string) => {
    addToast({ message, type: 'info' })
  }, [addToast])

  const warning = useCallback((message: string) => {
    addToast({ message, type: 'warning' })
  }, [addToast])

  return { success, error, info, warning, removeToast }
}
