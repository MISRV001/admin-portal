import React, { createContext, useContext, useState, useCallback } from 'react';

interface NavigationState {
  currentPage: string;
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
}

interface NavigationContextType extends NavigationState {
  setCurrentPage: (page: string) => void;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<NavigationState>({
    currentPage: 'Dashboard',
    sidebarCollapsed: false,
    mobileMenuOpen: false
  });

  const setCurrentPage = useCallback((page: string) => {
    setState(prev => ({ ...prev, currentPage: page, mobileMenuOpen: false }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setState(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setState(prev => ({ ...prev, mobileMenuOpen: !prev.mobileMenuOpen }));
  }, []);

  const closeMobileMenu = useCallback(() => {
    setState(prev => ({ ...prev, mobileMenuOpen: false }));
  }, []);

  return (
    <NavigationContext.Provider value={{
      ...state,
      setCurrentPage,
      toggleSidebar,
      toggleMobileMenu,
      closeMobileMenu
    }}>
      {children}
    </NavigationContext.Provider>
  );
};
