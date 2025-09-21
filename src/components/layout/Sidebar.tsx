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
  const { collapsed } = useSidebar();
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
      const isOpen = openSections.includes(sectionKey);

      return (
        <Collapsible
          key={item.title}
          open={isOpen}
          onOpenChange={() => toggleSection(sectionKey)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={`w-full justify-start h-12 px-4 ${
                collapsed ? 'px-3' : ''
              } hover:bg-accent/50 transition-colors`}
            >
              <item.icon className={`h-5 w-5 ${collapsed ? '' : 'mr-3'} text-muted-foreground`} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.title}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          {!collapsed && (
            <CollapsibleContent className="space-y-1">
              {item.children.map((child, childIndex) => (
                <NavLink
                  key={child.href}
                  to={child.href!}
                  className={({ isActive }) =>
                    `flex items-center h-10 px-8 text-sm rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`
                  }
                >
                  <child.icon className="h-4 w-4 mr-3" />
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
        className={({ isActive }) =>
          `flex items-center h-12 px-4 rounded-md transition-colors ${
            collapsed ? 'justify-center' : ''
          } ${
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          }`
        }
      >
        <item.icon className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} />
        {!collapsed && <span>{item.title}</span>}
      </NavLink>
    );
  };

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={`bg-card border-r border-border h-screen flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className={`p-4 border-b border-border ${collapsed ? 'px-2' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-lg font-semibold text-foreground">Real Estate</h1>
              <p className="text-xs text-muted-foreground">CRM Dashboard</p>
            </div>
          </div>
        ) : (
          <Building2 className="h-8 w-8 text-primary mx-auto" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map(renderNavItem)}
      </nav>

      {/* Language Toggle */}
      <div className={`p-4 border-t border-border ${collapsed ? 'px-2' : ''}`}>
        <Button
          variant="outline"
          size={collapsed ? 'icon' : 'sm'}
          onClick={toggleLanguage}
          className="w-full"
        >
          <Globe className={`h-4 w-4 ${collapsed ? '' : 'mr-2'}`} />
          {!collapsed && (i18n.language === 'en' ? 'العربية' : 'English')}
        </Button>
      </div>
    </motion.aside>
  );
};