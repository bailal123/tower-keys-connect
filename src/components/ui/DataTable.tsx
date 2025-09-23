import React, { useState, useMemo } from 'react'
import { cn } from '../../lib/utils'
import { ChevronDown, ChevronUp, Search, Filter, MoreHorizontal } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'

export interface Column<T> {
  key: keyof T | string
  title: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: unknown, row: T, index: number) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  searchable?: boolean
  filterable?: boolean
  sortable?: boolean
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
  }
  actions?: {
    label: string
    icon?: React.ReactNode
    onClick: (row: T) => void
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'warning' | 'info'
  }[]
  onRowClick?: (row: T) => void
  selectedRows?: T[]
  onSelectionChange?: (rows: T[]) => void
  emptyMessage?: string
  className?: string
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  searchable = true,
  filterable = false,
  sortable = true,
  pagination,
  actions,
  onRowClick,
  selectedRows = [],
  onSelectionChange,
  emptyMessage = 'لا توجد بيانات للعرض',
  className
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data]
    const filters: Record<string, string> = {} // TODO: Implement filter UI

    // Apply search
    if (searchTerm && searchable) {
      result = result.filter(row =>
        columns.some(column => {
          const value = column.key === 'actions' ? '' : row[column.key]
          return String(value).toLowerCase().includes(searchTerm.toLowerCase())
        })
      )
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(row =>
          String(row[key]).toLowerCase().includes(value.toLowerCase())
        )
      }
    })

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        
        // Type-safe comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        // For other types, convert to string and compare
        const aStr = String(aValue);
        const bStr = String(bValue);
        return sortConfig.direction === 'asc' 
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      })
    }

    return result
  }, [data, searchTerm, sortConfig, columns, searchable])

  const handleSort = (key: string) => {
    if (!sortable) return
    
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null
      }
      return { key, direction: 'asc' }
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return
    onSelectionChange(checked ? filteredData : [])
  }

  const handleSelectRow = (row: T, checked: boolean) => {
    if (!onSelectionChange) return
    
    if (checked) {
      onSelectionChange([...selectedRows, row])
    } else {
      onSelectionChange(selectedRows.filter(r => r !== row))
    }
  }

  const isAllSelected = selectedRows.length === filteredData.length && filteredData.length > 0
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < filteredData.length

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 overflow-hidden', className)}>
      {/* Header with search and filters */}
      {(searchable || filterable) && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-4">
            {searchable && (
              <div className="flex-1">
                <Input
                  placeholder="البحث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="h-4 w-4 text-gray-400" />}
                />
              </div>
            )}
            {filterable && (
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 ml-2" />
                تصفية
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {onSelectionChange && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={cn(
                    'px-4 py-3 font-medium text-gray-700 select-none',
                    column.headerAlign === 'center' && 'text-center',
                    column.headerAlign === 'right' && 'text-right',
                    column.headerAlign === 'left' && 'text-left',
                    !column.headerAlign && 'text-right',
                    column.sortable !== false && sortable && 'cursor-pointer hover:bg-gray-100'
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable !== false && handleSort(String(column.key))}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.title}</span>
                    {column.sortable !== false && sortable && (
                      <div className="flex flex-col">
                        <ChevronUp 
                          className={cn(
                            'h-3 w-3 transition-colors',
                            sortConfig?.key === column.key && sortConfig.direction === 'asc'
                              ? 'text-blue-600' 
                              : 'text-gray-400'
                          )} 
                        />
                        <ChevronDown 
                          className={cn(
                            'h-3 w-3 transition-colors -mt-1',
                            sortConfig?.key === column.key && sortConfig.direction === 'desc'
                              ? 'text-blue-600' 
                              : 'text-gray-400'
                          )} 
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="w-24 px-4 py-3 text-center font-medium text-gray-700">
                  الإجراءات
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td 
                  colSpan={columns.length + (onSelectionChange ? 1 : 0) + (actions ? 1 : 0)}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span>جارٍ التحميل...</span>
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (onSelectionChange ? 1 : 0) + (actions ? 1 : 0)}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredData.map((row, rowIndex) => (
                <tr 
                  key={rowIndex}
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    onRowClick && 'cursor-pointer',
                    selectedRows.includes(row) && 'bg-blue-50'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {onSelectionChange && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row)}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleSelectRow(row, e.target.checked)
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  {columns.map((column, colIndex) => (
                    <td 
                      key={colIndex}
                      className={cn(
                        'px-4 py-3',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                        column.align === 'left' && 'text-left',
                        !column.align && 'text-right'
                      )}
                    >
                      {column.render 
                        ? column.render(row[column.key], row, rowIndex)
                        : String(row[column.key] || '')
                      }
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {actions.map((action, actionIndex) => (
                          <Button
                            key={actionIndex}
                            variant={action.variant || 'outline'}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              action.onClick(row)
                            }}
                            className="h-8 w-8 p-0"
                          >
                            {action.icon || <MoreHorizontal className="h-4 w-4" />}
                          </Button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              عرض {((pagination.page - 1) * pagination.pageSize) + 1} إلى {Math.min(pagination.page * pagination.pageSize, pagination.total)} من أصل {pagination.total} عنصر
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
              >
                السابق
              </Button>
              <span className="text-sm text-gray-700">
                صفحة {pagination.page} من {Math.ceil(pagination.total / pagination.pageSize)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
              >
                التالي
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}