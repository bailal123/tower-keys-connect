import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Menu, X, Globe, Bell, User, Settings, LogOut } from 'lucide-react'
import { useLogout } from '../../hooks/useApi'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  onMenuToggle?: () => void
  isMenuOpen?: boolean
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMenuOpen }) => {
  const { logout: authLogout } = useAuth()
  const { language, toggleLanguage } = useLanguage()
  const navigate = useNavigate()
  const logoutMutation = useLogout()
  const [notifications] = useState(3)

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync({ lang: language })
      authLogout()
      navigate('/login')
    } catch (error) {
      // في حالة فشل API، قم بتسجيل الخروج محلياً على أي حال
      console.error('Logout failed:', error)
      authLogout()
      navigate('/login')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and Menu Toggle */}
        <div className="flex items-center gap-4">
          {onMenuToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuToggle}
              className="md:hidden"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">RE</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">
                {language === 'ar' ? 'نظام إدارة العقارات' : 'Real Estate CRM'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? 'إدارة شاملة للعقارات' : 'Comprehensive Property Management'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            className="relative"
            title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            <Globe className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 text-xs bg-primary text-primary-foreground rounded-full px-1">
              {language.toUpperCase()}
            </span>
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            title={language === 'ar' ? 'الإشعارات' : 'Notifications'}
          >
            <Bell className="h-4 w-4" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
                {notifications}
              </span>
            )}
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            title={language === 'ar' ? 'الإعدادات' : 'Settings'}
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* User Profile */}
          <Button
            variant="ghost"
            className="gap-2 px-3"
            title={language === 'ar' ? 'الملف الشخصي' : 'Profile'}
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">
              {language === 'ar' ? 'المدير' : 'Admin'}
            </span>
          </Button>

          {/* Logout */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title={language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}