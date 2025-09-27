import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../hooks/AuthProvider';
import { LanguageProvider } from '../../hooks/LanguageProvider';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import Dashboard from '../../pages/Dashboard';
import CountriesPage from '../../pages/CountriesPage';
import CitiesPage from '../../pages/CitiesPage';
import FeaturesPage from '../../pages/FeaturesPage';
import AppliancesPage from '../../pages/AppliancesPage';
import BlocksPage from '../../pages/BlocksPage';
import DesignsPage from '../../pages/DesignsPage';
import DesignDetailsPage from '../../pages/DesignDetailsPage';
import LoginPage from '../../pages/LoginPage';
import BuildingBuilderPage from '../../pages/BuildingBuilderPage';
import VisualizationTestPage from '../../pages/VisualizationTestPage';
import AdvancedVisualizationPage from '../../pages/AdvancedVisualizationPage';
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  MapPin,
  Settings,
  Palette,
  BarChart3,
  Wrench,
  Star,
  Menu,
  X,
  Globe,
  DollarSign,
  UserPlus,
  FileText,
  Grid,
  Bell,
  User,
  Key,
  ChevronDown,
  // Hammer
} from 'lucide-react';
import { Button } from '../ui/Button';

// إنشاء QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// مكون لحماية الصفحات
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // إذا كان التحميل في التقدم، اعرض loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// مكون wrapper لصفحة تسجيل الدخول
const LoginPageWrapper: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // إذا كان التحميل في التقدم، اعرض loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }
  
  // إذا كان المستخدم مسجل دخول بالفعل، وجهه للـ dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <LoginPage />;
};

// تخطيط الصفحات المحمية
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(['masterData', 'entities']);
  const { language, toggleLanguage, t } = useLanguage();
  
  const navItems = [
    {
      title: t('dashboard'),
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: t('basic_data'),
      icon: Globe,
      children: [
        { title: t('countries'), href: '/countries', icon: MapPin },
        { title: t('features'), href: '/features', icon: Star },
        { title: t('appliances'), href: '/appliances', icon: Wrench },
        { title: t('blocks'), href: '/blocks', icon: Grid },
      ],
    },
    {
      title: t('designs'),
      href: '/designs',
      icon: Palette,
    },
    // {
    //   title: 'منشئ الأبراج',
    //   href: '/building-builder',
    //   icon: Hammer,
    // },
    // {
    //   title: '🎯 تجربة الرسم التفاعلي',
    //   href: '/visualization-test',
    //   icon: Building2,
    // },
    // {
    //   title: '🌟 الرسم المتقدم 2D/3D',
    //   href: '/advanced-visualization',
    //   icon: Building2,
    // },
    {
      title: t('towers_nav'),
      href: '/towers',
      icon: Building2,
    },
    {
      title: t('people'),
      icon: Users,
      children: [
        { title: t('owners'), href: '/owners', icon: UserCheck },
        { title: t('tenants'), href: '/tenants', icon: Users },
        { title: t('potential_clients'), href: '/leads', icon: UserPlus },
      ],
    },
    {
      title: t('finance'),
      icon: DollarSign,
      children: [
        { title: t('contracts'), href: '/contracts', icon: FileText },
        { title: t('payments'), href: '/payments', icon: DollarSign },
      ],
    },
    {
      title: t('reports'),
      href: '/analytics',
      icon: BarChart3,
    },
    {
      title: t('settings'),
      href: '/settings',
      icon: Settings,
    },
  ];

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const renderNavItem = (item: typeof navItems[0]) => {
    if (item.children) {
      const sectionKey = item.title.toLowerCase().replace(/\s+/g, '');
      const isOpenSection = openSections.includes(sectionKey);

      return (
        <div key={item.title}>
          <Button
            variant="ghost"
            className="w-full justify-start h-12 px-4 hover:bg-gray-100 transition-colors"
            onClick={() => toggleSection(sectionKey)}
          >
            <item.icon className="h-5 w-5 ml-3 text-gray-600" />
            <span className="flex-1 text-right">{item.title}</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isOpenSection ? 'rotate-180' : ''
              }`}
            />
          </Button>
          {isOpenSection && (
            <div className="space-y-1 pr-4">
              {item.children?.map((child) => (
                <NavLink
                  key={child.href}
                  to={child.href!}
                  className={({ isActive }) =>
                    `flex items-center h-10 px-8 text-sm rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`
                  }
                >
                  <child.icon className="h-4 w-4 ml-3" />
                  {child.title}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.href}
        to={item.href}
        className={({ isActive }) =>
          `flex items-center h-12 px-4 rounded-md transition-colors ${
            isActive
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`
        }
      >
        <item.icon className="h-5 w-5 ml-3" />
        <span>{item.title}</span>
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out overflow-y-auto flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Building2 className="h-8 w-8 text-blue-600" />
              <Key className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Tower Keys</h1>
              <p className="text-xs text-gray-500">Connect</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(renderNavItem)}
        </nav>

        {/* Language Toggle */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="w-full"
          >
            <Globe className="h-4 w-4 ml-2" />
            {language === 'en' ? 'العربية' : 'English'}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 relative z-30">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Building2 className="h-5 w-5 text-blue-600" />
                <Key className="h-4 w-4 text-yellow-500" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 hidden sm:block">
                Tower Keys Connect
              </h2>
              <h2 className="text-sm font-semibold text-gray-900 sm:hidden">
                TKC
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <Button variant="ghost" size="icon" className="relative hidden sm:flex">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-8 w-full max-w-none">
          {children}
        </main>
      </div>
    </div>
  );
};

// مكون التوجيه
const AppRouter: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* صفحة تسجيل الدخول - غير محمية */}
          <Route path="/login" element={<LoginPageWrapper />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/countries"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <CountriesPage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cities"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <CitiesPage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/areas"
            element={<Navigate to="/countries" replace />}
          />
          <Route
            path="/features"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <FeaturesPage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/appliances"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <AppliancesPage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/blocks"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <BlocksPage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/designs"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <DesignsPage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/designs/:id"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <DesignDetailsPage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/building-builder"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <BuildingBuilderPage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/visualization-test"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <VisualizationTestPage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/advanced-visualization"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <AdvancedVisualizationPage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          
          {/* التوجيه الافتراضي */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            } 
          />
          {/* 404 - توجيه للـ login للمستخدمين غير المسجلين أو dashboard للمسجلين */}
          <Route 
            path="*" 
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

// التطبيق الرئيسي مع مزودي السياق
export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </LanguageProvider>
  );
}