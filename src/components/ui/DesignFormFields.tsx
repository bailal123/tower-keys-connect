import React from 'react'
import { Input } from './Input'
import { Textarea } from './Textarea'
import { useLanguage } from '../../hooks/useLanguage'
import { DesignCategory, TargetMarket, MaintenanceType, GasType, type DesignFormData } from '../../types/api'

interface DesignFormFieldsProps {
  formData: DesignFormData
  setFormData: (data: DesignFormData | ((prev: DesignFormData) => DesignFormData)) => void
}

const DesignFormFields: React.FC<DesignFormFieldsProps> = ({ 
  formData, 
  setFormData
}) => {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('arabicName') || 'الاسم بالعربية'} <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.arabicName}
            onChange={(e) => setFormData(prev => ({ ...prev, arabicName: e.target.value }))}
            required
            dir="rtl"
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
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            {t('arabicDescription') || 'الوصف بالعربية'}
          </label>
          <Textarea
            value={formData.arabicDescription}
            onChange={(e) => setFormData(prev => ({ ...prev, arabicDescription: e.target.value }))}
            rows={3}
            dir="rtl"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            {t('englishDescription') || 'English Description'}
          </label>
          <Textarea
            value={formData.englishDescription}
            onChange={(e) => setFormData(prev => ({ ...prev, englishDescription: e.target.value }))}
            rows={3}
            dir="ltr"
          />
        </div>
      </div>

      {/* Category and Market */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('designCategory') || 'الفئة'} <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: Number(e.target.value) as DesignCategory }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value={DesignCategory.Standard}>{t('standard') || 'عادي'}</option>
            <option value={DesignCategory.Luxury}>{t('luxury') || 'فاخر'}</option>
            <option value={DesignCategory.Premium}>{t('premium') || 'ممتاز'}</option>
            <option value={DesignCategory.Economic}>{t('economic') || 'اقتصادي'}</option>
            <option value={DesignCategory.Family}>{t('family') || 'عائلي'}</option>
            <option value={DesignCategory.Executive}>{t('executive') || 'تنفيذي'}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {t('targetMarket') || 'السوق المستهدف'} <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.targetMarket}
            onChange={(e) => setFormData(prev => ({ ...prev, targetMarket: Number(e.target.value) as TargetMarket }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value={TargetMarket.General}>{t('general') || 'عام'}</option>
            <option value={TargetMarket.Singles}>{t('singles') || 'عزاب'}</option>
            <option value={TargetMarket.Families}>{t('families') || 'عائلات'}</option>
            <option value={TargetMarket.Executives}>{t('executives') || 'تنفيذيين'}</option>
            <option value={TargetMarket.Students}>{t('students') || 'طلاب'}</option>
            <option value={TargetMarket.Seniors}>{t('seniors') || 'كبار السن'}</option>
          </select>
        </div>
      </div>

      {/* Area and Rooms */}
      <div>
        <h3 className="text-lg font-semibold mb-3">{t('areaAndRooms') || 'المساحة والغرف'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('areaSquareMeters') || 'المساحة (متر مربع)'} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.areaSquareMeters}
              onChange={(e) => setFormData(prev => ({ ...prev, areaSquareMeters: Number(e.target.value) }))}
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('bedroomsCount') || 'عدد غرف النوم'}
            </label>
            <Input
              type="number"
              value={formData.bedroomsCount}
              onChange={(e) => setFormData(prev => ({ ...prev, bedroomsCount: Number(e.target.value) }))}
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('bathroomsCount') || 'عدد الحمامات'}
            </label>
            <Input
              type="number"
              value={formData.bathroomsCount}
              onChange={(e) => setFormData(prev => ({ ...prev, bathroomsCount: Number(e.target.value) }))}
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('livingRoomsCount') || 'عدد غرف المعيشة'}
            </label>
            <Input
              type="number"
              value={formData.livingRoomsCount}
              onChange={(e) => setFormData(prev => ({ ...prev, livingRoomsCount: Number(e.target.value) }))}
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('kitchensCount') || 'عدد المطابخ'}
            </label>
            <Input
              type="number"
              value={formData.kitchensCount}
              onChange={(e) => setFormData(prev => ({ ...prev, kitchensCount: Number(e.target.value) }))}
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('balconiesCount') || 'عدد الشرفات'}
            </label>
            <Input
              type="number"
              value={formData.balconiesCount}
              onChange={(e) => setFormData(prev => ({ ...prev, balconiesCount: Number(e.target.value) }))}
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h3 className="text-lg font-semibold mb-3">{t('pricing') || 'التسعير'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('originalRentPrice') || 'سعر الإيجار الأصلي'} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.originalRentPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, originalRentPrice: Number(e.target.value) }))}
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('discountPercentage') || 'نسبة الخصم (%)'}
            </label>
            <Input
              type="number"
              value={formData.discountPercentage}
              onChange={(e) => setFormData(prev => ({ ...prev, discountPercentage: Number(e.target.value) }))}
              min="0"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('freePeriodDays') || 'فترة مجانية (أيام)'}
            </label>
            <Input
              type="number"
              value={formData.freePeriodDays}
              onChange={(e) => setFormData(prev => ({ ...prev, freePeriodDays: Number(e.target.value) }))}
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('officeCommission') || 'عمولة المكتب'}
            </label>
            <Input
              type="number"
              value={formData.officeCommission}
              onChange={(e) => setFormData(prev => ({ ...prev, officeCommission: Number(e.target.value) }))}
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Expenses */}
      <div>
        <h3 className="text-lg font-semibold mb-3">{t('expenses') || 'المصاريف'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('municipalityFees') || 'رسوم البلدية'}
            </label>
            <Input
              type="number"
              value={formData.municipalityFees}
              onChange={(e) => setFormData(prev => ({ ...prev, municipalityFees: Number(e.target.value) }))}
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('electricityFees') || 'رسوم الكهرباء'}
            </label>
            <Input
              type="number"
              value={formData.electricityFees}
              onChange={(e) => setFormData(prev => ({ ...prev, electricityFees: Number(e.target.value) }))}
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('proFees') || 'رسوم احترافية'}
            </label>
            <Input
              type="number"
              value={formData.proFees}
              onChange={(e) => setFormData(prev => ({ ...prev, proFees: Number(e.target.value) }))}
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('insuranceAmount') || 'مبلغ التأمين'}
            </label>
            <Input
              type="number"
              value={formData.insuranceAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, insuranceAmount: Number(e.target.value) }))}
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('maintenanceAmount') || 'مبلغ الصيانة'}
            </label>
            <Input
              type="number"
              value={formData.maintenanceAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, maintenanceAmount: Number(e.target.value) }))}
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('maintenanceType') || 'نوع الصيانة'}
            </label>
            <select
              value={formData.maintenanceType}
              onChange={(e) => setFormData(prev => ({ ...prev, maintenanceType: Number(e.target.value) as MaintenanceType }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={MaintenanceType.Annual}>{t('annual') || 'سنوي'}</option>
              <option value={MaintenanceType.NotIncluded}>{t('notIncluded') || 'غير مشمول'}</option>
              <option value={MaintenanceType.Optional}>{t('optional') || 'اختياري'}</option>
              <option value={MaintenanceType.Free}>{t('free') || 'مجاني'}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('gasType') || 'نوع الغاز'}
            </label>
            <select
              value={formData.gasType}
              onChange={(e) => setFormData(prev => ({ ...prev, gasType: Number(e.target.value) as GasType }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={GasType.Central}>{t('central') || 'مركزي'}</option>
              <option value={GasType.Cylinder}>{t('cylinder') || 'أسطوانات'}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('additionalExpensesAmount') || 'مصاريف إضافية'}
            </label>
            <Input
              type="number"
              value={formData.additionalExpensesAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalExpensesAmount: Number(e.target.value) }))}
              min="0"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              {t('additionalExpensesDescription') || 'وصف المصاريف الإضافية'}
            </label>
            <Textarea
              value={formData.additionalExpensesDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalExpensesDescription: e.target.value }))}
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Media Files */}
      <div>
        <h3 className="text-lg font-semibold mb-3">{t('mediaFiles') || 'الملفات الإعلامية'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('coverImage') || 'الصورة الرئيسية'}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.files?.[0] || null }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('images') || 'صور إضافية'}
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFormData(prev => ({ ...prev, images: e.target.files ? Array.from(e.target.files) : null }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('videos') || 'مقاطع فيديو'}
            </label>
            <input
              type="file"
              multiple
              accept="video/*"
              onChange={(e) => setFormData(prev => ({ ...prev, videos: e.target.files }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="mr-2"
          />
          {t('isActive') || 'نشط'}
        </label>
      </div>
    </div>
  )
}

export default DesignFormFields