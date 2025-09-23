import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { FormModal } from '../components/ui/FormModal'
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog'
import { Input } from '../components/ui/Input'
import { Grid } from '../components/ui/Grid'
import { ActionCard } from '../components/ui/ActionCard'
import { InfoCard } from '../components/ui/InfoCard'
import { PageHeader } from '../components/ui/PageHeader'
import { Plus, Edit, Trash2, MapPin, Building } from 'lucide-react'
import { cn } from '../lib/utils'
import {
  useCountries,
  useCities,
  useAreas
} from '../hooks/useApi'
import { useLanguage } from '../hooks/useLanguage'
import { useNotifications } from '../hooks/useNotificationContext'
import { useConfirmation } from '../hooks/useConfirmation'
import { useFormModal } from '../hooks/useFormModal'
import type { AreaListDto, CityListDto, CountryListDto } from '../types/api'
import { RealEstateAPI } from '../services/api'



const CountriesPage: React.FC = () => {
  const { language } = useLanguage()
  const { showSuccess, showError } = useNotifications()
  const confirmation = useConfirmation()
  
  const [view, setView] = useState<'countries' | 'cities' | 'areas'>('countries')
  const [selectedCountry, setSelectedCountry] = useState<CountryListDto | null>(null)
  const [selectedCity, setSelectedCity] = useState<CityListDto | null>(null)

  // Country form modal
  const countryModal = useFormModal<{
    id?: number
    arabicName: string
    englishName: string
    countryCode: string
    isActive: boolean
  }>({
    initialData: {
      arabicName: '',
      englishName: '',
      countryCode: '',
      isActive: true
    },
    onSave: async (data, isEditing) => {
      if (isEditing && data.id) {
        await RealEstateAPI.country.update(data.id, {
          id: data.id,
          arabicName: data.arabicName,
          englishName: data.englishName,
          countryCode: data.countryCode,
          isActive: data.isActive
        }, language)
        showSuccess('تم تحديث الدولة بنجاح')
      } else {
        await RealEstateAPI.country.create({
          arabicName: data.arabicName,
          englishName: data.englishName,
          countryCode: data.countryCode,
          isActive: data.isActive
        }, language)
        showSuccess('تم إضافة الدولة بنجاح')
      }
      refetchCountries()
    }
  })

  // City form modal  
  const cityModal = useFormModal<{
    id?: number
    arabicName: string
    englishName: string
    countryId: number
    isActive: boolean
  }>({
    initialData: {
      arabicName: '',
      englishName: '',
      countryId: 0,
      isActive: true
    },
    onSave: async (data, isEditing) => {
      const cityData = {
        countryId: selectedCountry?.id || 0,
        arabicName: data.arabicName,
        englishName: data.englishName,
        isActive: data.isActive
      }
      if (isEditing && data.id) {
        await RealEstateAPI.city.update(data.id, {
          id: data.id,
          ...cityData
        }, language)
        showSuccess('تم تحديث المدينة بنجاح')
      } else {
        await RealEstateAPI.city.create(cityData, language)
        showSuccess('تم إضافة المدينة بنجاح')
      }
      if (selectedCountry) {
        refetchCities()
      }
    }
  })

  // Area form modal
  const areaModal = useFormModal<{
    id?: number
    arabicName: string
    englishName: string
    cityId: number
    isActive: boolean
  }>({
    initialData: {
      arabicName: '',
      englishName: '',
      cityId: 0,
      isActive: true
    },
    onSave: async (data, isEditing) => {
      const areaData = {
        cityId: selectedCity?.id || 0,
        arabicName: data.arabicName,
        englishName: data.englishName,
        isActive: data.isActive
      }
      if (isEditing && data.id) {
        await RealEstateAPI.area.update(data.id, {
          id: data.id,
          ...areaData
        }, language)
        showSuccess('تم تحديث المنطقة بنجاح')
      } else {
        await RealEstateAPI.area.create(areaData, language)
        showSuccess('تم إضافة المنطقة بنجاح')
      }
      if (selectedCity) {
        refetchAreas()
      }
    }
  })

  // API hooks
  const { data: countriesData = [], isLoading: countriesLoading, refetch: refetchCountries } = useCountries({ lang: language })
  const { data: citiesData = [], refetch: refetchCities } = useCities({ countryId: selectedCountry?.id || 0, lang: language })
  const { data: areasData = [], refetch: refetchAreas } = useAreas({ cityId: selectedCity?.id || 0, lang: language })

  // Extract data from API responses
  const countries: CountryListDto[] = (countriesData as CountryListDto[]) || []
  const cities: CityListDto[] = (citiesData as CityListDto[]) || []
  const areas: AreaListDto[] = (areasData as AreaListDto[]) || []

  // Manual data refresh functions
  const refreshCitiesData = async () => {
    if (selectedCountry) {
      await refetchCities()
    }
  }

  const refreshAreasData = async () => {
    if (selectedCity) {
      await refetchAreas()
    }
  }

  // Get cities for selected country
  const getCountryCities = (countryId: number) => {
    return cities.filter((city: CityListDto) => city.countryId === countryId)
  }

  // Get areas for selected city
  const getCityAreas = (cityId: number) => {
    return areas.filter((area: AreaListDto) => area.cityId === cityId)
  }

  // Handle country selection
  const handleCountrySelect = async (country: CountryListDto) => {
    setSelectedCountry(country)
    setSelectedCity(null)
    setView('cities')
    // إعادة تحميل بيانات المدن للدولة الجديدة
    setTimeout(async () => {
      await refreshCitiesData()
    }, 100)
  }

  // Handle city selection
  const handleCitySelect = async (city: CityListDto) => {
    if (selectedCity?.id === city.id) {
      // If same city is clicked, deselect it
      setSelectedCity(null)
    } else {
      // Select the new city
      setSelectedCity(city)
      // إعادة تحميل بيانات المناطق للمدينة الجديدة
      setTimeout(async () => {
        await refreshAreasData()
      }, 100)
    }
  }

  // Go back to previous view
  const handleBack = () => {
    if (selectedCity) {
      setSelectedCity(null)
    } else if (view === 'cities') {
      setView('countries')
      setSelectedCountry(null)
    }
  }

  // CRUD operations using new modal system
  const handleAddCountry = () => {
    countryModal.openModal()
  }

  const handleEditCountry = (country: CountryListDto) => {
    countryModal.openModal(country)
  }

  const handleAddCity = () => {
    if (!selectedCountry) return
    cityModal.openModal()
  }

  const handleEditCity = (city: CityListDto) => {
    cityModal.openModal(city)
  }

  const handleAddArea = () => {
    if (!selectedCity) return
    areaModal.openModal()
  }

  const handleEditArea = (area: AreaListDto) => {
    areaModal.openModal(area)
  }

  // Delete operations
  const handleDeleteCountry = async (id: number) => {
    const confirmed = await confirmation.confirm({
      title: 'تأكيد الحذف',
      message: 'هل أنت متأكد من حذف هذه الدولة؟ سيتم حذف جميع المدن والمناطق المرتبطة بها.',
      confirmText: 'حذف',
      cancelText: 'إلغاء',
      type: 'danger'
    })

    if (confirmed) {
      try {
        await RealEstateAPI.country.delete(id, language)
        showSuccess('تم حذف الدولة بنجاح')
        refetchCountries()
      } catch (error: unknown) {
        const err = error as { response?: { data?: unknown; status?: number }; message?: string }
        console.error('حدث خطأ أثناء حذف الدولة:', error)
        console.error('تفاصيل الخطأ:', err.response?.data)
        console.error('كود الخطأ:', err.response?.status)
        
        if (err.response?.status === 405) {
          showError('عملية حذف الدول غير مدعومة حاليًا', 'خطأ 405')
        } else {
          showError('تعذر حذف الدولة', 'خطأ في الحذف')
        }
      }
    }
  }

  const handleDeleteCity = async (id: number) => {
    const confirmed = await confirmation.confirm({
      title: 'تأكيد حذف المدينة',
      message: 'هل أنت متأكد من حذف هذه المدينة؟ سيتم حذف جميع المناطق المرتبطة بها.',
      confirmText: 'حذف',
      cancelText: 'إلغاء',
      type: 'danger'
    })

    if (confirmed) {
      try {
        await RealEstateAPI.city.delete(id, language)
        showSuccess('تم حذف المدينة بنجاح')
        await refreshCitiesData()
      } catch (error: unknown) {
        const err = error as { response?: { data?: unknown; status?: number }; message?: string }
        console.error('حدث خطأ أثناء حذف المدينة:', error)
        console.error('تفاصيل الخطأ:', err.response?.data)
        console.error('كود الخطأ:', err.response?.status)
        
        if (err.response?.status === 405) {
          showError('عملية حذف المدن غير مدعومة حاليًا', 'خطأ 405')
        } else {
          showError('تعذر حذف المدينة', 'خطأ في الحذف')
        }
      }
    }
  }

  const handleDeleteArea = async (id: number) => {
    const confirmed = await confirmation.confirm({
      title: 'تأكيد حذف المنطقة',
      message: 'هل أنت متأكد من حذف هذه المنطقة؟',
      confirmText: 'حذف',
      cancelText: 'إلغاء',
      type: 'danger'
    })

    if (confirmed) {
      try {
        await RealEstateAPI.area.delete(id, language)
        showSuccess('تم حذف المنطقة بنجاح')
        await refreshAreasData()
      } catch (error) {
        console.error('حدث خطأ أثناء حذف المنطقة:', error)
        showError('تعذر حذف المنطقة', 'خطأ في الحذف')
      }
    }
  }

  // Render countries cards
  const renderCountries = () => (
    <div className="p-6">
      <PageHeader
        title="الدول"
        description={`إدارة الدول في النظام (${countries.length} دولة)`}
        actions={
          <Button 
            onClick={handleAddCountry}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            size="lg"
          >
            <Plus className="h-4 w-4 ml-2" />
            إضافة دولة جديدة
          </Button>
        }
      />

      {/* Countries Grid */}
      {countriesLoading ? (
        <div className="text-center py-8">
          <p>جارٍ تحميل الدول...</p>
        </div>
      ) : (
        <Grid cols={4} gap="lg" className="mt-6">
          {countries.map((country: CountryListDto) => (
            <InfoCard
              key={country.id}
              title={country.arabicName}
              subtitle={country.englishName}
              icon={<span className="text-4xl">🏳️</span>}
              badges={[
                { text: country.countryCode, variant: 'neutral' },
                { 
                  text: country.isActive ? 'نشط' : 'غير نشط', 
                  variant: country.isActive ? 'success' : 'error' 
                }
              ]}
              onClick={() => handleCountrySelect(country)}
              onEdit={() => handleEditCountry(country)}
              onDelete={() => handleDeleteCountry(country.id)}
            />
          ))}
        </Grid>
      )}
    </div>
  )

  // Render cities cards
  const renderCities = () => {
    const filteredCities = getCountryCities(selectedCountry!.id)
    
    return (
      <div className="p-6">
        <PageHeader
          title={`مدن ${selectedCountry!.arabicName}`}
          description={`اختر مدينة لعرض المناطق (${filteredCities.length} مدينة)`}
          breadcrumbs={[
            { label: 'الدول', onClick: () => setView('countries') },
            { label: selectedCountry!.arabicName, isActive: true }
          ]}
          onBack={handleBack}
          actions={
            <Button 
              onClick={handleAddCity}
              variant="success"
              size="lg"
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة مدينة جديدة
            </Button>
          }
        />

        <Grid cols={6} gap="md" className="mt-6">
          {filteredCities.map((city: CityListDto) => (
            <ActionCard
              key={city.id}
              title={city.arabicName}
              subtitle={city.englishName}
              icon={<MapPin className="h-8 w-8 text-blue-500" />}
              badge={{
                text: city.isActive ? 'نشط' : 'غير نشط',
                variant: city.isActive ? 'success' : 'error'
              }}
              isSelected={selectedCity?.id === city.id}
              onClick={() => handleCitySelect(city)}
              onEdit={() => handleEditCity(city)}
              onDelete={() => handleDeleteCity(city.id)}
            />
          ))}
        </Grid>
      </div>
    )
  }

  // Render areas table
  const renderAreasTable = () => {
    const filteredAreas = getCityAreas(selectedCity!.id)
    
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>مناطق {selectedCity!.arabicName} ({filteredAreas.length} منطقة)</span>
            </CardTitle>
            <Button 
              size="sm" 
              onClick={handleAddArea}
              variant="info"
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة منطقة جديدة
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">الاسم بالعربية</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">الاسم بالإنجليزية</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">الحالة</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAreas.map((area: AreaListDto) => (
                  <tr key={area.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{area.arabicName}</td>
                    <td className="py-3 px-4 text-gray-600">{area.englishName}</td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        area.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      )}>
                        {area.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          onClick={() => handleEditArea(area)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 border-red-600 hover:bg-red-50 bg-white"
                          onClick={() => handleDeleteArea(area.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {view === 'countries' && renderCountries()}
      {view === 'cities' && (
        <div className="space-y-6">
          {renderCities()}
          {selectedCity ? (
            <>
              {renderAreasTable()}
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">اختر مدينة لعرض المناطق</h3>
                <p className="text-gray-500">انقر على أي مدينة أعلاه لعرض المناطق المتاحة بها</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmation.isOpen}
        onClose={confirmation.close}
        onConfirm={confirmation.onConfirm || (() => {})}
        title={confirmation.options?.title || ''}
        message={confirmation.options?.message || ''}
        confirmText={confirmation.options?.confirmText}
        cancelText={confirmation.options?.cancelText}
        type={confirmation.options?.type}
      />

      {/* Country Form Modal */}
      <FormModal
        isOpen={countryModal.isOpen}
        onClose={countryModal.closeModal}
        onSave={countryModal.handleSave}
        title={countryModal.isEditing ? 'تعديل الدولة' : 'إضافة دولة جديدة'}
        saveText={countryModal.isEditing ? 'حفظ التغييرات' : 'إضافة'}
        isLoading={countryModal.isLoading}
      >
        <div className="space-y-6">
          <Grid cols={2} gap="lg">
            <Input
              label="اسم الدولة (بالإنجليزية)"
              value={countryModal.formData.englishName || ''}
              onChange={(e) => countryModal.updateFormData({ englishName: e.target.value })}
              placeholder="United Arab Emirates"
              required
            />
            <Input
              label="اسم الدولة (بالعربية)"
              value={countryModal.formData.arabicName || ''}
              onChange={(e) => countryModal.updateFormData({ arabicName: e.target.value })}
              placeholder="دولة الإمارات العربية المتحدة"
              required
            />
            <Input
              label="رمز الدولة"
              value={countryModal.formData.countryCode || ''}
              onChange={(e) => countryModal.updateFormData({ countryCode: e.target.value })}
              placeholder="AE"
              maxLength={2}
              required
            />
          </Grid>
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <input
              type="checkbox"
              id="countryIsActive"
              checked={countryModal.formData.isActive ?? true}
              onChange={(e) => countryModal.updateFormData({ isActive: e.target.checked })}
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="countryIsActive" className="text-sm font-medium text-gray-700">
              الدولة نشطة
            </label>
          </div>
        </div>
      </FormModal>

      {/* City Form Modal */}
      <FormModal
        isOpen={cityModal.isOpen}
        onClose={cityModal.closeModal}
        onSave={cityModal.handleSave}
        title={cityModal.isEditing ? 'تعديل المدينة' : 'إضافة مدينة جديدة'}
        saveText={cityModal.isEditing ? 'حفظ التغييرات' : 'إضافة'}
        isLoading={cityModal.isLoading}
      >
        <div className="space-y-6">
          <Grid cols={2} gap="lg">
            <Input
              label="اسم المدينة (بالإنجليزية)"
              value={cityModal.formData.englishName || ''}
              onChange={(e) => cityModal.updateFormData({ englishName: e.target.value })}
              placeholder="Dubai"
              variant="success"
              required
            />
            <Input
              label="اسم المدينة (بالعربية)"
              value={cityModal.formData.arabicName || ''}
              onChange={(e) => cityModal.updateFormData({ arabicName: e.target.value })}
              placeholder="دبي"
              variant="success"
              required
            />
          </Grid>
          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <input
              type="checkbox"
              id="cityIsActive"
              checked={cityModal.formData.isActive ?? true}
              onChange={(e) => cityModal.updateFormData({ isActive: e.target.checked })}
              className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2"
            />
            <label htmlFor="cityIsActive" className="text-sm font-medium text-gray-700">
              المدينة نشطة
            </label>
          </div>
        </div>
      </FormModal>

      {/* Area Form Modal */}
      <FormModal
        isOpen={areaModal.isOpen}
        onClose={areaModal.closeModal}
        onSave={areaModal.handleSave}
        title={areaModal.isEditing ? 'تعديل المنطقة' : 'إضافة منطقة جديدة'}
        saveText={areaModal.isEditing ? 'حفظ التغييرات' : 'إضافة'}
        isLoading={areaModal.isLoading}
      >
        <div className="space-y-6">
          <Grid cols={2} gap="lg">
            <Input
              label="اسم المنطقة (بالإنجليزية)"
              value={areaModal.formData.englishName || ''}
              onChange={(e) => areaModal.updateFormData({ englishName: e.target.value })}
              placeholder="Downtown Dubai"
              variant="warning"
              required
            />
            <Input
              label="اسم المنطقة (بالعربية)"
              value={areaModal.formData.arabicName || ''}
              onChange={(e) => areaModal.updateFormData({ arabicName: e.target.value })}
              placeholder="وسط مدينة دبي"
              variant="warning"
              required
            />
          </Grid>
          <div className="flex items-center space-x-3 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <input
              type="checkbox"
              id="areaIsActive"
              checked={areaModal.formData.isActive ?? true}
              onChange={(e) => areaModal.updateFormData({ isActive: e.target.checked })}
              className="h-5 w-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 focus:ring-2"
            />
            <label htmlFor="areaIsActive" className="text-sm font-medium text-gray-700">
              المنطقة نشطة
            </label>
          </div>
        </div>
      </FormModal>
    </div>
  )
}

export default CountriesPage
