import React from 'react'
import { cn } from '../../lib/utils'
import { ChevronLeft, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
  isActive?: boolean
  icon?: React.ReactNode
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  showHome?: boolean
  maxItems?: number
  className?: string
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator = <ChevronLeft className="h-4 w-4 text-gray-400" />,
  showHome = true,
  maxItems,
  className
}) => {
  const processedItems = React.useMemo(() => {
    let processedItems = [...items]
    
    // Add home item if requested
    if (showHome && !items.some(item => item.href === '/' || item.onClick === undefined)) {
      processedItems.unshift({
        label: 'الرئيسية',
        href: '/',
        icon: <Home className="h-4 w-4" />
      })
    }
    
    // Limit items if maxItems is specified
    if (maxItems && processedItems.length > maxItems) {
      const start = processedItems.slice(0, 1) // Keep first item
      const end = processedItems.slice(-maxItems + 2) // Keep last items
      processedItems = [
        ...start,
        { label: '...', isActive: false },
        ...end
      ]
    }
    
    return processedItems
  }, [items, showHome, maxItems])

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center space-x-1', className)}>
      <ol className="flex items-center space-x-1">
        {processedItems.map((item, index) => {
          const isLast = index === processedItems.length - 1
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 flex-shrink-0">
                  {separator}
                </span>
              )}
              
              {item.label === '...' ? (
                <span className="text-gray-500 text-sm">...</span>
              ) : (
                <div className="flex items-center">
                  {item.href || item.onClick ? (
                    <button
                      type="button"
                      onClick={item.onClick}
                      className={cn(
                        'flex items-center text-sm transition-colors hover:text-blue-600 focus:outline-none focus:underline',
                        item.isActive || isLast 
                          ? 'text-gray-900 font-medium cursor-default' 
                          : 'text-gray-600 hover:text-blue-600'
                      )}
                      aria-current={item.isActive || isLast ? 'page' : undefined}
                    >
                      {item.icon && (
                        <span className="ml-1 flex-shrink-0">
                          {item.icon}
                        </span>
                      )}
                      {item.label}
                    </button>
                  ) : (
                    <span
                      className={cn(
                        'flex items-center text-sm',
                        item.isActive || isLast 
                          ? 'text-gray-900 font-medium' 
                          : 'text-gray-600'
                      )}
                      aria-current={item.isActive || isLast ? 'page' : undefined}
                    >
                      {item.icon && (
                        <span className="ml-1 flex-shrink-0">
                          {item.icon}
                        </span>
                      )}
                      {item.label}
                    </span>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export { Breadcrumbs }