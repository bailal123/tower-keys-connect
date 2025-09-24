import React from 'react'
import { Edit, Copy, Trash2, Eye } from 'lucide-react'
import { Button } from './Button'
import { useLanguage } from '../../hooks/useLanguage'
import type { UnitDesignListDto } from '../../types/api'

interface DesignTableProps {
  designs: UnitDesignListDto[]
  onEdit: (design: UnitDesignListDto) => void
  onCopy: (design: UnitDesignListDto) => void
  onDelete: (design: UnitDesignListDto) => void
  onView: (design: UnitDesignListDto) => void
  getCategoryColor: (category: number) => string
  getCategoryLabel: (category: number) => string
}

const DesignTable: React.FC<DesignTableProps> = ({ 
  designs, 
  onEdit, 
  onCopy, 
  onDelete,
  onView,
  getCategoryColor, 
  getCategoryLabel 
}) => {
  const { language, t } = useLanguage()

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('name') || 'Name'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('designCategory') || 'Category'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('area') || 'Area'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('price') || 'Price'}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('actions') || 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {designs?.map((design) => (
              <tr key={design.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {language === 'ar' ? design.arabicName : design.englishName}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {language === 'ar' ? design.arabicDescription : design.englishDescription}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(design.category)}`}>
                    {getCategoryLabel(design.category)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {design.areaSquareMeters} {t('sqm') || 'sqm'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${design.finalRentPrice?.toLocaleString() || design.originalRentPrice?.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(design)}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(design)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCopy(design)}
                      className="text-green-600 hover:text-green-900"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(design)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DesignTable