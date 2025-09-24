import React from 'react'
import { Edit, Copy, Trash2, Eye, Bed, Bath, Square } from 'lucide-react'
import { Button } from './Button'
import { useLanguage } from '../../hooks/useLanguage'
import type { UnitDesignListDto } from '../../types/api'

interface DesignCardProps {
  design: UnitDesignListDto
  onEdit: (design: UnitDesignListDto) => void
  onCopy: (design: UnitDesignListDto) => void
  onDelete: (design: UnitDesignListDto) => void
  onView: (design: UnitDesignListDto) => void
  getCategoryColor: (category: number) => string
  getCategoryLabel: (category: number) => string
}

const DesignCard: React.FC<DesignCardProps> = ({ 
  design, 
  onEdit, 
  onCopy, 
  onDelete,
  onView,
  getCategoryColor, 
  getCategoryLabel 
}) => {
  const { language, t } = useLanguage()

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-all duration-300 group">
      {/* صورة التصميم */}
      <div 
        className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 cursor-pointer"
        onClick={() => onView(design)}
      >
        {design.coverImageUrl ? (
          <img 
            src={design.coverImageUrl} 
            alt={language === 'ar' ? design.arabicName : design.englishName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Square className="w-16 h-16" />
          </div>
        )}
        
        {/* الفئة */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full shadow-sm ${getCategoryColor(design.category)}`}>
            {getCategoryLabel(design.category)}
          </span>
        </div>

        {/* حالة النشاط */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${design.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {design.isActive ? (t('active') || 'نشط') : (t('inactive') || 'غير نشط')}
          </span>
        </div>

        {/* Overlay عند التمرير */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
        </div>
      </div>
      
      {/* المحتوى */}
      <div className="p-4" onClick={() => onView(design)}>
        <div className="cursor-pointer">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
            {language === 'ar' ? design.arabicName : design.englishName}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {language === 'ar' ? design.arabicDescription : design.englishDescription}
          </p>
        </div>
        
        {/* معلومات التصميم */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Square className="w-4 h-4" />
            <span>{design.areaSquareMeters} {t('sqm') || 'م²'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{design.bedroomsCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span>{design.bathroomsCount || 0}</span>
          </div>
        </div>

        {/* السعر */}
        <div className="mb-4">
          <div className="text-lg font-bold text-green-600">
            {design.finalRentPrice?.toLocaleString() || design.originalRentPrice?.toLocaleString()} {t('currency') || 'درهم'}
          </div>
          {design.discountPercentage && design.discountPercentage > 0 && (
            <div className="text-sm text-gray-500 line-through">
              {design.originalRentPrice?.toLocaleString()} {t('currency') || 'درهم'}
            </div>
          )}
        </div>
        
        {/* أزرار الإجراءات */}
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
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