import React, { createContext, useState, useCallback } from 'react'
import { Alert } from '../components/ui/Alert'
import type { AlertType } from '../components/ui/Alert'

interface Notification {
  id: string
  type: AlertType
  title?: string
  message: string
  duration?: number
  onClose?: () => void
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  showSuccess: (message: string, title?: string) => void
  showError: (message: string, title?: string) => void
  showWarning: (message: string, title?: string) => void
  showInfo: (message: string, title?: string) => void
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: React.ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000
    }

    setNotifications(prev => [...prev, newNotification])

    // Auto remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id))
      }, newNotification.duration)
    }
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const showSuccess = useCallback((message: string, title?: string) => {
    addNotification({ type: 'success', message, title })
  }, [addNotification])

  const showError = useCallback((message: string, title?: string) => {
    addNotification({ type: 'error', message, title })
  }, [addNotification])

  const showWarning = useCallback((message: string, title?: string) => {
    addNotification({ type: 'warning', message, title })
  }, [addNotification])

  const showInfo = useCallback((message: string, title?: string) => {
    addNotification({ type: 'info', message, title })
  }, [addNotification])

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Notification Container */}
      <div className="fixed top-4 left-4 z-50 space-y-4 max-w-sm">
        {notifications.map(notification => (
          <Alert
            key={notification.id}
            type={notification.type}
            title={notification.title}
            message={notification.message}
            onClose={() => {
              removeNotification(notification.id)
              notification.onClose?.()
            }}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export default NotificationProvider