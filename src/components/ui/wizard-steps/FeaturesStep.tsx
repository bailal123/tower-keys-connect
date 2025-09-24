import React, { useState } from 'react'
import { Input } from '../Input'
import { useLanguage } from '../../../hooks/useLanguage'
import type { DesignFormData, TowerFeatureListDto } from '../../../types/api'

interface FeaturesStepProps {
  formData: DesignFormData
  setFormData: (data: DesignFormData | ((prev: DesignFormData) => DesignFormData)) => void
  features: TowerFeatureListDto[]
}

const FeaturesStep: React.FC<FeaturesStepProps> = ({ formData, setFormData, features }) => {
  const { t, language } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')

  // Filter features based on search term
  const filteredFeatures = features.filter(feature => {
    const name = language === 'ar' ? feature.arabicName : feature.englishName
    const description = language === 'ar' ? feature.arabicDescription : feature.englishDescription
    
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (description && description.toLowerCase().includes(searchTerm.toLowerCase()))
  })

  const toggleFeature = (featureId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedFeatures: prev.selectedFeatures.includes(featureId)
        ? prev.selectedFeatures.filter(id => id !== featureId)
        : [...prev.selectedFeatures, featureId]
    }))
  }

  const selectAllFeatures = () => {
    setFormData(prev => ({
      ...prev,
      selectedFeatures: filteredFeatures.map(f => f.id)
    }))
  }

  const clearAllFeatures = () => {
    setFormData(prev => ({
      ...prev,
      selectedFeatures: []
    }))
  }

  const getSelectedFeaturesInfo = () => {
    return formData.selectedFeatures.map(id => 
      features.find(f => f.id === id)
    ).filter(Boolean) as TowerFeatureListDto[]
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('designFeatures') || 'ميزات التصميم'}
        </h3>
        <p className="text-gray-600">
          {t('selectDesignFeatures') || 'اختر الميزات التي تريد إضافتها للتصميم'}
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن الميزات..."
                className="pl-10"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAllFeatures}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              اختيار الكل
            </button>
            <button
              type="button"
              onClick={clearAllFeatures}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              إلغاء الكل
            </button>
          </div>
        </div>

        {/* Selected Count */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
            <span className="text-blue-600 font-medium">
              تم اختيار {formData.selectedFeatures.length} من {filteredFeatures.length} ميزة
            </span>
          </div>
        </div>

        {/* Features Grid */}
        {filteredFeatures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFeatures.map((feature) => {
              const isSelected = formData.selectedFeatures.includes(feature.id)
              const name = language === 'ar' ? feature.arabicName : feature.englishName
              const description = language === 'ar' ? feature.arabicDescription : feature.englishDescription
              
              return (
                <div
                  key={feature.id}
                  onClick={() => toggleFeature(feature.id)}
                  className={`
                    relative p-4 border rounded-xl cursor-pointer transition-all duration-200
                    ${isSelected 
                      ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50 shadow-lg transform scale-105' 
                      : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                    }
                  `}
                >
                  {/* Selection Indicator */}
                  <div className="absolute top-3 right-3">
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                      ${isSelected 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'border-gray-300 bg-white'
                      }
                    `}>
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Feature Icon */}
                  {feature.iconUrl && (
                    <div className="mb-3">
                      <img 
                        src={feature.iconUrl} 
                        alt={name}
                        className="w-12 h-12 object-contain mx-auto"
                      />
                    </div>
                  )}

                  {/* Feature Info */}
                  <div className="space-y-2">
                    <h5 className="font-semibold text-gray-900 text-center leading-tight">
                      {name}
                    </h5>
                    
                    {description && (
                      <p className="text-sm text-gray-600 text-center leading-relaxed">
                        {description}
                      </p>
                    )}

                    {/* Display Order Badge */}
                    <div className="flex justify-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        ترتيب: {feature.displayOrder}
                      </span>
                    </div>
                  </div>

                  {/* Selected Overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-xl pointer-events-none" />
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'لم يتم العثور على ميزات' : 'لا توجد ميزات متاحة'}
            </h4>
            <p className="text-gray-600">
              {searchTerm 
                ? 'جرب البحث بكلمات مختلفة'
                : 'لا توجد ميزات مضافة في النظام حالياً'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                إظهار جميع الميزات
              </button>
            )}
          </div>
        )}

        {/* Selected Features Summary */}
        {formData.selectedFeatures.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              ✅ الميزات المختارة ({formData.selectedFeatures.length})
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {getSelectedFeaturesInfo().map((feature) => {
                const name = language === 'ar' ? feature.arabicName : feature.englishName
                return (
                  <div key={feature.id} className="flex items-center gap-3 bg-white rounded-lg p-3">
                    {feature.iconUrl && (
                      <img 
                        src={feature.iconUrl} 
                        alt={name}
                        className="w-6 h-6 object-contain"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-900 flex-1">
                      {name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFeature(feature.id)
                      }}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FeaturesStep