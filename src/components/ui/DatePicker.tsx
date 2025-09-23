import React, { useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

const datePickerVariants = cva(
  'w-full px-3 py-2 text-sm border rounded-lg bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
        success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
        error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
        warning: 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface DatePickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'>,
    VariantProps<typeof datePickerVariants> {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  value?: Date | string
  onChange: (date: Date | null) => void
  minDate?: Date
  maxDate?: Date
  showTimeSelect?: boolean
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ 
    className, 
    variant, 
    label, 
    error, 
    helperText, 
    required, 
    value, 
    onChange,
    minDate,
    maxDate,
    showTimeSelect = false,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [currentDate, setCurrentDate] = useState(new Date())
    
    const id = props.id || `datepicker-${Math.random().toString(36).substr(2, 9)}`
    
    const formatDate = (date: Date | string) => {
      if (!date) return ''
      const dateObj = typeof date === 'string' ? new Date(date) : date
      
      if (showTimeSelect) {
        return dateObj.toLocaleString('ar-SA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      return dateObj.toLocaleDateString('ar-SA')
    }
    
    const handleDateSelect = (date: Date) => {
      onChange(date)
      if (!showTimeSelect) {
        setIsOpen(false)
      }
    }
    
    const generateCalendarDays = () => {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const daysInMonth = lastDay.getDate()
      const startingDayOfWeek = firstDay.getDay()
      
      const days = []
      
      // Previous month days
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const prevDate = new Date(year, month, -i)
        days.push({ date: prevDate, isCurrentMonth: false })
      }
      
      // Current month days
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        days.push({ date, isCurrentMonth: true })
      }
      
      // Next month days to fill grid
      const remainingDays = 42 - days.length
      for (let day = 1; day <= remainingDays; day++) {
        const nextDate = new Date(year, month + 1, day)
        days.push({ date: nextDate, isCurrentMonth: false })
      }
      
      return days
    }
    
    const navigateMonth = (direction: 'prev' | 'next') => {
      setCurrentDate(prev => {
        const newDate = new Date(prev)
        if (direction === 'prev') {
          newDate.setMonth(newDate.getMonth() - 1)
        } else {
          newDate.setMonth(newDate.getMonth() + 1)
        }
        return newDate
      })
    }
    
    return (
      <div className="relative">
        <div className="space-y-2">
          {label && (
            <label
              htmlFor={id}
              className={cn(
                'block text-sm font-medium',
                error ? 'text-red-700' : 'text-gray-700'
              )}
            >
              {label}
              {required && <span className="text-red-500 mr-1">*</span>}
            </label>
          )}
          
          <div className="relative">
            <input
              ref={ref}
              id={id}
              type="text"
              readOnly
              value={formatDate(value || '')}
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                datePickerVariants({ variant: error ? 'error' : variant }),
                'cursor-pointer pr-10',
                className
              )}
              placeholder={showTimeSelect ? 'اختر التاريخ والوقت' : 'اختر التاريخ'}
              {...props}
            />
            <Calendar 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" 
            />
          </div>
          
          {(error || helperText) && (
            <p className={cn(
              'text-xs',
              error ? 'text-red-600' : 'text-gray-500'
            )}>
              {error || helperText}
            </p>
          )}
        </div>
        
        {isOpen && (
          <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[300px]">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => navigateMonth('prev')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              
              <h3 className="text-sm font-medium">
                {currentDate.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' })}
              </h3>
              
              <button
                type="button"
                onClick={() => navigateMonth('next')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
            
            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'].map((day) => (
                <div key={day} className="text-xs font-medium text-gray-500 text-center p-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays().map(({ date, isCurrentMonth }, index) => {
                const isSelected = value && new Date(value).toDateString() === date.toDateString()
                const isToday = new Date().toDateString() === date.toDateString()
                const isDisabled = 
                  (minDate && date < minDate) || 
                  (maxDate && date > maxDate)
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => !isDisabled && handleDateSelect(date)}
                    disabled={isDisabled}
                    className={cn(
                      'p-2 text-sm text-center rounded hover:bg-blue-50 transition-colors',
                      !isCurrentMonth && 'text-gray-400',
                      isSelected && 'bg-blue-600 text-white hover:bg-blue-700',
                      isToday && !isSelected && 'bg-blue-100 text-blue-600',
                      isDisabled && 'opacity-50 cursor-not-allowed hover:bg-transparent'
                    )}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>
            
            {/* Time Selector (if enabled) */}
            {showTimeSelect && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="time"
                    className="px-2 py-1 text-sm border border-gray-300 rounded"
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':')
                      const newDate = new Date(value || new Date())
                      newDate.setHours(parseInt(hours), parseInt(minutes))
                      onChange(newDate)
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* Close Button */}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}
        
        {/* Backdrop */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    )
  }
)

DatePicker.displayName = 'DatePicker'

export { DatePicker }