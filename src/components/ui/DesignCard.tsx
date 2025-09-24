import React from 'react'
import { Edit, Copy, Trash2 } from 'lucide-react'
import { Button } from './Button'
import { useLanguage } from '../../hooks/useLanguage'
import type { UnitDesignListDto } from '../../types/api'

interface DesignCardProps {
  design: UnitDesignListDto
  onEdit: (design: UnitDesignListDto) => void
  onCopy: (design: UnitDesignListDto) => void
  onDelete: (design: UnitDesignListDto) => void
  getCategoryColor: (category: number) => string
  getCategoryLabel: (category: number) => string
}

const DesignCard: React.FC<DesignCardProps> = ({ 
  design, 
  onEdit, 
  onCopy, 
  onDelete, 
  getCategoryColor, 
  getCategoryLabel 
}) => {
  const { language, t } = useLanguage()

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {language === 'ar' ? design.arabicName : design.englishName}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2">
              {language === 'ar' ? design.arabicDescription : design.englishDescription}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(design.category)}`}>
            {getCategoryLabel(design.category)}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          <span>{design.areaSquareMeters} {t('sqm') || 'sqm'}</span>
          <span>${design.finalRentPrice?.toLocaleString() || design.originalRentPrice?.toLocaleString()}</span>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(design)}
            className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Edit className="w-4 h-4 mr-1" />
            {t('edit') || 'Edit'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopy(design)}
            className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <Copy className="w-4 h-4 mr-1" />
            {t('copy') || 'Copy'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(design)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DesignCard