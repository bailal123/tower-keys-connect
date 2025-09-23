import React from 'react'
import { cn } from '../../lib/utils'
import { Button } from './Button'
import { Edit, Trash2 } from 'lucide-react'

interface ActionCardProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  badge?: {
    text: string
    variant: 'success' | 'error' | 'warning' | 'info'
  }
  isSelected?: boolean
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  className?: string
  children?: React.ReactNode
}

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  subtitle,
  icon,
  badge,
  isSelected,
  onClick,
  onEdit,
  onDelete,
  className,
  children
}) => {
  const badgeVariants = {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800'
  }

  return (
    <div 
      className={cn(
        'bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md',
        'hover:border-blue-300 p-4',
        isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200',
        className
      )}
      onClick={onClick}
    >
      <div className="text-center space-y-3">
        {icon && (
          <div className="flex justify-center">
            {icon}
          </div>
        )}
        
        <div>
          <h3 className="font-medium text-sm text-gray-900">{title}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>

        {badge && (
          <div className="flex justify-center">
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              badgeVariants[badge.variant]
            )}>
              {badge.text}
            </span>
          </div>
        )}

        {children}

        {(onEdit || onDelete) && (
          <div className="flex justify-center gap-4 space-x-1 mt-3">
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm"
                className="h-6 w-6 p-0 text-blue-600 border-blue-600 hover:bg-blue-50"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="outline" 
                size="sm"
                className="h-6 w-6 p-0 text-red-600 border-red-600 hover:bg-red-50 bg-white"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export { ActionCard }