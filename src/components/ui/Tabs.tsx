import React, { useState, createContext, useContext } from 'react'
import { cn } from '../../lib/utils'

interface TabsContextValue {
  activeTab: string
  setActiveTab: (value: string) => void
  orientation: 'horizontal' | 'vertical'
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

const useTabs = () => {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('useTabs must be used within a Tabs component')
  }
  return context
}

export interface TabsProps {
  children: React.ReactNode
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

const Tabs: React.FC<TabsProps> = ({
  children,
  defaultValue,
  value,
  onValueChange,
  orientation = 'horizontal',
  className
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '')
  
  const activeTab = value !== undefined ? value : internalValue
  
  const setActiveTab = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, orientation }}>
      <div 
        className={cn(
          'w-full',
          orientation === 'vertical' && 'flex gap-6',
          className
        )}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export interface TabsListProps {
  children: React.ReactNode
  className?: string
}

const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  const { orientation } = useTabs()
  
  return (
    <div
      role="tablist"
      className={cn(
        'flex bg-gray-100 rounded-lg p-1',
        orientation === 'horizontal' ? 'flex-row w-full' : 'flex-col w-48',
        className
      )}
    >
      {children}
    </div>
  )
}

export interface TabsTriggerProps {
  children: React.ReactNode
  value: string
  disabled?: boolean
  className?: string
}

const TabsTrigger: React.FC<TabsTriggerProps> = ({
  children,
  value,
  disabled = false,
  className
}) => {
  const { activeTab, setActiveTab, orientation } = useTabs()
  const isActive = activeTab === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${value}`}
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(value)}
      className={cn(
        'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        isActive 
          ? 'bg-white text-gray-900 shadow-sm' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
        disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-600',
        orientation === 'vertical' && 'text-right justify-start',
        className
      )}
    >
      {children}
    </button>
  )
}

export interface TabsContentProps {
  children: React.ReactNode
  value: string
  className?: string
}

const TabsContent: React.FC<TabsContentProps> = ({
  children,
  value,
  className
}) => {
  const { activeTab } = useTabs()
  const isActive = activeTab === value

  if (!isActive) return null

  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={`tab-${value}`}
      className={cn(
        'flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md',
        className
      )}
      tabIndex={0}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }