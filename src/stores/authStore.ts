import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MockAPIService } from '../services/mockApiService';
import { useRouter } from 'next/router';
import { roleDefaultRoutes } from '../config/roleDefaultRoutes';

type UserRole = 'admin' | 'campaign_manager' | 'reports_only';

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginStatus: 'idle' | 'loading' | 'success' | 'error';
}

interface AuthActions {
  login: (credentials: { email: string; password: string; role?: UserRole }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  resetLoginStatus: () => void;
  forgotPassword: (email: string) => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      loginStatus: 'idle',

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null, loginStatus: 'loading' });
        try {
          const mockAPI = MockAPIService.getInstance();
          const response = await mockAPI.makeRequest('auth/login', credentials, { method: 'POST' });
          const user = response.data?.user || response.user;
          console.log('[AUTH DEBUG] Raw user from API:', user);

          // DEBUG: Log permissions as received
          if (user && user.permissions) {
            console.log('[AUTH DEBUG] User permissions (raw):', user.permissions);
            if (Array.isArray(user.permissions)) {
              // Try to map to sidebar-permissions.json format
              fetch('/mock/responses/sidebar-permissions.json')
                .then(res => res.json())
                .then(data => {
                  const sidebarRoutes = data.sidebar.map((item: any) => item.route);
                  const mapped: Record<string, string> = {};
                  sidebarRoutes.forEach((route: string) => {
                    // Try to find a matching permission for this route
                    // For demo, default to 'view' if present in array, else 'none'
                    mapped[route] = user.permissions.includes(route.replace('/', '')) || user.permissions.includes(route) ? 'view' : 'none';
                  });
                  console.log('[AUTH DEBUG] Mapped sidebar permissions:', mapped);
                });
            } else if (typeof user.permissions === 'object') {
              console.log('[AUTH DEBUG] User permissions (object):', user.permissions);
            }
          }

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            loginStatus: 'idle'
          });

          // Redirect to role-specific default route after login
          if (typeof window !== 'undefined' && user) {
            const redirectTo = roleDefaultRoutes[user.role] || '/';
            window.location.replace(redirectTo);
          }
        } catch (error: any) {
          set({
            error: error.message,
            isLoading: false,
            loginStatus: 'error'
          });
          setTimeout(() => set({ loginStatus: 'idle' }), 2000);
          throw error;
        }
      },

      logout: () => {
        set({
          user: null, 
          isAuthenticated: false, 
          isLoading: false,
          error: null,
          loginStatus: 'idle'
        });
      },

      clearError: () => {
        set({ error: null });
      },

      resetLoginStatus: () => {
        set({ loginStatus: 'idle' });
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const mockAPI = MockAPIService.getInstance();
          await mockAPI.makeRequest('auth/forgot-password', { email });
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message, 
            isLoading: false 
          });
          throw error;
        }
      }
    }),
    {
      name: 'boosttrade-auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);