import { create } from 'zustand';

interface NavigationState {
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
}

interface NavigationActions {
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

type NavigationStore = NavigationState & NavigationActions;

export const useNavigationStore = create<NavigationStore>((set) => ({
  // Initial state
  sidebarCollapsed: false,
  mobileMenuOpen: false,

  // Actions
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