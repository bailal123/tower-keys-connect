import React, { useState } from 'react'
import { Input } from '../Input'
import { Textarea } from '../Textarea'
import { useLanguage } from '../../../hooks/useLanguage'
import type { DesignFormData, ApplianceListDto } from '../../../types/api'

interface AppliancesStepProps {
  formData: DesignFormData
  setFormData: (data: DesignFormData | ((prev: DesignFormData) => DesignFormData)) => void
  appliances: ApplianceListDto[]
}

const AppliancesStep: React.FC<AppliancesStepProps> = ({ formData, setFormData, appliances }) => {
  const { t, language } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')

  // Filter appliances based on search term
  const filteredAppliances = appliances.filter(appliance => {
    const name = language === 'ar' ? appliance.arabicName : appliance.englishName
    const description = language === 'ar' ? appliance.arabicDescription : appliance.englishDescription
    
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (description && description.toLowerCase().includes(searchTerm.toLowerCase()))
  })

  const addAppliance = (applianceId: number) => {
    const exists = formData.selectedAppliances.find(a => a.id === applianceId)
    if (!exists) {
      setFormData(prev => ({
        ...prev,
        selectedAppliances: [...prev.selectedAppliances, { id: applianceId, quantity: 1, notes: '' }]
      }))
    }
  }

  const removeAppliance = (applianceId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedAppliances: prev.selectedAppliances.filter(a => a.id !== applianceId)
    }))
  }

  const updateApplianceQuantity = (applianceId: number, quantity: number) => {
    if (quantity < 1) {
      removeAppliance(applianceId)
      return
    }
    
    setFormData(prev => ({
      ...prev,
      selectedAppliances: prev.selectedAppliances.map(a => 
        a.id === applianceId ? { ...a, quantity } : a
      )
    }))
  }

  const updateApplianceNotes = (applianceId: number, notes: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAppliances: prev.selectedAppliances.map(a => 
        a.id === applianceId ? { ...a, notes } : a
      )
    }))
  }

  const clearAllAppliances = () => {
    setFormData(prev => ({
      ...prev,
      selectedAppliances: []
    }))
  }

  const getSelectedAppliancesInfo = () => {
    return formData.selectedAppliances.map(selected => {
      const appliance = appliances.find(a => a.id === selected.id)
      return appliance ? { appliance, ...selected } : null
    }).filter(Boolean) as Array<{ appliance: ApplianceListDto; id: number; quantity: number; notes?: string }>
  }

  const getTotalQuantity = () => {
    return formData.selectedAppliances.reduce((sum, a) => sum + a.quantity, 0)
  }

  const isApplianceSelected = (applianceId: number) => {
    return formData.selectedAppliances.some(a => a.id === applianceId)
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('designAppliances') || 'أدوات التصميم'}
        </h3>
        <p className="text-gray-600">
          {t('selectDesignAppliances') || 'اختر الأدوات والأجهزة المتوفرة في التصميم وحدد الكميات'}
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
                placeholder="ابحث عن الأدوات..."
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
              onClick={clearAllAppliances}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              إزالة الكل
            </button>
          </div>
        </div>

        {/* Selected Count */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
            <span className="text-green-600 font-medium">
              تم اختيار {formData.selectedAppliances.length} نوع من الأدوات • إجمالي الكمية: {getTotalQuantity()}
            </span>
          </div>
        </div>

        {/* Available Appliances */}
        {filteredAppliances.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAppliances.map((appliance) => {
              const isSelected = isApplianceSelected(appliance.id)
              const name = language === 'ar' ? appliance.arabicName : appliance.englishName
              const description = language === 'ar' ? appliance.arabicDescription : appliance.englishDescription
              
              return (
                <div
                  key={appliance.id}
                  className={`
                    relative p-4 border rounded-xl transition-all duration-200
                    ${isSelected 
                      ? 'ring-2 ring-green-500 border-green-500 bg-green-50' 
                      : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                    }
                  `}
                >
                  {/* Appliance Icon */}
                  {appliance.iconUrl && (
                    <div className="mb-3 text-center">
                      <img 
                        src={appliance.iconUrl} 
                        alt={name}
                        className="w-12 h-12 object-contain mx-auto"
                      />
                    </div>
                  )}

                  {/* Appliance Info */}
                  <div className="space-y-3">
                    <h5 className="font-semibold text-gray-900 text-center leading-tight">
                      {name}
                    </h5>
                    
                    {description && (
                      <p className="text-sm text-gray-600 text-center leading-relaxed">
                        {description}
                      </p>
                    )}

                    {/* Add/Remove Button */}
                    <div className="text-center">
                      {!isSelected ? (
                        <button
                          onClick={() => addAppliance(appliance.id)}
                          className="w-full px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            إضافة
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={() => removeAppliance(appliance.id)}
                          className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            إزالة
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔧</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'لم يتم العثور على أدوات' : 'لا توجد أدوات متاحة'}
            </h4>
            <p className="text-gray-600">
              {searchTerm 
                ? 'جرب البحث بكلمات مختلفة'
                : 'لا توجد أدوات مضافة في النظام حالياً'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                إظهار جميع الأدوات
              </button>
            )}
          </div>
        )}

        {/* Selected Appliances Configuration */}
        {formData.selectedAppliances.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-6 text-center">
              🔧 الأدوات المختارة ({formData.selectedAppliances.length})
            </h4>
            
            <div className="space-y-4">
              {getSelectedAppliancesInfo().map(({ appliance, id, quantity, notes }) => {
                const name = language === 'ar' ? appliance.arabicName : appliance.englishName
                return (
                  <div key={id} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start gap-4">
                      {/* Appliance Icon & Info */}
                      <div className="flex items-center gap-3 flex-1">
                        {appliance.iconUrl && (
                          <img 
                            src={appliance.iconUrl} 
                            alt={name}
                            className="w-8 h-8 object-contain"
                          />
                        )}
                        <div className="flex-1">
                          <h6 className="font-medium text-gray-900">{name}</h6>
                          <div className="flex items-center gap-4 mt-2">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-600">الكمية:</label>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => updateApplianceQuantity(id, quantity - 1)}
                                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded border text-gray-600"
                                  disabled={quantity <= 1}
                                >
                                  −
                                </button>
                                
                                <Input
                                  type="number"
                                  value={quantity}
                                  onChange={(e) => updateApplianceQuantity(id, Number(e.target.value))}
                                  min="1"
                                  className="w-16 text-center"
                                />
                                
                                <button
                                  type="button"
                                  onClick={() => updateApplianceQuantity(id, quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded border text-gray-600"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => removeAppliance(id)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="mt-3">
                      <label className="block text-sm text-gray-600 mb-2">ملاحظات خاصة:</label>
                      <Textarea
                        value={notes || ''}
                        onChange={(e) => updateApplianceNotes(id, e.target.value)}
                        rows={2}
                        placeholder="أي ملاحظات أو تفاصيل إضافية..."
                        className="text-sm"
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  إجمالي الأدوات: {formData.selectedAppliances.length} نوع • الكمية الإجمالية: {getTotalQuantity()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AppliancesStep