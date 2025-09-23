import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { cn } from '../../lib/utils'
import type { LucideIcon } from 'lucide-react'

interface NavigationCardProps {
  title: string
  description: string
  icon: LucideIcon
  onClick: () => void
  className?: string
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'indigo' | 'gray'
  badge?: string
}

const colorVariants = {
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    icon: 'text-blue-600',
    hover: 'hover:border-blue-200',
  },
  green: {
    gradient: 'from-green-500 to-green-600',
    icon: 'text-green-600',
    hover: 'hover:border-green-200',
  },
  orange: {
    gradient: 'from-orange-500 to-orange-600',
    icon: 'text-orange-600',
    hover: 'hover:border-orange-200',
  },
  red: {
    gradient: 'from-red-500 to-red-600',
    icon: 'text-red-600',
    hover: 'hover:border-red-200',
  },
  purple: {
    gradient: 'from-purple-500 to-purple-600',
    icon: 'text-purple-600',
    hover: 'hover:border-purple-200',
  },
  indigo: {
    gradient: 'from-indigo-500 to-indigo-600',
    icon: 'text-indigo-600',
    hover: 'hover:border-indigo-200',
  },
  gray: {
    gradient: 'from-gray-500 to-gray-600',
    icon: 'text-gray-600',
    hover: 'hover:border-gray-200',
  },
}

export const NavigationCard: React.FC<NavigationCardProps> = ({
  title,
  description,
  icon: Icon,
  onClick,
  className,
  color = 'blue',
  badge,
}) => {
  const colorConfig = colorVariants[color]

  return (
    <Card
      className={cn(
        'relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group',
        colorConfig.hover,
        className
      )}
      onClick={onClick}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-r opacity-5 group-hover:opacity-10 transition-opacity', colorConfig.gradient)} />
      
      {badge && (
        <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
          {badge}
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={cn('p-3 rounded-xl bg-gray-50 group-hover:scale-110 transition-transform', colorConfig.icon)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <CardTitle className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
        
        <div className="mt-4 flex items-center text-sm font-medium text-primary group-hover:text-primary/80 transition-colors">
          <span>انتقل إلى القسم</span>
          <svg
            className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}