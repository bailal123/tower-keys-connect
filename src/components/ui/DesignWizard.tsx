import React, { useState, useEffect } from 'react'
import { Button } from './Button'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import { RealEstateAPI } from '../../services/api'

import type { DesignFormData, DesignCategory, TargetMarket, MaintenanceType, GasType } from '../../types/api'

interface DesignWizardProps {
  formData: DesignFormData
  setFormData: (data: DesignFormData | ((prev: DesignFormData) => DesignFormData)) => void
  onSave: () => void
  isLoading?: boolean
  isEditing?: boolean
}

const DesignWizard: React.FC<DesignWizardProps> = ({
  formData,
  setFormData,
  onSave,
  isLoading = false,
  isEditing = false
}) => {
  const { language, t } = useLanguage()

  const STEPS = [
    { key: 'basic', label: t('design_wizard_basic_info'), icon: '📝' },
    { key: 'category', label: t('design_wizard_category'), icon: '🏷️' },
    { key: 'rooms', label: t('design_wizard_rooms'), icon: '🏠' },
    { key: 'pricing', label: t('design_wizard_pricing'), icon: '💰' },
    { key: 'expenses', label: t('design_wizard_expenses'), icon: '📊' },
    { key: 'features', label: t('design_wizard_features'), icon: '⭐' },
    { key: 'appliances', label: t('design_wizard_appliances'), icon: '🔧' },
    { key: 'media', label: t('design_wizard_media'), icon: '📸' },
    { key: 'review', label: t('design_wizard_review'), icon: '✅' }
  ]
  const [currentStep, setCurrentStep] = useState(0)
  const [loadingData, setLoadingData] = useState(true)
  const [features, setFeatures] = useState<Array<{id: number, arabicName: string, englishName: string, arabicDescription?: string}>>([])
  const [appliances, setAppliances] = useState<Array<{id: number, arabicName: string, englishName: string, arabicDescription?: string}>>([])

  // Load features and appliances
  useEffect(() => {
    const loadData = async () => {
      try {
        const [featuresResponse, appliancesResponse] = await Promise.all([
          RealEstateAPI.towerFeature.getAll(true, language),
          RealEstateAPI.appliance.getAll(true, language)
        ])
        
        if (featuresResponse.data) {
          setFeatures(featuresResponse.data || [])
        }
        
        if (appliancesResponse.data) {
          setAppliances(appliancesResponse.data || [])
        }
      } catch (error) {
        console.error('Error loading features/appliances:', error)
        setFeatures([])
        setAppliances([])
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [language])

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  const isStepComplete = (stepIndex: number) => {
    const step = STEPS[stepIndex]
    
    switch (step.key) {
      case 'basic':
        return !!(formData.arabicName && formData.englishName)
      case 'category':
        return !!(formData.category !== null && formData.targetMarket !== null)
      case 'rooms':
        return formData.areaSquareMeters > 0
      case 'pricing':
        return formData.originalRentPrice > 0
      case 'expenses':
        return true // Optional step
      case 'features':
        return true // Optional step
      case 'appliances':
        return true // Optional step
      case 'media':
        return true // Optional step
      case 'review':
        return true
      default:
        return false
    }
  }

  const renderCurrentStep = () => {
    const step = STEPS[currentStep]
    
    if (loadingData && currentStep > 4) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    switch (step.key) {
      case 'basic':
        return renderBasicInfoStep()
      case 'category':
        return renderCategoryStep()
      case 'rooms':
        return renderRoomsStep()
      case 'pricing':
        return renderPricingStep()
      case 'expenses':
        return renderExpensesStep()
      case 'features':
        return renderFeaturesStep()
      case 'appliances':
        return renderAppliancesStep()
      case 'media':
        return renderMediaStep()
      case 'review':
        return renderReviewStep()
      default:
        return null
    }
  }

  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('arabic_name_required')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.arabicName}
            onChange={(e) => setFormData(prev => ({ ...prev, arabicName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('enter_arabic_name_placeholder')}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('english_name_required')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.englishName}
            onChange={(e) => setFormData(prev => ({ ...prev, englishName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('enter_english_name_placeholder')}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('arabic_description_field')}
          </label>
          <textarea
            value={formData.arabicDescription}
            onChange={(e) => setFormData(prev => ({ ...prev, arabicDescription: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder={t('enter_arabic_desc_placeholder')}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('english_description_field')}
          </label>
          <textarea
            value={formData.englishDescription}
            onChange={(e) => setFormData(prev => ({ ...prev, englishDescription: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder={t('enter_english_desc_placeholder')}
          />
        </div>
      </div>
    </div>
  )

  const renderCategoryStep = () => (
    <div className="space-y-8">
      {/* Design Category */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('design_category_title')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries({
            1: { label: t('category_standard'), color: 'bg-gray-100 border-gray-300 text-gray-800' },
            2: { label: t('category_luxury'), color: 'bg-purple-100 border-purple-300 text-purple-800' },
            3: { label: t('category_premium'), color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
            4: { label: t('category_economic'), color: 'bg-green-100 border-green-300 text-green-800' },
            5: { label: t('category_family'), color: 'bg-blue-100 border-blue-300 text-blue-800' },
            6: { label: t('category_executive'), color: 'bg-indigo-100 border-indigo-300 text-indigo-800' }
          }).map(([value, config]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, category: Number(value) as DesignCategory }))}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                formData.category === Number(value) 
                  ? 'ring-2 ring-blue-500 border-blue-500' 
                  : 'hover:border-gray-400'
              } ${config.color}`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Target Market */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('target_market_title')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries({
            1: t('market_general'),
            2: t('market_bachelors'), 
            3: t('market_families'),
            4: t('market_executives'),
            5: t('market_students'),
            6: t('market_seniors')
          }).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, targetMarket: Number(value) as TargetMarket }))}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                formData.targetMarket === Number(value) 
                  ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500 text-blue-800' 
                  : 'bg-white border-gray-300 hover:border-gray-400 text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderRoomsStep = () => (
    <div className="space-y-6">
      {/* Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('area_square_meters')} <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={formData.areaSquareMeters}
          onChange={(e) => setFormData(prev => ({ ...prev, areaSquareMeters: Number(e.target.value) }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={t('enter_area_placeholder')}
          min="1"
          required
        />
      </div>

      {/* Room Counts */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { key: 'bedroomsCount', label: t('bedrooms_count'), icon: '🛏️' },
          { key: 'bathroomsCount', label: t('bathrooms_count'), icon: '🚿' },
          { key: 'livingRoomsCount', label: t('living_rooms_count'), icon: '🛋️' },
          { key: 'kitchensCount', label: t('kitchens_count'), icon: '🍳' },
          { key: 'balconiesCount', label: t('balconies_count'), icon: '🌿' }
        ].map(({ key, label, icon }) => (
          <div key={key} className="bg-gray-50 p-4 rounded-lg border">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {icon} {label}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => {
                  const currentValue = prev[key as keyof typeof prev] as number
                  return { ...prev, [key]: Math.max(0, currentValue - 1) }
                })}
                className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center"
              >
                −
              </button>
              <span className="w-8 text-center font-medium">
                {formData[key as keyof typeof formData] as number}
              </span>
              <button
                type="button"
                onClick={() => setFormData(prev => {
                  const currentValue = prev[key as keyof typeof prev] as number
                  return { ...prev, [key]: currentValue + 1 }
                })}
                className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderPricingStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('original_price')} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.originalRentPrice}
            onChange={(e) => setFormData(prev => ({ ...prev, originalRentPrice: Number(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('original_price_placeholder')}
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('discount_percentage')}
          </label>
          <input
            type="number"
            value={formData.discountPercentage}
            onChange={(e) => setFormData(prev => ({ ...prev, discountPercentage: Number(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('discount_placeholder')}
            min="0"
            max="100"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('free_period_days')}
          </label>
          <input
            type="number"
            value={formData.freePeriodDays}
            onChange={(e) => setFormData(prev => ({ ...prev, freePeriodDays: Number(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('free_period_placeholder')}
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('office_commission')}
          </label>
          <input
            type="number"
            value={formData.officeCommission}
            onChange={(e) => setFormData(prev => ({ ...prev, officeCommission: Number(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('office_commission_placeholder')}
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Price Summary */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">{t('price_summary')}</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>{t('original_price_label')}</span>
            <span>{formData.originalRentPrice.toLocaleString()} {t('sar_currency')}</span>
          </div>
          {formData.discountPercentage > 0 && (
            <div className="flex justify-between text-green-600">
              <span>{t('discount_label')} ({formData.discountPercentage}%):</span>
              <span>-{(formData.originalRentPrice * formData.discountPercentage / 100).toLocaleString()} {t('sar_currency')}</span>
            </div>
          )}
          <div className="flex justify-between font-medium text-blue-900 border-t border-blue-200 pt-1">
            <span>{t('final_price_label')}</span>
            <span>{(formData.originalRentPrice * (1 - formData.discountPercentage / 100)).toLocaleString()} {t('sar_currency')}</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderExpensesStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('insurance_amount')}
          </label>
          <input
            type="number"
            value={formData.insuranceAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, insuranceAmount: Number(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('insurance_placeholder')}
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رسوم الكهرباء
          </label>
          <input
            type="number"
            value={formData.electricityFees}
            onChange={(e) => setFormData(prev => ({ ...prev, electricityFees: Number(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="رسوم الكهرباء الشهرية"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('municipality_fees')}
          </label>
          <input
            type="number"
            value={formData.municipalityFees}
            onChange={(e) => setFormData(prev => ({ ...prev, municipalityFees: Number(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('municipality_placeholder')}
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('pro_fees')}
          </label>
          <input
            type="number"
            value={formData.proFees}
            onChange={(e) => setFormData(prev => ({ ...prev, proFees: Number(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('pro_fees_placeholder')}
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('maintenance_amount')}
          </label>
          <input
            type="number"
            value={formData.maintenanceAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, maintenanceAmount: Number(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('maintenance_placeholder')}
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('additional_expenses')}
          </label>
          <input
            type="number"
            value={formData.additionalExpensesAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, additionalExpensesAmount: Number(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('additional_expenses_placeholder')}
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('additional_expenses_desc')}
          </label>
          <textarea
            value={formData.additionalExpensesDescription}
            onChange={(e) => setFormData(prev => ({ ...prev, additionalExpensesDescription: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder={t('additional_expenses_desc_placeholder')}
          />
        </div>
      </div>

      {/* Maintenance Options */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('maintenance_type')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries({
            1: t('maintenance_comprehensive'),
            2: t('maintenance_periodic'),
            3: t('maintenance_emergency'),
            4: t('maintenance_basic'),
            5: t('maintenance_none'),
            6: t('maintenance_advanced')
          }).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, maintenanceType: Number(value) as MaintenanceType }))}
              className={`p-3 border-2 rounded-lg text-center transition-all ${
                formData.maintenanceType === Number(value) 
                  ? 'bg-green-50 border-green-500 ring-2 ring-green-500 text-green-800' 
                  : 'bg-white border-gray-300 hover:border-gray-400 text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Gas Options */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('gas_type')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries({
            1: t('gas_natural'),
            2: t('gas_lpg'),
            3: t('gas_cooking'),
            4: t('gas_heating'),
            5: t('gas_none'),
            6: t('gas_central')
          }).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, gasType: Number(value) as GasType }))}
              className={`p-3 border-2 rounded-lg text-center transition-all ${
                formData.gasType === Number(value) 
                  ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500 text-orange-800' 
                  : 'bg-white border-gray-300 hover:border-gray-400 text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Total Expenses Summary */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">{t('expenses_summary')}</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>{t('municipality_fees')}:</span>
            <span>{formData.municipalityFees.toLocaleString()} {t('sar_currency')}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('electricity_fees')}:</span>
            <span>{formData.electricityFees.toLocaleString()} {t('sar_currency')}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('pro_fees')}:</span>
            <span>{formData.proFees.toLocaleString()} {t('sar_currency')}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('insurance_amount')}:</span>
            <span>{formData.insuranceAmount.toLocaleString()} {t('sar_currency')}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('maintenance_amount')}:</span>
            <span>{formData.maintenanceAmount.toLocaleString()} {t('sar_currency')}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('additional_expenses')}:</span>
            <span>{formData.additionalExpensesAmount.toLocaleString()} {t('sar_currency')}</span>
          </div>
          <div className="flex justify-between font-medium text-gray-900 border-t border-gray-300 pt-1">
            <span>{t('total_expenses')}</span>
            <span>
              {(formData.municipalityFees + formData.electricityFees + formData.proFees + 
                formData.insuranceAmount + formData.maintenanceAmount + formData.additionalExpensesAmount).toLocaleString()} {t('sar_currency')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderFeaturesStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('select_features_title')}</h3>
        <p className="text-sm text-gray-600">{t('select_features_desc')}</p>
      </div>
      
      {features.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">{t('no_features_available')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('no_features_message')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {features.map((feature) => {
            const isSelected = formData.selectedFeatures.includes(feature.id)
            return (
              <div
                key={feature.id}
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    selectedFeatures: isSelected
                      ? prev.selectedFeatures.filter(id => id !== feature.id)
                      : [...prev.selectedFeatures, feature.id]
                  }))
                }}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500'
                    : 'bg-white border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{feature.arabicName}</h4>
                    <p className="text-sm text-gray-600">{feature.englishName}</p>
                    {feature.arabicDescription && (
                      <p className="text-xs text-gray-500 mt-1">{feature.arabicDescription}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>{t('features_selected_count').replace('{count}', formData.selectedFeatures.length.toString())}</strong>
        </p>
        <p className="text-xs text-blue-600 mt-1">
          {t('features_selection_note')}
        </p>
      </div>
    </div>
  )

  const renderAppliancesStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('select_appliances_title')}</h3>
        <p className="text-sm text-gray-600">{t('select_appliances_desc')}</p>
      </div>
      
      {appliances.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">{t('no_appliances_available')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('no_appliances_message')}</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {appliances.map((appliance) => {
            const selectedAppliance = formData.selectedAppliances.find(a => a.id === appliance.id)
            const quantity = selectedAppliance?.quantity || 0
            const notes = selectedAppliance?.notes || ''
            
            return (
              <div
                key={appliance.id}
                className={`p-4 border-2 rounded-lg transition-all ${
                  quantity > 0
                    ? 'bg-green-50 border-green-500'
                    : 'bg-white border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{appliance.arabicName}</h4>
                    <p className="text-sm text-gray-600">{appliance.englishName}</p>
                    {appliance.arabicDescription && (
                      <p className="text-xs text-gray-500 mt-1">{appliance.arabicDescription}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          selectedAppliances: quantity <= 1
                            ? prev.selectedAppliances.filter(a => a.id !== appliance.id)
                            : prev.selectedAppliances.map(a =>
                                a.id === appliance.id ? { ...a, quantity: a.quantity - 1 } : a
                              )
                        }))
                      }}
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center disabled:opacity-50"
                      disabled={quantity === 0}
                    >
                      −
                    </button>
                    
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          selectedAppliances: selectedAppliance
                            ? prev.selectedAppliances.map(a =>
                                a.id === appliance.id ? { ...a, quantity: a.quantity + 1 } : a
                              )
                            : [...prev.selectedAppliances, { id: appliance.id, quantity: 1, notes: '' }]
                        }))
                      }}
                      className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {quantity > 0 && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {t('appliances_notes_optional')}
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          selectedAppliances: prev.selectedAppliances.map(a =>
                            a.id === appliance.id ? { ...a, notes: e.target.value } : a
                          )
                        }))
                      }}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('appliances_notes_placeholder')}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <p className="text-sm text-green-800">
          <strong>{t('appliances_selected_count').replace('{count}', formData.selectedAppliances.filter(a => a.quantity > 0).length.toString())}</strong>
        </p>
        <p className="text-xs text-green-600 mt-1">
          {t('appliances_total_quantity').replace('{total}', formData.selectedAppliances.reduce((sum, a) => sum + a.quantity, 0).toString())}
        </p>
      </div>
    </div>
  )

  const renderMediaStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('media_title')}</h3>
        <p className="text-sm text-gray-600">{t('media_description')}</p>
      </div>
      
      {/* Cover Image */}
      <div className="bg-white p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-sm font-medium text-gray-900 mb-1">{t('media_cover_image_title')}</h4>
          <p className="text-xs text-gray-500 mb-3">{t('media_cover_image_description')}</p>
          <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {t('media_choose_cover_image')}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null
                setFormData(prev => ({ ...prev, coverImage: file }))
              }}
              className="hidden"
            />
          </label>
          {formData.coverImage && (
            <p className="text-xs text-green-600 mt-2">✓ {formData.coverImage.name}</p>
          )}
        </div>
      </div>

      {/* Additional Images */}
      <div className="bg-white p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h4 className="text-sm font-medium text-gray-900 mb-1">{t('media_additional_images_title')}</h4>
          <p className="text-xs text-gray-500 mb-3">{t('media_additional_images_description')}</p>
          <label className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 cursor-pointer">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {t('media_choose_multiple_images')}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : []
                setFormData(prev => ({ ...prev, images: files }))
              }}
              className="hidden"
            />
          </label>
          {formData.images && formData.images.length > 0 && (
            <p className="text-xs text-green-600 mt-2">✓ {t('media_images_selected').replace('{count}', formData.images.length.toString())}</p>
          )}
        </div>
      </div>

      {/* Video */}
      <div className="bg-white p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-sm font-medium text-gray-900 mb-1">{t('media_video_optional')}</h4>
          <p className="text-xs text-gray-500 mb-3">{t('media_video_description')}</p>
          <label className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 cursor-pointer">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {t('media_choose_video')}
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null
                setFormData(prev => ({ ...prev, video: file }))
              }}
              className="hidden"
            />
          </label>
          {formData.video && (
            <p className="text-xs text-purple-600 mt-2">✓ {formData.video.name}</p>
          )}
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h4 className="font-medium text-yellow-800 mb-2">💡 {t('media_upload_tips_title')}</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• {t('media_tip_high_quality')}</li>
          <li>• {t('media_tip_image_size')}</li>
          <li>• {t('media_tip_video_size')}</li>
          <li>• {t('media_tip_image_formats')}</li>
          <li>• {t('media_tip_video_formats')}</li>
        </ul>
      </div>
    </div>
  )

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
          ✅ {t('review_title')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800 border-b pb-1">{t('review_basic_info')}</h4>
            <div><span className="font-medium">{t('basic_arabic_name')}:</span> {formData.arabicName}</div>
            <div><span className="font-medium">{t('basic_english_name')}:</span> {formData.englishName}</div>
            <div><span className="font-medium">{t('category_label')}:</span> {getCategoryName(formData.category)}</div>
            <div><span className="font-medium">{t('category_target_market')}:</span> {getTargetMarketName(formData.targetMarket)}</div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-800 border-b pb-1">{t('review_space_rooms')}</h4>
            <div><span className="font-medium">{t('rooms_area_label')}:</span> {formData.areaSquareMeters} {t('rooms_area_unit')}</div>
            <div><span className="font-medium">{t('rooms_bedrooms')}:</span> {formData.bedroomsCount}</div>
            <div><span className="font-medium">{t('rooms_bathrooms')}:</span> {formData.bathroomsCount}</div>
            <div><span className="font-medium">{t('rooms_living_rooms')}:</span> {formData.livingRoomsCount}</div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-800 border-b pb-1">{t('review_pricing_info')}</h4>
            <div><span className="font-medium">{t('pricing_original_rent_price')}:</span> {formData.originalRentPrice.toLocaleString()} {t('pricing_currency')}</div>
            {formData.discountPercentage > 0 && (
              <div><span className="font-medium">{t('pricing_discount_percentage')}:</span> {formData.discountPercentage}%</div>
            )}
            <div><span className="font-medium">{t('pricing_final_price')}:</span> {(formData.originalRentPrice * (1 - formData.discountPercentage / 100)).toLocaleString()} {t('pricing_currency')}</div>
            {formData.freePeriodDays > 0 && (
              <div><span className="font-medium">{t('pricing_free_period_days')}:</span> {formData.freePeriodDays} {t('pricing_free_period_unit')}</div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-800 border-b pb-1">{t('review_additional_info')}</h4>
            <div><span className="font-medium">{t('expenses_office_commission')}:</span> {formData.officeCommission.toLocaleString()} {t('pricing_currency')}</div>
            <div><span className="font-medium">{t('expenses_maintenance_type')}:</span> {getMaintenanceTypeName(formData.maintenanceType)}</div>
            <div><span className="font-medium">{t('expenses_gas_type')}:</span> {getGasTypeName(formData.gasType)}</div>
            <div><span className="font-medium">{t('review_status')}:</span> {formData.isActive ? t('review_status_active') : t('review_status_inactive')}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800 border-b pb-1">{t('review_selected_features')}</h4>
            {formData.selectedFeatures.length > 0 ? (
              <div className="text-xs text-gray-600">
                {formData.selectedFeatures.map(featureId => {
                  const feature = features.find(f => f.id === featureId)
                  return feature ? (
                    <div key={featureId} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      {feature.arabicName}
                    </div>
                  ) : null
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-500">{t('review_no_features_selected')}</p>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-800 border-b pb-1">{t('review_selected_appliances')}</h4>
            {formData.selectedAppliances.filter(a => a.quantity > 0).length > 0 ? (
              <div className="text-xs text-gray-600 space-y-1">
                {formData.selectedAppliances.filter(a => a.quantity > 0).map(selectedAppliance => {
                  const appliance = appliances.find(a => a.id === selectedAppliance.id)
                  return appliance ? (
                    <div key={selectedAppliance.id} className="flex items-center justify-between">
                      <span>{appliance.arabicName}</span>
                      <span className="text-blue-600 font-medium">×{selectedAppliance.quantity}</span>
                    </div>
                  ) : null
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-500">{t('review_no_appliances_selected')}</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-medium text-gray-800 border-b pb-2 mb-3">{t('review_uploaded_files')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="font-medium">{t('media_cover_image_title')}:</span>
              <p className="text-gray-600">{formData.coverImage ? '✓ ' + formData.coverImage.name : t('review_not_uploaded')}</p>
            </div>
            <div>
              <span className="font-medium">{t('media_additional_images_title')}:</span>
              <p className="text-gray-600">{formData.images && formData.images.length > 0 ? `✓ ${formData.images.length} ${t('review_images_count')}` : t('review_not_uploaded')}</p>
            </div>
            <div>
              <span className="font-medium">{t('review_video')}:</span>
              <p className="text-gray-600">{formData.video ? '✓ ' + formData.video.name : t('review_not_uploaded')}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={onSave}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-medium"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t('review_saving')}
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                {isEditing ? t('review_save_changes') : t('review_create_design')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )

  const getCategoryName = (category: number) => {
    const names = { 
      1: t('category_normal'), 
      2: t('category_luxury'), 
      3: t('category_excellent'), 
      4: t('category_economic'), 
      5: t('category_family'), 
      6: t('category_executive') 
    }
    return names[category as keyof typeof names] || t('category_not_specified')
  }

  const getTargetMarketName = (market: number) => {
    const names = { 
      1: t('market_general'), 
      2: t('market_singles'), 
      3: t('market_families'), 
      4: t('market_executives'), 
      5: t('market_students'), 
      6: t('market_seniors') 
    }
    return names[market as keyof typeof names] || t('market_not_specified')
  }

  const getMaintenanceTypeName = (type: number) => {
    const names = { 
      1: t('maintenance_comprehensive'), 
      2: t('maintenance_periodic'), 
      3: t('maintenance_emergency'), 
      4: t('maintenance_basic'), 
      5: t('maintenance_none'), 
      6: t('maintenance_advanced') 
    }
    return names[type as keyof typeof names] || t('maintenance_not_specified')
  }

  const getGasTypeName = (type: number) => {
    const names = { 
      1: t('gas_natural'), 
      2: t('gas_lpg'), 
      3: t('gas_cooking'), 
      4: t('gas_heating'), 
      5: t('gas_none'), 
      6: t('gas_central') 
    }
    return names[type as keyof typeof names] || t('gas_not_specified')
  }

  const currentStepData = STEPS[currentStep]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isActive = index === currentStep
            const isCompleted = isStepComplete(index)
            const isAccessible = index <= currentStep || isCompleted
            
            return (
              <div key={step.key} className="flex flex-col items-center flex-1">
                <button
                  onClick={() => isAccessible && goToStep(index)}
                  disabled={!isAccessible}
                  className={`
                    relative flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium
                    transition-all duration-200 mb-2
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-lg scale-110' 
                      : isCompleted
                        ? 'bg-green-500 text-white'
                        : isAccessible
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {isCompleted && !isActive ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step.icon}</span>
                  )}
                </button>
                
                <span className={`
                  text-xs text-center leading-tight max-w-20
                  ${isActive 
                    ? 'text-blue-600 font-medium' 
                    : isCompleted 
                      ? 'text-green-600 font-medium'
                      : 'text-gray-500'
                  }
                `}>
                  {step.label}
                </span>
                
                {index < STEPS.length - 1 && (
                  <div className={`
                    absolute top-5 left-1/2 w-full h-0.5 -z-10
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                  `} style={{ transform: 'translateX(50%)' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentStepData.icon}</span>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentStepData.label}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                الخطوة {currentStep + 1} من {STEPS.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {renderCurrentStep()}
        </div>

        {/* Navigation */}
        {currentStep < STEPS.length - 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
            <Button
              onClick={prevStep}
              disabled={currentStep === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('wizard_previous')}
            </Button>
            
            <Button
              onClick={nextStep}
              disabled={currentStep === STEPS.length - 1}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {t('wizard_next')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DesignWizard