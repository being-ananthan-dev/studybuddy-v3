/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()
let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastId
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`
              pointer-events-auto px-4 py-3 rounded-xl text-sm font-semibold text-white shadow-lg
              animate-in slide-in-from-right-5 fade-in duration-300
              ${t.type === 'error'   ? 'bg-red-600' :
                t.type === 'success' ? 'bg-emerald-600' :
                t.type === 'warning' ? 'bg-amber-600' :
                                       'bg-blue-600'}
            `}
          >
            {t.type === 'error' && '❌ '}
            {t.type === 'success' && '✅ '}
            {t.type === 'warning' && '⚠️ '}
            {t.type === 'info' && 'ℹ️ '}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
