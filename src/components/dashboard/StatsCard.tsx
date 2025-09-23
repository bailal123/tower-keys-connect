import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { cn, formatCurrency, formatNumber } from '../../lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  isCurrency?: boolean
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'indigo'
}

const colorVariants = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  orange: 'from-orange-500 to-orange-600',
  red: 'from-red-500 to-red-600',
  purple: 'from-purple-500 to-purple-600',
  indigo: 'from-indigo-500 to-indigo-600',
}

const iconColorVariants = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  orange: 'text-orange-600',
  red: 'text-red-600',
  purple: 'text-purple-600',
  indigo: 'text-indigo-600',
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  className,
  isCurrency = false,
  color = 'blue',
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val
    return isCurrency ? formatCurrency(val) : formatNumber(val)
  }

  return (
    <Card className={cn('relative overflow-hidden transition-all duration-300 hover:shadow-lg', className)}>
      <div className={cn('absolute inset-0 bg-gradient-to-r opacity-5', colorVariants[color])} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn('p-2 rounded-lg bg-gray-50', iconColorVariants[color])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {formatValue(value)}
        </div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">
            <span
              className={cn(
                'inline-flex items-center',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </span>
            {' من الشهر الماضي'}
          </p>
        )}
      </CardContent>
    </Card>
  )
}