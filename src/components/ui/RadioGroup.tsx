import React from 'react'
import { cn } from '../../lib/utils'

export interface RadioOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface RadioGroupProps {
  name: string
  value?: string
  onChange: (value: string) => void
  options: RadioOption[]
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  direction?: 'horizontal' | 'vertical'
  className?: string
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  onChange,
  options,
  label,
  error,
  helperText,
  required,
  direction = 'vertical',
  className
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className={cn(
          'block text-sm font-medium',
          error ? 'text-red-700' : 'text-gray-700'
        )}>
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      
      <div className={cn(
        'space-y-3',
        direction === 'horizontal' && 'flex flex-wrap gap-6 space-y-0'
      )}>
        {options.map((option) => (
          <div key={option.value} className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id={`${name}-${option.value}`}
                name={name}
                type="radio"
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
                disabled={option.disabled}
                className={cn(
                  'w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2',
                  option.disabled && 'opacity-50 cursor-not-allowed'
                )}
              />
            </div>
            <div className="mr-3 text-sm">
              <label
                htmlFor={`${name}-${option.value}`}
                className={cn(
                  'font-medium',
                  option.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-900 cursor-pointer'
                )}
              >
                {option.label}
              </label>
              {option.description && (
                <p className={cn(
                  'text-gray-500',
                  option.disabled && 'text-gray-400'
                )}>
                  {option.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {(error || helperText) && (
        <p className={cn(
          'text-xs mt-2',
          error ? 'text-red-600' : 'text-gray-500'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  )
}

export { RadioGroup }