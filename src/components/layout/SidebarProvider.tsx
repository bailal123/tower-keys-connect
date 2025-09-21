import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  collapsed: boolean;
  isMobile: boolean;
  isOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

interface SidebarProviderProps {
  children: React.ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  // Check if screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      
      // Auto-collapse on mobile, auto-expand on desktop
      if (mobile) {
        setIsOpen(false);
        setCollapsed(true);
      } else {
        setIsOpen(true);
        setCollapsed(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(prev => !prev);
    } else {
      setCollapsed(prev => !prev);
    }
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const openSidebar = () => {
    if (isMobile) {
      setIsOpen(true);
    }
  };

  return (
    <SidebarContext.Provider value={{ 
      collapsed, 
      isMobile, 
      isOpen, 
      toggleSidebar, 
      closeSidebar, 
      openSidebar 
    }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ asChild, children, ...props }, ref) => {
  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      ...props,
      ref,
    });
  }
  return (
    <button ref={ref} {...props}>
      {children}
    </button>
  );
});