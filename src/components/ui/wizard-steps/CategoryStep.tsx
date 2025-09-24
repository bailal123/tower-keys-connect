import React from 'react'
import { useLanguage } from '../../../hooks/useLanguage'
import { DesignCategory, TargetMarket, type DesignFormData } from '../../../types/api'

interface CategoryStepProps {
  formData: DesignFormData
  setFormData: (data: DesignFormData | ((prev: DesignFormData) => DesignFormData)) => void
}

const CategoryStep: React.FC<CategoryStepProps> = ({ formData, setFormData }) => {
  const { t } = useLanguage()

  const categoryOptions = [
    { value: DesignCategory.Standard, label: 'عادي', description: 'تصميم عادي مناسب للاستخدام اليومي', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
    { value: DesignCategory.Luxury, label: 'فاخر', description: 'تصميم فاخر بخامات عالية الجودة', color: 'bg-purple-50 border-purple-200 hover:bg-purple-100' },
    { value: DesignCategory.Premium, label: 'ممتاز', description: 'تصميم ممتاز بمواصفات عالية', color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100' },
    { value: DesignCategory.Economic, label: 'اقتصادي', description: 'تصميم اقتصادي بأسعار مناسبة', color: 'bg-green-50 border-green-200 hover:bg-green-100' },
    { value: DesignCategory.Family, label: 'عائلي', description: 'تصميم مخصص للعائلات الكبيرة', color: 'bg-pink-50 border-pink-200 hover:bg-pink-100' },
    { value: DesignCategory.Executive, label: 'تنفيذي', description: 'تصميم تنفيذي للمدراء والتنفيذيين', color: 'bg-gray-50 border-gray-200 hover:bg-gray-100' }
  ]

  const targetMarketOptions = [
    { value: TargetMarket.General, label: 'عام', description: 'مناسب لجميع الفئات', icon: '👥' },
    { value: TargetMarket.Singles, label: 'عزاب', description: 'مخصص للأشخاص العزاب', icon: '👤' },
    { value: TargetMarket.Families, label: 'عائلات', description: 'مصمم للعائلات والأطفال', icon: '👨‍👩‍👧‍👦' },
    { value: TargetMarket.Executives, label: 'تنفيذيين', description: 'للمدراء والموظفين التنفيذيين', icon: '👔' },
    { value: TargetMarket.Students, label: 'طلاب', description: 'مناسب للطلاب والشباب', icon: '🎓' },
    { value: TargetMarket.Seniors, label: 'كبار السن', description: 'مصمم خصيصاً لكبار السن', icon: '👴' }
  ]

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('categoryAndTargetMarket') || 'فئة التصميم والسوق المستهدف'}
        </h3>
        <p className="text-gray-600">
          {t('selectDesignCategoryAndTarget') || 'اختر فئة التصميم والسوق المستهدف لتحديد خصائص التصميم'}
        </p>
      </div>

      {/* Design Category */}
      <div className="space-y-4">
        <h4 className="text-base font-medium text-gray-900 flex items-center gap-2">
          <span>🏷️</span>
          فئة التصميم <span className="text-red-500">*</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => setFormData(prev => ({ ...prev, category: option.value }))}
              className={`
                relative p-4 border rounded-lg cursor-pointer transition-all duration-200
                ${formData.category === option.value 
                  ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' 
                  : `border-gray-200 ${option.color}`
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 mb-1">{option.label}</h5>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
                {formData.category === option.value && (
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Target Market */}
      <div className="space-y-4">
        <h4 className="text-base font-medium text-gray-900 flex items-center gap-2">
          <span>🎯</span>
          السوق المستهدف <span className="text-red-500">*</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {targetMarketOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => setFormData(prev => ({ ...prev, targetMarket: option.value }))}
              className={`
                relative p-4 border rounded-lg cursor-pointer transition-all duration-200
                ${formData.targetMarket === option.value 
                  ? 'ring-2 ring-green-500 border-green-500 bg-green-50' 
                  : 'border-gray-200 bg-white hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">{option.icon}</span>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">{option.label}</h5>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
                {formData.targetMarket === option.value && (
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      {formData.category && formData.targetMarket && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">تم الاختيار</h4>
              <p className="text-sm text-blue-700">
                فئة التصميم: <strong>{categoryOptions.find(c => c.value === formData.category)?.label}</strong>
                {' • '}
                السوق المستهدف: <strong>{targetMarketOptions.find(t => t.value === formData.targetMarket)?.label}</strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryStep