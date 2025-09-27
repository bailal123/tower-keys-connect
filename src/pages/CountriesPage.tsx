import React, { useState } from 'react'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { FormModal } from '../components/ui/FormModal'
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog'
import { Input } from '../components/ui/Input'
import { Grid } from '../components/ui/Grid'
import { ActionCard } from '../components/ui/ActionCard'
import { InfoCard } from '../components/ui/InfoCard'
import { PageHeader } from '../components/ui/PageHeader'
import { TableCard, type Column } from '../components/ui/TableCard'
import { Plus, MapPin, Building } from 'lucide-react'
import { cn } from '../lib/utils'
import { getLocalizedName } from '../lib/localization'
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
  const { language, t } = useLanguage()
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
    phoneCode?: string
    isActive: boolean
  }>({
    initialData: {
      arabicName: '',
      englishName: '',
      countryCode: '',
      phoneCode: '',
      isActive: true
    },
    onSave: async (data, isEditing) => {
      if (isEditing && data.id) {
        await RealEstateAPI.country.update(data.id, {
          id: data.id,
          arabicName: data.arabicName,
          englishName: data.englishName,
          countryCode: data.countryCode,
          phoneCode: data.phoneCode || '',
          isActive: data.isActive
        }, language)
        showSuccess(t('country_updated'))
      } else {
        await RealEstateAPI.country.create({
          arabicName: data.arabicName,
          englishName: data.englishName,
          countryCode: data.countryCode,
          phoneCode: data.phoneCode || '',
          isActive: data.isActive
        }, language)
        showSuccess(t('country_added'))
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
        showSuccess(t('city_updated'))
      } else {
        await RealEstateAPI.city.create(cityData, language)
        showSuccess(t('city_added'))
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
        showSuccess(t('area_updated'))
      } else {
        await RealEstateAPI.area.create(areaData, language)
        showSuccess(t('area_added'))
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
      title: t('confirm_delete'),
      message: t('confirm_delete_country'),
      confirmText: t('delete'),
      cancelText: t('cancel'),
      type: 'danger'
    })

    if (confirmed) {
      try {
        await RealEstateAPI.country.delete(id, language)
        showSuccess(t('country_deleted'))
        refetchCountries()
      } catch (error: unknown) {
        const err = error as { response?: { data?: unknown; status?: number }; message?: string }
        console.error('حدث خطأ أثناء حذف الدولة:', error)
        console.error('تفاصيل الخطأ:', err.response?.data)
        console.error('كود الخطأ:', err.response?.status)
        
        if (err.response?.status === 405) {
          showError(t('delete_not_supported'), 'خطأ 405')
        } else {
          showError(t('delete_error'), t('error'))
        }
      }
    }
  }

  const handleDeleteCity = async (id: number) => {
    const confirmed = await confirmation.confirm({
      title: t('confirm_delete'),
      message: t('confirm_delete_city'),
      confirmText: t('delete'),
      cancelText: t('cancel'),
      type: 'danger'
    })

    if (confirmed) {
      try {
        await RealEstateAPI.city.delete(id, language)
        showSuccess(t('city_deleted'))
        await refreshCitiesData()
      } catch (error: unknown) {
        const err = error as { response?: { data?: unknown; status?: number }; message?: string }
        console.error('حدث خطأ أثناء حذف المدينة:', error)
        console.error('تفاصيل الخطأ:', err.response?.data)
        console.error('كود الخطأ:', err.response?.status)
        
        if (err.response?.status === 405) {
          showError(t('delete_not_supported'), 'خطأ 405')
        } else {
          showError(t('delete_error'), t('error'))
        }
      }
    }
  }

  const handleDeleteArea = async (id: number) => {
    const confirmed = await confirmation.confirm({
      title: t('confirm_delete'),
      message: t('confirm_delete_area'),
      confirmText: t('delete'),
      cancelText: t('cancel'),
      type: 'danger'
    })

    if (confirmed) {
      try {
        await RealEstateAPI.area.delete(id, language)
        showSuccess(t('area_deleted'))
        await refreshAreasData()
      } catch (error) {
        console.error('حدث خطأ أثناء حذف المنطقة:', error)
        showError(t('delete_error'), t('error'))
      }
    }
  }

  // Render countries cards
  const renderCountries = () => (
    <div className="p-6">
      <PageHeader
        title={t('countries')}
        description={`${t('manage_countries')} (${countries.length} ${t('countries').toLowerCase()})`}
        actions={
          <Button 
            onClick={handleAddCountry}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            size="lg"
          >
            <Plus className="h-4 w-4 ml-2" />
            {t('add_new_country')}
          </Button>
        }
      />

      {/* Countries Grid */}
      {countriesLoading ? (
        <div className="text-center py-8">
          <p>{t('loading')}</p>
        </div>
      ) : (
        <Grid cols={4} gap="lg" className="mt-6">
          {countries.map((country: CountryListDto) => (
            <InfoCard
              key={country.id}
              title={getLocalizedName(country, language)}
              subtitle={language === 'ar' ? country.englishName : country.arabicName}
              icon={<span className="text-4xl">🏳️</span>}
              badges={[
                { text: country.countryCode, variant: 'neutral' },
                { 
                  text: country.isActive ? t('active') : t('inactive'), 
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
          title={`${t('cities')} ${getLocalizedName(selectedCountry!, language)}`}
          description={`${t('select_city')} (${filteredCities.length} ${t('cities').toLowerCase()})`}
          breadcrumbs={[
            { label: t('countries'), onClick: () => setView('countries') },
            { label: getLocalizedName(selectedCountry!, language), isActive: true }
          ]}
          onBack={handleBack}
          actions={
            <Button 
              onClick={handleAddCity}
              variant="success"
              size="lg"
            >
              <Plus className="h-4 w-4 ml-2" />
              {t('add_new_city')}
            </Button>
          }
        />

        <Grid cols={6} gap="md" className="mt-6">
          {filteredCities.map((city: CityListDto) => (
            <ActionCard
              key={city.id}
              title={getLocalizedName(city, language)}
              subtitle={language === 'ar' ? city.englishName : city.arabicName}
              icon={<MapPin className="h-8 w-8 text-blue-500" />}
              badge={{
                text: city.isActive ? t('active') : t('inactive'),
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
    
    const areaColumns = [
      {
        key: 'arabicName' as keyof AreaListDto,
        label: t('arabic_name'),
        className: 'font-medium text-gray-900',
        render: (_: string, item: AreaListDto) => getLocalizedName(item, language)
      },
      {
        key: 'englishName' as keyof AreaListDto,
        label: t('english_name'),
        className: 'text-gray-600',
        render: (_: string, item: AreaListDto) => language === 'ar' ? item.englishName : item.arabicName
      },
      {
        key: 'isActive' as keyof AreaListDto,
        label: t('status'),
        render: (value: boolean) => (
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            value 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          )}>
            {value ? t('active') : t('inactive')}
          </span>
        )
      }
    ]
    
    return (
      <TableCard
        title={`${t('areas')} ${getLocalizedName(selectedCity!, language)} (${filteredAreas.length} ${t('areas').toLowerCase()})`}
        data={filteredAreas as unknown as Record<string, unknown>[]}
        columns={areaColumns as unknown as Column<Record<string, unknown>>[]}
        icon={<Building className="h-5 w-5" />}
        onAdd={handleAddArea}
        onEdit={handleEditArea as unknown as (item: Record<string, unknown>) => void}
        onDelete={(id: unknown) => handleDeleteArea(id as number)}
        addButtonText={t('add_new_area')}
        addButtonVariant="info"
        emptyMessage={t('no_areas_in_city')}
      />
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('select_city')}</h3>
                <p className="text-gray-500">{t('click_city')}</p>
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
        title={countryModal.isEditing ? t('edit_country') : t('add_new_country')}
        saveText={countryModal.isEditing ? t('save_changes') : t('add')}
        isLoading={countryModal.isLoading}
      >
        <div className="space-y-8">
          <Grid cols={2} gap="lg">
            <Input
              label={t('english_name')}
              value={countryModal.formData.englishName || ''}
              onChange={(e) => countryModal.updateFormData({ englishName: e.target.value })}
              placeholder="United Arab Emirates"
              required
            />
            <Input
              label={t('arabic_name')}
              value={countryModal.formData.arabicName || ''}
              onChange={(e) => countryModal.updateFormData({ arabicName: e.target.value })}
              placeholder="دولة الإمارات العربية المتحدة"
              required
            />
            <Input
              label={t('country_code')}
              value={countryModal.formData.countryCode || ''}
              onChange={(e) => countryModal.updateFormData({ countryCode: e.target.value })}
              placeholder="AE"
              maxLength={2}
              required
            />
            <Input
              label={t('phone_code')}
              value={countryModal.formData.phoneCode || ''}
              onChange={(e) => countryModal.updateFormData({ phoneCode: e.target.value })}
              placeholder="+971"
              maxLength={5}
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
              {t('is_active')}
            </label>
          </div>
        </div>
      </FormModal>

      {/* City Form Modal */}
      <FormModal
        isOpen={cityModal.isOpen}
        onClose={cityModal.closeModal}
        onSave={cityModal.handleSave}
        title={cityModal.isEditing ? t('edit_city') : t('add_new_city')}
        saveText={cityModal.isEditing ? t('save_changes') : t('add')}
        isLoading={cityModal.isLoading}
      >
        <div className="space-y-6">
          <Grid cols={2} gap="lg">
            <Input
              label={t('english_name')}
              value={cityModal.formData.englishName || ''}
              onChange={(e) => cityModal.updateFormData({ englishName: e.target.value })}
              placeholder="Dubai"
              variant="success"
              required
            />
            <Input
              label={t('arabic_name')}
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
              {t('is_active')}
            </label>
          </div>
        </div>
      </FormModal>

      {/* Area Form Modal */}
      <FormModal
        isOpen={areaModal.isOpen}
        onClose={areaModal.closeModal}
        onSave={areaModal.handleSave}
        title={areaModal.isEditing ? t('edit_area') : t('add_new_area')}
        saveText={areaModal.isEditing ? t('save_changes') : t('add')}
        isLoading={areaModal.isLoading}
      >
        <div className="space-y-6">
          <Grid cols={2} gap="lg">
            <Input
              label={t('english_name')}
              value={areaModal.formData.englishName || ''}
              onChange={(e) => areaModal.updateFormData({ englishName: e.target.value })}
              placeholder="Downtown Dubai"
              variant="warning"
              required
            />
            <Input
              label={t('arabic_name')}
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
              {t('is_active')}
            </label>
          </div>
        </div>
      </FormModal>
    </div>
  )
}

export default CountriesPage
