import React from 'react'
import { cn } from '../../lib/utils'
import { Button } from './Button'
import { Edit, Trash2 } from 'lucide-react'

interface InfoCardProps {
  title: string
  subtitle?: string
  description?: string
  icon?: React.ReactNode
  badges?: Array<{
    text: string
    variant: 'success' | 'error' | 'warning' | 'info' | 'neutral'
  }>
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  className?: string
  children?: React.ReactNode
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  subtitle,
  description,
  icon,
  badges,
  onClick,
  onEdit,
  onDelete,
  className,
  children
}) => {
  const badgeVariants = {
    success: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
    warning: 'bg-yellow-100 text-yellow-700',
    info: 'bg-blue-100 text-blue-700',
    neutral: 'bg-gray-100 text-gray-700'
  }

  return (
    <div 
      className={cn(
        'bg-white rounded-lg border-2 transition-all duration-200 p-6',
        'hover:shadow-lg hover:border-blue-200',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          {icon && (
            <div className="flex-shrink-0">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 truncate">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
            {description && (
              <p className="text-sm text-gray-600 mt-2">{description}</p>
            )}
          </div>
        </div>

        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <span 
                key={index}
                className={cn(
                  'text-xs px-2 py-1 rounded font-medium',
                  badgeVariants[badge.variant]
                )}
              >
                {badge.text}
              </span>
            ))}
          </div>
        )}

        {children}

        {(onEdit || onDelete) && (
          <div className="flex justify-end justify-center gap-4 pt-4 border-t border-gray-100">
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm"
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
                onClick={(e) => {
                  e?.stopPropagation()
                  onEdit()
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-600 border-red-600 hover:bg-red-50 bg-white"
                onClick={(e) => {
                  e?.stopPropagation()
                  onDelete()
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export { InfoCard }