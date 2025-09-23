import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-sm',
  {
    variants: {
      variant: {
        default:
          'bg-blue-600 text-white shadow hover:bg-blue-700 focus-visible:ring-blue-500',
        destructive:
          'bg-red-600 text-white shadow hover:bg-red-700 focus-visible:ring-red-500',
        outline:
          'border border-gray-300 bg-white shadow-sm hover:bg-gray-50 hover:border-gray-400 focus-visible:ring-blue-500',
        secondary:
          'bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 focus-visible:ring-gray-500',
        ghost: 'hover:bg-gray-100 hover:text-gray-900 shadow-none',
        link: 'text-blue-600 underline-offset-4 hover:underline shadow-none',
        success:
          'bg-green-600 text-white shadow hover:bg-green-700 focus-visible:ring-green-500',
        warning:
          'bg-yellow-600 text-white shadow hover:bg-yellow-700 focus-visible:ring-yellow-500',
        info:
          'bg-cyan-600 text-white shadow hover:bg-cyan-700 focus-visible:ring-cyan-500',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-lg px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }