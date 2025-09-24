import React from 'react'
import { Input } from '../Input'
import { Textarea } from '../Textarea'
import { useLanguage } from '../../../hooks/useLanguage'
import type { DesignFormData } from '../../../types/api'

interface BasicInfoStepProps {
  formData: DesignFormData
  setFormData: (data: DesignFormData | ((prev: DesignFormData) => DesignFormData)) => void
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ formData, setFormData }) => {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('basicDesignInfo') || 'معلومات التصميم الأساسية'}
        </h3>
        <p className="text-gray-600">
          {t('enterBasicDesignDetails') || 'أدخل المعلومات الأساسية للتصميم مثل الاسم والوصف'}
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Names */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('arabicName') || 'الاسم بالعربية'} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.arabicName}
              onChange={(e) => setFormData(prev => ({ ...prev, arabicName: e.target.value }))}
              required
              dir="rtl"
              placeholder="أدخل اسم التصميم بالعربية"
              className="text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('englishName') || 'English Name'} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.englishName}
              onChange={(e) => setFormData(prev => ({ ...prev, englishName: e.target.value }))}
              required
              dir="ltr"
              placeholder="Enter design name in English"
              className="text-lg"
            />
          </div>
        </div>

        {/* Descriptions */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('arabicDescription') || 'الوصف بالعربية'}
            </label>
            <Textarea
              value={formData.arabicDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, arabicDescription: e.target.value }))}
              rows={4}
              dir="rtl"
              placeholder="اكتب وصفاً مفصلاً للتصميم بالعربية..."
              className="text-base"
            />
            <p className="text-sm text-gray-500 mt-1">
              اختياري - يمكن إضافة وصف مفصل لمساعدة العملاء على فهم التصميم
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('englishDescription') || 'English Description'}
            </label>
            <Textarea
              value={formData.englishDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, englishDescription: e.target.value }))}
              rows={4}
              dir="ltr"
              placeholder="Write a detailed description of the design in English..."
              className="text-base"
            />
            <p className="text-sm text-gray-500 mt-1">
              Optional - Add detailed description to help customers understand the design
            </p>
          </div>
        </div>

        {/* Validation Messages */}
        {!formData.arabicName && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-800">
                  يرجى إدخال اسم التصميم بالعربية للمتابعة
                </p>
              </div>
            </div>
          </div>
        )}

        {!formData.englishName && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-800">
                  Please enter the design name in English to continue
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BasicInfoStep