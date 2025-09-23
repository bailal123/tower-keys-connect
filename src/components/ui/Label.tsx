import React from 'react'
import { cn } from '../../lib/utils'
import { AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
  required?: boolean
  optional?: boolean
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  size?: 'sm' | 'md' | 'lg'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  description?: string
  icon?: React.ReactNode
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ 
    className, 
    children, 
    required, 
    optional, 
    variant = 'default', 
    size = 'md', 
    weight = 'medium',
    description,
    icon,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base'
    }

    const weightClasses = {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold'
    }

    const variantClasses = {
      default: 'text-gray-800',
      success: 'text-green-800',
      error: 'text-red-800',
      warning: 'text-yellow-800',
      info: 'text-blue-800'
    }

    const variantIcons = {
      default: null,
      success: <CheckCircle className="h-4 w-4" />,
      error: <AlertCircle className="h-4 w-4" />,
      warning: <AlertTriangle className="h-4 w-4" />,
      info: <Info className="h-4 w-4" />
    }

    return (
      <div className="space-y-1">
        <label
          className={cn(
            'block',
            sizeClasses[size],
            weightClasses[weight],
            variantClasses[variant],
            'flex items-center gap-2',
            className
          )}
          ref={ref}
          {...props}
        >
          {(icon || variantIcons[variant]) && (
            <span className="flex-shrink-0">
              {icon || variantIcons[variant]}
            </span>
          )}
          <span className="flex-1">
            {children}
            {required && (
              <span className="text-red-500 ml-1">*</span>
            )}
            {optional && (
              <span className="text-gray-400 ml-1 text-xs">(اختياري)</span>
            )}
          </span>
        </label>
        {description && (
          <p className={cn(
            'text-gray-500',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-xs',
            size === 'lg' && 'text-sm'
          )}>
            {description}
          </p>
        )}
      </div>
    )
  }
)
Label.displayName = 'Label'

export { Label }