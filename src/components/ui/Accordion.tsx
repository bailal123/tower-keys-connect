import React, { useState, createContext, useContext } from 'react'
import { cn } from '../../lib/utils'
import { ChevronDown } from 'lucide-react'

interface AccordionContextValue {
  openItems: string[]
  toggleItem: (value: string) => void
  multiple?: boolean
}

const AccordionContext = createContext<AccordionContextValue | undefined>(undefined)

const useAccordion = () => {
  const context = useContext(AccordionContext)
  if (!context) {
    throw new Error('useAccordion must be used within an Accordion component')
  }
  return context
}

export interface AccordionProps {
  children: React.ReactNode
  type?: 'single' | 'multiple'
  defaultValue?: string | string[]
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  className?: string
}

const Accordion: React.FC<AccordionProps> = ({
  children,
  type = 'single',
  defaultValue,
  value,
  onValueChange,
  className
}) => {
  const [internalValue, setInternalValue] = useState<string[]>(() => {
    if (value !== undefined) {
      return Array.isArray(value) ? value : [value]
    }
    if (defaultValue !== undefined) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue]
    }
    return []
  })

  const openItems = value !== undefined 
    ? (Array.isArray(value) ? value : [value])
    : internalValue

  const toggleItem = (itemValue: string) => {
    let newValue: string[]
    
    if (type === 'single') {
      newValue = openItems.includes(itemValue) ? [] : [itemValue]
    } else {
      newValue = openItems.includes(itemValue)
        ? openItems.filter(item => item !== itemValue)
        : [...openItems, itemValue]
    }
    
    if (value === undefined) {
      setInternalValue(newValue)
    }
    
    if (onValueChange) {
      onValueChange(type === 'single' ? newValue[0] || '' : newValue)
    }
  }

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, multiple: type === 'multiple' }}>
      <div className={cn('space-y-2', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

export interface AccordionItemProps {
  children: React.ReactNode
  value: string
  className?: string
  disabled?: boolean
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  children,
  value,
  className,
  disabled = false
}) => {
  const { openItems } = useAccordion()
  const isOpen = openItems.includes(value)

  return (
    <div 
      className={cn(
        'border border-gray-200 rounded-lg overflow-hidden',
        disabled && 'opacity-60',
        className
      )}
      data-state={isOpen ? 'open' : 'closed'}
      data-disabled={disabled ? '' : undefined}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ value?: string; disabled?: boolean }>, { value, disabled })
        }
        return child
      })}
    </div>
  )
}

export interface AccordionTriggerProps {
  children: React.ReactNode
  value?: string
  disabled?: boolean
  className?: string
}

const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
  children,
  value,
  disabled = false,
  className
}) => {
  const { openItems, toggleItem } = useAccordion()
  const isOpen = value ? openItems.includes(value) : false

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => value && !disabled && toggleItem(value)}
      className={cn(
        'flex w-full items-center justify-between p-4 text-right font-medium transition-colors',
        'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        disabled && 'cursor-not-allowed',
        className
      )}
      aria-expanded={isOpen}
    >
      <span>{children}</span>
      <ChevronDown 
        className={cn(
          'h-4 w-4 transition-transform duration-200',
          isOpen && 'rotate-180'
        )}
      />
    </button>
  )
}

export interface AccordionContentProps {
  children: React.ReactNode
  value?: string
  className?: string
}

const AccordionContent: React.FC<AccordionContentProps> = ({
  children,
  value,
  className
}) => {
  const { openItems } = useAccordion()
  const isOpen = value ? openItems.includes(value) : false

  return (
    <div
      className={cn(
        'overflow-hidden transition-all duration-200',
        isOpen ? 'animate-in slide-in-from-top-1' : 'animate-out slide-out-to-top-1 hidden'
      )}
    >
      <div className={cn('p-4 pt-0 border-t border-gray-100', className)}>
        {children}
      </div>
    </div>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }