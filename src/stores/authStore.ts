import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MockAPIService } from '../services/mockApiService';

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
          // Pass the role to the mock API so it returns the right user object
          const response = await mockAPI.makeRequest('auth/login', credentials, { method: 'POST' });

          // If your mock returns users by role, select the correct one:
          // e.g. response.data.user or response.user
          const user = response.data?.user || response.user;

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            loginStatus: 'idle'
          });
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