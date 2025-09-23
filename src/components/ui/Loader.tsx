import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

const spinnerVariants = cva(
  'animate-spin',
  {
    variants: {
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
      variant: {
        default: 'text-blue-600',
        primary: 'text-blue-600',
        secondary: 'text-gray-600',
        success: 'text-green-600',
        warning: 'text-yellow-600',
        error: 'text-red-600',
        white: 'text-white',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
)

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, label, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center', className)}
        role="status"
        aria-label={label || 'جارٍ التحميل...'}
        {...props}
      >
        <Loader2 className={cn(spinnerVariants({ size, variant }))} />
        {label && <span className="sr-only">{label}</span>}
      </div>
    )
  }
)

Spinner.displayName = 'Spinner'

// Loading component with text
export interface LoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'white'
  text?: string
  fullscreen?: boolean
  overlay?: boolean
  className?: string
}

const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  variant = 'default',
  text = 'جارٍ التحميل...',
  fullscreen = false,
  overlay = false,
  className
}) => {
  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center gap-3',
      fullscreen && 'min-h-screen',
      overlay && 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50',
      className
    )}>
      <Spinner size={size} variant={variant} />
      {text && (
        <p className={cn(
          'text-sm font-medium',
          variant === 'white' ? 'text-white' : 'text-gray-600'
        )}>
          {text}
        </p>
      )}
    </div>
  )

  return content
}

// Skeleton component for loading placeholders
export interface SkeletonProps {
  className?: string
  lines?: number
  width?: string
  height?: string
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  lines = 1,
  width,
  height = '1rem'
}) => {
  if (lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse bg-gray-200 rounded"
            style={{
              width: index === lines - 1 ? '70%' : width || '100%',
              height
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 rounded',
        className
      )}
      style={{ width, height }}
    />
  )
}

// Progress Bar component
export interface ProgressProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
  showValue?: boolean
  className?: string
}

const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showValue = false,
  className
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }
  
  const variantClasses = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600'
  }

  return (
    <div className={cn('w-full', className)}>
      <div className={cn(
        'bg-gray-200 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out rounded-full',
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <div className="mt-1 text-xs text-gray-600 text-center">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  )
}

export { Spinner, Loader, Skeleton, Progress }