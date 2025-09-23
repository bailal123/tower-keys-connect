import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const toggleVariants = cva(
  'relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'focus:ring-blue-500',
        success: 'focus:ring-green-500',
        warning: 'focus:ring-yellow-500',
        error: 'focus:ring-red-500',
      },
      size: {
        sm: 'h-5 w-9',
        md: 'h-6 w-11',
        lg: 'h-7 w-13',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

const switchVariants = cva(
  'inline-block rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export interface ToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'>,
    VariantProps<typeof toggleVariants> {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  required?: boolean
  disabled?: boolean
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ 
    className, 
    variant, 
    size, 
    checked, 
    onChange, 
    label, 
    description, 
    required, 
    disabled,
    ...props 
  }, ref) => {
    const id = props.id || `toggle-${Math.random().toString(36).substr(2, 9)}`
    
    const getBackgroundColor = () => {
      if (disabled) return 'bg-gray-300'
      if (!checked) return 'bg-gray-200'
      
      switch (variant) {
        case 'success': return 'bg-green-600'
        case 'warning': return 'bg-yellow-600'
        case 'error': return 'bg-red-600'
        default: return 'bg-blue-600'
      }
    }
    
    const getTranslateClass = () => {
      if (!checked) return 'translate-x-0'
      
      switch (size) {
        case 'sm': return 'translate-x-4'
        case 'lg': return 'translate-x-6'
        default: return 'translate-x-5'
      }
    }

    return (
      <div className="flex items-start">
        <button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={label ? `${id}-label` : undefined}
          aria-describedby={description ? `${id}-description` : undefined}
          onClick={() => !disabled && onChange(!checked)}
          disabled={disabled}
          className={cn(
            toggleVariants({ variant, size }),
            getBackgroundColor(),
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          {...props}
        >
          <span
            className={cn(
              switchVariants({ size }),
              getTranslateClass()
            )}
          />
        </button>
        
        {(label || description) && (
          <div className="mr-3 flex flex-col">
            {label && (
              <label
                id={`${id}-label`}
                className={cn(
                  'text-sm font-medium cursor-pointer',
                  disabled ? 'text-gray-400' : 'text-gray-900'
                )}
                onClick={() => !disabled && onChange(!checked)}
              >
                {label}
                {required && <span className="text-red-500 mr-1">*</span>}
              </label>
            )}
            {description && (
              <p
                id={`${id}-description`}
                className={cn(
                  'text-xs',
                  disabled ? 'text-gray-400' : 'text-gray-500'
                )}
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Toggle.displayName = 'Toggle'

export { Toggle }