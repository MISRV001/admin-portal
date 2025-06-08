import { create } from 'zustand';

interface NavigationState {
  currentPage: string;
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
}

interface NavigationActions {
  setCurrentPage: (page: string) => void;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

type NavigationStore = NavigationState & NavigationActions;

export const useNavigationStore = create<NavigationStore>((set) => ({
  // Initial state
  currentPage: 'Dashboard',
  sidebarCollapsed: false,
  mobileMenuOpen: false,

  // Actions
  setCurrentPage: (page: string) => {
    set({ currentPage: page, mobileMenuOpen: false });
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },

  toggleMobileMenu: () => {
    set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen }));
  },

  closeMobileMenu: () => {
    set({ mobileMenuOpen: false });
  }
}));