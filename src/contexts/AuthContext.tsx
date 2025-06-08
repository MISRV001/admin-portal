import React, { createContext, useContext, useState, useCallback } from 'react';
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

interface AuthContextType extends AuthState {
  login: (credentials: { email: string; password: string; role?: UserRole }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  resetLoginStatus: () => void;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    loginStatus: 'idle'
  });

  const login = useCallback(async (credentials: { email: string; password: string; role?: UserRole }) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, loginStatus: 'loading' }));
    try {
      const mockAPI = MockAPIService.getInstance();
      const response = await mockAPI.makeRequest('auth/login', credentials);
      
      setState(prev => ({ ...prev, loginStatus: 'success' }));
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setState(prev => ({ 
        ...prev,
        user: response.user, 
        isAuthenticated: true, 
        isLoading: false,
        loginStatus: 'idle'
      }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev,
        error: error.message, 
        isLoading: false,
        loginStatus: 'error'
      }));
      
      setTimeout(() => {
        setState(prev => ({ ...prev, loginStatus: 'idle' }));
      }, 2000);
      
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setState({
      user: null, 
      isAuthenticated: false, 
      isLoading: false,
      error: null,
      loginStatus: 'idle'
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const resetLoginStatus = useCallback(() => {
    setState(prev => ({ ...prev, loginStatus: 'idle' }));
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const mockAPI = MockAPIService.getInstance();
      await mockAPI.makeRequest('auth/forgot-password', { email });
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev,
        error: error.message, 
        isLoading: false 
      }));
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      logout,
      clearError,
      resetLoginStatus,
      forgotPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};
