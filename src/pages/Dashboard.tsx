import React from 'react'
import { StatsCard } from '../components/dashboard/StatsCard'
import { NavigationCard } from '../components/dashboard/NavigationCard'
import { mockDashboardStats } from '../data/mockData'
import { useLanguage } from '../hooks/useLanguage'
import {
  Building2,
  Home,
  Users,
  UserCheck,
  TrendingUp,
  DollarSign,
  MapPin,
  Settings,
  Palette,
  FileText,
  BarChart3,
  Wallet,
} from 'lucide-react'

const Dashboard: React.FC = () => {
  const { t } = useLanguage()
  
  const handleNavigate = (section: string) => {
    console.log(`Navigate to ${section}`)
    // Here you would implement navigation logic
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('dashboard_welcome')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('dashboard_description')}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title={t('total_towers')}
            value={mockDashboardStats.totalTowers}
            icon={Building2}
            color="blue"
            trend={{ value: 8.2, isPositive: true }}
          />
          <StatsCard
            title={t('total_apartments')}
            value={mockDashboardStats.totalApartments}
            icon={Home}
            color="green"
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatsCard
            title={t('occupied_apartments')}
            value={mockDashboardStats.occupiedApartments}
            icon={UserCheck}
            color="orange"
            trend={{ value: 3.1, isPositive: true }}
          />
          <StatsCard
            title={t('monthly_revenue')}
            value={mockDashboardStats.monthlyRevenue}
            icon={DollarSign}
            color="purple"
            isCurrency
            trend={{ value: 15.3, isPositive: true }}
          />
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatsCard
            title={t('available_apartments')}
            value={mockDashboardStats.availableApartments}
            icon={Home}
            color="red"
          />
          <StatsCard
            title={t('total_owners')}
            value={mockDashboardStats.totalOwners}
            icon={Users}
            color="indigo"
          />
          <StatsCard
            title={t('total_tenants')}
            value={mockDashboardStats.totalTenants}
            icon={UserCheck}
            color="green"
          />
          <StatsCard
            title={t('total_revenue')}
            value={mockDashboardStats.totalRevenue}
            icon={TrendingUp}
            color="purple"
            isCurrency
          />
        </div>

        {/* Navigation Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('system_sections')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NavigationCard
              title={t('basic_data_management')}
              description={t('basic_data_description')}
              icon={MapPin}
              color="blue"
              onClick={() => handleNavigate('basic-data')}
              badge={t('basic')}
            />
            
            <NavigationCard
              title={t('towers_management')}
              description={t('towers_description')}
              icon={Building2}
              color="green"
              onClick={() => handleNavigate('towers')}
            />
            
            <NavigationCard
              title={t('designs_management')}
              description={t('designs_nav_description')}
              icon={Palette}
              color="purple"
              onClick={() => handleNavigate('designs')}
            />
            
            <NavigationCard
              title={t('owners_management')}
              description={t('owners_description')}
              icon={Users}
              color="orange"
              onClick={() => handleNavigate('owners')}
            />
            
            <NavigationCard
              title={t('tenants_management')}
              description={t('tenants_description')}
              icon={UserCheck}
              color="indigo"
              onClick={() => handleNavigate('tenants')}
            />
            
            <NavigationCard
              title={t('finance_management')}
              description={t('finance_description')}
              icon={Wallet}
              color="red"
              onClick={() => handleNavigate('finance')}
            />
            
            <NavigationCard
              title={t('reports_statistics')}
              description={t('reports_description')}
              icon={BarChart3}
              color="blue"
              onClick={() => handleNavigate('reports')}
            />
            
            <NavigationCard
              title={t('system_settings')}
              description={t('settings_description')}
              icon={Settings}
              color="gray"
              onClick={() => handleNavigate('settings')}
            />
            
            <NavigationCard
              title="المهتمين"
              description="قاعدة بيانات العملاء المهتمين بالعقارات"
              icon={FileText}
              color="green"
              onClick={() => handleNavigate('prospects')}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h3>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              إضافة برج جديد
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              إضافة مستأجر جديد
            </button>
            <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              إنشاء تقرير مالي
            </button>
            <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
              عرض الإحصائيات
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard