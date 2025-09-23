import React from 'react'
import { cn } from '../../lib/utils'
import { FileX, Search, Database, RefreshCw } from 'lucide-react'
import { Button } from './Button'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'secondary'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  type?: 'no-data' | 'no-results' | 'error' | 'loading' | 'custom'
  className?: string
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  type = 'no-data',
  className
}) => {
  const getDefaultIcon = () => {
    switch (type) {
      case 'no-results':
        return <Search className="h-12 w-12 text-gray-400" />
      case 'error':
        return <FileX className="h-12 w-12 text-gray-400" />
      case 'loading':
        return <RefreshCw className="h-12 w-12 text-gray-400 animate-spin" />
      case 'no-data':
      default:
        return <Database className="h-12 w-12 text-gray-400" />
    }
  }

  const displayIcon = icon || getDefaultIcon()

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center p-8 min-h-[400px]',
      className
    )}>
      <div className="mb-4">
        {displayIcon}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-600 mb-6 max-w-md">
          {description}
        </p>
      )}
      
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              className="min-w-[120px]"
            >
              {action.label}
            </Button>
          )}
          
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              className="min-w-[120px]"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Predefined EmptyState variants
export const NoData: React.FC<Omit<EmptyStateProps, 'type' | 'title'>> = (props) => (
  <EmptyState
    type="no-data"
    icon={<Database className="h-12 w-12 text-gray-400" />}
    title="لا توجد بيانات"
    description="لم يتم العثور على أي بيانات لعرضها."
    {...props}
  />
)

export const NoResults: React.FC<Omit<EmptyStateProps, 'type' | 'title'>> = (props) => (
  <EmptyState
    type="no-results"
    icon={<Search className="h-12 w-12 text-gray-400" />}
    title="لا توجد نتائج"
    description="لم يتم العثور على نتائج تطابق البحث الخاص بك."
    {...props}
  />
)

export const ErrorState: React.FC<Omit<EmptyStateProps, 'type' | 'title'>> = (props) => (
  <EmptyState
    type="error"
    icon={<FileX className="h-12 w-12 text-red-400" />}
    title="حدث خطأ"
    description="حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى."
    {...props}
  />
)

export const LoadingState: React.FC<Omit<EmptyStateProps, 'type' | 'title'>> = (props) => (
  <EmptyState
    type="loading"
    icon={<RefreshCw className="h-12 w-12 text-blue-500 animate-spin" />}
    title="جارٍ التحميل..."
    description="يرجى الانتظار بينما نقوم بتحميل البيانات."
    {...props}
  />
)

export { EmptyState }