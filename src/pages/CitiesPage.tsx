import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Plus, Edit, Trash2, Building2 } from 'lucide-react'
import { cn } from '../lib/utils'
import { cities, countries } from '../data/mockData'
import { useLanguage } from '../hooks/useLanguage'

interface City {
  id: string
  name: string
  nameAr: string
  countryId: string
  isActive: boolean
}

const CitiesPage: React.FC = () => {
  const { t } = useLanguage()
  const [citiesList, setCitiesList] = useState<City[]>(cities)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    countryId: '',
    isActive: true
  })

  const getCountryName = (countryId: string) => {
    const country = countries.find(c => c.id === countryId)
    return country ? country.nameAr : t('not_specified')
  }

  const getCountryFlag = (countryId: string) => {
    const country = countries.find(c => c.id === countryId)
    return country ? country.flag : '🏳️'
  }

  const handleAdd = () => {
    setIsAddingNew(true)
    setFormData({ name: '', nameAr: '', countryId: '', isActive: true })
  }

  const handleEdit = (city: City) => {
    setEditingId(city.id)
    setFormData({
      name: city.name,
      nameAr: city.nameAr,
      countryId: city.countryId,
      isActive: city.isActive
    })
  }

  const handleSave = () => {
    if (isAddingNew) {
      const newCity: City = {
        id: Date.now().toString(),
        ...formData
      }
      setCitiesList([...citiesList, newCity])
      setIsAddingNew(false)
    } else if (editingId) {
      setCitiesList(citiesList.map(city => 
        city.id === editingId ? { ...city, ...formData } : city
      ))
      setEditingId(null)
    }
    setFormData({ name: '', nameAr: '', countryId: '', isActive: true })
  }

  const handleCancel = () => {
    setIsAddingNew(false)
    setEditingId(null)
    setFormData({ name: '', nameAr: '', countryId: '', isActive: true })
  }

  const handleDelete = (id: string) => {
    setCitiesList(citiesList.filter(city => city.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-xl">
            <Building2 className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('cities_management')}</h1>
            <p className="text-gray-600">{t('cities_description')}</p>
          </div>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('add_new_city')}
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(isAddingNew || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{isAddingNew ? t('add_new_city') : t('edit_city')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('city_name_english')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Dubai"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('city_name_arabic')}
                </label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="دبي"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('country')}
                </label>
                <select
                  value={formData.countryId}
                  onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">{t('choose_country')}</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.flag} {country.nameAr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                {t('city_active')}
              </label>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={handleSave}>
                {isAddingNew ? t('add_button') : t('save_changes')}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                {t('cancel')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cities Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('cities_list')} ({citiesList.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">{t('name_arabic')}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">{t('name_english')}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">{t('country')}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">{t('status_column')}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">{t('actions_column')}</th>
                </tr>
              </thead>
              <tbody>
                {citiesList.map((city) => (
                  <tr key={city.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{city.nameAr}</td>
                    <td className="py-3 px-4 text-gray-600">{city.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCountryFlag(city.countryId)}</span>
                        <span>{getCountryName(city.countryId)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        city.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      )}>
                        {city.isActive ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(city)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(city.id)}
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
    </div>
  )
}

export default CitiesPage