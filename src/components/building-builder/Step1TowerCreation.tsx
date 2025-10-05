import React from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { Label } from '../ui/Label'
import { useLanguage } from '../../hooks/useLanguage'
import { useNotifications } from '../../hooks/useNotificationContext'
import { Building2, Calendar, Image, Save, ArrowRight, ArrowLeft, User, Building } from 'lucide-react'
import SimpleMapComponent from '../ui/SimpleMapComponent'
import { RealEstateAPI } from '../../services/api'
import type { StepProps, TowerFormData, BuildingData } from './types'

interface Step1Props extends StepProps {
  formData: TowerFormData
  onFormChange: (field: keyof TowerFormData, value: string | number | boolean) => void
  onLocationSelect: (lat: string, lng: string, address: string) => void
  countries: Array<{ id: number; arabicName: string; englishName: string }>
  cities: Array<{ id: number; arabicName: string; englishName: string }>
  areas: Array<{ id: number; arabicName: string; englishName: string }>
  selectedCountry: number
  selectedCity: number
  setSelectedCountry: (id: number) => void
  setSelectedCity: (id: number) => void
  setCreatedTowerId: (id: number | null) => void
  setBuildingData: (data: BuildingData | ((prev: BuildingData) => BuildingData)) => void
  onStageAdvance?: (nextStage: number, towerId: number) => void
}

const Step1TowerCreation: React.FC<Step1Props> = ({
  isCompleted,
  onNext,
  onComplete,
  isSubmitting,
  formData,
  onFormChange,
  onLocationSelect,
  countries,
  cities,
  areas,
  selectedCountry,
  selectedCity,
  setSelectedCountry,
  setSelectedCity,
  setCreatedTowerId,
  setBuildingData,
  onStageAdvance
}) => {
  const { language, t } = useLanguage()
  const { showSuccess, showError } = useNotifications()
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null)

  const handleSubmit = async () => {
    try {
      // إنشاء FormData لإرسال البيانات مع الملف
      const formDataToSend = new FormData()
      
      // إضافة الحقول النصية
      formDataToSend.append('ArabicName', formData.arabicName)
      formDataToSend.append('EnglishName', formData.englishName)
      if (formData.arabicDescription) formDataToSend.append('ArabicDescription', formData.arabicDescription)
      if (formData.englishDescription) formDataToSend.append('EnglishDescription', formData.englishDescription)
      if (formData.address) formDataToSend.append('Address', formData.address)
      if (formData.latitude) formDataToSend.append('Latitude', formData.latitude)
      if (formData.longitude) formDataToSend.append('Longitude', formData.longitude)
      formDataToSend.append('CountryId', String(formData.countryId))
      formDataToSend.append('CityId', String(formData.cityId))
      formDataToSend.append('AreaId', String(formData.areaId))
      formDataToSend.append('IsActive', String(formData.isActive))
      formDataToSend.append('DefinitionStage', '1')
      
      // تحويل سنة البناء إلى كائن Date إذا كانت موجودة
      if (formData.constructionYear && /^\d{4}$/.test(String(formData.constructionYear))) {
        const constructionYearDate = new Date(Number(formData.constructionYear), 0, 1)
        formDataToSend.append('ConstructionYear', constructionYearDate.toISOString())
      }
      
      // إضافة المطور وشركة الإدارة
      if (formData.developerName) formDataToSend.append('DeveloperName', formData.developerName)
      if (formData.managementCompany) formDataToSend.append('ManagementCompany', formData.managementCompany)
      
      // إضافة ملف الصورة إذا تم اختياره
      if (selectedImage) {
        formDataToSend.append('MainImage', selectedImage, selectedImage.name)
      }
      
      // إرسال الطلب مع FormData
      const response = await RealEstateAPI.tower.createWithFloors(formDataToSend, language || 'ar')
      console.log('Tower creation response:', response.data) // للتتبع
      
      // البيانات موجودة في response.data.data.towerId حسب هيكل الاستجابة
      const towerId = response.data.data?.towerId || response.data.id
      
      setCreatedTowerId(towerId)
      
      // تحديث buildingData باسم البرج
      setBuildingData(prev => ({
        ...prev,
    name: formData.arabicName || formData.englishName || t('builder_step1_heading')
      }))
      
  showSuccess(`${t('builder_tower_created')} (ID: ${towerId})`, t('success'))
  // ترقية المرحلة فقط بعد نجاح الـ API
  onStageAdvance?.(2, towerId)
  onComplete()
  onNext()
    } catch (error: unknown) {
  const errorMessage = error instanceof Error && 'response' in error && 
                          error.response && typeof error.response === 'object' &&
                          'data' in error.response && error.response.data &&
                          typeof error.response.data === 'object' &&
                          'message' in error.response.data 
                          ? String(error.response.data.message)
          : t('error')
  showError(errorMessage, t('error'))
    }
  }

  const canSubmit = formData.arabicName && formData.englishName && 
                   formData.countryId && formData.cityId && formData.areaId

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-6 h-6 text-blue-600" />
  <h2 className="text-xl font-semibold">{t('builder_step1_heading')}</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* العمود الأيسر - المعلومات الأساسية */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('builder_basic_info_heading')}</h3>
          
          {/* اسم البرج بالعربية */}
          <div>
            <Label htmlFor="arabicName">{t('builder_tower_name_ar_label')}</Label>
            <Input
              id="arabicName"
              type="text"
              value={formData.arabicName}
              onChange={(e) => onFormChange('arabicName', e.target.value)}
              placeholder={t('builder_tower_name_ar_placeholder')}
              className="mt-1"
              required
            />
          </div>

          {/* اسم البرج بالإنجليزية */}
          <div>
            <Label htmlFor="englishName">{t('builder_tower_name_en_label')}</Label>
            <Input
              id="englishName"
              type="text"
              value={formData.englishName}
              onChange={(e) => onFormChange('englishName', e.target.value)}
              placeholder="Kingdom Tower"
              className="mt-1"
              required
            />
          </div>

          {/* الوصف بالعربية */}
          <div>
            <Label htmlFor="arabicDescription">{t('builder_tower_description_ar_label')}</Label>
            <textarea
              id="arabicDescription"
              value={formData.arabicDescription}
              onChange={(e) => onFormChange('arabicDescription', e.target.value)}
              placeholder={t('builder_tower_description_ar_placeholder')}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* الوصف بالإنجليزية */}
          <div>
            <Label htmlFor="englishDescription">{t('builder_tower_description_en_label')}</Label>
            <textarea
              id="englishDescription"
              value={formData.englishDescription}
              onChange={(e) => onFormChange('englishDescription', e.target.value)}
              placeholder="Brief description of the tower..."
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* سنة البناء */}
          <div>
            <Label htmlFor="constructionYear">{t('builder_construction_year_label')}</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="constructionYear"
                type="number"
                value={formData.constructionYear}
                onChange={(e) => onFormChange('constructionYear', e.target.value)}
                placeholder="2024"
                className="mt-1 pl-10"
                min="1900"
                max={new Date().getFullYear() + 10}
              />
            </div>
          </div>

          {/* تحميل الصورة الرئيسية */}
          <div>
            <Label htmlFor="mainImage">{t('builder_main_image_label')}</Label>
            <div className="mt-1">
              <div className="flex items-center gap-3">
                <label
                  htmlFor="mainImage"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Image className="w-4 h-4" />
                  {selectedImage ? t('builder_change_image') || 'تغيير الصورة' : t('builder_choose_image') || 'اختر صورة'}
                </label>
                <input
                  id="mainImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setSelectedImage(file)
                    }
                  }}
                  className="hidden"
                />
                {selectedImage && (
                  <span className="text-sm text-gray-600">{selectedImage.name}</span>
                )}
              </div>
              {selectedImage && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Preview"
                    className="h-32 w-auto object-cover rounded-md border border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>

          {/* اسم المطور */}
          <div>
            <Label htmlFor="developerName">{t('builder_developer_name_label')}</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="developerName"
                type="text"
                value={formData.developerName}
                onChange={(e) => onFormChange('developerName', e.target.value)}
                placeholder="شركة التطوير العقاري"
                className="mt-1 pl-10"
              />
            </div>
          </div>

          {/* شركة الإدارة */}
          <div>
            <Label htmlFor="managementCompany">{t('builder_management_company_label')}</Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="managementCompany"
                type="text"
                value={formData.managementCompany}
                onChange={(e) => onFormChange('managementCompany', e.target.value)}
                placeholder="شركة الإدارة والصيانة"
                className="mt-1 pl-10"
              />
            </div>
          </div>

          {/* (تم إزالة اختيار مرحلة التعريف - يتم تعيينها تلقائياً بعد الحفظ) */}
        </div>

        {/* العمود الأيمن - الموقع والعنوان */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('builder_location_heading')}</h3>
          
          {/* الدولة */}
          <div>
            <Label htmlFor="countryId">{t('country')} *</Label>
            <select
              id="countryId"
              value={formData.countryId}
              onChange={(e) => {
                const countryId = parseInt(e.target.value)
                onFormChange('countryId', countryId)
                setSelectedCountry(countryId)
              }}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value={0}>{t('choose_country')}</option>
              {countries?.map((country: {id: number, arabicName: string, englishName: string}) => (
                <option key={country.id} value={country.id}>
                  {language === 'ar' ? country.arabicName : country.englishName}
                </option>
              ))}
            </select>
          </div>

          {/* المدينة */}
          <div>
            <Label htmlFor="cityId">{t('city_name_arabic')} *</Label>
            <select
              id="cityId"
              value={formData.cityId}
              onChange={(e) => {
                const cityId = parseInt(e.target.value)
                onFormChange('cityId', cityId)
                setSelectedCity(cityId)
              }}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!selectedCountry}
              required
            >
              <option value={0}>{t('choose_country')}</option>
              {cities?.map((city: {id: number, arabicName: string, englishName: string}) => (
                <option key={city.id} value={city.id}>
                  {language === 'ar' ? city.arabicName : city.englishName}
                </option>
              ))}
            </select>
          </div>

          {/* المنطقة */}
          <div>
            <Label htmlFor="areaId">{t('areas')} *</Label>
            <select
              id="areaId"
              value={formData.areaId}
              onChange={(e) => onFormChange('areaId', parseInt(e.target.value))}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!selectedCity}
              required
            >
              <option value={0}>{t('areas')}</option>
              {areas?.map((area: {id: number, arabicName: string, englishName: string}) => (
                <option key={area.id} value={area.id}>
                  {language === 'ar' ? area.arabicName : area.englishName}
                </option>
              ))}
            </select>
          </div>

          {/* العنوان التفصيلي */}
          <div>
            <Label htmlFor="address">{t('builder_address_label')}</Label>
            <Input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => onFormChange('address', e.target.value)}
              placeholder={t('builder_address_placeholder')}
              className="mt-1"
            />
          </div>

          {/* خريطة تحديد الموقع */}
          <SimpleMapComponent 
            latitude={formData.latitude}
            longitude={formData.longitude}
            onLocationSelect={onLocationSelect}
          />
        </div>
      </div>

      {/* أزرار التحكم */}
      <div className="mt-8 flex justify-between gap-4">
        <div>
          {/* زر التالي - يظهر إذا تم إكمال الخطوة الأولى */}
          {isCompleted && (
            <Button 
              onClick={onNext}
              variant="outline"
              className="px-6 py-2 flex items-center gap-2"
            >
              <>
                {language === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                {t('wizard_next')}
              </>
            </Button>
          )}
        </div>
        
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || !canSubmit}
          className="px-6 py-2 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {t('builder_saving')}
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {isCompleted ? t('builder_recreate_tower') : t('builder_save_and_continue')}
              {language === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}

export default Step1TowerCreation