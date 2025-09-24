import React from 'react'
import { Search, Grid, List } from 'lucide-react'
import { Input } from './Input'
import { useLanguage } from '../../hooks/useLanguage'
import { DesignCategory } from '../../types/api'

interface SearchAndFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedCategory: DesignCategory | ''
  setSelectedCategory: (category: DesignCategory | '') => void
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  viewMode,
  setViewMode
}) => {
  const { t } = useLanguage()

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={t('searchDesigns') || 'Search designs...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as DesignCategory | '')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('allCategories') || 'All Categories'}</option>
            <option value={DesignCategory.Standard}>{t('standard') || 'Standard'}</option>
            <option value={DesignCategory.Luxury}>{t('luxury') || 'Luxury'}</option>
            <option value={DesignCategory.Premium}>{t('premium') || 'Premium'}</option>
            <option value={DesignCategory.Economic}>{t('economic') || 'Economic'}</option>
          </select>
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchAndFilters