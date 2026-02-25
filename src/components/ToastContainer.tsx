import { useToastStore } from '../store/toastStore'
import Toast from './Toast'
import './Toast.css'

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={removeToast}
        />
      ))}
    </div>
  )
}
