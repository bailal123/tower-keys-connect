import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { Button } from './Button'
import { Edit, Trash2, Plus } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useLanguage } from '../../hooks/useLanguage'

export interface Column<T> {
  key: keyof T
  label: string
  render?: (value: unknown, item: T) => React.ReactNode
  className?: string
}

interface TableCardProps<T> {
  title: string
  data: T[]
  columns: Column<T>[]
  icon?: React.ReactNode
  onAdd?: () => void
  onEdit?: (item: T) => void
  onDelete?: (id: unknown) => void
  addButtonText?: string
  addButtonVariant?: 'default' | 'success' | 'info' | 'warning' | 'destructive'
  isLoading?: boolean
  emptyMessage?: string
  className?: string
}
 
export function TableCard<T extends Record<string, unknown>>({
  title,
  data,
  columns,
  icon,
  onAdd,
  onEdit,
  onDelete,
  addButtonText = 'إضافة جديد',
  addButtonVariant = 'info',
  isLoading = false,
  emptyMessage = 'لا توجد بيانات',
  className
}: TableCardProps<T>) {
   const {t} = useLanguage()
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جارٍ التحميل...</p>
        </CardContent>
      </Card>
    )
  }

  // function t(arg0: string): React.ReactNode {
  //   throw new Error('Function not implemented.')
  // }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center space-x-2">
            {icon}
            <span>{title}</span>
          </CardTitle>
          {onAdd && (
            <Button 
              size="sm" 
              onClick={onAdd}
              variant={addButtonVariant}
            >
              <Plus className="h-4 w-4 ml-2" />
              {addButtonText}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th 
                      key={String(column.key)} 
                      className={cn(
                        "text-center py-3 px-4 font-medium text-gray-700",
                        column.className
                      )}
                    >
                      {column.label}
                    </th>
                  ))}
                  {(onEdit || onDelete) && (
                    <th className="text-center py-3 px-4 font-medium text-gray-700">{t('actions')}</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((item, index) => (
                  <tr key={String(item.id) || index} className="hover:bg-gray-50">
                    {columns.map((column) => (
                      <td 
                        key={String(column.key)} 
                        className={cn("py-3 px-4", column.className)}
                      >
                        {column.render 
                          ? column.render(item[column.key], item)
                          : String(item[column.key] || '')
                        }
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          {onEdit && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                              onClick={() => onEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 border-red-600 hover:bg-red-50 bg-white"
                              onClick={() => onDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TableCard