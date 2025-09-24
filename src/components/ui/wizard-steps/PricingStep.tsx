import React from 'react'
import { Input } from '../Input'
import { useLanguage } from '../../../hooks/useLanguage'
import type { DesignFormData } from '../../../types/api'

interface PricingStepProps {
  formData: DesignFormData
  setFormData: (data: DesignFormData | ((prev: DesignFormData) => DesignFormData)) => void
}

const PricingStep: React.FC<PricingStepProps> = ({ formData, setFormData }) => {
  const { t } = useLanguage()

  const calculateFinalPrice = () => {
    const basePrice = formData.originalRentPrice
    const discount = (basePrice * formData.discountPercentage) / 100
    return basePrice - discount
  }

  const calculatePricePerMeter = () => {
    if (formData.areaSquareMeters === 0) return 0
    return formData.originalRentPrice / formData.areaSquareMeters
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('pricingInformation') || 'معلومات التسعير'}
        </h3>
        <p className="text-gray-600">
          {t('setPricingDetails') || 'حدد تفاصيل الأسعار والعروض الخاصة بالتصميم'}
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Original Price - Primary */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full text-white text-3xl mb-4">
            💰
          </div>
          
          <label className="block text-lg font-medium text-gray-900 mb-4">
            السعر الأصلي للإيجار <span className="text-red-500">*</span>
          </label>
          
          <div className="max-w-sm mx-auto relative">
            <Input
              type="number"
              value={formData.originalRentPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, originalRentPrice: Number(e.target.value) }))}
              min="0"
              required
              className="text-center text-2xl font-bold pl-16"
              placeholder="0"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 font-medium">درهم</span>
            </div>
          </div>

          {formData.areaSquareMeters > 0 && formData.originalRentPrice > 0 && (
            <p className="text-sm text-blue-600 mt-2">
              السعر للمتر المربع: {calculatePricePerMeter().toFixed(0)} درهم/متر²
            </p>
          )}
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Discount */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">🏷️</div>
              <h4 className="font-semibold text-gray-900">نسبة الخصم</h4>
            </div>
            
            <div className="relative">
              <Input
                type="number"
                value={formData.discountPercentage}
                onChange={(e) => setFormData(prev => ({ ...prev, discountPercentage: Number(e.target.value) }))}
                min="0"
                max="100"
                className="text-center pr-8"
                placeholder="0"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500">%</span>
              </div>
            </div>
            
            {formData.discountPercentage > 0 && (
              <div className="mt-3 text-center">
                <p className="text-sm text-orange-600">
                  مبلغ الخصم: {((formData.originalRentPrice * formData.discountPercentage) / 100).toFixed(0)} درهم
                </p>
              </div>
            )}
          </div>

          {/* Free Period */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">🆓</div>
              <h4 className="font-semibold text-gray-900">فترة مجانية</h4>
            </div>
            
            <div className="relative">
              <Input
                type="number"
                value={formData.freePeriodDays}
                onChange={(e) => setFormData(prev => ({ ...prev, freePeriodDays: Number(e.target.value) }))}
                min="0"
                className="text-center pl-12"
                placeholder="0"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 text-sm">يوم</span>
              </div>
            </div>
            
            {formData.freePeriodDays > 0 && (
              <div className="mt-3 text-center">
                <p className="text-sm text-green-600">
                  {formData.freePeriodDays > 30 
                    ? `${Math.floor(formData.freePeriodDays / 30)} شهر مجاني`
                    : `${formData.freePeriodDays} يوم مجاني`
                  }
                </p>
              </div>
            )}
          </div>

          {/* Office Commission */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">🏢</div>
              <h4 className="font-semibold text-gray-900">عمولة المكتب</h4>
            </div>
            
            <div className="relative">
              <Input
                type="number"
                value={formData.officeCommission}
                onChange={(e) => setFormData(prev => ({ ...prev, officeCommission: Number(e.target.value) }))}
                min="0"
                className="text-center pl-16"
                placeholder="0"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 text-sm">درهم</span>
              </div>
            </div>
          </div>

          {/* Final Price Display */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
            <div className="text-center">
              <div className="text-3xl mb-2">💎</div>
              <h4 className="font-semibold text-gray-900 mb-3">السعر النهائي</h4>
              
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {calculateFinalPrice().toFixed(0)} درهم
              </div>
              
              {formData.discountPercentage > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="line-through">{formData.originalRentPrice} درهم</span>
                  <span className="text-green-600 ml-2 font-medium">
                    وفر {formData.discountPercentage}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Card */}
        {formData.originalRentPrice > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              📋 ملخص التسعير
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="bg-white rounded-lg p-4">
                <div className="text-lg font-bold text-gray-900">{formData.originalRentPrice}</div>
                <div className="text-xs text-gray-600">السعر الأصلي</div>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <div className="text-lg font-bold text-orange-600">{formData.discountPercentage}%</div>
                <div className="text-xs text-gray-600">نسبة الخصم</div>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <div className="text-lg font-bold text-green-600">{formData.freePeriodDays}</div>
                <div className="text-xs text-gray-600">أيام مجانية</div>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <div className="text-lg font-bold text-purple-600">{calculateFinalPrice().toFixed(0)}</div>
                <div className="text-xs text-gray-600">السعر النهائي</div>
              </div>
            </div>
          </div>
        )}

        {/* Validation */}
        {formData.originalRentPrice === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-800">
                  يرجى إدخال السعر الأصلي للإيجار للمتابعة
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PricingStep