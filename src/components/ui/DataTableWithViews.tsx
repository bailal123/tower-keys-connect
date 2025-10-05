import React, { useState, useMemo } from 'react'
import { cn } from '../../lib/utils'
import { ChevronDown, ChevronUp, Search, Grid, List } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'
import { useLanguage } from '../../hooks/useLanguage'

export interface Column<T> {
  key: keyof T | string
  title: string
  sortable?: boolean
  render?: (value: unknown, row: T, index: number) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
}

export interface DataTableWithViewsProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  searchable?: boolean
  renderCard?: (item: T, index: number) => React.ReactNode
  emptyMessage?: string
  className?: string
  defaultView?: 'table' | 'cards'
}

export function DataTableWithViews<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  searchable = true,
  renderCard,
  emptyMessage,
  className,
  defaultView = 'table'
}: DataTableWithViewsProps<T>) {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentView, setCurrentView] = useState<'table' | 'cards'>(defaultView)
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = currentView === 'table' ? 100 : 20

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data]

    // Apply search
    if (searchTerm && searchable) {
      result = result.filter(row =>
        columns.some(column => {
          const value = row[column.key]
          return String(value).toLowerCase().includes(searchTerm.toLowerCase())
        })
      )
    }

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
        }
        
        const aStr = String(aValue)
        const bStr = String(bValue)
        return sortConfig.direction === 'asc' 
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr)
      })
    }

    return result
  }, [data, searchTerm, sortConfig, columns, searchable])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredData.slice(start, start + itemsPerPage)
  }, [filteredData, currentPage, itemsPerPage])

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null
      }
      return { key, direction: 'asc' }
    })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pages = []
    const showPages = 5
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2))
    const endPage = Math.min(totalPages, startPage + showPages - 1)

    if (endPage - startPage < showPages - 1) {
      startPage = Math.max(1, endPage - showPages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-700">
          عرض {((currentPage - 1) * itemsPerPage) + 1} إلى {Math.min(currentPage * itemsPerPage, filteredData.length)} من {filteredData.length} عنصر
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            السابق
          </Button>
          {startPage > 1 && (
            <>
              <Button variant="outline" size="sm" onClick={() => handlePageChange(1)}>1</Button>
              {startPage > 2 && <span className="px-2">...</span>}
            </>
          )}
          {pages.map(page => (
            <Button
              key={page}
              variant={page === currentPage ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2">...</span>}
              <Button variant="outline" size="sm" onClick={() => handlePageChange(totalPages)}>{totalPages}</Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            التالي
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 overflow-hidden', className)}>
      {/* Header with search and view toggle */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center gap-4">
          {searchable && (
            <div className="flex-1">
              <Input
                placeholder={t('search_placeholder') || 'بحث...'}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                icon={<Search className="h-4 w-4 text-gray-400" />}
              />
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant={currentView === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setCurrentView('table')
                setCurrentPage(1)
              }}
            >
              <List className="h-4 w-4 ml-2" />
              جدول
            </Button>
            {renderCard && (
              <Button
                variant={currentView === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setCurrentView('cards')
                  setCurrentPage(1)
                }}
              >
                <Grid className="h-4 w-4 ml-2" />
                بطاقات
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="px-4 py-12 text-center text-gray-500">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span>{t('loading_text') || 'جاري التحميل...'}</span>
          </div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="px-4 py-12 text-center text-gray-500">
          {emptyMessage || t('no_data_display') || 'لا توجد بيانات'}
        </div>
      ) : currentView === 'cards' && renderCard ? (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedData.map((item, index) => (
              <div key={index}>
                {renderCard(item, index)}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={cn(
                      'px-4 py-3 font-medium text-gray-700 select-none text-center',
                      column.headerAlign === 'center' && 'text-center',
                      column.headerAlign === 'right' && 'text-right',
                      column.headerAlign === 'left' && 'text-left',
                      column.sortable !== false && 'cursor-pointer hover:bg-gray-100'
                    )}
                    style={{ width: column.width }}
                    onClick={() => column.sortable !== false && handleSort(String(column.key))}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>{column.title}</span>
                      {column.sortable !== false && (
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.map((row, rowIndex) => (
                <tr 
                  key={rowIndex}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {columns.map((column, colIndex) => (
                    <td 
                      key={colIndex}
                      className={cn(
                        'px-4 py-3 text-center',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                        column.align === 'left' && 'text-left'
                      )}
                    >
                      {column.render 
                        ? column.render(row[column.key], row, rowIndex)
                        : String(row[column.key] || '')
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}
    </div>
  )
}
