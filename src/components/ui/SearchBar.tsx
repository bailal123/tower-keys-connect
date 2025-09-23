import React, { useState } from 'react'
import { cn } from '../../lib/utils'
import { Search, X, Filter } from 'lucide-react'
import { Button } from './Button'

export interface SearchBarProps {
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  onClear?: () => void
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  showClearButton?: boolean
  showFilterButton?: boolean
  onFilterClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outlined'
  className?: string
}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ 
    value: controlledValue,
    onChange,
    onSearch,
    onClear,
    placeholder = 'البحث...',
    disabled = false,
    loading = false,
    showClearButton = true,
    showFilterButton = false,
    onFilterClick,
    size = 'md',
    variant = 'default',
    className,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = useState('')
    
    const value = controlledValue !== undefined ? controlledValue : internalValue
    const hasValue = value.length > 0
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      if (controlledValue === undefined) {
        setInternalValue(newValue)
      }
      onChange?.(newValue)
    }
    
    const handleClear = () => {
      if (controlledValue === undefined) {
        setInternalValue('')
      }
      onChange?.('')
      onClear?.()
    }
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onSearch?.(value)
      }
    }
    
    const handleSearchClick = () => {
      onSearch?.(value)
    }
    
    const getSizeClasses = () => {
      switch (size) {
        case 'sm': return 'h-8 text-sm'
        case 'lg': return 'h-12 text-base'
        default: return 'h-10 text-sm'
      }
    }
    
    const getVariantClasses = () => {
      switch (variant) {
        case 'filled':
          return 'bg-gray-100 border-transparent focus:bg-white focus:border-blue-500'
        case 'outlined':
          return 'bg-transparent border-gray-300 focus:border-blue-500'
        default:
          return 'bg-white border-gray-300 focus:border-blue-500'
      }
    }
    
    const getPaddingClasses = () => {
      const baseRight = size === 'sm' ? 'pr-8' : size === 'lg' ? 'pr-12' : 'pr-10'
      let left = 'pl-3'
      
      if (showFilterButton) {
        left = size === 'sm' ? 'pl-16' : size === 'lg' ? 'pl-20' : 'pl-18'
      } else if (onSearch) {
        left = size === 'sm' ? 'pl-8' : size === 'lg' ? 'pl-12' : 'pl-10'
      }
      
      return `${baseRight} ${left}`
    }

    return (
      <div className={cn('relative w-full', className)}>
        {/* Filter Button */}
        {showFilterButton && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onFilterClick}
            disabled={disabled}
            className={cn(
              'absolute right-2 top-1/2 transform -translate-y-1/2 z-10',
              size === 'sm' ? 'h-6 w-6' : size === 'lg' ? 'h-8 w-8' : 'h-7 w-7'
            )}
          >
            <Filter className="h-4 w-4" />
          </Button>
        )}
        
        {/* Search Button */}
        {onSearch && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleSearchClick}
            disabled={disabled || loading}
            className={cn(
              'absolute top-1/2 transform -translate-y-1/2 z-10',
              showFilterButton 
                ? (size === 'sm' ? 'right-10' : size === 'lg' ? 'right-14' : 'right-12')
                : (size === 'sm' ? 'right-2' : 'right-2'),
              size === 'sm' ? 'h-6 w-6' : size === 'lg' ? 'h-8 w-8' : 'h-7 w-7'
            )}
          >
            <Search className="h-4 w-4" />
          </Button>
        )}
        
        {/* Search Input */}
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full border rounded-lg transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            getSizeClasses(),
            getVariantClasses(),
            getPaddingClasses()
          )}
          {...props}
        />
        
        {/* Clear Button */}
        {showClearButton && hasValue && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className={cn(
              'absolute left-2 top-1/2 transform -translate-y-1/2 z-10',
              size === 'sm' ? 'h-6 w-6' : size === 'lg' ? 'h-8 w-8' : 'h-7 w-7'
            )}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        
        {/* Loading Indicator */}
        {loading && (
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
            <div className={cn(
              'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
              size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'
            )} />
          </div>
        )}
      </div>
    )
  }
)

SearchBar.displayName = 'SearchBar'

export { SearchBar }