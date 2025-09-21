import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { SidebarTrigger, useSidebar } from './SidebarProvider';
import { Menu, Bell, User, X, Building2, Key } from 'lucide-react';

export const Header = () => {
  const { t } = useTranslation();
  const { toggleSidebar, isMobile, isOpen } = useSidebar();

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 relative z-30">
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <SidebarTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleSidebar}
            className="md:flex"
          >
            {isMobile && isOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </SidebarTrigger>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            <Building2 className="h-5 w-5 text-primary" />
            <Key className="h-4 w-4 text-yellow-500" />
          </div>
          <h2 className="text-lg md:text-xl font-semibold text-foreground hidden sm:block">
            Tower Keys Connect
          </h2>
          <h2 className="text-sm font-semibold text-foreground sm:hidden">
            TKC
          </h2>
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4 rtl:space-x-reverse">
        <Button variant="ghost" size="icon" className="relative hidden sm:flex">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};