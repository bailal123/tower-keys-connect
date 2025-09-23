import React from 'react'
import { StatsCard } from '../components/dashboard/StatsCard'
import { NavigationCard } from '../components/dashboard/NavigationCard'
import { mockDashboardStats } from '../data/mockData'
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
            مرحباً بك في نظام إدارة العقارات
          </h1>
          <p className="text-muted-foreground text-lg">
            إدارة شاملة وفعالة لجميع عقاراتك ومستأجريك
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="إجمالي الأبراج"
            value={mockDashboardStats.totalTowers}
            icon={Building2}
            color="blue"
            trend={{ value: 8.2, isPositive: true }}
          />
          <StatsCard
            title="إجمالي الشقق"
            value={mockDashboardStats.totalApartments}
            icon={Home}
            color="green"
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatsCard
            title="الشقق المؤجرة"
            value={mockDashboardStats.occupiedApartments}
            icon={UserCheck}
            color="orange"
            trend={{ value: 3.1, isPositive: true }}
          />
          <StatsCard
            title="الإيرادات الشهرية"
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
            title="الشقق المتاحة"
            value={mockDashboardStats.availableApartments}
            icon={Home}
            color="red"
          />
          <StatsCard
            title="إجمالي الملاك"
            value={mockDashboardStats.totalOwners}
            icon={Users}
            color="indigo"
          />
          <StatsCard
            title="إجمالي المستأجرين"
            value={mockDashboardStats.totalTenants}
            icon={UserCheck}
            color="green"
          />
          <StatsCard
            title="إجمالي الإيرادات"
            value={mockDashboardStats.totalRevenue}
            icon={TrendingUp}
            color="purple"
            isCurrency
          />
        </div>

        {/* Navigation Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">أقسام النظام</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NavigationCard
              title="إدارة البيانات الأساسية"
              description="إدارة الدول، المدن، المناطق، والميزات الأساسية للعقارات"
              icon={MapPin}
              color="blue"
              onClick={() => handleNavigate('basic-data')}
              badge="أساسي"
            />
            
            <NavigationCard
              title="إدارة الأبراج"
              description="إضافة وإدارة الأبراج والبلوكات والشقق"
              icon={Building2}
              color="green"
              onClick={() => handleNavigate('towers')}
            />
            
            <NavigationCard
              title="إدارة التصاميم"
              description="تصاميم الشقق مع الصور والفيديوهات والمواصفات"
              icon={Palette}
              color="purple"
              onClick={() => handleNavigate('designs')}
            />
            
            <NavigationCard
              title="إدارة الملاك"
              description="معلومات وبيانات ملاك العقارات"
              icon={Users}
              color="orange"
              onClick={() => handleNavigate('owners')}
            />
            
            <NavigationCard
              title="إدارة المستأجرين"
              description="بيانات المستأجرين وعقود الإيجار"
              icon={UserCheck}
              color="indigo"
              onClick={() => handleNavigate('tenants')}
            />
            
            <NavigationCard
              title="القسم المالي"
              description="إدارة المدفوعات والفواتير والتقارير المالية"
              icon={Wallet}
              color="red"
              onClick={() => handleNavigate('finance')}
            />
            
            <NavigationCard
              title="التقارير والإحصائيات"
              description="تقارير مفصلة وإحصائيات شاملة"
              icon={BarChart3}
              color="blue"
              onClick={() => handleNavigate('reports')}
            />
            
            <NavigationCard
              title="إعدادات النظام"
              description="إعدادات عامة وتخصيص النظام"
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