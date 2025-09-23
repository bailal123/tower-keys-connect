import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { X } from 'lucide-react'

const badgeVariants = cva(
  'inline-flex items-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
        success: 'bg-green-100 text-green-800 hover:bg-green-200',
        warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        error: 'bg-red-100 text-red-800 hover:bg-red-200',
        info: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200',
        neutral: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
        outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs rounded',
        md: 'px-2.5 py-1 text-sm rounded-md',
        lg: 'px-3 py-1.5 text-base rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  removable?: boolean
  onRemove?: () => void
  icon?: React.ReactNode
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, children, removable, onRemove, icon, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)} 
        {...props}
      >
        {icon && (
          <span className="ml-1 flex-shrink-0">
            {icon}
          </span>
        )}
        
        <span className="truncate">{children}</span>
        
        {removable && onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="mr-1 flex-shrink-0 hover:bg-black/10 rounded-full p-0.5 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }