import React from 'react'
import { cn } from '../../lib/utils'
import { Button } from './Button'
import { ArrowLeft } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  onClick?: () => void
  isActive?: boolean
}

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  onBack?: () => void
  actions?: React.ReactNode
  className?: string
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  onBack,
  actions,
  className
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span>›</span>}
              <span 
                className={cn(
                  item.onClick && !item.isActive && 'text-blue-600 cursor-pointer hover:underline',
                  item.isActive && 'text-gray-900 font-medium'
                )}
                onClick={item.onClick}
              >
                {item.label}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Header Content */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <Button 
              variant="outline" 
              onClick={onBack}
              className="hover:bg-gray-100 border-gray-300"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {description && (
              <p className="text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

export { PageHeader }