import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  BarChart3,
  Settings,
  MapPin,
  Star,
  Package,
  Palette,
  ChevronDown,
  Globe,
  DollarSign,
  UserCheck,
  UserPlus,
  Contact,
  Key,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useSidebar } from './SidebarProvider';

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<any>;
  children?: NavItem[];
}

export const Sidebar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { collapsed, isMobile, isOpen, closeSidebar } = useSidebar();
  const [openSections, setOpenSections] = React.useState<string[]>(['masterData', 'entities']);

  const navItems: NavItem[] = [
    {
      title: t('navigation.dashboard'),
      href: '/',
      icon: LayoutDashboard,
    },
    {
      title: t('navigation.masterData'),
      icon: Globe,
      children: [
        { title: t('navigation.countries'), href: '/countries', icon: MapPin },
        { title: t('navigation.cities'), href: '/cities', icon: MapPin },
        { title: t('navigation.areas'), href: '/areas', icon: MapPin },
        { title: t('navigation.towerFeatures'), href: '/tower-features', icon: Star },
        { title: t('navigation.blocks'), href: '/blocks', icon: Package },
        { title: t('navigation.appliances'), href: '/appliances', icon: Package },
      ],
    },
    {
      title: t('navigation.unitDesigns'),
      href: '/unit-designs',
      icon: Palette,
    },
    {
      title: t('navigation.towers'),
      href: '/towers',
      icon: Building2,
    },
    {
      title: t('navigation.entities'),
      icon: Users,
      children: [
        { title: t('navigation.owners'), href: '/owners', icon: UserCheck },
        { title: t('navigation.tenants'), href: '/tenants', icon: Users },
        { title: t('navigation.leads'), href: '/leads', icon: UserPlus },
      ],
    },
    {
      title: t('navigation.finance'),
      icon: DollarSign,
      children: [
        { title: t('navigation.contracts'), href: '/contracts', icon: FileText },
        { title: t('navigation.payments'), href: '/payments', icon: DollarSign },
      ],
    },
    {
      title: t('navigation.analytics'),
      href: '/analytics',
      icon: BarChart3,
    },
    {
      title: t('navigation.settings'),
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

  const isActive = (path: string) => location.pathname === path;

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const renderNavItem = (item: NavItem, index: number) => {
    if (item.children) {
      const sectionKey = item.title.toLowerCase().replace(/\s+/g, '');
      const isOpenSection = openSections.includes(sectionKey);

      return (
        <Collapsible
          key={item.title}
          open={isOpenSection}
          onOpenChange={() => toggleSection(sectionKey)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={`w-full justify-start h-12 px-4 ${
                collapsed && !isMobile ? 'px-3' : ''
              } hover:bg-accent/50 transition-colors`}
            >
              <item.icon className={`h-5 w-5 ${collapsed && !isMobile ? '' : 'mr-3 rtl:mr-0 rtl:ml-3'} text-muted-foreground`} />
              {(!collapsed || isMobile) && (
                <>
                  <span className="flex-1 text-left rtl:text-right">{item.title}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isOpenSection ? 'rotate-180' : ''
                    }`}
                  />
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          {(!collapsed || isMobile) && (
            <CollapsibleContent className="space-y-1">
              {item.children.map((child, childIndex) => (
                <NavLink
                  key={child.href}
                  to={child.href!}
                  onClick={() => isMobile && closeSidebar()}
                  className={({ isActive }) =>
                    `flex items-center h-10 px-8 text-sm rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`
                  }
                >
                  <child.icon className="h-4 w-4 mr-3 rtl:mr-0 rtl:ml-3" />
                  {child.title}
                </NavLink>
              ))}
            </CollapsibleContent>
          )}
        </Collapsible>
      );
    }

    return (
      <NavLink
        key={item.href}
        to={item.href!}
        onClick={() => isMobile && closeSidebar()}
        className={({ isActive }) =>
          `flex items-center h-12 px-4 rounded-md transition-colors ${
            collapsed && !isMobile ? 'justify-center' : ''
          } ${
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          }`
        }
      >
        <item.icon className={`h-5 w-5 ${collapsed && !isMobile ? '' : 'mr-3 rtl:mr-0 rtl:ml-3'}`} />
        {(!collapsed || isMobile) && <span>{item.title}</span>}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <motion.aside
        initial={{ x: i18n.language === 'ar' ? 300 : -300 }}
        animate={{ 
          x: isMobile && !isOpen ? (i18n.language === 'ar' ? 300 : -300) : 0 
        }}
        className={`
          ${isMobile 
            ? 'fixed top-0 left-0 z-50 h-full shadow-xl' 
            : 'relative'
          }
          bg-card border-r border-border h-screen flex flex-col transition-all duration-300
          ${collapsed && !isMobile ? 'w-16' : 'w-64'}
          ${isMobile ? 'w-64' : ''}
        `}
      >
        {/* Header */}
        <div className={`p-4 border-b border-border ${collapsed && !isMobile ? 'px-2' : ''}`}>
          {!collapsed || isMobile ? (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Building2 className="h-8 w-8 text-primary" />
                <Key className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Tower Keys</h1>
                <p className="text-xs text-muted-foreground">Connect</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-1 rtl:space-x-reverse">
              <Building2 className="h-6 w-6 text-primary" />
              <Key className="h-4 w-4 text-yellow-500" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(renderNavItem)}
        </nav>

        {/* Language Toggle */}
        <div className={`p-4 border-t border-border ${collapsed && !isMobile ? 'px-2' : ''}`}>
          <Button
            variant="outline"
            size={collapsed && !isMobile ? 'icon' : 'sm'}
            onClick={toggleLanguage}
            className="w-full"
          >
            <Globe className={`h-4 w-4 ${collapsed && !isMobile ? '' : 'mr-2 rtl:mr-0 rtl:ml-2'}`} />
            {(!collapsed || isMobile) && (i18n.language === 'en' ? 'العربية' : 'English')}
          </Button>
        </div>
      </motion.aside>
    </>
  );
};