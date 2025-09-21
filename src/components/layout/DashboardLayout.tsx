import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SidebarProvider, useSidebar } from './SidebarProvider';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardContent: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { collapsed, isMobile, isOpen } = useSidebar();

  return (
    <div className="min-h-screen flex w-full bg-background relative">
      <Sidebar />
      <div className={`
        flex-1 flex flex-col transition-all duration-300
        ${isMobile ? 'w-full' : ''}
        ${!isMobile && collapsed ? ' rtl:ml-0 ' : ''}
        ${!isMobile && !collapsed ? ' rtl:ml-0 ' : ''}
      `}>
        <Header />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <DashboardContent>
        {children}
      </DashboardContent>
    </SidebarProvider>
  );
};