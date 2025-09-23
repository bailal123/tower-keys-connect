import React from 'react'
import { cn } from '../../lib/utils'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
  variant?: 'default' | 'success' | 'error' | 'warning'
  onChange?: (value: string | number) => void
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    options, 
    placeholder, 
    variant = 'default', 
    onChange,
    ...props 
  }, ref) => {
    const variantClasses = {
      default: 'focus:ring-blue-500 focus:border-blue-500',
      success: 'focus:ring-green-500 focus:border-green-500 border-green-300',
      error: 'focus:ring-red-500 focus:border-red-500 border-red-300',
      warning: 'focus:ring-yellow-500 focus:border-yellow-500 border-yellow-300'
    }

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        const value = e.target.value
        // Try to parse as number if possible
        const numericValue = Number(value)
        onChange(isNaN(numericValue) ? value : numericValue)
      }
    }

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-semibold text-gray-800">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              'w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors bg-white shadow-sm appearance-none',
              'focus:ring-2 focus:outline-none pr-10',
              variantClasses[variant],
              error && 'border-red-300 focus:ring-red-500 focus:border-red-500',
              className
            )}
            ref={ref}
            onChange={handleChange}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
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
Select.displayName = 'Select'

export { Select }