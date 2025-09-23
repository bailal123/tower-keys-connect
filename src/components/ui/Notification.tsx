import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const notificationVariants = cva(
  'relative flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-white border-gray-200 text-gray-900',
        success: 'bg-green-50 border-green-200 text-green-900',
        error: 'bg-red-50 border-red-200 text-red-900',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
        info: 'bg-blue-50 border-blue-200 text-blue-900',
      },
      position: {
        'top-right': 'fixed top-4 right-4 z-50',
        'top-left': 'fixed top-4 left-4 z-50',
        'bottom-right': 'fixed bottom-4 right-4 z-50',
        'bottom-left': 'fixed bottom-4 left-4 z-50',
        'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
        'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50',
      },
    },
    defaultVariants: {
      variant: 'default',
      position: 'top-right',
    },
  }
)

export interface NotificationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof notificationVariants> {
  title?: string
  description?: string
  action?: React.ReactNode
  onClose?: () => void
  closable?: boolean
  icon?: React.ReactNode
  autoClose?: boolean
  duration?: number
}

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  ({ 
    className, 
    variant, 
    position, 
    title, 
    description, 
    action, 
    onClose, 
    closable = true, 
    icon, 
    autoClose = false,
    duration = 5000,
    children,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)
    
    React.useEffect(() => {
      if (autoClose && duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false)
          setTimeout(() => onClose?.(), 300) // Wait for animation
        }, duration)
        
        return () => clearTimeout(timer)
      }
    }, [autoClose, duration, onClose])
    
    const getIcon = () => {
      if (icon) return icon
      
      switch (variant) {
        case 'success':
          return <CheckCircle className="h-5 w-5 text-green-600" />
        case 'error':
          return <AlertCircle className="h-5 w-5 text-red-600" />
        case 'warning':
          return <AlertTriangle className="h-5 w-5 text-yellow-600" />
        case 'info':
          return <Info className="h-5 w-5 text-blue-600" />
        default:
          return null
      }
    }
    
    const handleClose = () => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300)
    }

    if (!isVisible) return null

    return (
      <div
        ref={ref}
        className={cn(
          notificationVariants({ variant, position }),
          'animate-in slide-in-from-top-2 fade-in-0',
          !isVisible && 'animate-out slide-out-to-top-2 fade-out-0',
          className
        )}
        role="alert"
        {...props}
      >
        {getIcon()}
        
        <div className="flex-1 min-w-0">
          {title && (
            <div className="text-sm font-medium">
              {title}
            </div>
          )}
          
          {description && (
            <div className="mt-1 text-sm opacity-90">
              {description}
            </div>
          )}
          
          {children}
          
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>
        
        {closable && onClose && (
          <button
            type="button"
            onClick={handleClose}
            className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)

Notification.displayName = 'Notification'

// Toast Container Component
export interface ToastContainerProps {
  children: React.ReactNode
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  className?: string
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  children,
  position = 'top-right',
  className
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right': return 'fixed top-4 right-4 z-50'
      case 'top-left': return 'fixed top-4 left-4 z-50'
      case 'bottom-right': return 'fixed bottom-4 right-4 z-50'
      case 'bottom-left': return 'fixed bottom-4 left-4 z-50'
      case 'top-center': return 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50'
      case 'bottom-center': return 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50'
      default: return 'fixed top-4 right-4 z-50'
    }
  }

  return (
    <div className={cn('space-y-2', getPositionClasses(), className)}>
      {children}
    </div>
  )
}

export { Notification, ToastContainer }