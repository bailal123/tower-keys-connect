import React from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { Label } from '../ui/Label'
import { useLanguage } from '../../hooks/useLanguage'
import { useNotifications } from '../../hooks/useNotificationContext'
import { Building2, Calendar, Image, Save, ArrowRight, User, Building, Settings } from 'lucide-react'
import SimpleMapComponent from '../ui/SimpleMapComponent'
import { RealEstateAPI } from '../../services/api'
import type { StepProps, TowerFormData, BuildingData } from './types'
import type { CreateTowerWithFloorsRequest } from '../../types/api'

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
  setBuildingData
}) => {
  const { language } = useLanguage()
  const { showSuccess, showError } = useNotifications()

  const handleSubmit = async () => {
    try {
      const towerData: CreateTowerWithFloorsRequest = {
        arabicName: formData.arabicName,
        englishName: formData.englishName,
        arabicDescription: formData.arabicDescription,
        englishDescription: formData.englishDescription,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        countryId: formData.countryId!,
        cityId: formData.cityId!,
        areaId: formData.areaId!,
        isActive: formData.isActive,
        definitionStage: 1, // المرحلة الأولى من التعريف
        lang: language || 'ar'
      }

      const response = await RealEstateAPI.tower.createWithFloors(towerData)
      console.log('Tower creation response:', response.data) // للتتبع
      
      // البيانات موجودة في response.data.data.towerId حسب هيكل الاستجابة
      const towerId = response.data.data?.towerId || response.data.id
      
      setCreatedTowerId(towerId)
      
      // تحديث buildingData باسم البرج
      setBuildingData(prev => ({
        ...prev,
        name: formData.arabicName || formData.englishName || 'البرج الجديد'
      }))
      
      showSuccess(`تم إنشاء البرج بنجاح (ID: ${towerId})`, 'نجح العملية')
      onComplete()
      onNext()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error && 
                          error.response && typeof error.response === 'object' &&
                          'data' in error.response && error.response.data &&
                          typeof error.response.data === 'object' &&
                          'message' in error.response.data 
                          ? String(error.response.data.message)
                          : 'حدث خطأ في إنشاء البرج'
      showError(errorMessage, 'خطأ')
    }
  }

  const canSubmit = formData.arabicName && formData.englishName && 
                   formData.countryId && formData.cityId && formData.areaId

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold">إنشاء برج جديد</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* العمود الأيسر - المعلومات الأساسية */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">المعلومات الأساسية</h3>
          
          {/* اسم البرج بالعربية */}
          <div>
            <Label htmlFor="arabicName">اسم البرج (عربي) *</Label>
            <Input
              id="arabicName"
              type="text"
              value={formData.arabicName}
              onChange={(e) => onFormChange('arabicName', e.target.value)}
              placeholder="برج المملكة"
              className="mt-1"
              required
            />
          </div>

          {/* اسم البرج بالإنجليزية */}
          <div>
            <Label htmlFor="englishName">اسم البرج (إنجليزي) *</Label>
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
            <Label htmlFor="arabicDescription">الوصف (عربي)</Label>
            <textarea
              id="arabicDescription"
              value={formData.arabicDescription}
              onChange={(e) => onFormChange('arabicDescription', e.target.value)}
              placeholder="وصف مختصر للبرج..."
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* الوصف بالإنجليزية */}
          <div>
            <Label htmlFor="englishDescription">الوصف (إنجليزي)</Label>
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
            <Label htmlFor="constructionYear">سنة البناء</Label>
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

          {/* رابط الصورة الرئيسية */}
          <div>
            <Label htmlFor="mainImageUrl">رابط الصورة الرئيسية</Label>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="mainImageUrl"
                type="url"
                value={formData.mainImageUrl}
                onChange={(e) => onFormChange('mainImageUrl', e.target.value)}
                placeholder="https://example.com/tower-image.jpg"
                className="mt-1 pl-10"
              />
            </div>
          </div>

          {/* اسم المطور */}
          <div>
            <Label htmlFor="developerName">اسم المطور</Label>
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
            <Label htmlFor="managementCompany">شركة الإدارة</Label>
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

          {/* مرحلة التعريف */}
          <div>
            <Label htmlFor="definitionStage">مرحلة التعريف</Label>
            <div className="relative">
              <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <select
                id="definitionStage"
                value={formData.definitionStage}
                onChange={(e) => onFormChange('definitionStage', parseInt(e.target.value))}
                className="mt-1 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value={1}>المرحلة 1: المعلومات الأساسية</option>
                <option value={2}>المرحلة 2: الطوابق والبلوكات</option>
                <option value={3}>المرحلة 3: الوحدات والشقق</option>
                <option value={4}>المرحلة 4: التصاميم والمخططات</option>
                <option value={5}>المرحلة 5: الأسعار والمدفوعات</option>
                <option value={6}>المرحلة 6: مكتمل</option>
              </select>
              {/* سهم القائمة المنسدلة */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* العمود الأيمن - الموقع والعنوان */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">الموقع والعنوان</h3>
          
          {/* الدولة */}
          <div>
            <Label htmlFor="countryId">الدولة *</Label>
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
              <option value={0}>اختر الدولة</option>
              {countries?.map((country: {id: number, arabicName: string, englishName: string}) => (
                <option key={country.id} value={country.id}>
                  {language === 'ar' ? country.arabicName : country.englishName}
                </option>
              ))}
            </select>
          </div>

          {/* المدينة */}
          <div>
            <Label htmlFor="cityId">المدينة *</Label>
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
              <option value={0}>اختر المدينة</option>
              {cities?.map((city: {id: number, arabicName: string, englishName: string}) => (
                <option key={city.id} value={city.id}>
                  {language === 'ar' ? city.arabicName : city.englishName}
                </option>
              ))}
            </select>
          </div>

          {/* المنطقة */}
          <div>
            <Label htmlFor="areaId">المنطقة *</Label>
            <select
              id="areaId"
              value={formData.areaId}
              onChange={(e) => onFormChange('areaId', parseInt(e.target.value))}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!selectedCity}
              required
            >
              <option value={0}>اختر المنطقة</option>
              {areas?.map((area: {id: number, arabicName: string, englishName: string}) => (
                <option key={area.id} value={area.id}>
                  {language === 'ar' ? area.arabicName : area.englishName}
                </option>
              ))}
            </select>
          </div>

          {/* العنوان التفصيلي */}
          <div>
            <Label htmlFor="address">العنوان التفصيلي</Label>
            <Input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => onFormChange('address', e.target.value)}
              placeholder="شارع الملك فهد، حي العليا"
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
                <ArrowRight className="w-4 h-4" />
                التالي
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
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {isCompleted ? 'إعادة إنشاء البرج' : 'حفظ والمتابعة'}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}

export default Step1TowerCreation