import React from 'react'
import { cn } from '../../lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
  variant?: 'default' | 'success' | 'error' | 'warning'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, icon, variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: 'focus:ring-blue-500 focus:border-blue-500',
      success: 'focus:ring-green-500 focus:border-green-500 border-green-300',
      error: 'focus:ring-red-500 focus:border-red-500 border-red-300',
      warning: 'focus:ring-yellow-500 focus:border-yellow-500 border-yellow-300'
    }

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-semibold text-gray-800">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors bg-white shadow-sm',
              'focus:ring-2 focus:outline-none',
              variantClasses[variant],
              icon && 'pl-10',
              error && 'border-red-300 focus:ring-red-500 focus:border-red-500',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }