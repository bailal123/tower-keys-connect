import React from 'react'
import { cn } from '../../lib/utils'
import { Check } from 'lucide-react'

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string
  description?: string
  error?: string
  variant?: 'default' | 'success' | 'error' | 'warning'
  size?: 'sm' | 'md' | 'lg'
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, variant = 'default', size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    }

    const variantClasses = {
      default: 'text-blue-600 focus:ring-blue-500 border-gray-300',
      success: 'text-green-600 focus:ring-green-500 border-green-300',
      error: 'text-red-600 focus:ring-red-500 border-red-300',
      warning: 'text-yellow-600 focus:ring-yellow-500 border-yellow-300'
    }

    const id = props.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="space-y-2">
        <div className="flex items-start space-x-3">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              id={id}
              className={cn(
                'rounded border transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none',
                sizeClasses[size],
                variantClasses[variant],
                error && 'border-red-300 text-red-600 focus:ring-red-500',
                props.disabled && 'opacity-50 cursor-not-allowed',
                className
              )}
              ref={ref}
              {...props}
            />
            {props.checked && (
              <Check className={cn(
                'absolute text-white pointer-events-none',
                size === 'sm' && 'h-3 w-3',
                size === 'md' && 'h-4 w-4',
                size === 'lg' && 'h-5 w-5'
              )} />
            )}
          </div>
          {(label || description) && (
            <div className="flex-1 min-w-0">
              {label && (
                <label 
                  htmlFor={id}
                  className={cn(
                    'block font-medium text-gray-900 cursor-pointer',
                    size === 'sm' && 'text-sm',
                    size === 'md' && 'text-sm',
                    size === 'lg' && 'text-base',
                    props.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {label}
                </label>
              )}
              {description && (
                <p className={cn(
                  'text-gray-500 mt-1',
                  size === 'sm' && 'text-xs',
                  size === 'md' && 'text-sm',
                  size === 'lg' && 'text-sm'
                )}>
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }