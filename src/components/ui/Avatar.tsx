import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { User } from 'lucide-react'

const avatarVariants = cva(
  'relative inline-flex items-center justify-center rounded-full bg-gray-100 overflow-hidden',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-16 w-16 text-xl',
        '2xl': 'h-20 w-20 text-2xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string
  alt?: string
  name?: string
  fallback?: string
  showInitials?: boolean
  status?: 'online' | 'offline' | 'away' | 'busy'
  showStatus?: boolean
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ 
    className, 
    size, 
    src, 
    alt, 
    name, 
    fallback, 
    showInitials = true, 
    status,
    showStatus = false,
    ...props 
  }, ref) => {
    const [imageError, setImageError] = React.useState(false)
    
    const getInitials = () => {
      if (fallback) return fallback
      if (!name) return ''
      
      return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    
    const getStatusColor = () => {
      switch (status) {
        case 'online': return 'bg-green-500'
        case 'offline': return 'bg-gray-400'
        case 'away': return 'bg-yellow-500'
        case 'busy': return 'bg-red-500'
        default: return 'bg-gray-400'
      }
    }
    
    const getStatusSize = () => {
      switch (size) {
        case 'xs': return 'h-1.5 w-1.5'
        case 'sm': return 'h-2 w-2'
        case 'md': return 'h-2.5 w-2.5'
        case 'lg': return 'h-3 w-3'
        case 'xl': return 'h-3.5 w-3.5'
        case '2xl': return 'h-4 w-4'
        default: return 'h-2.5 w-2.5'
      }
    }
    
    const getIconSize = () => {
      switch (size) {
        case 'xs': return 'h-3 w-3'
        case 'sm': return 'h-4 w-4'
        case 'md': return 'h-5 w-5'
        case 'lg': return 'h-6 w-6'
        case 'xl': return 'h-8 w-8'
        case '2xl': return 'h-10 w-10'
        default: return 'h-5 w-5'
      }
    }

    return (
      <div 
        ref={ref}
        className={cn(avatarVariants({ size }), className)} 
        {...props}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : showInitials && getInitials() ? (
          <span className="font-medium text-gray-600 select-none">
            {getInitials()}
          </span>
        ) : (
          <User className={cn('text-gray-400', getIconSize())} />
        )}
        
        {/* Status Indicator */}
        {showStatus && status && (
          <span 
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-2 border-white',
              getStatusColor(),
              getStatusSize()
            )}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

export { Avatar }