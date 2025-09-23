import React from 'react'
import { cn } from '../../lib/utils'
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react'

export type AlertType = 'success' | 'warning' | 'error' | 'info'

interface AlertProps {
  type: AlertType
  title?: string
  message: string
  onClose?: () => void
  className?: string
}

const alertStyles = {
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: 'text-green-400',
    title: 'text-green-800',
    message: 'text-green-700'
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: 'text-yellow-400',
    title: 'text-yellow-800',
    message: 'text-yellow-700'
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: 'text-red-400',
    title: 'text-red-800',
    message: 'text-red-700'
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: 'text-blue-400',
    title: 'text-blue-800',
    message: 'text-blue-700'
  }
}

const getIcon = (type: AlertType) => {
  switch (type) {
    case 'success':
      return CheckCircle
    case 'warning':
      return AlertTriangle
    case 'error':
      return XCircle
    case 'info':
      return Info
    default:
      return Info
  }
}

export const Alert: React.FC<AlertProps> = ({ 
  type, 
  title, 
  message, 
  onClose, 
  className 
}) => {
  const IconComponent = getIcon(type)
  const styles = alertStyles[type]

  return (
    <div className={cn(
      'rounded-lg border p-4 mb-4',
      styles.container,
      className
    )}>
      <div className="flex">
        <div className="flex-shrink-0">
          <IconComponent className={cn('h-5 w-5', styles.icon)} />
        </div>
        <div className="mr-3 flex-1">
          {title && (
            <h3 className={cn('text-sm font-medium', styles.title)}>
              {title}
            </h3>
          )}
          <div className={cn('text-sm', title ? 'mt-1' : '', styles.message)}>
            {message}
          </div>
        </div>
        {onClose && (
          <div className="mr-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  'hover:bg-opacity-20 hover:bg-gray-600',
                  styles.icon
                )}
              >
                <span className="sr-only">إغلاق</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Alert