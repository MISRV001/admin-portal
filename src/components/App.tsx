import React, { useEffect } from 'react';
import { LoginForm } from './LoginForm';
import { DashboardLayout } from './DashboardLayout';
import { NetworkSimulator } from './NetworkSimulator';
import { useAuthStore } from '../stores/authStore';
import { EnhancedApiModeSelector } from './ApiModeSelector';
import { useSidebarPermissions } from '../hooks/useSidebarPermissions';

// Main App Component
const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { sidebarPermissions, loading, error } = useSidebarPermissions();

  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isAuthenticated && loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading permissions...</div>;
  }
  if (isAuthenticated && error) {
    return <div className="flex items-center justify-center min-h-screen text-red-600">Failed to load permissions: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}>
      {isAuthenticated ? <DashboardLayout sidebarPermissions={sidebarPermissions} /> : <LoginForm />}
      <NetworkSimulator />
      <EnhancedApiModeSelector />
    </div>
  );
};

export default App;