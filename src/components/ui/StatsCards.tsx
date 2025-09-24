import React from 'react'
import { Filter, Grid } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

interface StatsCardsProps {
  totalDesigns: number
  designsByCategory: Record<number, number>
  getCategoryColor: (category: number) => string
  getCategoryLabel: (category: number) => string
}

const StatsCards: React.FC<StatsCardsProps> = ({ 
  totalDesigns, 
  designsByCategory, 
  getCategoryColor, 
  getCategoryLabel 
}) => {
  const { t } = useLanguage()

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Grid className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{t('totalDesigns') || 'Total Designs'}</div>
            <div className="text-2xl font-bold text-gray-900">{totalDesigns}</div>
          </div>
        </div>
      </div>
      
      {Object.entries(designsByCategory).map(([categoryNum, count]) => (
        <div key={categoryNum} className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getCategoryColor(Number(categoryNum)).replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                <Filter className="w-4 h-4" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">{getCategoryLabel(Number(categoryNum))}</div>
              <div className="text-2xl font-bold text-gray-900">{count}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsCards