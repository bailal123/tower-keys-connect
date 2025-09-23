import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const textareaVariants = cva(
  'w-full min-h-[100px] px-3 py-2 text-sm border rounded-lg bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 resize-y disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
        success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
        error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
        warning: 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, label, error, helperText, required, ...props }, ref) => {
    const id = props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'block text-sm font-medium',
              error ? 'text-red-700' : 'text-gray-700'
            )}
          >
            {label}
            {required && <span className="text-red-500 mr-1">*</span>}
          </label>
        )}
        <textarea
          id={id}
          className={cn(textareaVariants({ variant: error ? 'error' : variant }), className)}
          ref={ref}
          {...props}
        />
        {(error || helperText) && (
          <p className={cn(
            'text-xs',
            error ? 'text-red-600' : 'text-gray-500'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }